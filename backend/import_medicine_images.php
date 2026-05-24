<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Medicine;

// Source folder: user's Medicines folder at project root
$sourceDir = realpath(__DIR__ . '/../Medicines');
// Destination: backend public/images/medicines
$destDir   = public_path('images/medicines');

if (!$sourceDir || !is_dir($sourceDir)) {
    die("ERROR: Medicines folder not found at: " . __DIR__ . '/../Medicines' . "\n");
}

if (!file_exists($destDir)) {
    mkdir($destDir, 0777, true);
    echo "Created directory: {$destDir}\n";
}

$appUrl   = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
$count    = 0;
$skipped  = 0;
$notFound = 0;

// Read all .avif files from source
$files = glob($sourceDir . DIRECTORY_SEPARATOR . '*.avif');
if (empty($files)) {
    die("No .avif files found in: {$sourceDir}\n");
}

echo "Found " . count($files) . " images in Medicines folder.\n\n";

foreach ($files as $srcPath) {
    $filename     = basename($srcPath);                         // e.g. "Dolo 650.avif"
    $medicineName = pathinfo($filename, PATHINFO_FILENAME);    // e.g. "Dolo 650"

    // Try exact match first
    $medicine = Medicine::whereRaw(['medicine_name' => $medicineName])->first();

    // If not found, try case-insensitive
    if (!$medicine) {
        $medicine = Medicine::whereRaw([
            'medicine_name' => ['$regex' => '^' . preg_quote($medicineName, '/') . '$', '$options' => 'i']
        ])->first();
    }

    if (!$medicine) {
        echo "NOT FOUND in DB: '{$medicineName}' (file: {$filename})\n";
        $notFound++;
        continue;
    }

    // Copy the file to destination
    $destPath = $destDir . DIRECTORY_SEPARATOR . $filename;
    if (!copy($srcPath, $destPath)) {
        echo "COPY FAILED: {$filename}\n";
        $skipped++;
        continue;
    }

    // Build local URL
    $localUrl = "{$appUrl}/images/medicines/" . rawurlencode($filename);

    // Update the DB record
    $medicine->update(['image' => $localUrl]);

    echo "OK: '{$medicineName}' → saved as '{$filename}' and updated in DB.\n";
    $count++;
}

echo "\n========================================\n";
echo "Done!\n";
echo "  Updated : {$count}\n";
echo "  Not found in DB: {$notFound}\n";
echo "  Copy errors: {$skipped}\n";
