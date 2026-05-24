# Wisdom Pharma

Wisdom Pharma is a full-stack B2B + B2C pharmaceutical e-commerce and management platform. Consumers can buy medicines at retail prices with GST, medical stores can place wholesale orders, and admins can manage medicines, inventory, users, business approvals, orders, prescriptions, and analytics.

## Tech Stack

Frontend:
- React 19, Vite, React Router DOM
- Axios, Zustand, React Hook Form
- Tailwind CSS, Framer Motion
- React Icons, Lucide React, React Hot Toast

Backend:
- Laravel 12, PHP 8.2+
- Laravel Sanctum token authentication
- REST APIs, middleware, form requests, policies, resources, repositories
- MongoDB via `mongodb/laravel-mongodb`
- File uploads, in-app notifications, log/SMPP-ready mail notifications

Database:
- MongoDB collections: `users`, `medicines`, `categories`, `carts`, `orders`, `order_items`, `prescriptions`, `businesses`, `notifications`, `personal_access_tokens`

## Features

Consumer:
- Browse, search, filter, and view medicines
- Retail pricing with GST calculation
- Add to cart, checkout, place orders
- Upload prescriptions and view review status
- View order history and manage profile

Medical Store:
- Register as a business with GST and drug license details
- Wholesale pricing and bulk order flow
- Store dashboard and order tracking
- Business approval handled by admin

Admin:
- Login through the normal login form using admin credentials
- Analytics dashboard
- Manage medicines, categories, users, orders, inventory, and prescriptions
- Add/remove medicines, update prices, and increase/decrease stock
- Approve/reject medical store business accounts
- Review uploaded prescriptions

## Default Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `wisdom.admin@wisdompharma.com` | `WisdomAdmin@123` |
| Consumer | `rahul@example.com` | `password123` |
| Medical Store | `priya@medstore.com` | `password123` |

## Setup

### Backend

```bash
cd backend
composer install
php artisan storage:link
php artisan config:clear
php artisan db:seed
php artisan serve
```

Backend URL: `http://localhost:8000`

Important `.env` values:

```env
DB_CONNECTION=mongodb
DB_DSN=mongodb+srv://username:password@cluster.example.mongodb.net/
DB_DATABASE=wisdom_pharma
MAIL_MAILER=log
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Overview

Public:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/medicines`
- `GET /api/medicines/featured`
- `GET /api/medicines/{id}`
- `GET /api/categories`

Authenticated:
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/logout`
- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/{medicineId}`
- `POST /api/orders`
- `GET /api/orders`
- `POST /api/orders/{id}/cancel`
- `GET /api/prescriptions`
- `POST /api/prescriptions`

Admin:
- `GET /api/admin/dashboard`
- `POST /api/admin/medicines`
- `PUT /api/admin/medicines/{id}`
- `DELETE /api/admin/medicines/{id}`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`
- `GET /api/admin/users`
- `PUT /api/admin/users/{id}`
- `GET /api/admin/inventory`
- `PUT /api/admin/inventory/{id}/stock`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{id}/status`
- `GET /api/admin/businesses/pending`
- `POST /api/admin/businesses/{id}/approve`
- `POST /api/admin/businesses/{id}/reject`
- `GET /api/admin/prescriptions`
- `PUT /api/admin/prescriptions/{id}/review`

## Structure

```text
backend/
  app/Http/Controllers/Api
  app/Http/Middleware
  app/Http/Requests
  app/Http/Resources
  app/Mail
  app/Models
  app/Policies
  app/Repositories
  app/Services
  routes/api.php

frontend/
  src/components
  src/context
  src/hooks
  src/layouts
  src/pages
  src/routes
  src/services
  src/store
  src/utils
```

## Verification

Syllabus mapping checklist: see `SYLLABUS-COVERAGE.md`.

```bash
cd frontend
npm run lint
npm run build

cd ../backend
php artisan test
```

Current note: Vite may need to run outside this tool sandbox on Windows because Tailwind/Vite native process loading can be blocked by sandbox permissions.
