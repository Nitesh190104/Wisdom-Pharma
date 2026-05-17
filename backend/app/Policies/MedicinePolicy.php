<?php

namespace App\Policies;

use App\Models\Medicine;
use App\Models\User;

class MedicinePolicy
{
    public function viewAny(?User $user = null): bool
    {
        return true;
    }

    public function view(?User $user, Medicine $medicine): bool
    {
        return $medicine->is_active || $user?->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Medicine $medicine): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Medicine $medicine): bool
    {
        return $user->isAdmin();
    }
}
