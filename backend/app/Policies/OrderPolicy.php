<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $order->user_id === $user->_id;
    }

    public function cancel(User $user, Order $order): bool
    {
        return $order->user_id === $user->_id && $order->canBeCancelled();
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
