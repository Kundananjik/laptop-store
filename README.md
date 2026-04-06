# Laptop Store

## Overview
Laptop Store is a small full-stack laptop catalog and checkout demo. It includes a customer-facing storefront, a protected admin page for inventory management, session-based cart handling, and simple order placement backed by MongoDB.

## Features
- Storefront with search, filters, sorting, and product detail pages
- Protected admin page for create, edit, delete, and restock actions
- MongoDB-backed laptop inventory
- Session-based cart and checkout flow
- Order history per session
- Responsive frontend built with plain HTML, CSS, and JavaScript

## Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, Multer
- Database: MongoDB with Mongoose

## Structure
- `frontend/`: storefront, product detail, and admin pages
- `backend/server.js`: backend startup entry point
- `backend/app.js`: Express app wiring
- `backend/models/`: Mongoose models
- `backend/routes/`: API route definitions
- `backend/controllers/`: request handlers
- `backend/tests/`: automated tests

## Setup
1. Create or update `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/laptop-store
PORT=5000
CORS_ORIGIN=*
ADMIN_PASSWORD_HASH=scrypt$replace-this-salt$replace-this-derived-key
ADMIN_SECRET=replace-this-with-a-long-random-string
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Start the backend:

```bash
npm run dev
```

## App Routes
After the backend is running:

- `http://localhost:5000/`: storefront
- `http://localhost:5000/admin`: admin page
- `http://localhost:5000/product?id=<laptopId>`: product detail page

The frontend files can also be opened directly or served separately, but the backend-served routes are the preferred setup.

## Admin Access
The admin page is no longer linked from the storefront UI.

To access admin features:
1. Open `http://localhost:5000/admin`
2. Sign in with the admin password that matches `ADMIN_PASSWORD_HASH`
3. Use the admin page to add, edit, delete, or restock inventory

Programmatic inventory management is also possible through the protected API after login.

### Generate an admin password hash
PowerShell example:

```powershell
node -e "const crypto=require('crypto'); const password='admin123'; const salt=crypto.randomBytes(16).toString('hex'); const hash=crypto.scryptSync(password,salt,64).toString('hex'); console.log(`scrypt$${salt}$${hash}`)"
```

## API Summary
- `GET /api/health`
- `POST /api/admin/login`
- `GET /api/admin/session`
- `GET /api/laptops`
- `POST /api/laptops`
- `GET /api/laptops/:id`
- `PUT /api/laptops/:id`
- `DELETE /api/laptops/:id`
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `GET /api/orders`
- `GET /api/orders/admin`
- `POST /api/orders/checkout`

## Tests
Run the backend test suite:

```bash
cd backend
npm test
```

Optional database-backed test:

```bash
RUN_DB_TESTS=true npm test
```
