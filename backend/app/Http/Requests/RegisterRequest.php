<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:15',
            'role' => 'required|in:consumer,store',
        ];

        // Additional rules for medical store registration
        if ($this->input('role') === 'store') {
            $rules['business_name'] = 'required|string|max:255';
            $rules['gst_number'] = 'required|string|max:20';
            $rules['drug_license_number'] = 'required|string|max:50';
            $rules['business_address'] = 'required|string|max:500';
            $rules['business_city'] = 'required|string|max:100';
            $rules['business_state'] = 'required|string|max:100';
            $rules['business_pincode'] = 'required|string|max:10';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'role.in' => 'Role must be either consumer or store.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
