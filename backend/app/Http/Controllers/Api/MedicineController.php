<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Resources\MedicineResource;
use App\Models\Medicine;
use App\Repositories\MedicineRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        // Handle image upload – save to public/images/medicines & mirror to Medicines folder
        if ($request->hasFile('image')) {
            $data['image'] = $this->handleImageUpload($request->file('image'), $request->input('medicine_name'));
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
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:5120',
            'is_active' => 'sometimes|boolean',
            'dosage' => 'nullable|string|max:255',
            'composition' => 'nullable|string|max:1000',
        ]);

        // Handle image upload – save to public/images/medicines & mirror to Medicines folder
        if ($request->hasFile('image')) {
            // Delete old file from public/images/medicines if it was stored there
            if ($medicine->image && str_contains($medicine->image, '/images/medicines/')) {
                $oldFilename = basename(urldecode($medicine->image));
                $oldPath = public_path('images/medicines') . DIRECTORY_SEPARATOR . $oldFilename;
                if (file_exists($oldPath)) @unlink($oldPath);
                // Also remove from Medicines folder
                $mirrorPath = base_path('../Medicines') . DIRECTORY_SEPARATOR . $oldFilename;
                if (file_exists($mirrorPath)) @unlink($mirrorPath);
            }
            $validated['image'] = $this->handleImageUpload(
                $request->file('image'),
                $validated['medicine_name'] ?? $medicine->medicine_name
            );
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

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Save an uploaded medicine image to:
     *   1. backend/public/images/medicines/{name}.{ext}   (served as /images/medicines/...)
     *   2. project root /Medicines/{name}.{ext}           (user's mirror folder)
     *
     * Returns the full local URL for the DB.
     */
    private function handleImageUpload(UploadedFile $file, string $medicineName): string
    {
        $ext      = strtolower($file->getClientOriginalExtension()) ?: $file->guessExtension();
        $filename = $medicineName . '.' . $ext;   // e.g. "Dolo 650.avif"

        $destDir  = public_path('images/medicines');
        if (!is_dir($destDir)) mkdir($destDir, 0777, true);

        // Move into public/images/medicines/
        $file->move($destDir, $filename);

        // Mirror copy to project-root Medicines/ folder
        $medicinesDir = base_path('../Medicines');
        if (is_dir($medicinesDir)) {
            @copy($destDir . DIRECTORY_SEPARATOR . $filename,
                  $medicinesDir . DIRECTORY_SEPARATOR . $filename);
        }

        $appUrl = rtrim(config('app.url'), '/');
        return $appUrl . '/images/medicines/' . rawurlencode($filename);
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
