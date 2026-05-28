<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\Category;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminChatbotController extends Controller
{
    /**
     * Handle incoming chatbot message from admin.
     */
    public function handleMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = trim($request->input('message'));
        $apiKey = env('GEMINI_API_KEY');

        // If Gemini API Key is configured, attempt RAG with Gemini
        if (!empty($apiKey)) {
            try {
                return $this->handleGeminiRAG($message, $apiKey);
            } catch (\Throwable $e) {
                Log::error("Gemini Chatbot Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
                // If it fails, fall back to our local query matcher seamlessly
            }
        }

        // Fallback: Local Query Matcher (works perfectly without API keys)
        return $this->handleLocalFallback($message);
    }

    /**
     * RAG (Retrieval-Augmented Generation) with Google Gemini.
     * We retrieve all relevant database context, feed it to Gemini,
     * and ask Gemini to write a helpful response + specify UI widget payloads.
     */
    private function handleGeminiRAG(string $message, string $apiKey): JsonResponse
    {
        // 1. Gather all dynamic DB context
        
        // Medicines Inventory List
        $medicines = Medicine::all()->map(fn($m) => [
            'id' => $m->_id,
            'name' => $m->medicine_name,
            'manufacturer' => $m->manufacturer,
            'stock' => (int)$m->stock,
            'retail_price' => (float)$m->retail_price,
            'wholesale_price' => (float)$m->wholesale_price,
            'expiry_date' => $m->expiry_date ? Carbon::parse($m->expiry_date)->format('Y-m-d') : 'N/A',
            'category' => $m->category,
        ])->toArray();

        // Order Distributions
        $processingCount = Order::where('status', 'processing')->count();
        $confirmedCount = Order::where('status', 'confirmed')->count();
        $shippedCount = Order::where('status', 'shipped')->count();
        $deliveredCount = Order::whereIn('status', ['delivered', 'return_requested'])->count();
        $cancelledCount = Order::where('status', 'cancelled')->count();
        $returnedCount = Order::where('status', 'returned')->count();
        $returnRequestedCount = Order::where('status', 'return_requested')->count();
        $totalOrders = Order::count();

        $recentOrders = Order::with('user')->orderBy('created_at', 'desc')->take(3)->get()->map(fn($o) => [
            'id' => $o->_id,
            'order_number' => $o->order_number,
            'customer' => $o->user->name ?? 'Medical Store',
            'total' => (float)$o->total,
            'status' => $o->status,
            'date' => $o->created_at->format('M d, H:i'),
        ])->toArray();

        // Revenue analytics
        $analytics = new AnalyticsService();
        $stats = $analytics->getDashboardStats();
        $totalRevenue = $stats['revenue']['total'];
        $monthlyRevenue = $stats['revenue']['monthly'];

        // 2. Build the LLM System Prompt & Context
        $systemPrompt = "You are the highly professional AI Business Consultant & Store Assistant for the 'Wisdom Pharma' medical warehouse dashboard.
You are chatting with the Store Administrator.

You have direct, real-time access to the store's backend MongoDB database state. Here is the active dataset:

--- REVENUE & SALES STATS ---
- Lifetime Revenue: ₹" . number_format($totalRevenue, 2) . "
- Current Month Revenue: ₹" . number_format($monthlyRevenue, 2) . "

--- ORDERS STATE ---
- Total Orders: {$totalOrders}
- Processing: {$processingCount} (needs packaging/shipping)
- Confirmed: {$confirmedCount}
- Shipped: {$shippedCount}
- Delivered: {$deliveredCount}
- Return Requested (Pending review): {$returnRequestedCount}
- Returned: {$returnedCount}
- Cancelled: {$cancelledCount}
- Recent Orders List: " . json_encode($recentOrders) . "

--- INVENTORY LIST (40 Products) ---
" . json_encode($medicines) . "

--- ROLE & INSTRUCTIONS ---
1. Answer the Admin's query accurately using the database logs above.
2. Maintain a premium, executive tone. Be helpful and action-oriented.
3. Always format your responses in beautiful, readable GitHub Markdown (use bolding, clean headers, bullet points, or custom tables).
4. If the user asks about specific inventory, order statistics, near-expiry, low-stock, or revenue advice, reference the exact real numbers from the data.
5. In addition to your markdown text response, you must output a structured JSON block wrapped inside the custom tag `[WIDGET_DATA]...[/WIDGET_DATA]` at the very end of your response to trigger premium custom UI components on the React frontend.

Only select ONE widget format to output at the end if applicable:

- If answering about low stock medicines, output:
[WIDGET_DATA]
{
  \"type\": \"low_stock\",
  \"items\": [
    {\"id\": \"id_here\", \"name\": \"Medicine Name\", \"manufacturer\": \"Cipla\", \"stock\": 5, \"price\": 30.0, \"wholesale_price\": 22.0}
  ]
}
[/WIDGET_DATA]

- If answering about completely out of stock medicines, output:
[WIDGET_DATA]
{
  \"type\": \"out_of_stock\",
  \"items\": [
    {\"id\": \"id_here\", \"name\": \"Medicine Name\", \"manufacturer\": \"Mankind\", \"stock\": 0, \"price\": 45.0, \"wholesale_price\": 32.0}
  ]
}
[/WIDGET_DATA]

- If answering about a specific medicine lookup, output:
[WIDGET_DATA]
{
  \"type\": \"medicine_detail\",
  \"item\": {
    \"id\": \"id_here\",
    \"name\": \"Medicine Name\",
    \"manufacturer\": \"Cipla\",
    \"stock\": 120,
    \"price\": 35.0,
    \"expiry\": \"Oct 31, 2027\",
    \"status\": \"✅ In Stock\"
  }
}
[/WIDGET_DATA]

- If answering about expiring medicines soon or already expired, output:
[WIDGET_DATA]
{
  \"type\": \"expiry_report\",
  \"items\": [
    {\"id\": \"id_here\", \"name\": \"Medicine Name\", \"stock\": 200, \"expiry\": \"Oct 31, 2027\", \"days_left\": 45, \"expired\": false}
  ]
}
[/WIDGET_DATA]

- If answering about revenue growth strategies / tips, output:
[WIDGET_DATA]
{
  \"type\": \"revenue_tips\",
  \"tips\": [
    {\"title\": \"Clear Near-Expiry Shelf Stock\", \"description\": \"Put a 15% discount on Dolo to clear stock.\", \"badge\": \"Clearance\", \"action_label\": \"Run Clearance Promo\"}
  ],
  \"metrics\": {\"lifetime\": {$totalRevenue}, \"monthly\": {$monthlyRevenue}}
}
[/WIDGET_DATA]

- If answering about order analytics/distribution/status, output:
[WIDGET_DATA]
{
  \"type\": \"orders_report\",
  \"summary\": {
    \"total\": {$totalOrders},
    \"processing\": {$processingCount},
    \"shipped\": {$shippedCount},
    \"delivered\": {$deliveredCount},
    \"cancelled\": {$cancelledCount},
    \"returned\": {$returnedCount},
    \"return_requested\": {$returnRequestedCount}
  },
  \"recent\": " . json_encode($recentOrders) . "
}
[/WIDGET_DATA]

