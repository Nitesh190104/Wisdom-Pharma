<?php

namespace App\Services;

use App\Exceptions\OrderException;
use App\Mail\OrderPlacedMail;
use App\Models\Cart;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * Create an order from the user's cart.
     */
    public function createOrder(User $user, array $data): Order
    {
        $this->assertStoreVerified($user);

        $cartService = new CartService();
        $cartData = $cartService->getCartWithTotals($user);

        if (empty($cartData['items'])) {
            throw new OrderException('Cart is empty. Please add items before placing an order.');
        }

        $type = $user->role === 'store' ? 'wholesale' : 'retail';

        if ($type === 'wholesale') {
            $this->assertWholesaleMinimums($cartData['items']);
        }

        $isUpi   = ($data['payment_method'] === 'upi');
        $order = Order::create([
            'user_id'              => $user->_id,
            'order_number'         => Order::generateOrderNumber(),
            'items'                => $cartData['items'],
            'subtotal'             => $cartData['subtotal'],
            'gst_total'            => $cartData['gst_total'],
            'discount'             => 0,
            'total'                => $cartData['total'],
            'status'               => 'processing',
            'payment_status'       => $isUpi ? 'paid' : 'pending',
            'payment_method'       => $data['payment_method'],
            'razorpay_payment_id'  => $data['razorpay_payment_id'] ?? null,
            'type'                 => $type,
            'shipping_address'     => $data['shipping_address'],
            'notes'                => $data['notes'] ?? null,
            'prescription_id'      => $data['prescription_id'] ?? null,
            'estimated_delivery'   => now()->addDays(5),
        ]);

        // Create order items and deduct stock
        foreach ($cartData['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->_id,
                'medicine_id' => $item['medicine_id'],
                'medicine_name' => $item['medicine_name'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'gst_percentage' => $item['gst_percentage'],
                'gst_amount' => $item['gst_amount'],
                'subtotal' => $item['total'],
                'price_type' => $item['price_type'],
            ]);

            // Deduct stock
            $medicine = Medicine::find($item['medicine_id']);
            if ($medicine) {
                $medicine->decrement('stock', $item['quantity']);
            }
        }

        // Clear cart
        $cart = Cart::where('user_id', $user->_id)->first();
        if ($cart) {
            $cart->clearCart();
        }

        // Create notification
        Notification::create([
            'user_id' => $user->_id,
            'title' => 'Order Placed Successfully',
            'message' => "Your order #{$order->order_number} has been placed. Total: ₹{$order->total}",
            'type' => 'order',
            'is_read' => false,
            'data' => ['order_id' => $order->_id],
        ]);

        try {
            Mail::to($user->email)->send(new OrderPlacedMail($order, $user));
        } catch (\Throwable $exception) {
            Log::warning('Order confirmation email failed.', [
                'order_id' => $order->_id,
                'error' => $exception->getMessage(),
            ]);
        }

        return $order;
    }

    /**
     * Cancel an order.
     */
    public function cancelOrder(Order $order, string $reason): Order
    {
        if (!$order->canBeCancelled()) {
            throw new OrderException('This order cannot be cancelled.');
        }

        // Restore stock
        foreach ($order->items as $item) {
            $medicine = Medicine::find($item['medicine_id']);
            if ($medicine) {
                $medicine->increment('stock', $item['quantity']);
            }
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'title' => 'Order Cancelled',
            'message' => "Your order #{$order->order_number} has been cancelled.",
            'type' => 'order',
            'is_read' => false,
            'data' => ['order_id' => $order->_id],
        ]);

        return $order->fresh();
    }

    private function assertStoreVerified(User $user): void
    {
        if ($user->role !== 'store') {
            return;
        }

        $business = $user->business;
        if (!$business || !$business->is_verified) {
            throw new OrderException('Your business account is pending verification. Please wait for admin approval.');
        }
    }

    private function assertWholesaleMinimums(array $items): void
    {
        foreach ($items as $item) {
            $medicine = Medicine::find($item['medicine_id']);
            if (!$medicine) {
                throw new OrderException('One or more medicines in your cart are no longer available.');
            }

            $minQty = (int) ($medicine->min_wholesale_qty ?? 0);
            if ($minQty > 0 && (int) $item['quantity'] < $minQty) {
                throw new OrderException("Minimum wholesale quantity for {$medicine->medicine_name} is {$minQty} units.");
            }
        }
    }
}
