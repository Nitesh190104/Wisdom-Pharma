# Wisdom Pharma — Backend

Laravel 12 + MongoDB backend API for the Wisdom Pharma full-stack platform.

## Requirements

- PHP 8.2+
- Composer
- MongoDB (local or Atlas)

## Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure MongoDB in `backend/.env`:

```env
DB_CONNECTION=mongodb
DB_DSN=mongodb+srv://username:password@cluster.example.mongodb.net/
DB_DATABASE=wisdom_pharma
```

Seed sample data (includes default admin/consumer/store):

```bash
php artisan db:seed
```

Run API server:

```bash
php artisan serve
```

## Sanity checks

```bash
php artisan test
```

## Important behavior

- Auth uses Sanctum tokens stored in MongoDB.
- Medical store users can place wholesale orders only after admin verification (`business.is_verified === true`).
- Wholesale minimum quantity enforcement is applied at cart updates and order placement.

For full project setup (frontend + backend), see the root `README.md`.
