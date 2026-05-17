<?php

namespace Tests\Feature;

use App\Models\PersonalAccessToken;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    protected function tearDown(): void
    {
        PersonalAccessToken::query()->delete();
        Prescription::where('file_name', 'test-prescription.pdf')->delete();
        User::where('email', 'consumer-test@wisdompharma.com')->delete();

        parent::tearDown();
    }

    public function test_public_medicines_endpoint_supports_search(): void
    {
        $response = $this->getJson('/api/medicines?search=Vitamin');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'data',
                    'current_page',
                    'last_page',
                ],
            ]);
    }

    public function test_admin_uses_regular_login_and_can_open_dashboard(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@wisdompharma.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'phone' => '9999999999',
                'role' => 'admin',
                'is_active' => true,
                'is_approved' => true,
            ],
        );

        $login = $this->postJson('/api/auth/login', [
            'email' => 'admin@wisdompharma.com',
            'password' => 'password123',
        ]);

        $login
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'admin');

        $token = $login->json('data.token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_removed_admin_login_endpoint_is_not_available(): void
    {
        $this->postJson('/api/auth/admin/login', [
            'email' => 'admin@wisdompharma.com',
            'password' => 'password123',
        ])->assertNotFound();
    }

    public function test_authenticated_user_can_upload_prescription(): void
    {
        Storage::fake('public');

        $user = User::updateOrCreate(
            ['email' => 'consumer-test@wisdompharma.com'],
            [
                'name' => 'Prescription Test User',
                'password' => Hash::make('password123'),
                'phone' => '9000000000',
                'role' => 'consumer',
                'is_active' => true,
                'is_approved' => true,
            ],
        );

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->post('/api/prescriptions', [
                'file' => UploadedFile::fake()->create('test-prescription.pdf', 128, 'application/pdf'),
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending');
    }
}
