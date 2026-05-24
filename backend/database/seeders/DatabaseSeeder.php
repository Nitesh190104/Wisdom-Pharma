<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'wisdom.admin@wisdompharma.com');
        $adminPassword = env('ADMIN_PASSWORD', 'WisdomAdmin@123');

        // Clean slate for repeatable seeding
        User::where('email', 'admin@wisdompharma.com')->delete();
        User::where('email', $adminEmail)->delete();
        User::where('email', 'rahul@example.com')->delete();
        User::where('email', 'priya@medstore.com')->delete();
        
        Category::truncate();
        Medicine::truncate();
        Business::truncate();

        // 1. Create Admin
        User::create([
            'name' => 'Admin',
            'email' => $adminEmail,
            'password' => Hash::make($adminPassword),
            'phone' => '9999999999',
            'role' => 'admin',
            'is_active' => true,
            'is_approved' => true,
        ]);

        // 2. Create Consumer
        User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@example.com',
            'password' => Hash::make('password123'),
            'phone' => '9876543210',
            'role' => 'consumer',
            'is_active' => true,
            'is_approved' => true,
            'address' => '123 MG Road',
            'city' => 'Varanasi',
            'state' => 'Uttar Pradesh',
            'pincode' => '221006',
        ]);

        // 3. Create Store User & Business
        $storeUser = User::create([
            'name' => 'Priya Patel',
            'email' => 'priya@medstore.com',
            'password' => Hash::make('password123'),
            'phone' => '9876543211',
            'role' => 'store',
            'is_active' => true,
            'is_approved' => true,
        ]);

        Business::create([
            'user_id' => $storeUser->_id,
            'business_name' => 'Patel Medical Store',
            'gst_number' => '27AABCU9603R1ZM',
            'drug_license_number' => 'UP-VAR-123456',
            'address' => '456 Station Road',
            'city' => 'Varanasi',
            'state' => 'Uttar Pradesh',
            'pincode' => '221006',
            'phone' => '9876543211',
            'email' => 'priya@medstore.com',
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        // 4. Raw Medicines Dataset (40 Actual Products)
        $rawMedicines = [
            // Table 1
            [
                'name' => 'Paracetamol 500mg',
                'category' => 'Tablet',
                'manufacturer' => 'Cipla',
                'stock' => 500,
                'retail_price' => 30,
                'wholesale_price' => 22,
                'gst' => 12,
                'expiry_date' => '2027-12-31',
                'min_wholesale_qty' => 50,
                'description' => 'Fever and pain relief',
                'composition' => 'Paracetamol 500mg',
                'dosage' => '1 tablet after meal',
                'prescription_required' => false
            ],
            [
                'name' => 'Crocin Advance',
                'category' => 'Tablet',
                'manufacturer' => 'GSK',
                'stock' => 400,
                'retail_price' => 35,
                'wholesale_price' => 26,
                'gst' => 12,
                'expiry_date' => '2027-11-30',
                'min_wholesale_qty' => 50,
                'description' => 'Used for headache and fever',
                'composition' => 'Paracetamol 500mg',
                'dosage' => '1 tablet twice daily',
                'prescription_required' => false
            ],
            [
                'name' => 'Dolo 650',
                'category' => 'Tablet',
                'manufacturer' => 'Micro Labs',
                'stock' => 600,
                'retail_price' => 35,
                'wholesale_price' => 28,
                'gst' => 12,
                'expiry_date' => '2027-10-31',
                'min_wholesale_qty' => 50,
                'description' => 'Pain and fever reducer',
                'composition' => 'Paracetamol 650mg',
                'dosage' => '1 tablet when needed',
                'prescription_required' => false
            ],
            [
                'name' => 'Azithromycin 500',
                'category' => 'Antibiotic',
                'manufacturer' => 'Sun Pharma',
                'stock' => 200,
                'retail_price' => 120,
                'wholesale_price' => 95,
                'gst' => 12,
                'expiry_date' => '2027-09-30',
                'min_wholesale_qty' => 20,
                'description' => 'Bacterial infection treatment',
                'composition' => 'Azithromycin 500mg',
                'dosage' => 'Once daily for 3 days',
                'prescription_required' => true
            ],
            [
                'name' => 'Amoxicillin 500',
                'category' => 'Antibiotic',
                'manufacturer' => 'Mankind',
                'stock' => 250,
                'retail_price' => 95,
                'wholesale_price' => 70,
                'gst' => 12,
                'expiry_date' => '2027-08-31',
                'min_wholesale_qty' => 20,
                'description' => 'Infection treatment',
                'composition' => 'Amoxicillin 500mg',
                'dosage' => '1 capsule thrice daily',
                'prescription_required' => true
            ],
            [
                'name' => 'Pantoprazole 40',
                'category' => 'Capsule',
                'manufacturer' => 'Cipla',
                'stock' => 300,
                'retail_price' => 110,
                'wholesale_price' => 85,
                'gst' => 12,
                'expiry_date' => '2028-01-31',
                'min_wholesale_qty' => 30,
                'description' => 'Acidity and GERD relief',
                'composition' => 'Pantoprazole 40mg',
                'dosage' => 'Before breakfast',
                'prescription_required' => true
            ],
            [
                'name' => 'Cetirizine 10mg',
                'category' => 'Tablet',
                'manufacturer' => 'Dr. Reddy\'s',
                'stock' => 350,
                'retail_price' => 40,
                'wholesale_price' => 30,
                'gst' => 12,
                'expiry_date' => '2027-07-31',
                'min_wholesale_qty' => 50,
                'description' => 'Allergy relief medicine',
                'composition' => 'Cetirizine 10mg',
                'dosage' => '1 tablet at night',
                'prescription_required' => false
            ],
            [
                'name' => 'ORS Powder',
                'category' => 'Hydration',
                'manufacturer' => 'Electral',
                'stock' => 450,
                'retail_price' => 25,
                'wholesale_price' => 18,
                'gst' => 5,
                'expiry_date' => '2027-06-30',
                'min_wholesale_qty' => 100,
                'description' => 'Prevents dehydration',
                'composition' => 'Electrolytes & Glucose',
                'dosage' => 'Mix with water',
                'prescription_required' => false
            ],
            [
                'name' => 'Digene Gel',
                'category' => 'Syrup',
                'manufacturer' => 'Abbott',
                'stock' => 150,
                'retail_price' => 120,
                'wholesale_price' => 90,
                'gst' => 12,
                'expiry_date' => '2027-04-30',
                'min_wholesale_qty' => 20,
                'description' => 'Acidity and gas relief',
                'composition' => 'Magaldrate + Simethicone',
                'dosage' => '2 tsp after meals',
                'prescription_required' => false
            ],
            [
                'name' => 'Benadryl Syrup',
                'category' => 'Syrup',
                'manufacturer' => 'Johnson & Johnson',
                'stock' => 180,
                'retail_price' => 145,
                'wholesale_price' => 110,
                'gst' => 12,
                'expiry_date' => '2027-02-28',
                'min_wholesale_qty' => 20,
                'description' => 'Cough relief syrup',
                'composition' => 'Diphenhydramine',
                'dosage' => '5ml twice daily',
                'prescription_required' => false
            ],
            [
                'name' => 'Ascoril LS',
                'category' => 'Syrup',
                'manufacturer' => 'Glenmark',
                'stock' => 160,
                'retail_price' => 135,
                'wholesale_price' => 105,
                'gst' => 12,
                'expiry_date' => '2027-03-31',
                'min_wholesale_qty' => 20,
                'description' => 'Wet cough treatment',
                'composition' => 'Ambroxol + Levosalbutamol',
                'dosage' => '5ml three times daily',
                'prescription_required' => true
            ],
            [
                'name' => 'Volini Spray',
                'category' => 'Pain Relief',
                'manufacturer' => 'Sun Pharma',
                'stock' => 120,
                'retail_price' => 210,
                'wholesale_price' => 175,
                'gst' => 18,
                'expiry_date' => '2028-09-30',
                'min_wholesale_qty' => 10,
                'description' => 'Muscle pain relief spray',
                'composition' => 'Diclofenac + Menthol',
                'dosage' => 'Apply externally',
                'prescription_required' => false
            ],
            [
                'name' => 'Vicks Vaporub',
                'category' => 'Ointment',
                'manufacturer' => 'P&G',
                'stock' => 220,
                'retail_price' => 160,
                'wholesale_price' => 130,
                'gst' => 12,
                'expiry_date' => '2028-05-31',
                'min_wholesale_qty' => 20,
                'description' => 'Cold and cough relief',
                'composition' => 'Menthol + Camphor',
                'dosage' => 'Apply externally',
                'prescription_required' => false
            ],
            [
                'name' => 'Otrivin Nasal Spray',
                'category' => 'Nasal Spray',
                'manufacturer' => 'GSK',
                'stock' => 130,
                'retail_price' => 115,
                'wholesale_price' => 88,
                'gst' => 12,
                'expiry_date' => '2027-08-31',
                'min_wholesale_qty' => 20,
                'description' => 'Nasal congestion relief',
                'composition' => 'Xylometazoline',
                'dosage' => '1 spray per nostril',
                'prescription_required' => false
            ],
            [
                'name' => 'Shelcal 500',
                'category' => 'Supplement',
                'manufacturer' => 'Torrent Pharma',
                'stock' => 280,
                'retail_price' => 150,
                'wholesale_price' => 120,
                'gst' => 12,
                'expiry_date' => '2028-10-31',
                'min_wholesale_qty' => 30,
                'description' => 'Calcium supplement',
                'composition' => 'Calcium + Vitamin D3',
                'dosage' => '1 tablet daily',
                'prescription_required' => false
            ],
            [
                'name' => 'Zincovit',
                'category' => 'Supplement',
                'manufacturer' => 'Apex Labs',
                'stock' => 240,
                'retail_price' => 95,
                'wholesale_price' => 75,
                'gst' => 12,
                'expiry_date' => '2028-11-30',
                'min_wholesale_qty' => 30,
                'description' => 'Multivitamin supplement',
                'composition' => 'Vitamins & Zinc',
                'dosage' => '1 tablet daily',
                'prescription_required' => false
            ],
            [
                'name' => 'Evion 400',
                'category' => 'Capsule',
                'manufacturer' => 'Merck',
                'stock' => 200,
                'retail_price' => 85,
                'wholesale_price' => 65,
                'gst' => 12,
                'expiry_date' => '2028-07-31',
                'min_wholesale_qty' => 30,
                'description' => 'Vitamin E supplement',
                'composition' => 'Vitamin E',
                'dosage' => '1 capsule daily',
                'prescription_required' => false
            ],
            [
                'name' => 'Limcee 500',
                'category' => 'Tablet',
                'manufacturer' => 'Abbott',
                'stock' => 300,
                'retail_price' => 40,
                'wholesale_price' => 28,
                'gst' => 12,
                'expiry_date' => '2028-09-30',
                'min_wholesale_qty' => 50,
                'description' => 'Vitamin C supplement',
                'composition' => 'Vitamin C 500mg',
                'dosage' => '1 tablet daily',
                'prescription_required' => false
            ],
            [
                'name' => 'Metformin 500',
                'category' => 'Diabetes',
                'manufacturer' => 'USV',
                'stock' => 180,
                'retail_price' => 55,
                'wholesale_price' => 42,
                'gst' => 12,
                'expiry_date' => '2028-01-31',
                'min_wholesale_qty' => 20,
                'description' => 'Diabetes management',
                'composition' => 'Metformin 500mg',
                'dosage' => 'After meals',
                'prescription_required' => true
            ],
            [
                'name' => 'Amlodipine 5mg',
                'category' => 'BP Medicine',
                'manufacturer' => 'Cipla',
                'stock' => 170,
                'retail_price' => 60,
                'wholesale_price' => 45,
                'gst' => 12,
                'expiry_date' => '2028-02-29',
                'min_wholesale_qty' => 20,
                'description' => 'Blood pressure control',
                'composition' => 'Amlodipine 5mg',
                'dosage' => 'Once daily',
                'prescription_required' => true
            ],

            // Table 2
            [
                'name' => 'Surgical Cotton 100g',
                'category' => 'First Aid',
                'manufacturer' => 'Johnson & Johnson',
                'stock' => 300,
                'retail_price' => 45,
                'wholesale_price' => 32,
                'gst' => 5,
                'expiry_date' => '2028-12-31',
                'min_wholesale_qty' => 50,
                'description' => 'Soft absorbent cotton',
                'composition' => 'Pure Cotton',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Band-Aid Strips',
                'category' => 'Bandage',
                'manufacturer' => 'Johnson & Johnson',
                'stock' => 500,
                'retail_price' => 25,
                'wholesale_price' => 18,
                'gst' => 12,
                'expiry_date' => '2028-10-31',
                'min_wholesale_qty' => 100,
                'description' => 'Small wound protection',
                'composition' => 'Adhesive Bandage',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Crepe Bandage 6cm',
                'category' => 'Bandage',
                'manufacturer' => 'Romsons',
                'stock' => 200,
                'retail_price' => 85,
                'wholesale_price' => 65,
                'gst' => 12,
                'expiry_date' => '2028-09-30',
                'min_wholesale_qty' => 30,
                'description' => 'Support for sprains',
                'composition' => 'Cotton Elastic Bandage',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Gauze Roll',
                'category' => 'First Aid',
                'manufacturer' => 'Savlon',
                'stock' => 250,
                'retail_price' => 55,
                'wholesale_price' => 40,
                'gst' => 12,
                'expiry_date' => '2028-11-30',
                'min_wholesale_qty' => 50,
                'description' => 'Wound dressing material',
                'composition' => 'Sterile Gauze',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Sterile Gloves',
                'category' => 'Medical Supplies',
                'manufacturer' => 'Surgicare',
                'stock' => 400,
                'retail_price' => 30,
                'wholesale_price' => 22,
                'gst' => 12,
                'expiry_date' => '2028-08-31',
                'min_wholesale_qty' => 100,
                'description' => 'Disposable examination gloves',
                'composition' => 'Latex',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Face Mask Pack',
                'category' => 'Hygiene',
                'manufacturer' => '3M',
                'stock' => 600,
                'retail_price' => 50,
                'wholesale_price' => 35,
                'gst' => 5,
                'expiry_date' => '2028-07-31',
                'min_wholesale_qty' => 100,
                'description' => 'Protection from dust/germs',
                'composition' => 'Non-woven Fabric',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Hand Sanitizer 100ml',
                'category' => 'Hygiene',
                'manufacturer' => 'Dettol',
                'stock' => 350,
                'retail_price' => 60,
                'wholesale_price' => 45,
                'gst' => 18,
                'expiry_date' => '2028-06-30',
                'min_wholesale_qty' => 50,
                'description' => 'Hand disinfectant',
                'composition' => 'Alcohol Based',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Syringe 5ml',
                'category' => 'Injection',
                'manufacturer' => 'Dispovan',
                'stock' => 700,
                'retail_price' => 12,
                'wholesale_price' => 8,
                'gst' => 12,
                'expiry_date' => '2030-05-31',
                'min_wholesale_qty' => 200,
                'description' => 'Disposable syringe',
                'composition' => 'Sterile Plastic',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Syringe 10ml',
                'category' => 'Injection',
                'manufacturer' => 'Romsons',
                'stock' => 500,
                'retail_price' => 18,
                'wholesale_price' => 13,
                'gst' => 12,
                'expiry_date' => '2030-05-31',
                'min_wholesale_qty' => 200,
                'description' => 'Medical injection syringe',
                'composition' => 'Sterile Plastic',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Insulin Syringe',
                'category' => 'Diabetes Care',
                'manufacturer' => 'BD',
                'stock' => 250,
                'retail_price' => 22,
                'wholesale_price' => 16,
                'gst' => 12,
                'expiry_date' => '2030-04-30',
                'min_wholesale_qty' => 100,
                'description' => 'Insulin injection syringe',
                'composition' => 'Sterile Plastic',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Digital Thermometer',
                'category' => 'Medical Device',
                'manufacturer' => 'Omron',
                'stock' => 120,
                'retail_price' => 180,
                'wholesale_price' => 145,
                'gst' => 18,
                'expiry_date' => '2030-12-31',
                'min_wholesale_qty' => 10,
                'description' => 'Measures body temperature',
                'composition' => 'Electronic Device',
                'dosage' => 'Oral/Axillary use',
                'prescription_required' => false
            ],
            [
                'name' => 'Hot Water Bag',
                'category' => 'Healthcare',
                'manufacturer' => 'Flamingo',
                'stock' => 90,
                'retail_price' => 250,
                'wholesale_price' => 200,
                'gst' => 18,
                'expiry_date' => '2030-01-31',
                'min_wholesale_qty' => 10,
                'description' => 'Heat therapy for pain relief',
                'composition' => 'Rubber',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Nebulizer Mask Kit',
                'category' => 'Respiratory Care',
                'manufacturer' => 'Omron',
                'stock' => 100,
                'retail_price' => 140,
                'wholesale_price' => 105,
                'gst' => 12,
                'expiry_date' => '2029-03-31',
                'min_wholesale_qty' => 20,
                'description' => 'Used with nebulizer machine',
                'composition' => 'PVC Material',
                'dosage' => 'As directed',
                'prescription_required' => false
            ],
            [
                'name' => 'Adult Diapers',
                'category' => 'Personal Care',
                'manufacturer' => 'Friends',
                'stock' => 180,
                'retail_price' => 320,
                'wholesale_price' => 270,
                'gst' => 12,
                'expiry_date' => '2029-08-31',
                'min_wholesale_qty' => 20,
                'description' => 'Elderly patient care',
                'composition' => 'Absorbent Material',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Urine Collection Bag',
                'category' => 'Hospital Supplies',
                'manufacturer' => 'Romsons',
                'stock' => 220,
                'retail_price' => 75,
                'wholesale_price' => 55,
                'gst' => 12,
                'expiry_date' => '2029-06-30',
                'min_wholesale_qty' => 50,
                'description' => 'Urine storage bag',
                'composition' => 'Medical Grade PVC',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Pregnancy Test Kit',
                'category' => 'Diagnostic',
                'manufacturer' => 'Prega News',
                'stock' => 260,
                'retail_price' => 55,
                'wholesale_price' => 42,
                'gst' => 12,
                'expiry_date' => '2028-09-30',
                'min_wholesale_qty' => 50,
                'description' => 'Home pregnancy test',
                'composition' => 'HCG Detection Kit',
                'dosage' => 'Single use',
                'prescription_required' => false
            ],
            [
                'name' => 'Blood Glucose Strips',
                'category' => 'Diabetes Care',
                'manufacturer' => 'Accu-Chek',
                'stock' => 150,
                'retail_price' => 850,
                'wholesale_price' => 760,
                'gst' => 12,
                'expiry_date' => '2028-05-31',
                'min_wholesale_qty' => 10,
                'description' => 'Sugar testing strips',
                'composition' => 'Test Strips',
                'dosage' => 'Use with glucometer',
                'prescription_required' => false
            ],
            [
                'name' => 'Antiseptic Liquid 100ml',
                'category' => 'First Aid',
                'manufacturer' => 'Dettol',
                'stock' => 320,
                'retail_price' => 75,
                'wholesale_price' => 58,
                'gst' => 18,
                'expiry_date' => '2028-11-30',
                'min_wholesale_qty' => 50,
                'description' => 'Kills germs on wounds',
                'composition' => 'Chloroxylenol Solution',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Betadine Ointment',
                'category' => 'First Aid',
                'manufacturer' => 'Win-Medicare',
                'stock' => 180,
                'retail_price' => 95,
                'wholesale_price' => 72,
                'gst' => 12,
                'expiry_date' => '2028-10-31',
                'min_wholesale_qty' => 30,
                'description' => 'Antiseptic wound cream',
                'composition' => 'Povidone Iodine',
                'dosage' => 'External use',
                'prescription_required' => false
            ],
            [
                'name' => 'Micropore Tape',
                'category' => 'Medical Supplies',
                'manufacturer' => '3M',
                'stock' => 250,
                'retail_price' => 65,
                'wholesale_price' => 48,
                'gst' => 12,
                'expiry_date' => '2029-02-28',
                'min_wholesale_qty' => 50,
                'description' => 'Medical adhesive tape',
                'composition' => 'Paper Surgical Tape',
                'dosage' => 'External use',
                'prescription_required' => false
            ]
        ];

        // 5. Build Categories Map Dynamically
        $uniqueCategories = collect($rawMedicines)->pluck('category')->unique();
        $catMap = [];

        foreach ($uniqueCategories as $catName) {
            $category = Category::create([
                'name' => $catName,
                'slug' => Str::slug($catName),
                'description' => "Pharmaceutical products and medical essentials in the {$catName} segment.",
                'is_active' => true
            ]);
            $catMap[$catName] = $category->_id;
        }

        // 6. Seed the 40 Medicines
        $appUrl = rtrim(env('APP_URL', 'http://localhost:8000'), '/');

        foreach ($rawMedicines as $medData) {
            $name = $medData['name'];
            $catName = $medData['category'];

            // Match exact AVIF image filename
            // Handle special mapping for Antiseptic Liquid 100ml
            $imgBaseName = $name;
            if ($name === 'Antiseptic Liquid 100ml') {
                $imgBaseName = 'Antiseptic Liquid';
            }
            $filename = rawurlencode($imgBaseName) . '.avif';
            $imageUrl = "{$appUrl}/images/medicines/{$filename}";

            Medicine::create([
                'medicine_name' => $name,
                'category' => $catName,
                'category_id' => $catMap[$catName] ?? null,
                'manufacturer' => $medData['manufacturer'],
                'stock' => (int)$medData['stock'],
                'retail_price' => (float)$medData['retail_price'],
                'wholesale_price' => (float)$medData['wholesale_price'],
                'gst_percentage' => (int)$medData['gst'],
                'expiry_date' => $medData['expiry_date'],
                'min_wholesale_qty' => (int)$medData['min_wholesale_qty'],
                'description' => $medData['description'],
                'composition' => $medData['composition'],
                'dosage' => $medData['dosage'],
                'prescription_required' => (bool)$medData['prescription_required'],
                'image' => $imageUrl,
                'is_active' => true
            ]);
        }

        $this->command->info('Database successfully re-seeded with your custom 40 medicines catalog and correct .avif local images mapping!');
    }
}
