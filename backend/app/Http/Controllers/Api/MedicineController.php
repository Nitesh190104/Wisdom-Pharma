<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Resources\MedicineResource;
use App\Models\Medicine;
use App\Repositories\MedicineRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    public function __construct(private readonly MedicineRepository $medicines)
    {
    }

    /**
     * Get all medicines with filtering, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $medicines = $this->medicines->paginatedActive([
            'search' => $request->input('search'),
            'category_id' => $request->input('category_id'),
            'prescription_required' => $request->has('prescription_required')
                ? $request->boolean('prescription_required')
                : null,
            'min_price' => $request->input('min_price'),
            'max_price' => $request->input('max_price'),
            'in_stock' => $request->boolean('in_stock'),
            'sort_by' => $request->input('sort_by', 'created_at'),
            'sort_order' => $request->input('sort_order', 'desc'),
            'per_page' => $request->input('per_page', 12),
        ]);

        return response()->json([
            'success' => true,
            'data' => $medicines,
        ]);
    }

    /**
     * Get a single medicine by ID.
     */
    public function show(string $id): JsonResponse
    {
        $medicine = $this->medicines->find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found.',
            ], 404);
        }

        Gate::authorize('view', $medicine);

        return response()->json([
            'success' => true,
            'data' => new MedicineResource($medicine),
        ]);
    }

    /**
     * Create a new medicine (Admin only).
     */
    public function store(StoreMedicineRequest $request): JsonResponse
    {
        Gate::authorize('create', Medicine::class);

        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('medicines', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $data['is_active'] = true;

        $medicine = $this->medicines->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Medicine created successfully.',
            'data' => new MedicineResource($medicine),
        ], 201);
    }

    /**
     * Update a medicine (Admin only).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $medicine = $this->medicines->find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found.',
            ], 404);
        }

        Gate::authorize('update', $medicine);

        $validated = $request->validate([
            'medicine_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:2000',
            'category_id' => 'sometimes|string',
            'category' => 'sometimes|string|max:100',
            'stock' => 'sometimes|integer|min:0',
            'retail_price' => 'sometimes|numeric|min:0',
            'wholesale_price' => 'sometimes|numeric|min:0',
            'gst_percentage' => 'sometimes|numeric|min:0|max:100',
            'expiry_date' => 'sometimes|date',
            'manufacturer' => 'sometimes|string|max:255',
            'prescription_required' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'sometimes|boolean',
            'dosage' => 'nullable|string|max:255',
            'composition' => 'nullable|string|max:1000',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($medicine->image) {
                $oldPath = str_replace('/storage/', '', $medicine->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('medicines', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $medicine = $this->medicines->update($medicine, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Medicine updated successfully.',
            'data' => new MedicineResource($medicine),
        ]);
    }

    /**
     * Delete a medicine (Admin only).
     */
    public function destroy(string $id): JsonResponse
    {
        $medicine = $this->medicines->find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found.',
            ], 404);
        }

        Gate::authorize('delete', $medicine);

        $this->medicines->delete($medicine);

        return response()->json([
            'success' => true,
            'message' => 'Medicine deleted successfully.',
        ]);
    }

    /**
     * Get featured/popular medicines for homepage.
     */
    public function featured(): JsonResponse
    {
        $medicines = $this->medicines->featured();

        return response()->json([
            'success' => true,
            'data' => $medicines,
        ]);
    }
}
