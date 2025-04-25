# Alltech Staffing Platform MVP – Developer README

This project is a modular, localStorage-powered staffing platform MVP built in React. It supports full front- and back-office workflows for recruiters, clients, candidates, and admins. Designed in Replit for rapid prototyping and demo readiness.

---

## ⚙️ Setup Instructions (Replit)

1. **Clone or open project** at:
   - [https://replit.com/@DDAlltech/AlltechMVP](https://replit.com/@DDAlltech/AlltechMVP)

2. **Project Structure:**
   - All components stored in `.jsx` files
   - Shared logic: `users.js`, `jobOrders.js`, `salesData.js`, `data-store.js`
   - Route-based dashboard loading

3. **Run the app:**
   - Click ▶️ Run
   - Use the globe icon 🌐 to open in a new tab

4. **Login system:**
   - Go to `/login`
   - Select a role-based user from dropdown
   - Role-based redirection will take you to the appropriate dashboard

---

## 🧱 Key Technologies

- **React (JSX modules)**
- **Tailwind CSS**
- **React Router (local routing)**
- **LocalStorage** for all data persistence

---

## 🧠 Folder + Feature Map

| Category          | Modules                            |
|------------------|-------------------------------------|
| Dashboards       | `admin-dashboard.jsx`, `executive-dashboard.jsx`, `sales-dashboard.jsx`, `recruiter-dashboard.jsx`, `client-approvals.jsx`, `candidate-dashboard.jsx` |
| Tools            | `resume-generator.jsx`, `smart-matching.jsx`, `roi-calculator.jsx`, `gl-mapping-assistant.jsx`, `import-export.jsx`, `vms-aggregator.jsx` |
| Navigation/Auth  | `login.jsx`, `role-home.jsx`, `top-nav.jsx`, `global-search.jsx`, `notification-center.jsx` |
| Data Stores      | `users.js`, `jobOrders.js`, `salesData.js`, `data-store.js` |
| Candidate UX     | `candidate-job-search.jsx`, `onboarding-flow.jsx`, `timesheet-entry.jsx` |

---

## 🔌 Planned Integrations

| Service      | Notes |
|--------------|-------|
| **Supabase** | Future authentication + backend persistence |
| **Recharts** | Replace simulated KPI panels with live charting |
| **Drag-n-Drop Upload** | Simulate onboarding doc collection |
| **Webhooks / API Layer** | Optional external job feed support |

---

## 🧪 Test Scenarios

- Log in as each role → ensure you’re routed correctly
- Use Global Search to find job titles or user names
- Generate a resume or simulate ROI savings
- Submit a candidate, then approve via client role

---

## 🔒 No backend or login API required
This version is designed to simulate production functionality using only client-side state, so it's safe for investors, demos, or offline testing.

---

## 👋 Contributing
This version is single-user and intended for prototype simulation. Future PR-ready version will include:
- Supabase integration
- Role-based auth guards
- Live DB and file storage

---

> Questions? Ask @DDAlltech – everything built here was designed for demo impact, investor clarity, and fast iteration.
