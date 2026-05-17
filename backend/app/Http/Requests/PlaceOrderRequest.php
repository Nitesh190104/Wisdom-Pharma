<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.address' => 'required|string|max:500',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'required|string|max:100',
            'shipping_address.pincode' => 'required|string|max:10',
            'shipping_address.phone' => 'required|string|max:15',
            'payment_method' => 'required|in:cod,online,bank_transfer',
            'notes' => 'nullable|string|max:500',
            'prescription_id' => 'nullable|string',
        ];
    }
}
