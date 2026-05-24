<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Otp extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'otps';

    protected $fillable = [
        'email',
        'otp',
        'is_verified',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }
}
