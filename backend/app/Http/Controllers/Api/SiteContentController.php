<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    /**
     * GET /site-content/{key}
     * Public — returns the stored page content (or empty data if not set yet).
     */
    public function show(string $key): JsonResponse
    {
        $content = SiteContent::getByKey($key);

        return response()->json([
            'success' => true,
            'data'    => $content ? $content->data : null,
        ]);
    }

    /**
     * PUT /site-content/{key}   (admin only)
     * Saves / replaces the entire data blob for a given page key.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        $content = SiteContent::upsertByKey($key, $validated['data']);

        return response()->json([
            'success' => true,
            'message' => 'Content updated successfully.',
            'data'    => $content->data,
        ]);
    }
}
