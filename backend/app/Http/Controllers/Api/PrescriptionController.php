<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $prescriptions = Prescription::where('user_id', $request->user()->_id)
            ->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $prescriptions]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120']);
        $path = $request->file('file')->store('prescriptions', 'public');
        $prescription = Prescription::create([
            'user_id' => $request->user()->_id,
            'file_path' => '/storage/' . $path,
            'file_name' => $request->file('file')->getClientOriginalName(),
            'status' => 'pending',
        ]);
        return response()->json(['success' => true, 'message' => 'Prescription uploaded.', 'data' => $prescription], 201);
    }
}
