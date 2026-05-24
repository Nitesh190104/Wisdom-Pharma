<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|max:5000',
        ]);

        $toEmail = config('services.contact.email', 'wisdompharma866@gmail.com');

        try {
            Mail::to($toEmail)->send(new ContactMessageMail(
                name: $validated['name'],
                email: $validated['email'],
                subjectLine: $validated['subject'],
                messageBody: $validated['message'],
            ));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully.',
        ]);
    }
}
