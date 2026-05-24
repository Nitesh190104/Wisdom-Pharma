<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('prescription_required')) {
            $this->merge([
                'prescription_required' => filter_var($this->prescription_required, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'medicine_name' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'category_id' => 'required|string',
            'category' => 'required|string|max:100',
            'stock' => 'required|integer|min:0',
            'retail_price' => 'required|numeric|min:0',
            'wholesale_price' => 'required|numeric|min:0',
            'gst_percentage' => 'required|numeric|min:0|max:100',
            'expiry_date' => 'required|date|after:today',
            'manufacturer' => 'required|string|max:255',
            'prescription_required' => 'required|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:5120',
            'min_wholesale_qty' => 'nullable|integer|min:1',
            'dosage' => 'nullable|string|max:255',
            'composition' => 'nullable|string|max:1000',
            'side_effects' => 'nullable|string|max:2000',
            'usage_instructions' => 'nullable|string|max:2000',
        ];
    }
}
