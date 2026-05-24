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
            'delivered_at' => $this->delivered_at,
            'cancelled_at' => $this->cancelled_at,
            'cancellation_reason' => $this->cancellation_reason,

            // Return workflow
            'return_requested_at' => $this->return_requested_at,
            'return_reason' => $this->return_reason,
            'return_reviewed_at' => $this->return_reviewed_at,
            'return_reviewed_by' => $this->return_reviewed_by,
            'return_reject_reason' => $this->return_reject_reason,
            'returned_at' => $this->returned_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
