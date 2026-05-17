<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Medicine extends Model
{
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'medicines';

    protected $fillable = [
        'medicine_name',
        'description',
        'category_id',
        'category',
        'stock',
        'retail_price',
        'wholesale_price',
        'gst_percentage',
        'expiry_date',
        'manufacturer',
        'prescription_required',
        'image',
        'is_active',
        'min_wholesale_qty',
        'dosage',
        'composition',
        'side_effects',
        'usage_instructions',
    ];

    protected function casts(): array
    {
        return [
            'retail_price' => 'float',
            'wholesale_price' => 'float',
            'gst_percentage' => 'float',
            'stock' => 'integer',
            'prescription_required' => 'boolean',
            'is_active' => 'boolean',
            'min_wholesale_qty' => 'integer',
            'expiry_date' => 'date',
        ];
    }

    // Relationships
    public function categoryRelation()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopePrescriptionRequired($query)
    {
        return $query->where('prescription_required', true);
    }

    public function scopeFilterSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('medicine_name', 'like', "%{$term}%")
              ->orWhere('manufacturer', 'like', "%{$term}%")
              ->orWhere('composition', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
        });
    }

    // Helpers
    public function getRetailPriceWithGst(): float
    {
        return $this->retail_price + ($this->retail_price * $this->gst_percentage / 100);
    }

    public function getWholesalePriceWithGst(): float
    {
        return $this->wholesale_price + ($this->wholesale_price * $this->gst_percentage / 100);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= 10;
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }
}
