<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update - Wisdom Pharma</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- Status Header Banner -->
                    <tr>
                        @php
                            $bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
                            $statusTitle = 'Order Updated';
                            $statusDesc = 'Your order has been updated.';

                            if ($status === 'confirmed') {
                                $bgGradient = 'linear-gradient(135deg, #065f46 0%, #047857 100%)';
                                $statusTitle = 'Order Confirmed! ✓';
                                $statusDesc = 'Your order has been successfully verified and confirmed by our team.';
                            } elseif ($status === 'processing') {
                                $bgGradient = 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)';
                                $statusTitle = 'Now Processing ⚙️';
                                $statusDesc = 'We are currently preparing and packaging your medicines for delivery.';
                            } elseif ($status === 'shipped') {
                                $bgGradient = 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)';
                                $statusTitle = 'Order Shipped! 🚀';
                                $statusDesc = 'Your package is on its way! It has been dispatched to our delivery service.';
                            } elseif ($status === 'delivered') {
                                $bgGradient = 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)';
                                $statusTitle = 'Successfully Delivered! 🎉';
                                $statusDesc = 'Your order has been delivered. Thank you for choosing Wisdom Pharma!';
                            } elseif ($status === 'cancelled') {
                                $bgGradient = 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)';
                                $statusTitle = 'Order Cancelled ✗';
                                $statusDesc = 'Your order has been cancelled.';
                            } elseif ($status === 'returned') {
                                $bgGradient = 'linear-gradient(135deg, #475569 0%, #64748b 100%)';
                                $statusTitle = 'Order Returned ↩️';
                                $statusDesc = 'Your order has been returned. A refund is being processed if applicable.';
                            } elseif ($status === 'return_requested') {
                                $bgGradient = 'linear-gradient(135deg, #92400e 0%, #d97706 100%)';
                                $statusTitle = 'Return Requested 📩';
                                $statusDesc = 'We have received your return request and will review it shortly.';
                            } elseif ($status === 'return_rejected') {
                                $bgGradient = 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)';
                                $statusTitle = 'Return Rejected ✗';
                                $statusDesc = 'Your return request was not approved.';
                            }
                        @endphp
                        <td style="background: {!! $bgGradient !!}; padding: 35px 30px; text-align: left;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">{{ $statusTitle }}</h1>
                                        <p style="color: #e0f2fe; font-size: 13px; font-weight: 500; margin: 5px 0 0 0; letter-spacing: 0.5px;">{{ $statusDesc }}</p>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                            {{ $status }}
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
                                The status of your Wisdom Pharma order **#{{ $order->order_number }}** has been updated. Below are the current order and delivery details for your reference.
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

                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">
                                Need help? Contact our pharmacy support at Meera Nagar, Chitayipur Varanasi.
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
