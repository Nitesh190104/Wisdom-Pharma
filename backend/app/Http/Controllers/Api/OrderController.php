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
}
