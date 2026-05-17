<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PrescriptionReviewedMail;
use App\Models\Business;
use App\Models\Medicine;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Prescription;
use App\Models\User;
use App\Repositories\MedicineRepository;
use App\Repositories\OrderRepository;
use App\Repositories\UserRepository;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    public function __construct(
        private readonly MedicineRepository $medicines,
        private readonly OrderRepository $orders,
        private readonly UserRepository $users,
    ) {
    }

    public function dashboard(): JsonResponse
    {
        $analytics = new AnalyticsService();
        return response()->json(['success' => true, 'data' => $analytics->getDashboardStats()]);
    }

    public function users(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->users->paginated([
                'role' => $request->input('role'),
                'search' => $request->input('search'),
                'per_page' => $request->input('per_page', 15),
            ]),
        ]);
    }

    public function updateUser(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'is_approved' => 'sometimes|boolean',
            'role' => 'sometimes|in:consumer,store,admin',
        ]);
        $user->update($validated);
        return response()->json(['success' => true, 'message' => 'User updated.', 'data' => $user->fresh()]);
    }

    public function pendingBusinesses(): JsonResponse
    {
        $businesses = Business::pending()->with('user')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $businesses]);
    }

    public function approveBusiness(Request $request, string $id): JsonResponse
    {
        $business = Business::find($id);
        if (!$business) return response()->json(['success' => false, 'message' => 'Business not found.'], 404);
        $business->update(['is_verified' => true, 'verified_at' => now(), 'verified_by' => $request->user()->_id]);
        $user = $business->user;
        if ($user) {
            $user->update(['is_approved' => true]);
            Notification::create([
                'user_id' => $user->_id, 'title' => 'Business Approved',
                'message' => 'Your business account has been approved! You can now place wholesale orders.',
                'type' => 'account', 'is_read' => false,
            ]);
        }
        return response()->json(['success' => true, 'message' => 'Business approved.']);
    }

    public function rejectBusiness(Request $request, string $id): JsonResponse
    {
        $business = Business::find($id);
        if (!$business) return response()->json(['success' => false, 'message' => 'Business not found.'], 404);
        $reason = $request->input('reason', 'Application rejected.');
        $business->update(['verification_notes' => $reason]);
        Notification::create([
            'user_id' => $business->user_id, 'title' => 'Business Application Rejected',
            'message' => "Your business application was rejected. Reason: {$reason}",
            'type' => 'account', 'is_read' => false,
        ]);
        return response()->json(['success' => true, 'message' => 'Business rejected.']);
    }

    public function allOrders(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->orders->paginatedForAdmin([
                'status' => $request->input('status'),
                'type' => $request->input('type'),
                'per_page' => $request->input('per_page', 15),
            ]),
        ]);
    }

    public function updateOrderStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        $validated = $request->validate(['status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled']);
        $order->update(['status' => $validated['status']]);
        if ($validated['status'] === 'delivered') $order->update(['delivered_at' => now()]);
        Notification::create([
            'user_id' => $order->user_id, 'title' => 'Order Status Updated',
            'message' => "Your order #{$order->order_number} status changed to {$validated['status']}.",
            'type' => 'order', 'is_read' => false, 'data' => ['order_id' => $order->_id],
        ]);
        return response()->json(['success' => true, 'message' => 'Order status updated.', 'data' => $order->fresh()]);
    }

    public function inventory(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->medicines->inventory([
                'search' => $request->input('search'),
                'low_stock' => $request->boolean('low_stock'),
                'out_of_stock' => $request->boolean('out_of_stock'),
                'per_page' => $request->input('per_page', 20),
            ]),
        ]);
    }

    public function updateStock(Request $request, string $id): JsonResponse
    {
        $medicine = Medicine::find($id);
        if (!$medicine) return response()->json(['success' => false, 'message' => 'Medicine not found.'], 404);
        $validated = $request->validate(['stock' => 'required|integer|min:0']);
        $medicine->update(['stock' => $validated['stock']]);
        return response()->json(['success' => true, 'message' => 'Stock updated.', 'data' => $medicine->fresh()]);
    }

    public function prescriptions(Request $request): JsonResponse
    {
        $query = Prescription::with('user');
        if ($status = $request->input('status')) $query->where('status', $status);
        return response()->json(['success' => true, 'data' => $query->orderBy('created_at', 'desc')->paginate(15)]);
    }

    public function reviewPrescription(Request $request, string $id): JsonResponse
    {
        $prescription = Prescription::find($id);
        if (!$prescription) return response()->json(['success' => false, 'message' => 'Prescription not found.'], 404);
        $validated = $request->validate(['status' => 'required|in:approved,rejected', 'notes' => 'nullable|string|max:500']);
        $prescription->update([
            'status' => $validated['status'], 'notes' => $validated['notes'] ?? null,
            'reviewed_by' => $request->user()->_id, 'reviewed_at' => now(),
        ]);

        if ($prescription->user?->email) {
            try {
                Mail::to($prescription->user->email)->send(new PrescriptionReviewedMail($prescription->fresh(), $prescription->user));
            } catch (\Throwable $exception) {
                Log::warning('Prescription review email failed.', [
                    'prescription_id' => $prescription->_id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Prescription reviewed.']);
    }
}
