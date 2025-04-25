
# Alltech Staffing Platform MVP – Developer README

This project is a modular, localStorage-powered staffing platform MVP built in React. It supports full front- and back-office workflows for recruiters, clients, candidates, and admins. Designed in Replit for rapid prototyping and demo readiness.

## 🚀 Quick Start

1. Open in [Replit](https://replit.com/@DDAlltech/AlltechMVP)
2. Click ▶️ Run to start Vite dev server
3. Access app via webview or new tab

## 🏗️ Architecture

```
/js
├── components/      # React JSX modules
├── stores/         # Data persistence 
├── tools/          # Feature modules
└── auth/           # Role system
```

## 💻 Development

### Role System
- Dev override code: `alltechadmin`
- Roles: CEO, CFO, Director, Sales, Client, Recruiter
- Auth simulation via localStorage

### Data Layer
```javascript
// Access stored data
const users = JSON.parse(localStorage.getItem('users'))
const jobs = JSON.parse(localStorage.getItem('jobs'))
```

### Component Props
```javascript
// Standard dashboard props
interface DashboardProps {
  userData: UserData;
  roleType: RoleTypes;
  metrics?: MetricsData;
}
```

## 🔧 Core Modules

| Module | Purpose | Key Functions |
|--------|----------|--------------|
| `data-store.js` | Central state | `getUser()`, `updateUser()` |
| `router.js` | Navigation | Role-based routing |
| `dev-tools.js` | Testing | Role override |

## 🧪 Testing

1. Enable dev mode:
   - Click "Dev override" link
   - Enter code: `alltechadmin`
   - Select role from dropdown

2. Test flows:
   - Candidate application
   - Job posting
   - Client approvals
   - Onboarding steps

## 📦 Future Integration

```javascript
// Supabase auth example
const { user, session } = await supabase.auth.signUp({
  email: 'user@alltech.com',
  password: 'password'
})
```

## 🛠️ Dev Tools

- Role override system
- Mock data generators
- Console debugging
- localStorage inspector

## 📝 Notes

- Vite dev server runs on port 5000
- All API calls simulated via localStorage
- Role-based routing handles access control
- Mock data persists in localStorage

> Built for rapid prototyping and demo deployment on Replit
