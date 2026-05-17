<?php

namespace App\Models;

use DateTimeInterface;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role', // consumer, store, admin
        'address',
        'city',
        'state',
        'pincode',
        'avatar',
        'is_active',
        'is_approved',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_approved' => 'boolean',
        ];
    }

    public function createToken(string $name, array $abilities = ['*'], ?DateTimeInterface $expiresAt = null): object
    {
        $plainTextToken = $this->generateTokenString();

        $token = PersonalAccessToken::create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
            'tokenable_id' => $this->getKey(),
            'tokenable_type' => static::class,
        ]);

        return (object) [
            'accessToken' => $token,
            'plainTextToken' => $token->getKey() . '|' . $plainTextToken,
        ];
    }

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function business()
    {
        return $this->hasOne(Business::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeConsumers($query)
    {
        return $query->where('role', 'consumer');
    }

    public function scopeStores($query)
    {
        return $query->where('role', 'store');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStore(): bool
    {
        return $this->role === 'store';
    }

    public function isConsumer(): bool
    {
        return $this->role === 'consumer';
    }
}
