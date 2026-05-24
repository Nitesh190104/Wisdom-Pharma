<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Business;
use App\Models\User;
use App\Models\Otp;
use App\Mail\SendOtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new consumer or store user.
     */
    /**
     * Send OTP to the provided email.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = $request->input('email');

        // Check if the email is already in use
        $userExists = User::where('email', $email)->first();
        if ($userExists) {
            return response()->json([
                'success' => false,
                'message' => 'This email is already registered.',
            ], 422);
        }

        // Generate a random 6-digit OTP code
        $otpCode = (string) rand(100000, 999999);

        // Store or update OTP in the collection
        Otp::updateOrCreate(
            ['email' => $email],
            [
                'otp' => $otpCode,
                'is_verified' => false,
                'expires_at' => now()->addMinutes(10),
            ]
        );

        // Send email
        try {
            Mail::to($email)->send(new SendOtpMail($otpCode));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP email. Please check your mail settings.',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to your email successfully.',
        ]);
    }

    /**
     * Verify the OTP code.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $email = $request->input('email');
        $otpCode = $request->input('otp');

        $otpRecord = Otp::where('email', $email)->first();

        if (!$otpRecord || $otpRecord->otp !== $otpCode) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code.',
            ], 422);
        }

        if (now()->greaterThan($otpRecord->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.',
            ], 422);
        }

        // Mark OTP as verified
        $otpRecord->update(['is_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully.',
        ]);
    }

    /**
     * Register a new consumer or store user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Security check: Verify OTP record exists and is verified
        $otpRecord = Otp::where('email', $request->email)
            ->where('is_verified', true)
            ->where('updated_at', '>=', now()->subMinutes(15))
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Email verification is missing or expired. Please verify your email first.',
            ], 422);
        }

        // Clean up the verified OTP record
        $otpRecord->delete();

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

            $user->load('business');
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

        // Role mismatch — reject login and tell frontend which tab to switch to
        $requestedRole = $request->input('role');
        if ($requestedRole && $user->role !== 'admin' && $user->role !== $requestedRole) {
            $message = $user->role === 'store'
                ? 'You have a Medical Store account. Switching to the Medical Store tab.'
                : 'You have a Consumer account. Switching to the Consumer tab.';
            return response()->json([
                'success'     => false,
                'message'     => $message,
                'actual_role' => $user->role,
            ], 422);
        }

        if ($user->role === 'store') {
            $user->load('business');
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
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->_id . ',_id',
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'pincode' => 'sometimes|string|max:10',
        ]);

        $user->update($validated);

        $freshUser = $user->fresh();
        if ($freshUser->role === 'store') {
            $freshUser->load('business');
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $this->formatUser($freshUser),
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
