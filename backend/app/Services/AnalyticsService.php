<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\Order;
use App\Models\User;

class AnalyticsService
{
    /**
     * Get dashboard analytics for admin.
     */
    public function getDashboardStats(): array
    {
        $totalRevenue = Order::where('status', '!=', 'cancelled')
            ->where('payment_status', 'paid')
            ->sum('total');

        $monthlyRevenue = Order::where('status', '!=', 'cancelled')
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total');

        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $deliveredOrders = Order::where('status', 'delivered')->count();

        $totalUsers = User::count();
        $totalConsumers = User::where('role', 'consumer')->count();
        $totalStores = User::where('role', 'store')->count();
        $pendingApprovals = User::where('role', 'store')->where('is_approved', false)->count();

        $totalMedicines = Medicine::count();
        $lowStockMedicines = Medicine::where('stock', '<=', 10)->where('stock', '>', 0)->count();
        $outOfStockMedicines = Medicine::where('stock', 0)->count();

        // Recent orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn($o) => [
                'id' => $o->_id,
                'order_number' => $o->order_number,
                'customer' => $o->user->name ?? 'N/A',
                'total' => $o->total,
                'status' => $o->status,
                'type' => $o->type,
                'created_at' => $o->created_at->format('M d, Y H:i'),
            ]);

        // Monthly revenue chart data (last 6 months)
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $revenue = Order::where('status', '!=', 'cancelled')
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', $month->startOfMonth())
                ->where('created_at', '<=', $month->copy()->endOfMonth())
                ->sum('total');
            $revenueChart[] = [
                'month' => $month->format('M Y'),
                'revenue' => round($revenue, 2),
            ];
        }

        // Order status distribution
        $orderStats = [
            ['name' => 'Pending', 'value' => Order::where('status', 'pending')->count()],
            ['name' => 'Confirmed', 'value' => Order::where('status', 'confirmed')->count()],
            ['name' => 'Processing', 'value' => Order::where('status', 'processing')->count()],
            ['name' => 'Shipped', 'value' => Order::where('status', 'shipped')->count()],
            ['name' => 'Delivered', 'value' => Order::where('status', 'delivered')->count()],
            ['name' => 'Cancelled', 'value' => Order::where('status', 'cancelled')->count()],
        ];

        return [
            'revenue' => [
                'total' => round($totalRevenue, 2),
                'monthly' => round($monthlyRevenue, 2),
                'chart' => $revenueChart,
            ],
            'orders' => [
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'delivered' => $deliveredOrders,
                'stats' => $orderStats,
            ],
            'users' => [
                'total' => $totalUsers,
                'consumers' => $totalConsumers,
                'stores' => $totalStores,
                'pending_approvals' => $pendingApprovals,
            ],
            'inventory' => [
                'total_medicines' => $totalMedicines,
                'low_stock' => $lowStockMedicines,
                'out_of_stock' => $outOfStockMedicines,
            ],
            'recent_orders' => $recentOrders,
        ];
    }
}
