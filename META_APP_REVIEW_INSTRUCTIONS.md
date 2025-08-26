# Meta App Review Instructions - DigiFlow Hub (AIDs)

## 1. Application Access Instructions

### Application URL
**Production URL:** https://digiflow-hub.vercel.app

### Navigation Path to Facebook Login
1. Visit https://digiflow-hub.vercel.app
2. Click on "AIDs - Artificial Intelligence for Digital Advertising" card on homepage
3. You will be redirected to `/app/aids` (dashboard)
4. Click on "Se connecter" button in the yellow warning box OR navigate to `/app/aids/connect`
5. Click the blue "Se connecter avec Facebook" button to initiate Facebook Login

### Alternative Direct URLs
- Direct login page: https://digiflow-hub.vercel.app/app/aids/connect
- Dashboard (requires login): https://digiflow-hub.vercel.app/app/aids

## 2. Test Credentials

### Demo Account (for general app testing)
```
Email: jason@behype-app.com
Password: Demo123
```

### Facebook Test User (recommended for Meta review)
Please create a Facebook test user through your Meta App Dashboard:
1. Go to your app in Meta for Developers
2. Navigate to Roles > Test Users
3. Create a test user with the following permissions:
   - ads_management
   - ads_read
   - business_management
   - pages_read_engagement
   - leads_retrieval
   - pages_manage_metadata
   - pages_manage_ads

## 3. Meta APIs and Integrations Used

### Facebook Login Integration
**Status:** ACTIVE - Facebook Login is actively used for authentication

### Required Permissions
- `email` - To identify the user
- `ads_management` - To manage ad campaigns
- `ads_read` - To read ad account data
- `business_management` - To access Business Manager
- `pages_read_engagement` - To read page insights
- `leads_retrieval` - To fetch lead forms data
- `pages_manage_metadata` - To manage page settings
- `pages_manage_ads` - To manage page advertising

### Meta API Endpoints Used
1. **User Profile**
   - `GET /v18.0/me` - Fetch user info (id, name, email)

2. **Ad Accounts**
   - `GET /v18.0/me/adaccounts` - List ad accounts
   - `GET /v18.0/{ad-account-id}/campaigns` - Fetch campaigns
   - `GET /v18.0/{ad-account-id}/insights` - Get performance metrics
   - `GET /v18.0/{ad-account-id}/leadgen_forms` - Fetch lead forms

3. **Pages**
   - `GET /v18.0/me/accounts` - List Facebook pages
   - `GET /v18.0/{page-id}/leadgen_forms` - Get page lead forms

4. **Business Manager**
   - `GET /v18.0/me/businesses` - List business accounts
   - `GET /v18.0/{business-id}/owned_ad_accounts` - Get owned ad accounts

5. **Lead Center**
   - `GET /v18.0/{form-id}/leads` - Retrieve leads from forms

## 4. Testing Instructions

### Step 1: Initial Setup
1. Visit https://digiflow-hub.vercel.app/app/aids/connect
2. Ensure you see the Facebook SDK loaded indicator
3. Click "Se connecter avec Facebook"

### Step 2: Facebook Login Flow
1. You will be redirected to Facebook login
2. Enter your Facebook credentials (or use test user)
3. Review and accept the requested permissions:
   - Manage your ads
   - Read your ad accounts
   - Access your Business Manager
   - Manage your Pages
   - Retrieve leads from your forms
4. Click "Continue as [Your Name]"

### Step 3: Select Ad Account
1. After successful login, you'll see a list of your ad accounts
2. Select one ad account to connect
3. You'll be redirected to the AIDs dashboard

### Step 4: Test Features
Navigate through the following sections to test Meta API integration:

1. **Dashboard** (`/app/aids`)
   - View connected account status
   - See basic metrics

2. **Prospects** (`/app/aids/prospects`)
   - Synchronize leads from Meta Lead Center
   - View lead forms data

3. **Campaigns** (`/app/aids/campaigns`)
   - View active campaigns from Meta
   - See campaign performance

4. **Insights** (`/app/aids/insights`)
   - View detailed analytics
   - Performance metrics over time

5. **Business Manager** (`/app/aids/business`)
   - View business information
   - List ad accounts and users

6. **Pages & Assets** (`/app/aids/pages`)
   - View connected Facebook pages
   - Manage pixels and audiences

### Step 5: Test Disconnect/Reconnect
1. Go to `/app/aids/connect`
2. Click "Déconnecter" to logout
3. Confirm disconnection
4. Try connecting again to ensure fresh authorization

## 5. Key Features Using Meta APIs

### Lead Synchronization
- Fetches leads from Meta Lead Center
- Processes lead form submissions
- Stores leads with campaign attribution

### Campaign Management
- Lists all campaigns from connected ad account
- Shows real-time performance metrics
- Displays spend, impressions, clicks

### Analytics Dashboard
- Real-time insights from Meta Ads
- ROI calculation
- Performance tracking

### Debug Tools (for testing)
- `/app/aids/logs` - View all API logs
- `/app/aids/debug-leads` - Debug lead synchronization

## 6. Geographic Restrictions
**No geographic restrictions** - The app is accessible globally.

## 7. Payment/Membership
**No payment required** - All features are currently free during beta testing.

## 8. Important Notes for Reviewers

### Authentication Flow
1. We use `auth_type: 'reauthorize'` to ensure users see permissions dialog
2. Token is stored securely in httpOnly cookies
3. Full logout clears both our session and Facebook SDK session

### Error Handling
- All Meta API errors are logged in `/app/aids/logs`
- User-friendly error messages displayed
- Automatic retry logic for transient failures

### Data Usage
- We only request permissions necessary for advertising management
- Lead data is stored securely with user consent
- No data is shared with third parties

### Compliance
- GDPR compliant with data deletion on request
- Clear privacy policy at `/privacy`
- Terms of service at `/terms`

## 9. Contact Information

**Developer:** DigiFlow Agency
**Email:** contact@digiflow-agency.fr
**Support:** support@digiflow-agency.fr
**Website:** https://www.digiflow-agency.fr

## 10. Additional Testing Scenarios

### Scenario 1: Fresh User
1. Clear all cookies
2. Visit `/app/aids/connect`
3. Complete Facebook login
4. Select ad account
5. Verify data loads correctly

### Scenario 2: Existing User
1. Login with existing session
2. Navigate to different sections
3. Verify data persistence

### Scenario 3: Permission Denied
1. Login but deny some permissions
2. Verify appropriate error messages
3. Check graceful degradation

### Scenario 4: Token Expiration
1. Wait for token to expire (or revoke manually)
2. Try to access protected endpoints
3. Verify redirect to login

## App Review Checklist

✅ Facebook Login actively used
✅ All Meta API permissions justified
✅ Error handling implemented
✅ Privacy policy and terms available
✅ No geographic restrictions
✅ No payment required
✅ Test credentials provided
✅ Clear navigation instructions
✅ API endpoints documented

---

**Last Updated:** December 2024
**App Version:** 3.0.0
**Meta API Version:** v18.0