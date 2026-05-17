<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Business extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'businesses';

    protected $fillable = [
        'user_id',
        'business_name',
        'gst_number',
        'drug_license_number',
        'address',
        'city',
        'state',
        'pincode',
        'phone',
        'email',
        'is_verified',
        'documents',
        'verification_notes',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'documents' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_verified', false);
    }
}
