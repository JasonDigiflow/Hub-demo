# Meta App Review Response

## 1. Application Access Instructions

### How to Navigate to the App
1. Visit our application at: **https://digiflow-hub.vercel.app**
2. Click on the "AIDs" card on the homepage
3. You will be redirected to the AIDs dashboard at `/app/aids`
4. Click "Se connecter" (Connect) in the yellow warning box
5. This will take you to `/app/aids/connect` where you'll see the Facebook Login button

### Direct Access URL
- **Login Page**: https://digiflow-hub.vercel.app/app/aids/connect

### Testing Instructions
1. Click the blue "Se connecter avec Facebook" (Connect with Facebook) button
2. Log in with your Facebook account (or use a test user)
3. Review and accept all requested permissions
4. Select an ad account from the list presented
5. You'll be redirected to the dashboard with your Meta data loaded

### Confirmation of Meta API Usage
**YES - We actively use Facebook Login and Meta APIs**

We use the following Meta APIs:
- **Facebook Login** for authentication (OAuth 2.0)
- **Graph API v18.0** endpoints:
  - `/me` - User profile (email, name)
  - `/me/adaccounts` - Ad accounts list
  - `/me/accounts` - Facebook pages
  - `/{ad-account-id}/campaigns` - Campaign data
  - `/{ad-account-id}/insights` - Performance metrics
  - `/{ad-account-id}/leadgen_forms` - Lead forms
  - `/{form-id}/leads` - Lead data retrieval
  - `/me/businesses` - Business Manager access

### Required Permissions
- `email` - User identification
- `ads_management` - Manage advertising campaigns
- `ads_read` - Read advertising data
- `business_management` - Access Business Manager
- `pages_read_engagement` - Read page insights
- `leads_retrieval` - Fetch lead form submissions
- `pages_manage_metadata` - Manage page metadata
- `pages_manage_ads` - Manage page advertising

## 2. Test Credentials

### Demo Account (Optional)
```
Email: jason@behype-app.com
Password: Demo123
```

**Note**: For testing Meta API integration, please use Facebook Login with your own account or create a Facebook test user through your app dashboard.

### Creating a Test User
1. Go to your app in Meta for Developers
2. Navigate to Roles > Test Users
3. Create a test user with all required permissions listed above
4. Use this test user to login through our Facebook Login integration

## 3. Payment Information
**NO PAYMENT REQUIRED** - The application is currently free to use during our beta phase. All features are accessible without payment.

## 4. Geographic Restrictions
**NO GEOGRAPHIC RESTRICTIONS** - The application is accessible globally without any geo-blocking or geo-fencing.

## 5. Additional Testing Information

### Key Features to Test
1. **Lead Synchronization** (`/app/aids/prospects`)
   - Click "Synchroniser avec Meta" to import leads from Meta Lead Center
   
2. **Campaign Management** (`/app/aids/campaigns`)
   - View active campaigns and performance metrics
   
3. **Analytics Dashboard** (`/app/aids/insights`)
   - Real-time insights and performance data
   
4. **Business Manager** (`/app/aids/business`)
   - View business information and ad accounts
   
5. **Pages & Assets** (`/app/aids/pages`)
   - Manage Facebook pages and pixels

### Debugging Tools
- **API Logs**: https://digiflow-hub.vercel.app/app/aids/logs
- **Lead Debug**: https://digiflow-hub.vercel.app/app/aids/debug-leads

### Disconnect/Reconnect Test
To test the full authentication flow:
1. Navigate to `/app/aids/connect`
2. Click "Déconnecter" (Disconnect) button
3. Confirm disconnection
4. Click "Se connecter avec Facebook" again
5. You should see the Facebook permission dialog again

### Error Handling
All Meta API errors are logged and can be viewed at `/app/aids/logs`. User-friendly error messages are displayed for common issues like expired tokens or missing permissions.

### Data Privacy
- We only request permissions necessary for advertising management
- User data is stored securely and not shared with third parties
- Full GDPR compliance with data deletion on request
- Privacy Policy: https://digiflow-hub.vercel.app/privacy
- Terms of Service: https://digiflow-hub.vercel.app/terms

## Contact Information
**Developer**: DigiFlow Agency
**Support Email**: support@digiflow-agency.fr
**Technical Contact**: contact@digiflow-agency.fr

---

**App Version**: 3.0.0
**Meta API Version**: v18.0
**Submission Date**: December 2024