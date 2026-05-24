<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message - Wisdom Pharma</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 30px; text-align: left;">
                            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">Wisdom Pharma</h1>
                            <p style="color: #38bdf8; font-size: 12px; font-weight: 600; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">New contact form message</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 28px 30px;">
                            <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">{{ $subjectLine }}</h2>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0 22px 0;">
                                <tr>
                                    <td style="background-color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9;">
                                        <p style="font-size: 13px; line-height: 20px; color: #0f172a; margin: 0 0 6px 0;"><strong>Name:</strong> {{ $name }}</p>
                                        <p style="font-size: 13px; line-height: 20px; color: #0f172a; margin: 0;"><strong>Email:</strong> {{ $email }}</p>
                                    </td>
                                </tr>
                            </table>

                            <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">Message</h3>
                            <div style="background-color: #ffffff; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
                                <p style="white-space: pre-wrap; font-size: 13px; line-height: 20px; color: #475569; margin: 0;">{{ $messageBody }}</p>
                            </div>

                            <p style="font-size: 12px; color: #94a3b8; margin: 16px 0 0 0;">
                                Tip: Reply directly to this email to respond to the sender.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 18px 30px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 11px; color: #cbd5e1; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
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
