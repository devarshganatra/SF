# Setup Instructions

## Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn

---

## 1. Clone the Repository
```bash
git clone https://github.com/devarshganatra/SF.git
cd SF
```

---

## 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- The frontend will be available at: http://localhost:3000

---

## 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
- The backend API will be available at: http://localhost:5000

---

## 4. Environment Variables (Frontend)
Create a file named `.env.local` in the `frontend` directory with the following content:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 5. Access the App
- Open your browser and go to: http://localhost:3000
- The app will connect to the backend at http://localhost:5000 