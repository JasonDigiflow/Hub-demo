# Meta App Review - Visual Testing Guide

## 🚀 Quick Start Guide

### 1️⃣ Access the Application
```
URL: https://digiflow-hub.vercel.app
```

### 2️⃣ Navigate to AIDs Module
```
Homepage → Click "AIDs" Card → Dashboard
```

### 3️⃣ Connect with Facebook
```
Dashboard → Yellow Box "Se connecter" → Facebook Login
```

---

## 📱 Step-by-Step Visual Flow

### Step 1: Homepage
```
┌─────────────────────────────────┐
│     DigiFlow Hub Homepage       │
│                                  │
│  ┌──────────┐  ┌──────────┐    │
│  │   AIDs   │  │  Other   │    │
│  │   Click  │  │   Apps   │    │
│  │   Here   │  │          │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

### Step 2: AIDs Dashboard (Not Connected)
```
┌─────────────────────────────────┐
│        AIDs Dashboard           │
│                                  │
│  ⚠️ Connexion Meta requise      │
│  ┌────────────────────┐         │
│  │   Se connecter     │ ← Click │
│  └────────────────────┘         │
└─────────────────────────────────┘
```

### Step 3: Connect Page
```
┌─────────────────────────────────┐
│     Connexion Meta Ads          │
│                                  │
│         ( f )                   │
│    Facebook Logo                │
│                                  │
│  ┌──────────────────────┐       │
│  │ Se connecter avec    │       │
│  │    Facebook          │ ← Click│
│  └──────────────────────┘       │
└─────────────────────────────────┘
```

### Step 4: Facebook Permission Dialog
```
┌─────────────────────────────────┐
│     Facebook Permissions        │
│                                  │
│  ✓ Manage your ads              │
│  ✓ Access ad accounts           │
│  ✓ Read page insights           │
│  ✓ Retrieve leads               │
│                                  │
│  ┌──────────────────────┐       │
│  │    Continue as...    │       │
│  └──────────────────────┘       │
└─────────────────────────────────┘
```

### Step 5: Select Ad Account
```
┌─────────────────────────────────┐
│   Select Ad Account             │
│                                  │
│  ┌──────────────────────┐       │
│  │ Account 1            │       │
│  │ act_123456789        │ ← Select│
│  └──────────────────────┘       │
│                                  │
│  ┌──────────────────────┐       │
│  │ Account 2            │       │
│  │ act_987654321        │       │
│  └──────────────────────┘       │
└─────────────────────────────────┘
```

### Step 6: Connected Dashboard
```
┌─────────────────────────────────┐
│     AIDs Dashboard              │
│                                  │
│  ✅ Connected as: John Doe      │
│                                  │
│  📊 Campaigns  📈 Insights      │
│  👥 Prospects  📄 Pages         │
│  💼 Business   🤖 Octavia AI    │
│                                  │
│  [Performance Metrics Here]      │
└─────────────────────────────────┘
```

---

## 🧪 Test Scenarios

### ✅ Successful Connection Test
1. Navigate to `/app/aids/connect`
2. Click Facebook Login
3. Accept all permissions
4. Select ad account
5. Verify dashboard loads with data

### 🔄 Disconnect/Reconnect Test
1. Click "Déconnecter" on connect page
2. Confirm disconnection
3. Login again
4. Verify fresh permission dialog appears

### 📊 API Features Test
Test each section to verify Meta API integration:

| Section | URL Path | Meta API Used |
|---------|----------|---------------|
| Prospects | `/app/aids/prospects` | Lead Forms API |
| Campaigns | `/app/aids/campaigns` | Campaigns API |
| Insights | `/app/aids/insights` | Insights API |
| Business | `/app/aids/business` | Business Manager API |
| Pages | `/app/aids/pages` | Pages API |

### 🐛 Debug Tools
- **View Logs**: `/app/aids/logs` - See all API calls
- **Debug Leads**: `/app/aids/debug-leads` - Test lead sync

---

## ⚠️ Common Issues & Solutions

### Issue: "App isn't available"
✅ **Fixed** - This was caused by incorrect config_id parameter

### Issue: No Ad Accounts Found
**Solution**: Ensure test user has ad account access in Business Manager

### Issue: Leads Not Syncing
**Solution**: Check `/app/aids/debug-leads` for detailed diagnostics

---

## 📝 Review Checklist

- [ ] Facebook Login button visible
- [ ] Permission dialog shows all required permissions
- [ ] User can select ad account after login
- [ ] Dashboard loads with real data
- [ ] All API sections accessible
- [ ] Disconnect clears session completely
- [ ] Reconnect shows fresh authorization
- [ ] Error messages are user-friendly
- [ ] Logs capture all API interactions

---

## 📞 Support

**Email**: support@digiflow-agency.fr
**Documentation**: This guide
**Debug Tools**: `/app/aids/logs` and `/app/aids/debug-leads`

---

**App Version**: 3.0.0
**Meta API Version**: v18.0
**Last Updated**: December 2024