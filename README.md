# SF Data Visualization Platform

This guide will walk you through setting up, running, and updating the fullstack application (React/Next.js frontend + FastAPI backend).

---

## Prerequisites
- **Node.js** v18 or newer
- **Python** 3.8 or newer
- **npm** or **yarn** (for frontend)
- **git**

---

## 1. Clone the Repository
```bash
git clone https://github.com/devarshganatra/SF.git
cd SF
```

If you already have the repo, update to the latest version:
```bash
git pull origin main
```

---

## 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
- The backend will run at: **http://localhost:8000**
- By default, SQLite is used for storage (no setup needed).
- If you change backend port, update the frontend `.env.local` accordingly.

---

## 3. Frontend Setup (Next.js)
```bash
cd ../frontend
npm install
```

### Environment Variables
Create a file called `.env.local` in the `frontend` directory:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

### Start the Frontend
```bash
npm run dev
```
- The frontend will run at: **http://localhost:3000**

---

## 4. Using the App
- Visit [http://localhost:3000](http://localhost:3000) in your browser.
- Create a project, add visualizations, and explore features.
- Saved visualizations are project-specific and persist automatically.

---

## 5. Project Structure
- `frontend/` — Next.js React app (UI/dashboard)
- `backend/` — FastAPI app (API, SQLite DB)
- `README.md` — This file

---

## 6. Updating Your Repo
To get the latest features and bug fixes:
```bash
cd SF
git pull origin main
# (Optionally) update dependencies:
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

---

## 7. Troubleshooting
- **Port issues:** Make sure nothing else is running on 3000 (frontend) or 8000 (backend).
- **.env issues:** Double-check `.env.local` in `frontend/` and restart `npm run dev` after changes.
- **Backend errors:** Ensure virtualenv is activated and all Python dependencies are installed.
- **Frontend errors:** Run `npm install` in the `frontend/` directory.

---

## 8. Additional Notes
- For production, use `npm run build` and a proper ASGI server for FastAPI.
- Contributions welcome! Fork, branch, and PR as usual.

---

**Enjoy building and visualizing your data!**