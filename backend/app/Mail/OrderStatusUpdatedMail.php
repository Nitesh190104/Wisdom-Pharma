<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Mail\Mailable;

class OrderStatusUpdatedMail extends Mailable
{
    public function __construct(
        public readonly Order $order,
        public readonly User $user,
        public readonly string $status,
    ) {
    }

    public function build(): self
    {
        $statusLabel = ucfirst($this->status);
        return $this
            ->subject("Wisdom Pharma: Order #{$this->order->order_number} is {$statusLabel}")
            ->view('emails.order-status-updated');
    }
}
