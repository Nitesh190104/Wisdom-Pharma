<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->_id,
            'medicine_name' => $this->medicine_name,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'category' => $this->category,
            'stock' => $this->stock,
            'retail_price' => $this->retail_price,
            'wholesale_price' => $this->wholesale_price,
            'gst_percentage' => $this->gst_percentage,
            'expiry_date' => $this->expiry_date,
            'manufacturer' => $this->manufacturer,
            'prescription_required' => $this->prescription_required,
            'image' => $this->image,
            'is_active' => $this->is_active,
            'min_wholesale_qty' => $this->min_wholesale_qty,
            'dosage' => $this->dosage,
            'composition' => $this->composition,
            'side_effects' => $this->side_effects,
            'usage_instructions' => $this->usage_instructions,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
