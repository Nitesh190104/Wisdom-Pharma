<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Wisdom Pharma</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 30px; text-align: left;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">Wisdom Pharma</h1>
                                        <p style="color: #38bdf8; font-size: 13px; font-weight: 500; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Order Confirmation & Receipt</p>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                                            {{ ucfirst($order->status) }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 35px 30px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 10px;">Hello, {{ $user->name }}!</h2>
                            <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 30px 0;">
                                Thank you for your order. We are processing it now. Below is a comprehensive breakdown and details for your purchase reference.
                            </p>

                            <!-- Order Meta & Shipping Info Grid -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <!-- Order Info Box -->
                                    <td width="48%" style="vertical-align: top; background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9;">
                                        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 12px 0;">Order Summary</h3>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 6px 0;"><strong>Order Number:</strong> <span style="font-family: monospace; font-size: 14px; color: #0f172a;">{{ $order->order_number }}</span></p>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 6px 0;"><strong>Date:</strong> {{ $order->created_at->format('d M Y, h:i A') }}</p>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 6px 0;"><strong>Payment Method:</strong> {{ strtoupper($order->payment_method) }}</p>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0;"><strong>Payment Status:</strong> {{ ucfirst($order->payment_status) }}</p>
                                    </td>
                                    
                                    <td width="4%">&nbsp;</td>
                                    
                                    <!-- Shipping Address Box -->
                                    <td width="48%" style="vertical-align: top; background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9;">
                                        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 12px 0;">Delivery Address</h3>
                                        <p style="font-size: 13px; line-height: 20px; color: #0f172a; font-weight: 600; margin: 0 0 4px 0;">{{ $order->shipping_address['name'] }}</p>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 4px 0;">{{ $order->shipping_address['address'] }}</p>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0 0 4px 0;">{{ $order->shipping_address['city'] }}, {{ $order->shipping_address['state'] }} - {{ $order->shipping_address['pincode'] }}</p>
                                        <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0;"><strong>Phone:</strong> {{ $order->shipping_address['phone'] }}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Itemized Table -->
                            <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 12px 0;">Ordered Items</h3>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 25px;">
                                <thead>
                                    <tr style="border-bottom: 2px solid #f1f5f9;">
                                        <th align="left" style="font-size: 12px; font-weight: 700; color: #64748b; padding: 10px 5px; text-transform: uppercase;">Medicine Name</th>
                                        <th align="right" style="font-size: 12px; font-weight: 700; color: #64748b; padding: 10px 5px; text-transform: uppercase; width: 80px;">Price</th>
                                        <th align="center" style="font-size: 12px; font-weight: 700; color: #64748b; padding: 10px 5px; text-transform: uppercase; width: 60px;">Qty</th>
                                        <th align="right" style="font-size: 12px; font-weight: 700; color: #64748b; padding: 10px 5px; text-transform: uppercase; width: 90px;">GST</th>
                                        <th align="right" style="font-size: 12px; font-weight: 700; color: #64748b; padding: 10px 5px; text-transform: uppercase; width: 90px;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($order->items as $item)
                                        <tr style="border-bottom: 1px solid #f8fafc;">
                                            <td style="font-size: 13px; color: #0f172a; padding: 12px 5px; font-weight: 600;">
                                                {{ $item['medicine_name'] }}
                                                @if(isset($item['price_type']))
                                                    <span style="font-size: 11px; font-weight: 500; color: #64748b; display: block; text-transform: capitalize;">({{ $item['price_type'] }})</span>
                                                @endif
                                            </td>
                                            <td align="right" style="font-size: 13px; color: #475569; padding: 12px 5px;">₹{{ number_format($item['unit_price'], 2) }}</td>
                                            <td align="center" style="font-size: 13px; color: #475569; padding: 12px 5px;">{{ $item['quantity'] }}</td>
                                            <td align="right" style="font-size: 12px; color: #475569; padding: 12px 5px;">
                                                ₹{{ number_format($item['gst_amount'] * $item['quantity'], 2) }}
                                                <span style="font-size: 10px; color: #94a3b8; display: block;">({{ $item['gst_percentage'] }}%)</span>
                                            </td>
                                            <td align="right" style="font-size: 13px; color: #0f172a; font-weight: 600; padding: 12px 5px;">₹{{ number_format($item['total'] ?? ($item['subtotal'] ?? $item['unit_price'] * $item['quantity']), 2) }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            <!-- Price Breakdown Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 2px solid #f1f5f9; padding-top: 15px;">
                                <tr>
                                    <td width="60%">&nbsp;</td>
                                    <td width="40%">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Subtotal (excl. GST):</td>
                                                <td align="right" style="font-size: 13px; color: #475569; padding: 6px 0;">₹{{ number_format($order->subtotal, 2) }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; padding: 6px 0;">GST Total:</td>
                                                <td align="right" style="font-size: 13px; color: #475569; padding: 6px 0;">₹{{ number_format($order->gst_total, 2) }}</td>
                                            </tr>
                                            @if($order->discount > 0)
                                                <tr>
                                                    <td style="font-size: 13px; color: #10b981; padding: 6px 0; font-weight: 600;">Discount:</td>
                                                    <td align="right" style="font-size: 13px; color: #10b981; padding: 6px 0; font-weight: 600;">-₹{{ number_format($order->discount, 2) }}</td>
                                                </tr>
                                            @endif
                                            <tr style="border-top: 1px solid #cbd5e1;">
                                                <td style="font-size: 15px; font-weight: 700; color: #0f172a; padding: 12px 0 0 0;">Grand Total:</td>
                                                <td align="right" style="font-size: 16px; font-weight: 700; color: #0284c7; padding: 12px 0 0 0;">₹{{ number_format($order->total, 2) }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Delivery Note -->
                            @if(isset($order->estimated_delivery))
                                <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 30px;">
                                    <p style="font-size: 13px; line-height: 18px; color: #0369a1; margin: 0;">
                                        <strong>Estimated Delivery:</strong> We expect your package to arrive by <strong>{{ $order->estimated_delivery->format('d M Y') }}</strong>.
                                    </p>
                                </div>
                            @endif

                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">
                                Need help with your order? Reply to this email or contact support.
                            </p>
                            <p style="font-size: 11px; color: #cbd5e1; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                &copy; {{ date('Y') }} Wisdom Pharma Varanasi. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
