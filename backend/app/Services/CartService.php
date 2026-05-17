<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Medicine;
use App\Models\User;

class CartService
{
    /**
     * Get the cart with calculated totals for a user.
     */
    public function getCartWithTotals(User $user): array
    {
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->_id],
            ['items' => []]
        );

        $items = [];
        $subtotal = 0;
        $gstTotal = 0;
        $priceType = $user->role === 'store' ? 'wholesale' : 'retail';

        foreach ($cart->items ?? [] as $cartItem) {
            $medicine = Medicine::find($cartItem['medicine_id']);
            if (!$medicine) continue;

            $type = $cartItem['price_type'] ?? $priceType;
            $unitPrice = $type === 'wholesale' ? $medicine->wholesale_price : $medicine->retail_price;
            $gstAmount = $unitPrice * $medicine->gst_percentage / 100 * $cartItem['quantity'];
            $itemSubtotal = $unitPrice * $cartItem['quantity'];

            $items[] = [
                'medicine_id' => $medicine->_id,
                'medicine_name' => $medicine->medicine_name,
                'image' => $medicine->image,
                'quantity' => $cartItem['quantity'],
                'unit_price' => $unitPrice,
                'gst_percentage' => $medicine->gst_percentage,
                'gst_amount' => round($gstAmount, 2),
                'subtotal' => round($itemSubtotal, 2),
                'total' => round($itemSubtotal + $gstAmount, 2),
                'price_type' => $type,
                'stock' => $medicine->stock,
                'prescription_required' => $medicine->prescription_required,
            ];

            $subtotal += $itemSubtotal;
            $gstTotal += $gstAmount;
        }

        return [
            'id' => $cart->_id,
            'items' => $items,
            'item_count' => count($items),
            'subtotal' => round($subtotal, 2),
            'gst_total' => round($gstTotal, 2),
            'total' => round($subtotal + $gstTotal, 2),
        ];
    }
}
