<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Order extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'orders';

    protected $fillable = [
        'user_id',
        'order_number',
        'items',
        'subtotal',
        'gst_total',
        'discount',
        'total',
        'status', // pending, confirmed, processing, shipped, delivered, cancelled
        'payment_status', // pending, paid, refunded
        'payment_method',
        'type', // retail, wholesale
        'shipping_address',
        'billing_address',
        'notes',
        'prescription_id',
        'estimated_delivery',
        'delivered_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'subtotal' => 'float',
            'gst_total' => 'float',
            'discount' => 'float',
            'total' => 'float',
            'estimated_delivery' => 'date',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRetail($query)
    {
        return $query->where('type', 'retail');
    }

    public function scopeWholesale($query)
    {
        return $query->where('type', 'wholesale');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Helpers
    public static function generateOrderNumber(): string
    {
        return 'WP-' . strtoupper(uniqid()) . '-' . now()->format('Ymd');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }
}
