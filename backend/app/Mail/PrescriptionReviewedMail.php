<?php

namespace App\Mail;

use App\Models\Prescription;
use App\Models\User;
use Illuminate\Mail\Mailable;

class PrescriptionReviewedMail extends Mailable
{
    public function __construct(
        public readonly Prescription $prescription,
        public readonly User $user,
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject('Wisdom Pharma prescription review update')
            ->view('emails.prescription-reviewed');
    }
}
