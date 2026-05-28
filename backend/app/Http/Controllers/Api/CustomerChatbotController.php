<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CustomerChatbotController extends Controller
{
    /**
     * Handle incoming chatbot message from customer or medical store.
     */
    public function handleMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = trim($request->input('message'));
        $apiKey = env('GEMINI_API_KEY');

        // Attempt Gemini RAG
        if (!empty($apiKey)) {
            try {
                return $this->handleGeminiRAG($request, $message, $apiKey);
            } catch (\Throwable $e) {
                Log::error("Customer Gemini Chatbot Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            }
        }

        // Fallback: Local Query Matcher
        return $this->handleLocalFallback($request, $message);
    }

    /**
     * Gemini RAG for Customers and Medical Stores.
     */
    private function handleGeminiRAG(Request $request, string $message, string $apiKey): JsonResponse
    {
        $user = $request->user();

        // 1. Fetch user's own orders (strictly isolated for safety!)
        $orders = Order::where('user_id', $user->_id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($o) => [
                'id' => $o->_id,
                'order_number' => $o->order_number,
                'total' => (float)$o->total,
                'status' => $o->status,
                'date' => $o->created_at->format('M d, Y'),
                'estimated_delivery' => $o->estimated_delivery ? Carbon::parse($o->estimated_delivery)->format('M d, Y') : 'N/A',
            ])->toArray();

        // 2. Fetch full active products catalog
        $catalog = Medicine::where('is_active', true)->get()->map(fn($m) => [
            'id' => $m->_id,
            'name' => $m->medicine_name,
            'manufacturer' => $m->manufacturer,
            'category' => $m->category,
            'retail_price' => (float)$m->retail_price,
            'wholesale_price' => (float)$m->wholesale_price,
            'min_wholesale_qty' => (int)$m->min_wholesale_qty,
            'expiry_date' => $m->expiry_date ? Carbon::parse($m->expiry_date)->format('M d, Y') : 'N/A',
            'prescription_required' => (bool)$m->prescription_required,
            'description' => $m->description,
            'composition' => $m->composition,
            'dosage' => $m->dosage,
        ])->toArray();

        // 3. Build system prompt tailored to role (Consumer vs. Store Pharmacy)
        $roleLabel = $user->role === 'store' ? 'Registered Pharmacy (Medical Store)' : 'Consumer (Patient)';
        
        $systemPrompt = "You are the warm, knowledgeable, and caring AI Virtual Pharmacist and Support Assistant for 'Wisdom Pharma'.
You are chatting with an authenticated user who is a **{$roleLabel}** named **{$user->name}**.

--- USER ACCOUNT METADATA ---
- User Name: {$user->name}
- User Role: {$user->role}
- Role Permissions: " . ($user->role === 'store' ? 'Access to wholesale bulk pricing & drug deals' : 'Access to standard retail wellness orders') . "

--- THE USER'S SECURE ORDERS HISTORY ---
" . json_encode($orders) . "

--- AVAILABLE MEDICINES & EQUIPMENTS CATALOG (40 Items) ---
" . json_encode($catalog) . "

--- MANDATORY ROLE-BASED INSTRUCTIONS ---
1. **Security & Order Segregation**: If the user asks about their order status (e.g., 'where is my order?', 'track order'), read their Orders History above and describe it clearly. Do not make up any orders not listed in the array.
2. **Pricing Guidelines**:
   - If user is `store`, always display **Wholesale Prices** and mention minimum order quantities (min_wholesale_qty).
   - If user is `consumer`, always display **Retail Prices**. Never disclose wholesale prices to general consumers.
3. **Medical Disclaimer**:
   - If the user asks for medical advice, checks symptoms (e.g., fever, cough, acidity), or asks about medication, you must suggest matching items from the catalog.
   - **ALWAYS** append a clear warning disclaimer at the end of the text in bold:
     `*⚠️ Disclaimer: I am an AI assistant. Please consult a qualified doctor or physician before starting any medication.*`
4. **Markdown Formatting**: Use clean bold texts, lists, and headers in your response.
5. **Widget Payloads**:
   To trigger visual interface components in the React frontend, you must output a structured JSON block wrapped inside the custom tag `[WIDGET_DATA]...[/WIDGET_DATA]` at the very end of your response if applicable.

Choose ONLY ONE widget payload from these types to output at the end:

- If describing the user's order lists, output:
[WIDGET_DATA]
{
  \"type\": \"user_orders\",
  \"orders\": " . json_encode($orders) . "
}
[/WIDGET_DATA]

- If looking up or recommending a specific medicine/equipment detail, output:
[WIDGET_DATA]
{
  \"type\": \"medicine_detail\",
  \"item\": {
    \"id\": \"id_here\",
    \"name\": \"Medicine Name\",
    \"manufacturer\": \"Cipla\",
    \"price\": " . ($user->role === 'store' ? "wholesale_price_value" : "retail_price_value") . ",
    \"expiry\": \"Expiry Date\",
    \"status\": \"✅ In Stock\"
  }
}
[/WIDGET_DATA]

- If suggesting general wellness or symptom guidance, output:
[WIDGET_DATA]
{
  \"type\": \"health_tips\",
  \"tips\": [
    {\"title\": \"Cough Care\", \"description\": \"Drink warm water, take cough syrup as directed, and get plenty of rest.\", \"badge\": \"Wellness\"}
  ]
}
[/WIDGET_DATA]";

        // 4. Dispatch Call to Gemini
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($endpoint, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $systemPrompt . "\n\nUser: " . $message]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3,
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception("Gemini API call failed: " . $response->body());
        }

        $resJson = $response->json();
        $rawText = $resJson['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Parse Response for Widget Data
        $cleanMessage = $rawText;
        $widgetData = ['type' => 'text'];

        if (preg_match('/\[WIDGET_DATA\](.*?)\[\/WIDGET_DATA\]/s', $rawText, $matches)) {
            $cleanMessage = trim(str_replace($matches[0], '', $rawText));
            $jsonString = trim($matches[1]);
            
            $parsedJson = json_decode($jsonString, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $widgetData = $parsedJson;
            } else {
                Log::warning("Failed to parse Customer Gemini widget JSON: " . json_last_error_msg());
            }
        }

        return response()->json([
            'success' => true,
            'message' => $cleanMessage,
            'data' => $widgetData
        ]);
    }

    /**
     * Local Query Parser used as a fallback if Gemini is not configured.
     */
    private function handleLocalFallback(Request $request, string $message): JsonResponse
    {
        $user = $request->user();
        $lowerMsg = strtolower($message);

        // Order Query
        if (str_contains($lowerMsg, 'order') || str_contains($lowerMsg, 'track') || str_contains($lowerMsg, 'deliver')) {
            $orders = Order::where('user_id', $user->_id)
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->get()
                ->map(fn($o) => [
                    'id' => $o->_id,
                    'order_number' => $o->order_number,
                    'total' => (float)$o->total,
                    'status' => $o->status,
                    'date' => $o->created_at->format('M d, Y'),
                    'estimated_delivery' => $o->estimated_delivery ? Carbon::parse($o->estimated_delivery)->format('M d, Y') : 'N/A',
                ])->toArray();

            if (empty($orders)) {
                return response()->json([
                    'success' => true,
                    'message' => "Hello {$user->name}, I checked your profile but couldn't find any orders placed yet. Feel free to browse our medicines catalog to place your first order!",
                    'data' => ['type' => 'text']
                ]);
            }

            $md = "### 📋 Your Order Status\nHello {$user->name}, I retrieved your latest order details:\n\n";
            foreach ($orders as $ord) {
                $md .= "- **Order #{$ord['order_number']}**\n";
                $md .= "  - **Total:** ₹" . number_format($ord['total'], 2) . "\n";
                $md .= "  - **Status:** *{$ord['status']}*\n";
                $md .= "  - **Date:** {$ord['date']}\n";
                $md .= "  - **Est. Delivery:** {$ord['estimated_delivery']}\n\n";
            }

            return response()->json([
                'success' => true,
                'message' => $md,
                'data' => [
                    'type' => 'user_orders',
                    'orders' => $orders
                ]
            ]);
        }

        // Equipment query
        if (str_contains($lowerMsg, 'thermometer') || str_contains($lowerMsg, 'nebulizer') || str_contains($lowerMsg, 'bag') || str_contains($lowerMsg, 'equipment') || str_contains($lowerMsg, 'device')) {
            $md = "### 🩺 Medical Devices & Equipments\nWe carry top-tier certified diagnostic and care devices from trusted manufacturers like **Omron** and **BD**:\n\n";
            $md .= "1. **Digital Thermometer (Omron):** Quick, precise measurement.\n";
            $md .= "2. **Nebulizer Mask Kit (Omron):** Superior respiratory aerosol delivery.\n";
            $md .= "3. **Blood Glucose Strips (Accu-Chek):** Glucose sugar testing essentials.\n\n";
            $md .= "Let me know if you would like me to look up pricing or details for any of these devices.";

            return response()->json([
                'success' => true,
                'message' => $md,
                'data' => [
                    'type' => 'health_tips',
                    'tips' => [
                        ['title' => "Equipment Guide", 'description' => "Our diagnostic tools like Omron thermometers are pre-calibrated for maximum safety.", 'badge' => "Devices"]
                    ]
                ]
            ]);
        }

        // Medicine recommendation / lookup fallback
        $medicines = Medicine::where('is_active', true)->get();
        $matched = null;
        foreach ($medicines as $med) {
            $nameLower = strtolower($med->medicine_name);
            if (str_contains($lowerMsg, $nameLower)) {
                $matched = $med;
                break;
            }
        }

        if ($matched) {
            $price = $user->role === 'store' ? $matched->wholesale_price : $matched->retail_price;
            $priceLabel = $user->role === 'store' ? 'Wholesale Price' : 'Retail Price';
            $prescription = $matched->prescription_required ? "⚠️ Prescription required" : "✅ Over the Counter";

            $md = "### 💊 Product Information: {$matched->medicine_name}\n";
            $md .= "- **Composition:** {$matched->composition}\n";
            $md .= "- **Manufacturer:** {$matched->manufacturer}\n";
            $md .= "- **{$priceLabel}:** ₹" . number_format($price, 2) . "\n";
            $md .= "- **Fulfillment Status:** {$prescription}\n";
            $md .= "- **Usage:** {$matched->description}\n\n";
            $md .= "*⚠️ Disclaimer: I am an AI assistant. Please consult a qualified doctor before starting any medication.*";

            return response()->json([
                'success' => true,
                'message' => $md,
                'data' => [
                    'type' => 'medicine_detail',
                    'item' => [
                        'id' => $matched->_id,
                        'name' => $matched->medicine_name,
                        'manufacturer' => $matched->manufacturer,
                        'price' => $price,
                        'expiry' => $matched->expiry_date ? Carbon::parse($matched->expiry_date)->format('M d, Y') : 'N/A',
                        'status' => $matched->stock > 0 ? "✅ In Stock" : "🚫 Out of Stock"
                    ]
                ]
            ]);
        }

        // Standard Welcome Greeting
        $md = "### 👋 Hello {$user->name}! I am your Wisdom Pharmacy Care Assistant.\n";
        $md .= "I am here to help you get the best medical products, device insights, and check your packages! You can ask me:\n\n";
        $md .= "1. **📋 Track My Shipments**\n";
        $md .= "   - *\"Where is my latest order?\"*\n";
        $md .= "   - *\"Track my orders\"*\n\n";
        $md .= "2. **🤒 Medical Guidance & Ailments**\n";
        $md .= "   - *\"What medicine do you recommend for headache?\"*\n";
        $md .= "   - *\"Details for Dolo 650\"*\n\n";
        $md .= "3. **🩺 Equipment Guidelines**\n";
        $md .= "   - *\"How do I use a nebulizer?\"*\n";
        $md .= "   - *\"Show diagnostic equipments available\"*";

        return response()->json([
            'success' => true,
            'message' => $md,
            'data' => ['type' => 'greeting']
        ]);
    }
}