If the question is conversational or does not map to any statistics, you don't need to append any `[WIDGET_DATA]` payload.";

        // 3. Dispatch the API Call to Gemini
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($endpoint, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $systemPrompt . "\n\nStore Administrator: " . $message]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.2, // Low temperature for factual consistency with our database context
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception("Gemini API call failed: " . $response->body());
        }

        $resJson = $response->json();
        $rawText = $resJson['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // 4. Parse response for text and widget data
        $cleanMessage = $rawText;
        $widgetData = ['type' => 'text'];

        if (preg_match('/\[WIDGET_DATA\](.*?)\[\/WIDGET_DATA\]/s', $rawText, $matches)) {
            // Strip the custom tag from the printed message so it doesn't show to the user
            $cleanMessage = trim(str_replace($matches[0], '', $rawText));
            $jsonString = trim($matches[1]);
            
            $parsedJson = json_decode($jsonString, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $widgetData = $parsedJson;
            } else {
                Log::warning("Failed to parse Gemini widget JSON: " . json_last_error_msg() . "\nRaw JSON: " . $jsonString);
            }
        }

        return response()->json([
            'success' => true,
            'message' => $cleanMessage,
            'data' => $widgetData
        ]);
    }

    /**
     * Local Query Parser used as a fallback if Gemini is offline or not configured.
     */
    private function handleLocalFallback(string $message): JsonResponse
    {
        $lowerMsg = strtolower($message);

        if ($this->hasKeywords($lowerMsg, ['stock', 'inventory', 'qty', 'quantity', 'available'])) {
            return $this->handleInventoryQuery($lowerMsg);
        }

        if ($this->hasKeywords($lowerMsg, ['expir', 'expire', 'expiry', 'expired', 'shelf life'])) {
            return $this->handleExpiryQuery($lowerMsg);
        }

        if ($this->hasKeywords($lowerMsg, ['revenue', 'sale', 'profit', 'increase', 'analytics', 'strategy', 'marketing', 'tips', 'money', 'business'])) {
            return $this->handleRevenueQuery($lowerMsg);
        }

        if ($this->hasKeywords($lowerMsg, ['order', 'deliver', 'process', 'return', 'cancel', 'pending'])) {
            return $this->handleOrdersQuery($lowerMsg);
        }

        // Default greeting / help message
        return $this->handleGreeting();
    }

    /**
     * Check if the message contains any of the search words.
     */
    private function hasKeywords(string $message, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * LOCAL FALLBACK INVENTORY QUERY
     */
    private function handleInventoryQuery(string $message): JsonResponse
    {
        if (str_contains($message, 'low')) {
            $lowStock = Medicine::where('stock', '<=', 10)->where('stock', '>', 0)->take(10)->get();
            if ($lowStock->isEmpty()) {
                return response()->json(['success' => true, 'message' => "All items are well-stocked! There are currently no medicines in a low-stock state.", 'data' => ['type' => 'text']]);
            }
            $md = "### ⚠️ Low Stock Alert\nHere are the medicines running low on stock (10 units or less):\n\n";
            $items = [];
            foreach ($lowStock as $med) {
                $md .= "- **{$med->medicine_name}** ({$med->manufacturer}): **{$med->stock}** units remaining\n";
                $items[] = ['id' => $med->_id, 'name' => $med->medicine_name, 'manufacturer' => $med->manufacturer, 'stock' => $med->stock, 'price' => $med->retail_price, 'wholesale_price' => $med->wholesale_price];
            }
            return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'low_stock', 'items' => $items]]);
        }

        if (str_contains($message, 'out') || str_contains($message, 'zero') || str_contains($message, 'nil')) {
            $outOfStock = Medicine::where('stock', 0)->take(10)->get();
            if ($outOfStock->isEmpty()) {
                return response()->json(['success' => true, 'message' => "Great news! None of your active medicines are completely out of stock right now.", 'data' => ['type' => 'text']]);
            }
            $md = "### 🚫 Out of Stock Summary\nThe following products are completely out of stock:\n\n";
            $items = [];
            foreach ($outOfStock as $med) {
                $md .= "- **{$med->medicine_name}** ({$med->manufacturer})\n";
                $items[] = ['id' => $med->_id, 'name' => $med->medicine_name, 'manufacturer' => $med->manufacturer, 'stock' => 0, 'price' => $med->retail_price, 'wholesale_price' => $med->wholesale_price];
            }
            return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'out_of_stock', 'items' => $items]]);
        }

        $allMedicines = Medicine::select('medicine_name', 'manufacturer', 'stock', 'retail_price', 'wholesale_price', 'expiry_date')->get();
        $matched = null;
        foreach ($allMedicines as $med) {
            $nameLower = strtolower($med->medicine_name);
            if (str_contains($message, $nameLower)) {
                $matched = $med;
                break;
            }
        }

        if ($matched) {
            $status = $matched->stock > 10 ? "✅ In Stock" : ($matched->stock > 0 ? "⚠️ Low Stock" : "🚫 Out of Stock");
            $expiryStr = $matched->expiry_date ? Carbon::parse($matched->expiry_date)->format('M d, Y') : 'N/A';
            $md = "### 📦 Inventory Look-up: {$matched->medicine_name}\n- **Manufacturer:** {$matched->manufacturer}\n- **Current Stock:** **{$matched->stock} units** ({$status})\n- **Retail Price:** ₹" . number_format($matched->retail_price, 2) . "\n- **Wholesale Price:** ₹" . number_format($matched->wholesale_price, 2) . "\n- **Expiry Date:** {$expiryStr}\n";
            return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'medicine_detail', 'item' => ['id' => $matched->_id, 'name' => $matched->medicine_name, 'manufacturer' => $matched->manufacturer, 'stock' => $matched->stock, 'price' => $matched->retail_price, 'expiry' => $expiryStr, 'status' => $status]]]);
        }

        $totalCount = Medicine::count();
        $lowStockCount = Medicine::where('stock', '<=', 10)->where('stock', '>', 0)->count();
        $outCount = Medicine::where('stock', 0)->count();

        $md = "### 📊 Overall Inventory Status\n- **Total Catalog Products:** **{$totalCount} items**\n- **Low Stock Alerts:** **{$lowStockCount} items**\n- **Out of Stock:** **{$outCount} items**\n\nAsk me details by typing *\"list low stock medicines\"* or *\"stock of Dolo 650\"*.";
        return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'inventory_summary', 'summary' => ['total' => $totalCount, 'low_stock' => $lowStockCount, 'out_of_stock' => $outCount]]]);
    }

    /**
     * LOCAL FALLBACK EXPIRY QUERY
     */
    private function handleExpiryQuery(string $message): JsonResponse
    {
        $now = now();
        $sixMonthsFromNow = now()->addDays(180);

        if (str_contains($message, 'already') || str_contains($message, 'past')) {
            $expired = Medicine::where('expiry_date', '<', $now)->take(10)->get();
            if ($expired->isEmpty()) {
                return response()->json(['success' => true, 'message' => "Excellent! There are **zero** expired medicines in inventory.", 'data' => ['type' => 'text']]);
            }
            $md = "### 🚨 Expired Medicines Report\nThe following items have already expired:\n\n";
            $items = [];
            foreach ($expired as $med) {
                $expDate = Carbon::parse($med->expiry_date)->format('M d, Y');
                $md .= "- **{$med->medicine_name}** | Expired: **{$expDate}** (Stock: {$med->stock})\n";
                $items[] = ['name' => $med->medicine_name, 'stock' => $med->stock, 'expiry' => $expDate, 'expired' => true];
            }
            return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'expiry_report', 'items' => $items]]);
        }

        $nearExpiry = Medicine::where('expiry_date', '>=', $now)
            ->where('expiry_date', '<=', $sixMonthsFromNow)
            ->orderBy('expiry_date', 'asc')
            ->take(10)
            ->get();

        if ($nearExpiry->isEmpty()) {
            return response()->json(['success' => true, 'message' => "All good! No medicines are expiring within the next 6 months.", 'data' => ['type' => 'text']]);
        }

        $md = "### ⏳ Near Expiry Warning (Next 6 Months)\nThe following medicines are approaching their expiry dates:\n\n";
        $items = [];
        foreach ($nearExpiry as $med) {
            $expDate = Carbon::parse($med->expiry_date);
            $daysLeft = $now->diffInDays($expDate);
            $formattedDate = $expDate->format('M d, Y');
            $md .= "- **{$med->medicine_name}** | Expires: **{$formattedDate}** (In **{$daysLeft} days**, Stock: {$med->stock})\n";
            $items[] = ['id' => $med->_id, 'name' => $med->medicine_name, 'stock' => $med->stock, 'expiry' => $formattedDate, 'days_left' => $daysLeft, 'expired' => false];
        }
        return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'expiry_report', 'items' => $items]]);
    }

    /**
     * LOCAL FALLBACK REVENUE TIPS
     */
    private function handleRevenueQuery(string $message): JsonResponse
    {
        $analytics = new AnalyticsService();
        $stats = $analytics->getDashboardStats();
        $totalRevenue = $stats['revenue']['total'];
        $monthlyRevenue = $stats['revenue']['monthly'];

        $nearExpiry = Medicine::where('expiry_date', '>=', now())->where('expiry_date', '<=', now()->addDays(180))->take(2)->get();
        $lowStock = Medicine::where('stock', '<=', 10)->where('stock', '>', 0)->take(2)->get();

        $md = "### 💡 Strategic Revenue Action Plan\nBased on store statistics (Revenue: ₹" . number_format($totalRevenue, 2) . "), here is your strategic advice:\n\n";
        $tips = [];

        if (!$nearExpiry->isEmpty()) {
            $names = $nearExpiry->pluck('medicine_name')->join(' & ');
            $tips[] = ['title' => "Clear Near-Expiry Shelf Stock", 'description' => "Introduce a 15% discount for {$names} which are expiring within 6 months.", 'badge' => "Clearance", 'action_label' => "Run Clearance Promo"];
            $md .= "1. **Clearance Discounts:** Sell expiring **{$names}** with standard clearance promotions.\n";
        }

        if (!$lowStock->isEmpty()) {
            $names = $lowStock->pluck('medicine_name')->join(' & ');
            $tips[] = ['title' => "Restock High-Demand Items", 'description' => "Prevent out of stock losses of {$names}.", 'badge' => "High Demand", 'action_label' => "Restock Now"];
            $md .= "2. **Prevent Stockouts:** Replenish low-stock items **{$names}** immediately.\n";
        }

        $tips[] = ['title' => "Bulk Wholesale Incentives", 'description' => "Tiered pricing for medical stores buying in bulk.", 'badge' => "Wholesale Boost", 'action_label' => "Manage Wholesale"];
        $md .= "3. **Wholesale Incentives:** Introduce tiered wholesale discount packages.";

        return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'revenue_tips', 'tips' => $tips, 'metrics' => ['lifetime' => $totalRevenue, 'monthly' => $monthlyRevenue]]]);
    }

    /**
     * LOCAL FALLBACK ORDERS STATUS
     */
    private function handleOrdersQuery(string $message): JsonResponse
    {
        $processingCount = Order::where('status', 'processing')->count();
        $confirmedCount = Order::where('status', 'confirmed')->count();
        $shippedCount = Order::where('status', 'shipped')->count();
        $deliveredCount = Order::whereIn('status', ['delivered', 'return_requested'])->count();
        $cancelledCount = Order::where('status', 'cancelled')->count();
        $returnedCount = Order::where('status', 'returned')->count();
        $returnRequestedCount = Order::where('status', 'return_requested')->count();
        $totalOrders = Order::count();

        $md = "### 📦 Order Analytics\nTotal orders: **{$totalOrders}**\n- Processing: **{$processingCount}**\n- Shipped: **{$shippedCount}**\n- Delivered: **{$deliveredCount}**\n- Returns requested: **{$returnRequestedCount}**\n";

        return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'orders_report', 'summary' => ['total' => $totalOrders, 'processing' => $processingCount, 'shipped' => $shippedCount, 'delivered' => $deliveredCount, 'cancelled' => $cancelledCount, 'returned' => $returnedCount, 'return_requested' => $returnRequestedCount]]]);
    }

    /**
     * LOCAL GREETING
     */
    private function handleGreeting(): JsonResponse
    {
        $md = "### 👋 Hello Admin! I am your Wisdom Pharmacy Smart Assistant.\nI can query live database records and display inventory, expiry warnings, orders status, and strategic advice. Ask me anything!";
        return response()->json(['success' => true, 'message' => $md, 'data' => ['type' => 'greeting']]);
    }
}
