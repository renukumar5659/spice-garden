#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "=== Spice Garden: backend setup ==="
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py makemigrations users menu orders reviews
python manage.py migrate
python manage.py seed_data

echo "=== Spice Garden: frontend setup ==="
cd ../frontend
npm install

echo "Setup complete."
echo "Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "Frontend: cd frontend && npm run dev"
