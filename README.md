# KHILATKARI — The Art of Timeless Craft

A full-stack, appointment-based luxury fashion web application built for **KhilatKari**.

KhilatKari operates as an exclusive, private in-home appointment label for handcrafted South Asian traditional wear (Kamdani, Mukesh, Gota, hand embroidery, Kashmiri Shawls, and Bridal Wear) across **Lahore, Islamabad, Rawalpindi, and Peshawar**.

---

## 🏛️ Project Architecture

```
ms-fashions/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/           # Reusable UI & Layout components
│   │   │   ├── layout/           # Navbar, Footer
│   │   │   ├── product/          # ProductCard
│   │   │   └── ui/               # WhatsAppButton, InstagramIcon
│   │   ├── pages/                # Public pages & Admin dashboard
│   │   │   ├── HomePage.tsx      # Luxury hero carousel, model gallery, process
│   │   │   ├── CollectionsPage.tsx # Catalog search, category filters, pagination
│   │   │   ├── ProductDetailPage.tsx # Editorial gallery, specs, appointment CTAs
│   │   │   ├── AppointmentPage.tsx # In-home appointment booking form
│   │   │   ├── AboutPage.tsx     # Heritage story, craftsmanship, values
│   │   │   ├── ContactPage.tsx   # Direct concierge, WhatsApp, FAQs
│   │   │   └── admin/            # Secure Management Portal
│   │   │       ├── AdminLoginPage.tsx
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── ProductsAdminPage.tsx
│   │   │       ├── AddEditProductPage.tsx
│   │   │       └── AppointmentsAdminPage.tsx
│   │   ├── layouts/              # PublicLayout & AdminLayout
│   │   ├── services/             # Axios API services (products, appointments, auth)
│   │   ├── data/constants.ts     # Central brand settings, phone, links, cities
│   │   └── types/index.ts        # TypeScript schemas
│   └── public/images/models/     # High-resolution model showcase photos
│
├── backend/                      # FastAPI + Motor (Async MongoDB) + PyMongo + JWT
│   ├── app/
│   │   ├── main.py               # Application factory & CORS
│   │   ├── config.py             # Settings via pydantic-settings
│   │   ├── database.py           # MongoDB connection & indexes
│   │   ├── routes/               # Public endpoints & /admin endpoints
│   │   ├── services/             # Database queries & business logic
│   │   ├── schemas/              # Pydantic validation models
│   │   └── utils/                # Security (Bcrypt + JWT) & JSON response
│   ├── seed.py                   # Database seeder (admin user + 9 sample pieces)
│   ├── test_e2e.py               # Automated verification test script
│   └── requirements.txt          # Python dependencies
│
└── Products/                     # Original photos from photoshoots
```

---

## ⚡ Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend

# Install dependencies (FastAPI, Motor, PyMongo, python-jose, bcrypt, uvicorn)
pip install -r requirements.txt

# Seed database (Admin account + 9 luxury model collections)
python seed.py

# Start FastAPI server (Runs on port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Runs on port 5173 with proxy to backend)
npm run dev
```

Visit the storefront at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔐 Admin Portal Access

- **URL:** `http://localhost:5173/admin/login`
- **Default Username:** Configured in `backend/.env` (`ADMIN_USERNAME`)
- **Default Password:** Configured during database seeding

### Admin Features:
- **Dashboard Overview:** Real-time metrics for total catalog pieces, pending appointments, and recent booking requests.
- **Product Management:** Add, edit, or archive creations. Easily assign photos from the 18 model photos in the gallery or upload from PC.
- **In-Home Appointments:** Review customer booking details, filter by city (Lahore, Islamabad, Rawalpindi, Peshawar) and status, record private concierge notes, and initiate 1-click WhatsApp customer contact.

---

## 🚀 Free Deployment Guide

### A. Database — MongoDB Atlas
Configure your MongoDB Atlas cluster connection string in your deployment environment variables:
`MONGODB_URI=<your-mongodb-connection-string>`

### B. Backend Deployment — Render (Free Tier)
1. Push your repository to GitHub.
2. Sign up on [Render.com](https://render.com/) and click **New + > Web Service**.
3. Connect your GitHub repository and configure:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`
   - `DATABASE_NAME`: `ms_fashions`
   - `SECRET_KEY`: `<generate-a-random-256-bit-secret-key>`
   - `ADMIN_USERNAME`: `<your-admin-username>`
   - `ADMIN_PASSWORD_HASH`: `<bcrypt-hash-of-admin-password>`
   - `FRONTEND_URL`: `https://<your-vercel-domain>.vercel.app`
5. Click **Deploy**. Your API will be live at `https://<your-render-subdomain>.onrender.com`.

### C. Frontend Deployment — Vercel (Free Tier)
1. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
2. Select your repository.
3. Configure project settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set up rewrite/proxy in `vercel.json` (or set `VITE_API_URL` to point to your live Render backend).
5. Click **Deploy**. Your luxury storefront will be live worldwide with SSL!
