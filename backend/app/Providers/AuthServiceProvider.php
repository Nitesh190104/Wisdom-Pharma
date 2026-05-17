<?php

namespace App\Providers;

use App\Models\Medicine;
use App\Models\Order;
use App\Policies\MedicinePolicy;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::policy(Medicine::class, MedicinePolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
