# 🥗 MealMate

**MealMate** is a modern, real-time bill-splitting and expense-tracking web application designed for friends, roommates, and colleagues to effortlessly manage shared costs. It acts as a digital ledger that simplifies debts and streamlines the process of settling up via bank transfer slip verifications.

![MealMate](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Vue](https://img.shields.io/badge/Vue.js-3.0-4FC08D.svg?logo=vue.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg?logo=tailwind-css)

---

## ✨ Core Features

1. **Passwordless & Social Authentication**
   - Secure Login via Magic Link/OTP sent to email.
   - Google OAuth integration.
   
2. **Group Management & Invites**
   - Create dedicated groups for specific trips or events.
   - Invite users seamlessly using **LaoQR-style QR Codes** or shareable links.

3. **Expense Tracking & Debt Simplification**
   - Add meals or expenses, specifying the payer and the total cost.
   - Supports multiple currencies (`THB`, `LAK`, `USD`) with automatic thousands-separator formatting.
   - **Debt Simplification Algorithm:** Automatically calculates "Who Owes Who" to minimize total transactions required to settle debts.

4. **Payment Settlement via Slip Verification**
   - Users settle debts by uploading a bank transfer slip as proof.
   - Status tracking (`Needs Review`, `Confirmed`, `Rejected`).

5. **Full CRUD Admin Control Center**
   - A dedicated dashboard for the system admin (`amonethep16@gmail.com`).
   - **Real-time Queue:** Approvals/rejections of payment slips update instantly without refreshing.
   - Manage all entities: Edit/Ban Users, Edit/Delete Groups, and forcefully Delete invalid meals.
   - Real-time statistics (Total Volume, User Counts, etc.).

---

## 💻 Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Pinia
- **Routing:** Vue Router
- **Icons & Animations:** Lucide Vue, AOS (Animate On Scroll)

### Backend (BaaS)
- **Infrastructure:** Supabase
- **Database:** PostgreSQL (with Row Level Security policies)
- **Real-Time:** Supabase Realtime (PostgreSQL CDC) for instant UI updates.
- **Storage:** Supabase Storage for Avatars and Slip images.

---

## 📂 Project Structure

```
mealmate-app/
├── src/
│   ├── assets/       # Static assets (images, global CSS)
│   ├── components/   # Reusable Vue components (e.g., Navbar, User Avatar)
│   ├── lib/          # Library configurations (e.g., supabase.js client)
│   ├── router/       # Vue Router configuration & Auth Guards
│   ├── stores/       # Pinia state management (authStore, notificationsStore)
│   ├── views/        # Page-level components (Home, Admin, Login, Groups)
│   ├── App.vue       # Root component
│   └── main.js       # Entry point
├── supabase/         # (If applicable) Local Supabase schema/migrations
├── tailwind.config.js# Tailwind CSS configuration & custom colors
├── vite.config.js    # Vite bundler configuration
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A Supabase Project (Database, Auth, Storage)

### 1. Clone the repository
```bash
git clone https://github.com/Fifaamonethep/mealmate-app.git
cd mealmate-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup (Supabase)
Ensure your Supabase project is configured with the following tables:
- `profiles`
- `groups`
- `group_members`
- `meals`
- `meal_participants`
- `slips`
- `notifications`

*Note: You must execute the `admin-policies.sql` in your Supabase SQL Editor to grant full CRUD permissions to the Admin.*

### 5. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🔒 Security
- **Row Level Security (RLS)** is heavily enforced on the database layer.
- Admin privileges are strictly locked to the designated admin email.
- Real-time channels are securely bound to authenticated sessions.
