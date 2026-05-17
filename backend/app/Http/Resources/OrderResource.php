<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->_id,
            'order_number' => $this->order_number,
            'items' => $this->items,
            'subtotal' => $this->subtotal,
            'gst_total' => $this->gst_total,
            'discount' => $this->discount,
            'total' => $this->total,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'type' => $this->type,
            'shipping_address' => $this->shipping_address,
            'notes' => $this->notes,
            'prescription_id' => $this->prescription_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
