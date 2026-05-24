<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Allow explicit frontend URLs (comma-separated) and common local dev origins.
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('FRONTEND_URL', 'http://localhost:5173'))))),

    // Match local dev (Vite may switch ports when 5173 is busy)
    'allowed_origins_patterns' => [
        '#^https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
