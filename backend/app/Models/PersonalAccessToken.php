<?php

namespace App\Models;

use Laravel\Sanctum\Contracts\HasAbilities;
use MongoDB\Laravel\Eloquent\Model;

class PersonalAccessToken extends Model implements HasAbilities
{
    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'token',
        'abilities',
        'expires_at',
        'tokenable_id',
        'tokenable_type',
        'last_used_at',
    ];

    protected $casts = [
        'abilities' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the tokenable model.
     */
    public function tokenable()
    {
        return $this->morphTo('tokenable');
    }

    /**
     * Find the token instance matching the given token.
     */
    public static function findToken($token)
    {
        if (strpos($token, '|') === false) {
            return static::where('token', hash('sha256', $token))->first();
        }

        [$id, $token] = explode('|', $token, 2);

        $instance = static::find($id);

        if ($instance) {
            return hash_equals($instance->token, hash('sha256', $token)) ? $instance : null;
        }

        return null;
    }

    /**
     * Determine if the token has a given ability.
     */
    public function can($ability)
    {
        return in_array('*', $this->abilities ?? []) || in_array($ability, $this->abilities ?? []);
    }

    /**
     * Determine if the token is missing a given ability.
     */
    public function cant($ability)
    {
        return ! $this->can($ability);
    }
}
