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
        // Admin (env-configurable)
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

        // 4. Create Categories
        $categories = [
            [
                'name' => 'Critical Care Injections',
                'slug' => 'critical-care-injections',
                'description' => 'Life-saving and high-efficacy critical care injections stored and distributed under sterile cold-chain parameters.',
                'is_active' => true
            ],
            [
                'name' => 'Specialty Oral Tablets',
                'slug' => 'specialty-oral-tablets',
                'description' => 'Specialized oral therapeutic tablets, antifungal doses, and daily life management capsules.',
                'is_active' => true
            ],
            [
                'name' => 'General OTC & Pain Relief',
                'slug' => 'general-otc-pain-relief',
                'description' => 'Over-the-counter everyday medicines, pain relievers, cold and cough formulations, and fever management tablets.',
                'is_active' => true
            ],
            [
                'name' => 'Medical & Surgical Supplies',
                'slug' => 'medical-surgical-supplies',
                'description' => 'Clinical consumables, medical gauze rolls, absorbent cotton waddings, and surgical dressings.',
                'is_active' => true
            ],
            [
                'name' => 'Surgical Instruments',
                'slug' => 'surgical-instruments',
                'description' => 'Precision clinical instruments, hospital tools, and surgical hardware sourced from trusted manufacturers.',
                'is_active' => true
            ],
        ];

        $catMap = [];
        foreach ($categories as $cat) {
            $c = Category::create($cat);
            $catMap[$cat['name']] = $c->_id;
        }

        // 5. Create Medicines (Wisdom Pharma Varanasi Actual IndiaMART Catalog)
        $medicines = [
            // Life-Saving Injections
            [
                'medicine_name' => 'Bd Ampho Injection',
                'description' => 'Bd Ampho Injection is a sterile antifungal medication containing Amphotericin B. It is formulated to treat serious, life-threatening systemic fungal infections of the blood, lungs, and core organs.',
                'category' => 'Critical Care Injections',
                'stock' => 120,
                'retail_price' => 3200,
                'wholesale_price' => 1950,
                'gst_percentage' => 12,
                'manufacturer' => 'BDR Pharmaceuticals',
                'prescription_required' => true,
                'dosage' => 'As directed by the oncologist/haematologist',
                'composition' => 'Amphotericin B 50mg',
                'min_wholesale_qty' => 5,
                'expiry_date' => '2028-04-30',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2024/8/441593451/RO/MA/NZ/112230271/112230271-product-1723179787105-250x250.jpeg',
            ],
            [
                'medicine_name' => 'Xavitaz Injection',
                'description' => 'Xavitaz is a powerful broad-spectrum intravenous antibiotic combination of Piperacillin and Tazobactam. Effective against multi-drug resistant bacterial infections in the lungs (pneumonia), abdomen, and skin structures.',
                'category' => 'Critical Care Injections',
                'stock' => 180,
                'retail_price' => 1450,
                'wholesale_price' => 790,
                'gst_percentage' => 12,
                'manufacturer' => 'Xavia Lifesciences',
                'prescription_required' => true,
                'dosage' => 'IV Infusion as guided by clinical supervisor',
                'composition' => 'Piperacillin 4g + Tazobactam 0.5g',
                'min_wholesale_qty' => 10,
                'expiry_date' => '2027-11-30',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2024/8/441592936/YI/FL/NS/112230271/112230271-product-1723179677807-250x250.jpeg',
            ],
            [
                'medicine_name' => 'Tigecycline Injection',
                'description' => 'Tigecycline is a glycylcycline class antibiotic used for complicated skin and intra-abdominal bacterial infections. Specially designed to combat tetracycline-resistant strains.',
                'category' => 'Critical Care Injections',
                'stock' => 90,
                'retail_price' => 3500,
                'wholesale_price' => 2100,
                'gst_percentage' => 12,
                'manufacturer' => 'Cipla Ltd',
                'prescription_required' => true,
                'dosage' => 'Intravenous infusion over 30-60 minutes every 12 hours',
                'composition' => 'Tigecycline 50mg',
                'min_wholesale_qty' => 5,
                'expiry_date' => '2027-09-30',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2024/8/441594430/MS/LI/FL/112230271/112230271-product-1723179987394-250x250.jpeg',
            ],
            [
                'medicine_name' => 'Bd Dapto Injection',
                'description' => 'Bd Dapto contains Daptomycin, a lipopeptide antibiotic indicated for complex skin structure infections (cSSSI) and Staphylococcus aureus bloodstream infections.',
                'category' => 'Critical Care Injections',
                'stock' => 75,
                'retail_price' => 5800,
                'wholesale_price' => 3600,
                'gst_percentage' => 12,
                'manufacturer' => 'BDR Pharmaceuticals',
                'prescription_required' => true,
                'dosage' => '4 mg/kg to 6 mg/kg intravenously once every 24 hours',
                'composition' => 'Daptomycin 350mg',
                'min_wholesale_qty' => 3,
                'expiry_date' => '2027-08-31',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2023/5/305620881/WH/HX/YS/112230271/bd-dapto-injection-1683271582956-250x250.jpg',
            ],
            [
                'medicine_name' => 'Streptokinase Injection',
                'description' => 'Streptokinase is a critical clot-dissolving (thrombolytic) enzyme injection. Administered urgently during acute myocardial infarction (heart attack) or deep vein thrombosis (DVT) to restore blood circulation.',
                'category' => 'Critical Care Injections',
                'stock' => 45,
                'retail_price' => 2400,
                'wholesale_price' => 1450,
                'gst_percentage' => 12,
                'manufacturer' => 'Bharat Serums & Vaccines',
                'prescription_required' => true,
                'dosage' => '1.5 million IU administered under rigorous ICU monitoring',
                'composition' => 'Streptokinase 1500000 IU',
                'min_wholesale_qty' => 2,
                'expiry_date' => '2027-10-31',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2023/5/305620884/GT/JA/OB/112230271/streptokinase-injection-1683271583313-250x250.jpg',
            ],
            [
                'medicine_name' => 'Insulin Injection',
                'description' => 'Human Insulin injection for rapid and steady glycemic control in type-1 and type-2 diabetic medical care. Stored strictly in high-standard cold-chain refrigeration.',
                'category' => 'Critical Care Injections',
                'stock' => 350,
                'retail_price' => 160,
                'wholesale_price' => 95,
                'gst_percentage' => 5,
                'manufacturer' => 'Biocon Ltd',
                'prescription_required' => true,
                'dosage' => 'Subcutaneous self-injection as directed by endocrinologist',
                'composition' => 'Human Insulin 40 IU/ml',
                'min_wholesale_qty' => 20,
                'expiry_date' => '2027-06-30',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2023/5/305620885/DL/IS/XP/112230271/insulin-injection-1683271583700-250x250.jpg',
            ],

            // Specialty Oral Tablets
            [
                'medicine_name' => 'Posaconazole Gastro Tablet',
                'description' => 'Posaconazole gastro-resistant delayed-release tablets. Used for deep prevention of severe fungal infections like invasive Candida and Aspergillus in high-risk immunocompromised clinical treatments.',
                'category' => 'Specialty Oral Tablets',
                'stock' => 110,
                'retail_price' => 8200,
                'wholesale_price' => 5400,
                'gst_percentage' => 12,
                'manufacturer' => 'MSD Pharmaceuticals',
                'prescription_required' => true,
                'dosage' => '300 mg daily with or without meals',
                'composition' => 'Posaconazole 100mg',
                'min_wholesale_qty' => 5,
                'expiry_date' => '2028-02-28',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2023/5/305620877/DX/TM/FR/112230271/posaconazole-gastro-tablet-1683271582616-250x250.jpg',
            ],
            [
                'medicine_name' => 'Eplerenone Tablet',
                'description' => 'Eplerenone is a specialized mineralocorticoid receptor blocker. Used to enhance survival rates and heart wellness after congestive heart failure and cardio events.',
                'category' => 'Specialty Oral Tablets',
                'stock' => 220,
                'retail_price' => 410,
                'wholesale_price' => 250,
                'gst_percentage' => 12,
                'manufacturer' => 'Lupin Ltd',
                'prescription_required' => true,
                'dosage' => '25 mg or 50 mg tablet daily once',
                'composition' => 'Eplerenone 25mg',
                'min_wholesale_qty' => 15,
                'expiry_date' => '2027-12-31',
                'image' => 'https://5.imimg.com/data5/NSDMERP/Default/2023/5/305620873/JJ/WQ/EX/112230271/eplerenone-tablet-1683271582246-250x250.jpg',
            ],

            // General OTC & Pain Relief (Newly Added Common Medicines)
            [
                'medicine_name' => 'Dolo 650mg Tablet',
                'description' => 'Dolo 650 contains Paracetamol IP, highly trusted across India for quick and effective fever reduction and relief from moderate pain including headache, toothache, muscle aches, and cold discomfort.',
                'category' => 'General OTC & Pain Relief',
                'stock' => 800,
                'retail_price' => 31,
                'wholesale_price' => 16,
                'gst_percentage' => 12,
                'manufacturer' => 'Micro Labs Ltd',
                'prescription_required' => false,
                'dosage' => '1 tablet 3-4 times daily as needed. Maintain a gap of 4-6 hours between doses.',
                'composition' => 'Paracetamol IP 650mg',
                'min_wholesale_qty' => 100,
                'expiry_date' => '2028-12-31',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2021/3/FP/XG/YB/35345731/dolo-650-mg-tablet-500x500.jpg',
            ],
            [
                'medicine_name' => 'Amoxyclav 625 Tablet',
                'description' => 'Amoxyclav 625 is an antibiotic combination consisting of Amoxicillin and Clavulanic Acid, highly effective for bacterial infections of the lungs, ears, sinuses, urinary tract, and skin.',
                'category' => 'General OTC & Pain Relief',
                'stock' => 350,
                'retail_price' => 220,
                'wholesale_price' => 130,
                'gst_percentage' => 12,
                'manufacturer' => 'Abbott India',
                'prescription_required' => true,
                'dosage' => '1 tablet twice daily or as prescribed by a medical expert.',
                'composition' => 'Amoxicillin IP 500mg + Clavulanic Acid 125mg',
                'min_wholesale_qty' => 50,
                'expiry_date' => '2027-10-31',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2022/9/SS/UX/GD/3389020/amoxyclav-625-tablet-500x500.jpg',
            ],
            [
                'medicine_name' => 'Pantocid 40mg Tablet',
                'description' => 'Pantocid contains Pantoprazole, a proton pump inhibitor that reduces the amount of acid produced in your stomach. Used for treating acid reflux, GERD, and peptic ulcers.',
                'category' => 'General OTC & Pain Relief',
                'stock' => 450,
                'retail_price' => 165,
                'wholesale_price' => 95,
                'gst_percentage' => 12,
                'manufacturer' => 'Sun Pharmaceutical Industries',
                'prescription_required' => false,
                'dosage' => '1 tablet daily in the morning, 30 minutes before breakfast.',
                'composition' => 'Pantoprazole Sodium IP 40mg',
                'min_wholesale_qty' => 50,
                'expiry_date' => '2028-06-30',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2020/9/XT/EA/VE/15316490/pantocid-40mg-tablet-500x500.jpg',
            ],
            [
                'medicine_name' => 'Cetirizine 10mg Tablet (Okacet)',
                'description' => 'Cetirizine is a non-drowsy, second-generation antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, sneezing, hives, and itching.',
                'category' => 'General OTC & Pain Relief',
                'stock' => 600,
                'retail_price' => 18,
                'wholesale_price' => 9,
                'gst_percentage' => 12,
                'manufacturer' => 'Cipla Ltd',
                'prescription_required' => false,
                'dosage' => '1 tablet daily at bedtime or as needed.',
                'composition' => 'Cetirizine Hydrochloride IP 10mg',
                'min_wholesale_qty' => 100,
                'expiry_date' => '2028-09-30',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2021/3/KK/IH/YQ/35345731/cetirizine-10mg-tablet-500x500.jpg',
            ],
            [
                'medicine_name' => 'Vicks Action 500 Advanced',
                'description' => 'A trusted multi-symptom cold relief tablet containing Paracetamol, Phenylephrine, and Caffeine to alleviate nasal block, headache, bodyache, and runny nose.',
                'category' => 'General OTC & Pain Relief',
                'stock' => 500,
                'retail_price' => 45,
                'wholesale_price' => 25,
                'gst_percentage' => 12,
                'manufacturer' => 'Procter & Gamble',
                'prescription_required' => false,
                'dosage' => '1 tablet every 6 hours. Do not exceed 4 tablets in 24 hours.',
                'composition' => 'Paracetamol 500mg + Phenylephrine HCl 5mg + Caffeine anhydrous 30mg',
                'min_wholesale_qty' => 80,
                'expiry_date' => '2028-03-31',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2022/10/SI/XJ/TY/13926511/vicks-action-500-tablet-500x500.jpg',
            ],

            // Medical & Surgical Supplies
            [
                'medicine_name' => 'Cotton Roller Bandages (Pack of 10)',
                'description' => '100% premium cotton rolled surgical bandages. Excellent skin breathability, high stretching capacity, and sterilizable. Perfect for clinical dressing and orthopaedic wraps.',
                'category' => 'Medical & Surgical Supplies',
                'stock' => 500,
                'retail_price' => 180,
                'wholesale_price' => 105,
                'gst_percentage' => 12,
                'manufacturer' => 'Wisdom Consumables',
                'prescription_required' => false,
                'dosage' => 'Wrap securely as required over wound dressing',
                'composition' => 'Premium Bleached Surgical Cotton',
                'min_wholesale_qty' => 50,
                'expiry_date' => '2030-12-31',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2021/6/YF/WW/ZM/12739097/cotton-rolled-bandage-500x500.jpg',
            ],
            [
                'medicine_name' => 'Absorbent Medical Gauze Roll',
                'description' => 'High-absorbency surgical gauze roll. Free of loose threads, bleach-tested, sterile-grade, and ideal for heavy-duty hospital operations and emergency dressing.',
                'category' => 'Medical & Surgical Supplies',
                'stock' => 400,
                'retail_price' => 220,
                'wholesale_price' => 125,
                'gst_percentage' => 12,
                'manufacturer' => 'Wisdom Consumables',
                'prescription_required' => false,
                'dosage' => 'Cut and sterilize as required for surgical dressings',
                'composition' => '100% Absorbent Woven Cotton',
                'min_wholesale_qty' => 30,
                'expiry_date' => '2030-09-30',
                'image' => 'https://3.imimg.com/data3/UE/VO/MY-10259837/absorbent-gauze-500x500.jpg',
            ],
            [
                'medicine_name' => 'Absorbent Cotton Wadding (500g)',
                'description' => 'Premium surgical cotton wadding roll. Super soft, free from impurities, highly absorbent, and derm-friendly. Crafted for general hospital and home nursing.',
                'category' => 'Medical & Surgical Supplies',
                'stock' => 300,
                'retail_price' => 150,
                'wholesale_price' => 85,
                'gst_percentage' => 5,
                'manufacturer' => 'Wisdom Consumables',
                'prescription_required' => false,
                'dosage' => 'Use as required for clinical cleaning or padding',
                'composition' => 'Absorbent Cotton Wool IP',
                'min_wholesale_qty' => 40,
                'expiry_date' => '2030-06-30',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2020/9/ZQ/UX/TI/42436814/absorbent-surgical-cotton-500x500.jpg',
            ],

            // Surgical Instruments
            [
                'medicine_name' => 'Premium Surgical Instruments Kit',
                'description' => 'Clinical-grade diagnostic & surgical instrument kit containing stainless steel scissors, forceps, scalpel handles, and artery clamps. Rust-proof, highly durable, and autoclavable.',
                'category' => 'Surgical Instruments',
                'stock' => 60,
                'retail_price' => 4500,
                'wholesale_price' => 2600,
                'gst_percentage' => 18,
                'manufacturer' => 'Precision Surgical India',
                'prescription_required' => false,
                'dosage' => 'Autoclave before surgical or diagnostic usage',
                'composition' => 'Medical Grade AISI 304 Stainless Steel',
                'min_wholesale_qty' => 5,
                'expiry_date' => '2035-12-31',
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2023/3/HX/VO/OP/186523996/surgical-instruments-500x500.jpg',
            ],
        ];

        foreach ($medicines as $med) {
            $catName = $med['category'];
            $med['category_id'] = $catMap[$catName] ?? null;
            $med['is_active'] = true;
            Medicine::create($med);
        }

        $this->command->info('Database successfully re-seeded with Wisdom Pharma Varanasi IndiaMART catalog, exact pricing, and common OTC medications!');
        $this->command->info("Admin: {$adminEmail} / {$adminPassword}");
        $this->command->info('Consumer: rahul@example.com / password123 (Varanasi)');
        $this->command->info('Store: priya@medstore.com / password123 (Patel Medical Store, Varanasi)');
    }
}
