<?php

namespace App\Repositories;

use App\Models\Medicine;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MedicineRepository
{
    public function paginatedActive(array $filters): LengthAwarePaginator
    {
        $query = Medicine::active();

        if (!empty($filters['search'])) {
            $query->filterSearch($filters['search']);
        }

        if (!empty($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        if (array_key_exists('prescription_required', $filters) && $filters['prescription_required'] !== null) {
            $query->where('prescription_required', (bool) $filters['prescription_required']);
        }

        if (!empty($filters['min_price'])) {
            $query->where('retail_price', '>=', (float) $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('retail_price', '<=', (float) $filters['max_price']);
        }

        if (!empty($filters['in_stock'])) {
            $query->inStock();
        }

        return $query
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_order'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 12);
    }

    public function featured(int $limit = 8): Collection
    {
        return Medicine::active()
            ->inStock()
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();
    }

    public function inventory(array $filters): LengthAwarePaginator
    {
        $query = Medicine::query();

        if (!empty($filters['low_stock'])) {
            $query->where('stock', '<=', 10)->where('stock', '>', 0);
        }

        if (!empty($filters['out_of_stock'])) {
            $query->where('stock', 0);
        }

        if (!empty($filters['search'])) {
            $query->filterSearch($filters['search']);
        }

        return $query->orderBy('stock', 'asc')->paginate($filters['per_page'] ?? 20);
    }

    public function find(string $id): ?Medicine
    {
        return Medicine::find($id);
    }

    public function create(array $data): Medicine
    {
        return Medicine::create($data);
    }

    public function update(Medicine $medicine, array $data): Medicine
    {
        $medicine->update($data);

        return $medicine->fresh();
    }

    public function delete(Medicine $medicine): void
    {
        $medicine->delete();
    }
}
