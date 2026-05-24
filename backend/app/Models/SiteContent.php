<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SiteContent extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'site_contents';

    protected $fillable = [
        'key',    // e.g. "about"
        'data',   // JSON blob of all page content
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    /**
     * Get content by key, or return null.
     */
    public static function getByKey(string $key): ?self
    {
        return static::where('key', $key)->first();
    }

    /**
     * Upsert content by key.
     */
    public static function upsertByKey(string $key, array $data): self
    {
        $record = static::firstOrNew(['key' => $key]);
        $record->data = $data;
        $record->save();
        return $record;
    }
}
