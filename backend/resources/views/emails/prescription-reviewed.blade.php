<!doctype html>
<html>
<body style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>Prescription review update</h2>
    <p>Hello {{ $user->name }},</p>
    <p>Your prescription <strong>{{ $prescription->file_name }}</strong> has been reviewed.</p>
    <p><strong>Status:</strong> {{ ucfirst($prescription->status) }}</p>
    @if ($prescription->notes)
        <p><strong>Notes:</strong> {{ $prescription->notes }}</p>
    @endif
    <p>Thank you,<br>Wisdom Pharma</p>
</body>
</html>
