<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px border #e2e8f0;">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 20px;">
                            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">Wisdom Pharma</h1>
                            <p style="color: #38bdf8; font-size: 13px; font-weight: 500; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Email Verification</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px 30px 30px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Hello!</h2>
                            <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 25px 0;">
                                Thank you for starting your registration with Wisdom Pharma. To verify your email address, please use the 6-digit verification code below:
                            </p>

                            <!-- OTP Display Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px dashed #cbd5e1;">
                                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #0284c7; text-align: center; display: block; margin: 0;">{{ $otpCode }}</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 25px 0 0 0; text-align: center;">
                                This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0;">
                        </td>
                    </tr>

                    <!-- Footer Warning and Copyright -->
                    <tr>
                        <td style="padding: 30px; background-color: #fafafa;">
                            <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0 0 10px 0; text-align: center;">
                                For your security, never share this code with anyone. Wisdom Pharma representatives will never ask for your verification code.
                            </p>
                            <p style="font-size: 11px; color: #cbd5e1; margin: 0; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
                                &copy; {{ date('Y') }} Wisdom Pharma. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
