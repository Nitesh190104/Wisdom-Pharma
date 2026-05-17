<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new consumer or store user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
            'role' => $request->role,
            'is_active' => true,
            'is_approved' => $request->role === 'consumer', // Consumers auto-approved
        ];

        $user = User::create($userData);

        // Create business profile for store users
        if ($request->role === 'store') {
            Business::create([
                'user_id' => $user->_id,
                'business_name' => $request->business_name,
                'gst_number' => $request->gst_number,
                'drug_license_number' => $request->drug_license_number,
                'address' => $request->business_address,
                'city' => $request->business_city,
                'state' => $request->business_state,
                'pincode' => $request->business_pincode,
                'phone' => $request->phone,
                'email' => $request->email,
                'is_verified' => false,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $request->role === 'store'
                ? 'Registration successful! Your business account is pending admin approval.'
                : 'Registration successful!',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login for consumers and store users.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful!',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Get the authenticated user profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('business');

        return response()->json([
            'success' => true,
            'data' => $this->formatUser($user),
        ]);
    }

    /**
     * Update the authenticated user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'pincode' => 'sometimes|string|max:10',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * Logout the user (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Format user data for API response.
     */
    private function formatUser(User $user): array
    {
        $data = [
            'id' => $user->_id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'address' => $user->address,
            'city' => $user->city,
            'state' => $user->state,
            'pincode' => $user->pincode,
            'avatar' => $user->avatar,
            'is_active' => $user->is_active,
            'is_approved' => $user->is_approved,
            'created_at' => $user->created_at,
        ];

        if ($user->role === 'store' && $user->business) {
            $data['business'] = [
                'id' => $user->business->_id,
                'business_name' => $user->business->business_name,
                'gst_number' => $user->business->gst_number,
                'drug_license_number' => $user->business->drug_license_number,
                'is_verified' => $user->business->is_verified,
            ];
        }

        return $data;
    }
}
