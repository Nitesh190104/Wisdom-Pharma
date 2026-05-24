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
            $rules['gst_number'] = ['required', 'string', 'max:15', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/'];
            $rules['drug_license_number'] = ['required', 'string', 'min:5', 'max:50', 'regex:/^[A-Za-z0-9][A-Za-z0-9\/\-]{4,49}$/'];
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
            'gst_number.regex' => 'Invalid GST number format. Example: 27AAPFU0939F1ZV',
            'drug_license_number.regex' => 'Invalid format. Only letters, numbers, "-" and "/" are allowed (e.g. MH-MUM-123456).',
        ];
    }
}
