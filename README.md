# 🥗 Plan My Plate

A full-stack **MERN** web app for personalized healthy meal planning and nutrition tracking.

Plan meals across Breakfast / Lunch / Dinner / Snack slots, browse vegetarian & non-vegetarian meals with full nutrition facts, track calories and protein on a live dashboard, set personal goals, and contact support — all in one colorful, responsive app.

## ✨ Features

| Area | What you get |
|---|---|
| 🔐 Auth | JWT login & signup, hashed passwords, protected routes, admin role |
| 🍽️ Meals | 28+ seeded meals with calories, protein, carbs, fats, fiber; search, filter by diet/category, sort |
| 📅 Meal Plans | Per-day plans, add/remove meals with servings, mark as eaten |
| 📊 Dashboard | Stat cards, animated calorie ring, 7-day intake chart |
| 👤 Profile | Body stats, diet preference (veg/non-veg/both), auto calorie & protein goal calculator |
| 💬 Support | Submit queries/complaints/feedback; track replies |
| 🛡️ Admin | Manage users, meals (CRUD), and support tickets with replies |

## 🧱 Tech Stack

- **MongoDB** + Mongoose ODM
- **Express.js** REST API
- **React 18** (Vite) + **Tailwind CSS v4** + React Router
- **Node.js** with JWT auth (jsonwebtoken + bcryptjs)

## 📁 Project Structure

```
plan-my-plate/
├── server/               # Express API
│   └── src/
│       ├── config/       # DB connection
│       ├── controllers/  # auth, users, meals, plans, support, admin
│       ├── middleware/   # JWT protect + adminOnly
│       ├── models/       # User, Meal, MealPlan, SupportTicket
│       ├── routes/
│       └── seed/         # Demo data (meals, users, plan)
└── client/               # React app (Vite)
    └── src/
        ├── components/   # Navbar, MealCard, AddToPlanModal
        ├── context/      # Auth, Toast
        ├── lib/          # axios instance + helpers
        ├── pages/        # Landing, Login, Register, Dashboard, Meals, MyPlan, Profile, Support, Admin
        └── utils/        # nutrition math & date helpers
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`), **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
```
Edit `server/.env` — set `MONGO_URI` (local or Atlas string) and a strong `JWT_SECRET`.

### 3. Seed demo data
```bash
npm run seed
```
This creates 28 meals, an admin, a demo user, and a sample plan for today.

### 4. Run the app (dev)
```bash
npm run dev
```
- Frontend → http://localhost:5173
- API → http://localhost:5000/api/health
- Vite proxies `/api` to the backend automatically.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| 👤 User | aarav@example.com | user123 |
| 🛡️ Admin | admin@planmyplate.com | admin123 |

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run server + client together |
| `npm run server` / `npm run client` | Run one side only |
| `npm run seed` | Reset & seed the database |
| `npm run build` | Production build of the client |

## 🔌 API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user |
| GET/PUT | `/api/users/profile` | Get/update profile & goals |
| POST | `/api/users/suggest-goals` | Auto-calculate targets |
| GET/POST | `/api/meals` | List (filter/sort) / create custom meal |
| GET/DELETE | `/api/meals/:id` | Detail / delete own meal |
| GET | `/api/plans?date=` | Day plan |
| GET | `/api/plans/summary?days=7` | Weekly intake summary |
| POST | `/api/plans/entries` | Add meal to a day |
| DELETE | `/api/plans/entries/:entryId` | Remove entry |
| PATCH | `/api/plans/entries/:entryId/toggle` | Toggle "eaten" |
| GET/POST | `/api/support` | List own tickets / create ticket |
| GET/DELETE | `/api/admin/...` | Stats, users, meals, tickets (admin only) |

## 🌍 Production

1. `npm run build` — builds the React app to `client/dist`.
2. The Express server automatically serves `client/dist` and falls back to `index.html` for SPA routing.
3. Set `NODE_ENV=production`, a strong `JWT_SECRET`, and your `MONGO_URI` on the host.
