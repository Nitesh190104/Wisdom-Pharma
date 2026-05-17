<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class OrderItem extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'order_items';

    protected $fillable = [
        'order_id',
        'medicine_id',
        'medicine_name',
        'quantity',
        'unit_price',
        'gst_percentage',
        'gst_amount',
        'subtotal',
        'price_type', // retail, wholesale
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'float',
            'gst_percentage' => 'float',
            'gst_amount' => 'float',
            'subtotal' => 'float',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
