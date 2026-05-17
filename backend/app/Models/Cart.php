<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Cart extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'carts';

    protected $fillable = [
        'user_id',
        'items',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Add or update an item in the cart.
     * Each item: { medicine_id, quantity, price_type (retail/wholesale) }
     */
    public function addItem(string $medicineId, int $quantity, string $priceType = 'retail'): void
    {
        $items = $this->items ?? [];
        $found = false;

        foreach ($items as &$item) {
            if ($item['medicine_id'] === $medicineId) {
                $item['quantity'] = $quantity;
                $item['price_type'] = $priceType;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $items[] = [
                'medicine_id' => $medicineId,
                'quantity' => $quantity,
                'price_type' => $priceType,
            ];
        }

        $this->items = $items;
        $this->save();
    }

    public function removeItem(string $medicineId): void
    {
        $items = collect($this->items ?? [])
            ->filter(fn($item) => $item['medicine_id'] !== $medicineId)
            ->values()
            ->toArray();

        $this->items = $items;
        $this->save();
    }

    public function clearCart(): void
    {
        $this->items = [];
        $this->save();
    }

    public function getItemCount(): int
    {
        return count($this->items ?? []);
    }
}
