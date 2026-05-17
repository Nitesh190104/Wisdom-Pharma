<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Mail\Mailable;

class OrderPlacedMail extends Mailable
{
    public function __construct(
        public readonly Order $order,
        public readonly User $user,
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject("Wisdom Pharma order {$this->order->order_number} placed")
            ->view('emails.order-placed');
    }
}
