# Spice Garden — Frontend + Backend Setup

## Stack
- **Frontend:** React 18 + Vite, JSX, HTML, CSS
- **Backend:** Python 3.11+ + Django 5 + Django REST Framework
- **Database:** PostgreSQL 14+
- **API authentication:** JWT via SimpleJWT
- **HTTP client:** Axios

## Project structure

```text
spice-garden/
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/       # Axios/API calls
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
├── backend/
│   ├── config/              # Django project settings/URLs
│   ├── users/               # authentication + profiles
│   ├── menu/                # categories + menu items
│   ├── orders/              # cart checkout + orders
│   ├── reviews/             # customer reviews
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── database/init.sql
└── scripts/
```

## 1. PostgreSQL

Open `database/init.sql` in pgAdmin or `psql` and run it as a PostgreSQL administrator. Replace the example password first.

If the user/database already exists, do not run the CREATE statements again; instead make sure the credentials in `backend/.env` match PostgreSQL.

## 2. Backend

Windows:

```bat
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
python manage.py runserver
```

API: http://localhost:8000/api/
Django admin: http://localhost:8000/admin/

## 3. Frontend

In a second terminal:

```bat
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173/

Vite proxies `/api` and `/media` to Django at port 8000, so the browser does not need a separate API URL in development.

## 4. Run both

Use two terminals:

**Terminal 1**
```bat
scripts\start_backend_windows.bat
```

**Terminal 2**
```bat
scripts\start_frontend_windows.bat
```

Or run `scripts\setup_windows.bat` once for first-time setup.

## 5. Main flow

1. Register a user in React.
2. Log in; JWT access/refresh tokens are stored in browser local storage.
3. Browse `/menu` and add food to the cart.
4. Checkout creates an order through Django REST API.
5. Admin users can use `/admin` in React to manage menu, orders, and customers.
6. Django admin remains available at `/admin/` on port 8000.

## 6. Important URLs

| Purpose | URL |
|---|---|
| React app | http://localhost:5173/ |
| Django API | http://localhost:8000/api/ |
| Django admin | http://localhost:8000/admin/ |
| Menu API | http://localhost:8000/api/menu/ |
| Auth API | http://localhost:8000/api/auth/ |
| Orders API | http://localhost:8000/api/orders/ |
| Reviews API | http://localhost:8000/api/reviews/ |
