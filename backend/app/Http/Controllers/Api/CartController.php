<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Medicine;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Get cart contents with totals.
     */
    public function index(Request $request): JsonResponse
    {
        $cartData = $this->cartService->getCartWithTotals($request->user());

        return response()->json([
            'success' => true,
            'data' => $cartData,
        ]);
    }

    /**
     * Add item to cart.
     */
    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medicine_id' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $medicine = Medicine::find($validated['medicine_id']);
        $user = $request->user();
        $priceType = $user->role === 'store' ? 'wholesale' : 'retail';

        $error = null;
        $statusCode = 422;

        if (!$medicine) {
            $error = 'Medicine not found.';
            $statusCode = 404;
        } elseif ($medicine->stock < $validated['quantity']) {
            $error = "Only {$medicine->stock} units available.";
        } elseif ($user->role === 'store') {
            $minQty = (int) ($medicine->min_wholesale_qty ?? 0);
            if ($minQty > 0 && $validated['quantity'] < $minQty) {
                $error = "Minimum wholesale quantity for {$medicine->medicine_name} is {$minQty} units.";
            }
        }

        if ($error) {
            return response()->json([
                'success' => false,
                'message' => $error,
            ], $statusCode);
        }

        $cart = Cart::firstOrCreate(
            ['user_id' => $user->_id],
            ['items' => []]
        );

        $cart->addItem($validated['medicine_id'], $validated['quantity'], $priceType);

        $cartData = $this->cartService->getCartWithTotals($user);

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart.',
            'data' => $cartData,
        ]);
    }

    /**
     * Update item quantity in cart.
     */
    public function updateItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medicine_id' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $medicine = Medicine::find($validated['medicine_id']);
        $user = $request->user();

        $error = null;
        if ($medicine && $medicine->stock < $validated['quantity']) {
            $error = "Only {$medicine->stock} units available.";
        } elseif ($user->role === 'store' && $medicine) {
            $minQty = (int) ($medicine->min_wholesale_qty ?? 0);
            if ($minQty > 0 && $validated['quantity'] < $minQty) {
                $error = "Minimum wholesale quantity for {$medicine->medicine_name} is {$minQty} units.";
            }
        }

        if ($error) {
            return response()->json([
                'success' => false,
                'message' => $error,
            ], 422);
        }
        $cart = Cart::where('user_id', $user->_id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found.',
            ], 404);
        }

        $priceType = $user->role === 'store' ? 'wholesale' : 'retail';
        $cart->addItem($validated['medicine_id'], $validated['quantity'], $priceType);

        $cartData = $this->cartService->getCartWithTotals($user);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated.',
            'data' => $cartData,
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(Request $request, string $medicineId): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->_id)->first();

        if ($cart) {
            $cart->removeItem($medicineId);
        }

        $cartData = $this->cartService->getCartWithTotals($user);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
            'data' => $cartData,
        ]);
    }

    /**
     * Clear entire cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->_id)->first();

        if ($cart) {
            $cart->clearCart();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
            'data' => [
                'items' => [],
                'item_count' => 0,
                'subtotal' => 0,
                'gst_total' => 0,
                'total' => 0,
            ],
        ]);
    }
}
