<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class ContactMessageMail extends Mailable
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $subjectLine,
        public readonly string $messageBody,
    ) {
    }

    public function build(): self
    {
        return $this
            ->replyTo($this->email, $this->name)
            ->subject('Contact: ' . $this->subjectLine)
            ->view('emails.contact-message');
    }
}
