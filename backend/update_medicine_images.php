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

$mapping = [
    // Tablets and capsules (pills)
    'Paracetamol 500mg' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    'Crocin Advance' => 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop',
    'Dolo 650' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    'Azithromycin 500' => 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop',
    'Amoxicillin 500' => 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop',
    'Pantoprazole 40' => 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=500&auto=format&fit=crop',
    'Cetirizine 10mg' => 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop',
    'Shelcal 500' => 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop',
    'Zincovit' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    'Evion 400' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    'Limcee 500' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    'Metformin 500' => 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop',
    'Amlodipine 5mg' => 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop',

    // Liquids & Syrups
    'ORS Powder' => 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=500&auto=format&fit=crop',
    'Digene Gel' => 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop',
    'Benadryl Syrup' => 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop',
    'Ascoril LS' => 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop',

    // Sprays and Ointments
    'Volini Spray' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    'Vicks Vaporub' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop',
    'Otrivin Nasal Spray' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',

    // Surgical supplies
    'Surgical Cotton 100g' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop',
    'Band-Aid Strips' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop',
    'Crepe Bandage 6cm' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop',
    'Gauze Roll' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop',
    'Sterile Gloves' => 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop',
    'Face Mask Pack' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop',
    'Hand Sanitizer 100ml' => 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop',
    'Syringe 5ml' => 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=500&auto=format&fit=crop',
    'Syringe 10ml' => 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=500&auto=format&fit=crop',
    'Insulin Syringe' => 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=500&auto=format&fit=crop',
    'Digital Thermometer' => 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=500&auto=format&fit=crop',
    'Hot Water Bag' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop',
    'Nebulizer Mask Kit' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop',
    'Adult Diapers' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop',
    'Urine Collection Bag' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop',
    'Pregnancy Test Kit' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop',
    'Blood Glucose Strips' => 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop',
    'Antiseptic Liquid 100ml' => 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop',
    'Betadine Ointment' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop',
    'Micropore Tape' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop',
];

$count = 0;
$failed = 0;
foreach ($mapping as $name => $url) {
    $med = Medicine::where('medicine_name', $name)->first();
    if ($med) {
        // Create clean slug for filename
        $slug = Str::slug($name);
        $ext = 'jpg';
        if (preg_match('/\.(jpg|jpeg|png|webp)/i', $url, $matches)) {
            $ext = strtolower($matches[1]);
        }
        
        $filename = "{$slug}.{$ext}";
        $filepath = "{$dir}/{$filename}";
        
        echo "Downloading '{$name}' image from Unsplash...\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
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
            echo "Failed to download image for '{$name}' (HTTP {$code}).\n";
            $failed++;
        }
    } else {
        echo "Medicine '{$name}' not found.\n";
    }
}
echo "Successfully updated and stored {$count} medicines with local premium images! Failed: {$failed}.\n";
