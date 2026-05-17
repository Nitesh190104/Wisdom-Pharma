<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin', 'email' => 'admin@wisdompharma.com',
            'password' => Hash::make('password123'), 'phone' => '9999999999',
            'role' => 'admin', 'is_active' => true, 'is_approved' => true,
        ]);

        // Consumer
        User::create([
            'name' => 'Rahul Sharma', 'email' => 'rahul@example.com',
            'password' => Hash::make('password123'), 'phone' => '9876543210',
            'role' => 'consumer', 'is_active' => true, 'is_approved' => true,
            'address' => '123 MG Road', 'city' => 'Mumbai', 'state' => 'Maharashtra', 'pincode' => '400001',
        ]);

        // Store User
        $storeUser = User::create([
            'name' => 'Priya Patel', 'email' => 'priya@medstore.com',
            'password' => Hash::make('password123'), 'phone' => '9876543211',
            'role' => 'store', 'is_active' => true, 'is_approved' => true,
        ]);

        Business::create([
            'user_id' => $storeUser->_id, 'business_name' => 'Patel Medical Store',
            'gst_number' => '27AABCU9603R1ZM', 'drug_license_number' => 'MH-MUM-123456',
            'address' => '456 Station Road', 'city' => 'Pune', 'state' => 'Maharashtra',
            'pincode' => '411001', 'phone' => '9876543211', 'email' => 'priya@medstore.com',
            'is_verified' => true, 'verified_at' => now(),
        ]);

        // Categories
        $categories = [
            ['name' => 'Pain Relief', 'slug' => 'pain-relief', 'description' => 'Medicines for pain management', 'is_active' => true],
            ['name' => 'Antibiotics', 'slug' => 'antibiotics', 'description' => 'Anti-bacterial medicines', 'is_active' => true],
            ['name' => 'Vitamins & Supplements', 'slug' => 'vitamins-supplements', 'description' => 'Nutritional supplements', 'is_active' => true],
            ['name' => 'Digestive Care', 'slug' => 'digestive-care', 'description' => 'Digestive system medicines', 'is_active' => true],
            ['name' => 'Cardiac Care', 'slug' => 'cardiac-care', 'description' => 'Heart and cardiovascular medicines', 'is_active' => true],
            ['name' => 'Diabetes Care', 'slug' => 'diabetes-care', 'description' => 'Diabetes management medicines', 'is_active' => true],
            ['name' => 'Respiratory Care', 'slug' => 'respiratory-care', 'description' => 'Respiratory system medicines', 'is_active' => true],
            ['name' => 'Skin Care', 'slug' => 'skin-care', 'description' => 'Dermatological medicines', 'is_active' => true],
        ];

        $catMap = [];
        foreach ($categories as $cat) {
            $c = Category::create($cat);
            $catMap[$cat['name']] = $c->_id;
        }

        // Medicines
        $medicines = [
            ['medicine_name' => 'Paracetamol 500mg', 'description' => 'Effective fever and pain reliever. Used for headaches, muscle aches, and fever reduction.', 'category' => 'Pain Relief', 'stock' => 500, 'retail_price' => 30, 'wholesale_price' => 18, 'gst_percentage' => 12, 'manufacturer' => 'Cipla Ltd', 'prescription_required' => false, 'dosage' => '1-2 tablets every 4-6 hours', 'composition' => 'Paracetamol 500mg', 'min_wholesale_qty' => 50, 'expiry_date' => '2027-12-31'],
            ['medicine_name' => 'Amoxicillin 250mg', 'description' => 'Broad-spectrum antibiotic for bacterial infections including respiratory and urinary tract infections.', 'category' => 'Antibiotics', 'stock' => 300, 'retail_price' => 85, 'wholesale_price' => 52, 'gst_percentage' => 12, 'manufacturer' => 'Sun Pharma', 'prescription_required' => true, 'dosage' => '1 capsule 3 times daily', 'composition' => 'Amoxicillin Trihydrate 250mg', 'min_wholesale_qty' => 100, 'expiry_date' => '2027-06-30'],
            ['medicine_name' => 'Vitamin D3 60000 IU', 'description' => 'High-dose vitamin D supplement for deficiency correction and bone health.', 'category' => 'Vitamins & Supplements', 'stock' => 200, 'retail_price' => 120, 'wholesale_price' => 75, 'gst_percentage' => 5, 'manufacturer' => 'Abbott India', 'prescription_required' => false, 'dosage' => '1 sachet weekly', 'composition' => 'Cholecalciferol 60000 IU', 'min_wholesale_qty' => 50, 'expiry_date' => '2028-03-31'],
            ['medicine_name' => 'Omeprazole 20mg', 'description' => 'Proton pump inhibitor for acid reflux, GERD, and stomach ulcers.', 'category' => 'Digestive Care', 'stock' => 400, 'retail_price' => 65, 'wholesale_price' => 38, 'gst_percentage' => 12, 'manufacturer' => 'Dr Reddys', 'prescription_required' => false, 'dosage' => '1 capsule daily before breakfast', 'composition' => 'Omeprazole 20mg', 'min_wholesale_qty' => 100, 'expiry_date' => '2027-09-30'],
            ['medicine_name' => 'Atorvastatin 10mg', 'description' => 'Cholesterol-lowering medication for cardiovascular disease prevention.', 'category' => 'Cardiac Care', 'stock' => 250, 'retail_price' => 95, 'wholesale_price' => 58, 'gst_percentage' => 12, 'manufacturer' => 'Lupin Ltd', 'prescription_required' => true, 'dosage' => '1 tablet daily at bedtime', 'composition' => 'Atorvastatin Calcium 10mg', 'min_wholesale_qty' => 50, 'expiry_date' => '2027-11-30'],
            ['medicine_name' => 'Metformin 500mg', 'description' => 'First-line medication for type 2 diabetes management.', 'category' => 'Diabetes Care', 'stock' => 350, 'retail_price' => 45, 'wholesale_price' => 25, 'gst_percentage' => 5, 'manufacturer' => 'USV Private Ltd', 'prescription_required' => true, 'dosage' => '1 tablet twice daily with meals', 'composition' => 'Metformin Hydrochloride 500mg', 'min_wholesale_qty' => 100, 'expiry_date' => '2027-08-31'],
            ['medicine_name' => 'Cetirizine 10mg', 'description' => 'Antihistamine for allergies, hay fever, and urticaria relief.', 'category' => 'Respiratory Care', 'stock' => 600, 'retail_price' => 25, 'wholesale_price' => 12, 'gst_percentage' => 12, 'manufacturer' => 'Mankind Pharma', 'prescription_required' => false, 'dosage' => '1 tablet daily', 'composition' => 'Cetirizine Hydrochloride 10mg', 'min_wholesale_qty' => 200, 'expiry_date' => '2028-01-31'],
            ['medicine_name' => 'Clotrimazole Cream 1%', 'description' => 'Antifungal cream for skin infections, ringworm, and athlete foot.', 'category' => 'Skin Care', 'stock' => 150, 'retail_price' => 75, 'wholesale_price' => 45, 'gst_percentage' => 12, 'manufacturer' => 'Glenmark Pharma', 'prescription_required' => false, 'dosage' => 'Apply twice daily on affected area', 'composition' => 'Clotrimazole 1% w/w', 'min_wholesale_qty' => 50, 'expiry_date' => '2027-10-31'],
            ['medicine_name' => 'Azithromycin 500mg', 'description' => 'Macrolide antibiotic for respiratory, skin, and ear infections.', 'category' => 'Antibiotics', 'stock' => 8, 'retail_price' => 110, 'wholesale_price' => 68, 'gst_percentage' => 12, 'manufacturer' => 'Alkem Labs', 'prescription_required' => true, 'dosage' => '1 tablet daily for 3 days', 'composition' => 'Azithromycin Dihydrate 500mg', 'min_wholesale_qty' => 50, 'expiry_date' => '2027-07-31'],
            ['medicine_name' => 'Multivitamin Tablets', 'description' => 'Complete daily multivitamin with essential minerals for overall health.', 'category' => 'Vitamins & Supplements', 'stock' => 0, 'retail_price' => 150, 'wholesale_price' => 95, 'gst_percentage' => 5, 'manufacturer' => 'Pfizer India', 'prescription_required' => false, 'dosage' => '1 tablet daily after meal', 'composition' => 'Vitamins A,B,C,D,E + Minerals', 'min_wholesale_qty' => 100, 'expiry_date' => '2028-06-30'],
            ['medicine_name' => 'Ibuprofen 400mg', 'description' => 'NSAID for pain, inflammation, and fever. Effective for arthritis and muscle pain.', 'category' => 'Pain Relief', 'stock' => 450, 'retail_price' => 35, 'wholesale_price' => 20, 'gst_percentage' => 12, 'manufacturer' => 'Cipla Ltd', 'prescription_required' => false, 'dosage' => '1 tablet every 6-8 hours', 'composition' => 'Ibuprofen 400mg', 'min_wholesale_qty' => 100, 'expiry_date' => '2027-12-31'],
            ['medicine_name' => 'Amlodipine 5mg', 'description' => 'Calcium channel blocker for high blood pressure and angina.', 'category' => 'Cardiac Care', 'stock' => 300, 'retail_price' => 55, 'wholesale_price' => 32, 'gst_percentage' => 12, 'manufacturer' => 'Torrent Pharma', 'prescription_required' => true, 'dosage' => '1 tablet daily', 'composition' => 'Amlodipine Besylate 5mg', 'min_wholesale_qty' => 100, 'expiry_date' => '2028-02-28'],
        ];

        foreach ($medicines as $med) {
            $catName = $med['category'];
            $med['category_id'] = $catMap[$catName] ?? null;
            $med['is_active'] = true;
            $med['expiry_date'] = $med['expiry_date'];
            Medicine::create($med);
        }

        $this->command->info('Database seeded with sample data!');
        $this->command->info('Admin: admin@wisdompharma.com / password123');
        $this->command->info('Consumer: rahul@example.com / password123');
        $this->command->info('Store: priya@medstore.com / password123');
    }
}
