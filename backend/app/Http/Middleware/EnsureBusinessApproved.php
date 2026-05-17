<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessApproved
{
    /**
     * Ensure the authenticated store user has an approved business account.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'store') {
            $business = $user->business;
            if (!$business || !$business->is_verified) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your business account is pending verification. Please wait for admin approval.',
                ], 403);
            }
        }

        return $next($request);
    }
}
