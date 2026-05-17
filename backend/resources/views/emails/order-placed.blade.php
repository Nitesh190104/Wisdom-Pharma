<!doctype html>
<html>
<body style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Order placed successfully</h2>
    <p>Hello {{ $user->name }},</p>
    <p>Your Wisdom Pharma order <strong>{{ $order->order_number }}</strong> has been placed.</p>
    <p><strong>Total:</strong> INR {{ number_format($order->total, 2) }}</p>
    <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>
    <p>We will notify you when the order status changes.</p>
    <p>Thank you,<br>Wisdom Pharma</p>
</body>
</html>
