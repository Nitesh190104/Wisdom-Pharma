<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Middleware\EnsureBusinessApproved;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

// Public medicine & category routes
Route::get('/medicines', [MedicineController::class, 'index'])->name('medicines.index');
Route::get('/medicines/featured', [MedicineController::class, 'featured'])->name('medicines.featured');
Route::get('/medicines/{id}', [MedicineController::class, 'show'])->name('medicines.show');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{id}', [CategoryController::class, 'show'])->name('categories.show');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/profile', [AuthController::class, 'profile'])->name('auth.profile');
    Route::put('/auth/profile', [AuthController::class, 'updateProfile'])->name('auth.profile.update');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Cart
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('cart.index');
        Route::post('/add', [CartController::class, 'addItem'])->name('cart.add');
        Route::put('/update', [CartController::class, 'updateItem'])->name('cart.update');
        Route::delete('/remove/{medicineId}', [CartController::class, 'removeItem'])->name('cart.remove');
        Route::delete('/clear', [CartController::class, 'clear'])->name('cart.clear');
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/{id}', [OrderController::class, 'show'])->name('orders.show');
        Route::post('/', [OrderController::class, 'store'])->name('orders.store');
        Route::post('/{id}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    });

    // Prescriptions
    Route::prefix('prescriptions')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index'])->name('prescriptions.index');
        Route::post('/', [PrescriptionController::class, 'store'])->name('prescriptions.store');
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware(RoleMiddleware::class . ':admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

        // Medicine management
        Route::post('/medicines', [MedicineController::class, 'store'])->name('admin.medicines.store');
        Route::put('/medicines/{id}', [MedicineController::class, 'update'])->name('admin.medicines.update');
        Route::delete('/medicines/{id}', [MedicineController::class, 'destroy'])->name('admin.medicines.destroy');

        // Category management
        Route::post('/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
        Route::put('/categories/{id}', [CategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');

        // User management
        Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
        Route::put('/users/{id}', [AdminController::class, 'updateUser'])->name('admin.users.update');

        // Business management
        Route::get('/businesses/pending', [AdminController::class, 'pendingBusinesses'])->name('admin.businesses.pending');
        Route::post('/businesses/{id}/approve', [AdminController::class, 'approveBusiness'])->name('admin.businesses.approve');
        Route::post('/businesses/{id}/reject', [AdminController::class, 'rejectBusiness'])->name('admin.businesses.reject');

        // Order management
        Route::get('/orders', [AdminController::class, 'allOrders'])->name('admin.orders');
        Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus'])->name('admin.orders.status');

        // Inventory
        Route::get('/inventory', [AdminController::class, 'inventory'])->name('admin.inventory');
        Route::put('/inventory/{id}/stock', [AdminController::class, 'updateStock'])->name('admin.inventory.stock');

        // Prescriptions
        Route::get('/prescriptions', [AdminController::class, 'prescriptions'])->name('admin.prescriptions');
        Route::put('/prescriptions/{id}/review', [AdminController::class, 'reviewPrescription'])->name('admin.prescriptions.review');
    });
});
