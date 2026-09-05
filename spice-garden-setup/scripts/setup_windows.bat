@echo off
setlocal
cd /d "%~dp0.."

echo === Spice Garden: backend setup ===
cd backend
if not exist venv python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py makemigrations users menu orders reviews
python manage.py migrate
python manage.py seed_data

echo.
echo === Spice Garden: frontend setup ===
cd ..\frontend
call npm install

echo.
echo Setup complete.
echo Start backend:  cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
 echo Start frontend: cd frontend ^&^& npm run dev
endlocal
