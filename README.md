# VastraSilai AI – AI-Powered Multilingual Tailoring Management Platform

Making Every Stitch Intelligent.

VastraSilai AI is a digital platform designed to modernize traditional tailoring businesses. It replaces traditional paper notebooks with a secure, multilingual, and AI-enabled dashboard that manages customers, measurements, orders, payments, delivery schedules, and automated WhatsApp reminders.

---

## Folder Structure

```
VastraSilai/
├── backend/            # Python FastAPI Backend
│   ├── app/            # Source code (routers, schemas, models)
│   ├── run.py          # Server launcher
│   └── requirements.txt# Backend libraries
├── frontend/           # React + Vite + Tailwind Frontend
│   ├── src/            # Components, Pages, Context, Translations (i18n)
│   └── package.json    # Frontend npm packages
├── database/           # PostgreSQL Setup scripts (Supabase schema.sql)
├── uploads/            # Location for uploaded design reference photos
├── .env                # Local configuration values
├── Dockerfile          # Stage instructions for backend deployment
├── docker-compose.yml  # Network orchestrator (client + server + local db)
└── README.md           # Documentation
```

---

## Getting Started

### 1. Database Setup (Supabase)

To link your live Supabase PostgreSQL database:
1. Open the `.env` file at the root.
2. Locate the `DATABASE_URL` parameter:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR_SUPABASE_PASSWORD]@db.nmrcwzafsyvuosbhcyhl.supabase.co:5432/postgres
   ```
3. Replace `[YOUR_SUPABASE_PASSWORD]` with your actual Supabase database password.
4. When you start the FastAPI server, it will automatically connect and create the tables (Users, Customers, Measurements, Orders, Payments, Notifications) inside your Supabase project!

*(Optional: You can also copy the content of [database/schema.sql](file:///d:/VastraSilai/database/schema.sql) and execute it manually in the Supabase SQL Editor).*

---

### 2. Local Run (FastAPI + React)

#### Start Backend:
1. Open a terminal at the project root.
2. Activate virtual environment and launch FastAPI:
   ```powershell
   # Windows PowerShell
   .\backend\venv\Scripts\python backend/run.py
   ```
   The backend will run on [http://localhost:8000](http://localhost:8000) and automatically configure the DB schemas.

#### Start Frontend:
1. Open a separate terminal at the project root.
2. Launch Vite dev server:
   ```powershell
   npm run dev --prefix frontend
   ```
   The Vite React UI will launch on [http://localhost:5173](http://localhost:5173).

---

## Core Features Tour

1. **Multilingual toggle:** Switch between **English, Telugu (తెలుగు), and Hindi (हिंदी)** instantly using the navbar translation utility or settings selector. All labels translate immediately.
2. **Tailor Workspaces:**
   - **Dashboard:** Glassmorphism cards for monthly collections, completed order meters, and today's schedule lists.
   - **Customers Registry:** Add tailors' customers, view order histories, update digitized measurement parameters (Chest, Waist, Shoulder, Sleeve), and upload design sketches.
   - **Order Book:** Log shirt/pant orders, specify total charges, and record advance fees.
   - **Deliveries Calendar:** Segment schedules into Today's, Overdue, and Upcoming deliveries, with an interactive monthly calendar board.
   - **Revenue Analytics:** Custom vector SVG graphics modeling weekly collections and monthly revenue paths.
   - **WhatsApp Simulators:** View message audit dispatch registers and trigger the daily 8 AM automated collection reports manually.
3. **Customer Workspace:** Log in as a customer using the customer's phone number to view order progress tracks, expected collections dates, payment histories, and measurement charts.
