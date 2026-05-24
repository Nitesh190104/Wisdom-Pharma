<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Medicine;

$src  = realpath(__DIR__ . '/../Medicines/Antiseptic Liquid.avif');
$dest = public_path('images/medicines') . DIRECTORY_SEPARATOR . 'Antiseptic Liquid 100ml.avif';
$appUrl = rtrim(env('APP_URL', 'http://localhost:8000'), '/');

if (!$src) {
    die("Source file not found.\n");
}

if (copy($src, $dest)) {
    echo "Copied to: $dest\n";
    // Try to find by partial name
    $med = Medicine::whereRaw(['medicine_name' => ['$regex' => 'antiseptic', '$options' => 'i']])->first();
    if ($med) {
        $localUrl = $appUrl . '/images/medicines/Antiseptic%20Liquid%20100ml.avif';
        $med->update(['image' => $localUrl]);
        echo "Updated DB for: " . $med->medicine_name . "\n";
    } else {
        echo "Medicine not found in DB\n";
    }
} else {
    echo "Copy failed\n";
}
