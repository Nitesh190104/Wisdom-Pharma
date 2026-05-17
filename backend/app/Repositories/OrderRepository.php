<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository
{
    public function paginatedForUser(User $user, array $filters): LengthAwarePaginator
    {
        $query = Order::where('user_id', $user->_id)->recent();

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function findForUser(User $user, string $id): ?Order
    {
        return Order::where('user_id', $user->_id)->find($id);
    }

    public function paginatedForAdmin(array $filters): LengthAwarePaginator
    {
        $query = Order::with('user')->recent();

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }
}
