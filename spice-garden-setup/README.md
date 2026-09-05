# Spice Garden Restaurant — Full-Stack Ordering Website

A full-stack restaurant ordering website: React (Vite) frontend + Django REST
Framework backend + PostgreSQL database, with JWT authentication, a customer
ordering flow, and an admin dashboard.

```
spice-garden/
├── backend/     Django + DRF REST API, PostgreSQL models
├── frontend/    React + Vite + React Router SPA
└── README.md
```

## Features

- Customer registration/login (JWT), profile, order history
- Browsable menu with categories, veg/non-veg + spice-level filters, search
- Food detail pages, cart, checkout, order confirmation with status tracking
- Admin dashboard: manage menu items & categories, view/update orders,
  view customers, revenue/order stats
- Customer star-rating reviews shown on the home page
- Sample menu data seed command so the site works immediately

---

## 1. Backend Setup (Django + PostgreSQL)

### 1.1 Prerequisites
- Python 3.11+
- PostgreSQL 14+ running locally (or accessible via network)

### 1.2 Create the PostgreSQL database

```bash
# Open the postgres shell
psql -U postgres

-- Inside psql:
CREATE DATABASE spice_garden;
CREATE USER spice_garden_user WITH PASSWORD 'change-this-password';
GRANT ALL PRIVILEGES ON DATABASE spice_garden TO spice_garden_user;
\q
```

(On PostgreSQL 15+, you may also need to run
`GRANT ALL ON SCHEMA public TO spice_garden_user;` while connected to the
`spice_garden` database.)

### 1.3 Install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 1.4 Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `SECRET_KEY`, `DB_PASSWORD`, etc. to match what you
created in step 1.2. **Never commit `.env` to version control.**

### 1.5 Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 1.6 Create an admin (superuser) account

```bash
python manage.py createsuperuser
```

Follow the prompts (email, username, password). This account can log in to
both `/admin/` (Django admin) and the React admin dashboard at `/admin`,
because the dashboard checks `is_staff`.

### 1.7 Load sample menu data

```bash
python manage.py seed_data
```

This creates the 4 categories and 12 menu items described in the project
brief (Paneer Tikka, Chicken Curry, Hakka Noodles, Mango Lassi, etc.) so the
site can be tested immediately.

### 1.8 Run the backend server

```bash
python manage.py runserver
```

The API is now available at `http://localhost:8000/api/`.
Django admin is at `http://localhost:8000/admin/`.

---

## 2. Frontend Setup (React + Vite)

### 2.1 Prerequisites
- Node.js 18+

### 2.2 Install dependencies

```bash
cd frontend
npm install
```

### 2.3 Configure environment variables

```bash
cp .env.example .env
```

The default `VITE_API_URL=/api` works with the built-in Vite dev proxy
(configured in `vite.config.js`) to forward `/api` and `/media` requests to
`http://localhost:8000`, so you usually don't need to change anything.

### 2.4 Run the frontend dev server

```bash
npm run dev
```

Visit `http://localhost:5173`.

### 2.5 Production build

```bash
npm run build
```

Outputs static files to `frontend/dist/`, which you can serve with any
static file host (or Django's `whitenoise`, nginx, etc). Update
`VITE_API_URL` to your deployed API URL before building for production.

---

## 3. Testing the Main Flow

With both servers running:

1. **Register** a customer account at `/register`.
2. **Login** — you're redirected home and the navbar shows your name.
3. **Browse Menu** at `/menu` — filter by category or veg-only, or search.
4. **Add to Cart** from a menu card or a food detail page.
5. **Checkout** — fill in delivery details and place the order.
6. You land on the **order confirmation** page with a live status tracker.
7. Log in as the **superuser** you created, and visit `/admin` in the app
   (not `/admin/` which is Django's own admin) to see the order under
   **Orders**, and update its status through the dropdown — the customer's
   `/orders/<id>` page will reflect the new status on next visit.
8. Check **Dashboard** for total orders/customers/revenue cards.

---

## 4. REST API Reference

All endpoints are prefixed with `/api/`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register/` | Create a customer account |
| POST | `/auth/login/` | Obtain JWT access/refresh tokens (email + password) |
| POST | `/auth/logout/` | Blacklist a refresh token |
| POST | `/auth/token/refresh/` | Exchange a refresh token for a new access token |
| GET/PUT | `/auth/profile/` | View or update the logged-in user's profile |
| GET | `/auth/customers/` | *(admin)* List all customers |
| GET | `/categories/` | List menu categories |
| POST | `/categories/` | *(admin)* Create a category |
| GET | `/menu/` | List menu items (`?category=`, `?veg=true`, `?search=`) |
| GET | `/menu/<id>/` | Menu item detail |
| POST/PUT/DELETE | `/menu/<id>/` | *(admin)* Create/update/delete a menu item |
| POST | `/orders/` | Place an order from cart items |
| GET | `/orders/` | List own orders (or all orders, if admin) |
| GET | `/orders/<id>/` | Order detail |
| PATCH | `/orders/<id>/status/` | *(admin)* Update order status |
| GET | `/orders/stats/` | *(admin)* Dashboard summary (totals & revenue) |
| GET | `/reviews/` | List reviews |
| POST | `/reviews/` | Submit a review (logged-in customers) |

Authenticated requests use `Authorization: Bearer <access_token>`.

---

## 5. Notes on Security & Configuration

- Passwords are hashed by Django's built-in password hashers — never stored
  in plaintext.
- All secrets (Django `SECRET_KEY`, database credentials) are read from
  environment variables via `python-decouple` — see `backend/.env.example`.
- JWT access tokens are short-lived (default 60 min); refresh tokens rotate
  and old ones are blacklisted on refresh/logout.
- CORS is restricted to `FRONTEND_URL` from your `.env`.
- Uploaded menu item images are served from `/media/` in development
  (`DEBUG=True`); configure a proper media host (S3, etc.) for production.

## 6. Troubleshooting

- **`django.db.utils.OperationalError`**: check `DB_*` values in `.env`
  match the database/user you created, and that PostgreSQL is running.
- **CORS errors in the browser console**: make sure `FRONTEND_URL` in
  `backend/.env` exactly matches the URL the frontend is served from
  (including port).
- **401 errors after a while**: the access token expired and there's no
  valid refresh token — log in again.
