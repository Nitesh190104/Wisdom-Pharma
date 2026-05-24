<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Medicine;
use Illuminate\Support\Str;

$dir = public_path('images/medicines');
if (!file_exists($dir)) {
    mkdir($dir, 0777, true);
    echo "Created directory: {$dir}\n";
}

$medicines = Medicine::all();
$count = 0;
$failed = 0;

foreach ($medicines as $med) {
    $url = $med->image;
    if (empty($url)) {
        echo "Medicine '{$med->medicine_name}' has no image URL. Skipping.\n";
        continue;
    }
    
    // Create clean slug for filename
    $slug = Str::slug($med->medicine_name);
    
    // Find extension from URL or default to jpg
    $ext = 'jpg';
    if (preg_match('/\.(jpg|jpeg|png|webp)/i', $url, $matches)) {
        $ext = strtolower($matches[1]);
    }
    
    $filename = "{$slug}.{$ext}";
    $filepath = "{$dir}/{$filename}";
    
    echo "Downloading '{$med->medicine_name}' image from: {$url}...\n";
    
    // Download using curl with User-Agent to bypass any restrictions
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]);
    $data = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($code === 200 && !empty($data)) {
        file_put_contents($filepath, $data);
        $appUrl = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
        $localUrl = "{$appUrl}/images/medicines/{$filename}";
        
        $med->update(['image' => $localUrl]);
        echo "Success! Saved locally to '{$filename}' and updated database.\n";
        $count++;
    } else {
        echo "Failed to download image for '{$med->medicine_name}' (HTTP {$code}).\n";
        $failed++;
    }
}

echo "\nCompleted. Successfully downloaded {$count} images. Failed: {$failed}.\n";
