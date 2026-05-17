<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->_id)
            ->orderBy('created_at', 'desc')->take(50)->get();
        $unreadCount = Notification::where('user_id', $request->user()->_id)->unread()->count();
        return response()->json(['success' => true, 'data' => ['notifications' => $notifications, 'unread_count' => $unreadCount]]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->_id)->find($id);
        if ($notification) $notification->markAsRead();
        return response()->json(['success' => true, 'message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->_id)->unread()->update(['is_read' => true]);
        return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
    }
}
