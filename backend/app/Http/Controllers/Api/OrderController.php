<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlaceOrderRequest;
use App\Http\Resources\OrderResource;
use App\Repositories\OrderRepository;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService,
        protected OrderRepository $orders,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->orders->paginatedForUser($request->user(), [
                'status' => $request->input('status'),
                'per_page' => $request->input('per_page', 10),
            ]),
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = $this->orders->findForUser($request->user(), $id);
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        Gate::authorize('view', $order);
        return response()->json(['success' => true, 'data' => new OrderResource($order)]);
    }

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createOrder($request->user(), $request->validated());
            return response()->json(['success' => true, 'message' => 'Order placed successfully!', 'data' => $order], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $order = $this->orders->findForUser($request->user(), $id);
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        try {
            Gate::authorize('cancel', $order);
            $order = $this->orderService->cancelOrder($order, $request->input('reason', 'Cancelled by user'));
            return response()->json(['success' => true, 'message' => 'Order cancelled.', 'data' => new OrderResource($order)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function returnOrder(Request $request, string $id): JsonResponse
    {
        $order = $this->orders->findForUser($request->user(), $id);
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found.'], 404);

        if ($order->status === 'return_requested') {
            return response()->json(['success' => false, 'message' => 'Return has already been requested for this order.'], 422);
        }
        if ($order->status === 'returned') {
            return response()->json(['success' => false, 'message' => 'This order has already been returned.'], 422);
        }
        if ($order->return_reviewed_at && $order->return_reject_reason) {
            return response()->json(['success' => false, 'message' => 'Return request for this order was rejected.'], 422);
        }
        if ($order->status !== 'delivered') {
            return response()->json(['success' => false, 'message' => 'Only delivered orders can be returned.'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $deliveredAt = $order->delivered_at ?? $order->updated_at;
            if ($deliveredAt && now()->diffInDays($deliveredAt) > 7) {
                return response()->json(['success' => false, 'message' => 'Return policy expired. Returns must be requested within 7 days of delivery.'], 422);
            }
            $order->update([
                'status' => 'return_requested',
                'return_requested_at' => now(),
                'return_reason' => $validated['reason'],
                'return_reviewed_at' => null,
                'return_reviewed_by' => null,
                'return_reject_reason' => null,
                'returned_at' => null,
            ]);
            
            // Send dynamic status update email
            $user = $request->user();
            if ($user && $user->email) {
                try {
                    \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OrderStatusUpdatedMail($order, $user, 'return_requested'));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Order return email failed: " . $e->getMessage());
                }
            }

            return response()->json(['success' => true, 'message' => 'Return request submitted. Awaiting admin approval.', 'data' => new OrderResource($order)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
