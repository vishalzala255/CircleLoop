# CircleLoop ♻️

### *The Green Revolution in E-Waste Management*

CircleLoop is a full-stack, enterprise-grade e-waste management platform designed to bridge the gap between conscientious consumers, recycling partners, and professional waste administrators. By streamlining the collection, inventorying, and redistribution of electronic waste, CircleLoop empowers communities to achieve a zero-waste future.

---

## ✨ Core Features

### 👤 User Dashboards
*   **Customer Portal**: Seamlessly schedule e-waste pickups, track request statuses in real-time, and manage personal profiles with saved collection addresses.
*   **Partner (Company) Portal**: Access a specialized marketplace of recovered electronic components, manage orders, and contribute to the waste logistics chain.
*   **Admin Command Center**: A bird's-eye view of system analytics, user management, inventory control, and real-time sales tracking.

### 🛡️ Secure & Scalable Architecture
*   **Role-Based Access Control (RBAC)**: Fine-grained security ensuring users only see what their role allows (Customer vs. Partner vs. Admin).
*   **Zero-Lag Data Synchronization**: Powered by Supabase Realtime for instant dashboard updates without page refreshes.
*   **Responsive Multi-Platform UI**: Hand-crafted vanilla CSS with a premium "Glassmorphism" aesthetic, optimized for Mobile, Tablet, and Desktop.

### 🌓 Advanced UI/UX
*   **Dynamic Theme Engine**: Full support for High-Contrast Dark Mode and Soft Light Mode.
*   **Custom Vector Iconography**: Professional SVG-based icons for a crisp, high-resolution experience on all screens.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 15+** | React framework with App Router for high-performance server-side rendering. |
| **Supabase** | Backend-as-a-Service providing PostgreSQL, Auth, and Realtime capabilities. |
| **TypeScript** | Static typing for enterprise-level code reliability. |
| **Vanilla CSS** | Custom design system using modern CSS variables for total aesthetic control. |

---

## 📂 Project Navigation

```bash
├── src/
│   ├── app/           # Next.js App Router (Dashboards & Auth)
│   ├── components/    # Reusable UI (Navbar, Footer, Icons)
│   ├── hooks/         # Custom React hooks (Auth, State)
│   └── lib/           # Supabase client & utility configs
├── documentation/     # Database architecture & setup logic
└── public/            # Static assets and branding
```

---

## 🚀 Local Setup & Configuration

### Prerequisites
- Node.js 18.x or higher
- A Supabase Project (Free Tier works perfectly)

### 1. Installation
```bash
git clone https://github.com/your-username/circleloop-web.git
cd circleloop-web
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and populate it with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

### 3. Database Initialization
Run the SQL scripts provided in `documentation/MASTER_SETUP.sql` inside your Supabase SQL Editor to initialize the `profiles`, `pickup_requests`, and `inventory` tables.

### 4. Launch
```bash
npm run dev
```

---

## 🌐 Deployment Logic

CircleLoop is built for the **Vercel** ecosystem. To deploy:
1. Connect your GitHub repository to Vercel.
2. Add your `.env` variables in the Vercel Project Settings.
3. Vercel will automatically detect the Next.js framework and build your project.

---

## 🤝 Contributing
We welcome contributions to the Green Revolution! Please fork the repo and submit a PR for any UI enhancements or performance optimizations.

---

*Join us in making the world a cleaner place, one circuit board at a time.*
