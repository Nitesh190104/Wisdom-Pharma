<?php

namespace App\Mail\Transports;

use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mime\MessageConverter;
use Symfony\Component\Mime\RawMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoTransport extends AbstractTransport
{
    public function __construct(protected string $apiKey)
    {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        
        $to = [];
        foreach ($email->getTo() as $address) {
            $to[] = [
                'email' => $address->getAddress(),
                'name' => $address->getName() ?: null
            ];
        }

        $from = current($email->getFrom());
        $fromEmail = $from ? $from->getAddress() : env('MAIL_FROM_ADDRESS', 'wisdompharma866@gmail.com');
        $fromName = $from ? $from->getName() : env('MAIL_FROM_NAME', 'Wisdom Pharma');

        $payload = [
            'sender' => ['email' => $fromEmail, 'name' => $fromName],
            'to' => $to,
            'subject' => $email->getSubject(),
        ];

        // Parse HTML or Text bodies
        $htmlBody = $email->getHtmlBody();
        $textBody = $email->getTextBody();

        if ($htmlBody) {
            // If body is a resource, read it
            if (is_resource($htmlBody)) {
                $htmlBody = stream_get_contents($htmlBody);
            }
            $payload['htmlContent'] = (string)$htmlBody;
        }

        if ($textBody) {
            if (is_resource($textBody)) {
                $textBody = stream_get_contents($textBody);
            }
            $payload['textContent'] = (string)$textBody;
        }

        // Fallback if both are empty
        if (empty($payload['htmlContent']) && empty($payload['textContent'])) {
            $payload['textContent'] = (string)$email->getBody()->toString();
        }

        $response = Http::withHeaders([
            'api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', $payload);

        if ($response->failed()) {
            Log::error('Brevo API Email sending failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Brevo API Email sending failed: ' . $response->body());
        }
    }

    public function __toString(): string
    {
        return 'brevo';
    }
}
