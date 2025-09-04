# Ads Master API Documentation

## Overview
The Ads Master module provides a unified interface for managing advertising campaigns across multiple platforms, starting with Meta (Facebook/Instagram) Ads.

## API Endpoints

### Meta OAuth Connection

#### 1. Initiate OAuth Connection
```
GET /api/ads-master/meta/auth
```
Redirects user to Facebook OAuth consent page.

#### 2. OAuth Callback
```
GET /api/ads-master/meta/callback?code={code}&state={state}
```
Handles OAuth callback from Facebook, exchanges code for access token.

#### 3. Check Connection Status
```
GET /api/ads-master/meta/status
```
Returns current connection status and available ad accounts.

**Response:**
```json
{
  "connected": true,
  "user": {
    "id": "123456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "adAccounts": [
    {
      "id": "act_123456",
      "name": "My Business",
      "currency": "EUR",
      "status": "ACTIVE"
    }
  ],
  "lastSync": "2025-02-09T10:30:00Z",
  "connectedAt": "2025-02-01T09:00:00Z"
}
```

#### 4. Sync Campaign Data
```
POST /api/ads-master/meta/sync
```
Fetches and caches campaign data from Meta Ads API.

**Request Body:**
```json
{
  "adAccountId": "act_123456"
}
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "summary": {
      "spend": 1234.56,
      "impressions": 456789,
      "clicks": 8901,
      "ctr": 1.95,
      "cpc": 0.14,
      "cpm": 2.70,
      "conversions": 234,
      "conversionRate": 2.63,
      "roas": 3.45
    },
    "timeline": [...],
    "campaigns": [...],
    "audiences": [...]
  },
  "fromCache": false
}
```

#### 5. Disconnect
```
POST /api/ads-master/meta/disconnect
```
Removes Meta connection and clears cached data.

### AI Octavia

#### Generate AI Insights
```
POST /api/ads-master/ai/generate
```
Generates AI-powered insights and recommendations.

**Request Body:**
```json
{
  "action": "insights",  // or "optimize"
  "adAccountId": "act_123456",
  "insights": {...}  // Current campaign data
}
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "insights": {
      "strengths": [...],
      "weaknesses": [...],
      "recommendations": [...],
      "score": 72
    },
    "generated": true,
    "model": "octavia-v1"
  }
}
```

### Credits Management

#### Debit Credits
```
POST /api/credits/debit
```
Deducts credits for AI actions.

**Request Body:**
```json
{
  "amount": 0.2,
  "module": "ads-master",
  "action": "insights",
  "description": "Generate AI Insights"
}
```

## Cache Management

- **Duration:** 30 minutes
- **Storage:** HTTP-only cookies
- **Key:** `meta_cache`

The cache automatically invalidates after 30 minutes or when:
- User switches ad accounts
- User manually triggers sync
- Connection is disconnected

## Environment Variables

Required environment variables in `.env.local`:

```env
# Meta OAuth App Credentials
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# Optional: For production deployment
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Development Mode

In development mode, the API returns mock data for testing:
- Mock insights with sample metrics
- 4 demo campaigns
- Sample audience demographics
- Performance score calculation

## Security

- OAuth state tokens for CSRF protection
- HTTP-only cookies for token storage
- Access token validation on each request
- Automatic token refresh (not yet implemented)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

## Rate Limiting

Currently no rate limiting implemented. In production, consider:
- Meta API rate limits
- User credit balance checks
- Request throttling

## Future Enhancements

1. **Google Ads Integration**
   - OAuth connection
   - Campaign sync
   - Performance metrics

2. **TikTok Ads Integration**
   - OAuth connection
   - Campaign management
   - Creative insights

3. **Advanced AI Features**
   - Creative generation
   - Automated bid optimization
   - Cross-platform insights

4. **Database Storage**
   - Replace cookie storage with database
   - User credit wallet management
   - Transaction history