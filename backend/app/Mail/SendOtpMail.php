<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class SendOtpMail extends Mailable
{
    public function __construct(
        public readonly string $otpCode,
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject("Verify your email - Wisdom Pharma")
            ->view('emails.otp');
    }
}
