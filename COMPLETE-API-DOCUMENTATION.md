# ProtoLab Complete API Documentation
**Date:** June 19, 2025  
**Version:** 2.0 Production Release  
**Last Updated:** Production Deployment Phase

## Authentication Endpoints

### User Registration
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "country": "string",
  "industry": "string"
}

Response:
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "plan": "free"
  }
}
```

### User Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "plan": "string"
  }
}
```

## Content Generation Endpoints

### Generate Pitch Deck
```
POST /api/pitch/generate
Content-Type: application/json

Body:
{
  "industry": "fintech|agritech|healthtech|edtech",
  "country": "Kenya|Nigeria|Ghana|South Africa",
  "businessType": "string",
  "description": "string (optional)"
}

Response:
{
  "success": true,
  "requestId": "number",
  "content": {
    "title": "string",
    "slides": [
      {
        "slideNumber": "number",
        "title": "string",
        "content": ["string"],
        "keyPoints": ["string"],
        "imageUrl": "string (optional)"
      }
    ],
    "insights": {
      "marketSize": "string",
      "revenueProjection": "string",
      "competitiveAdvantage": "string",
      "marketStrategy": "string"
    }
  },
  "pdfUrl": "string",
  "isWatermarked": "boolean"
}
```

### Generate 3D Video
```
POST /api/generate-3d-video
Content-Type: application/json

Body:
{
  "prompt": "string",
  "style": "professional|creative|corporate",
  "duration": "number (10-60)"
}

Response:
{
  "success": true,
  "video": {
    "id": "string",
    "prompt": "string",
    "script": "string",
    "scenes": [
      {
        "id": "number",
        "description": "string",
        "duration": "number",
        "cameraAngle": "string"
      }
    ],
    "previewUrl": "string",
    "downloadUrl": "string",
    "videoUrl": "string"
  }
}
```

## Document Management Endpoints

### Upload Document
```
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
file: [File] (PDF, DOCX, TXT)

Response:
{
  "success": true,
  "file": {
    "id": "string",
    "filename": "string",
    "mimetype": "string",
    "size": "number",
    "content": "string",
    "uploadedAt": "string",
    "userId": "string"
  },
  "insights": {
    "documentType": "string",
    "industry": "string",
    "keyMessages": ["string"],
    "strengthAreas": ["string"],
    "improvementSuggestions": ["string"]
  },
  "patterns": {
    "templateType": "string",
    "confidence": "number",
    "colorScheme": ["string"],
    "layout": "string"
  }
}
```

### Analyze Website
```
POST /api/analyze-website
Content-Type: application/json

Body:
{
  "url": "string"
}

Response:
{
  "success": true,
  "analysis": {
    "patterns": {
      "colorScheme": ["string"],
      "typography": {
        "primaryFont": "string",
        "headingSize": "string",
        "bodySize": "string"
      },
      "layout": "string"
    },
    "insights": {
      "industry": "string",
      "targetAudience": "string",
      "keyMessages": ["string"]
    }
  }
}
```

## Collaboration Endpoints

### Create Workspace
```
POST /api/collab/workspace
Content-Type: application/json

Body:
{
  "name": "string",
  "type": "proposal|business_plan|resume|pitch_deck",
  "participants": [
    {
      "name": "string",
      "email": "string",
      "role": "owner|editor|reviewer|viewer"
    }
  ]
}

Response:
{
  "success": true,
  "workspace": {
    "id": "string",
    "name": "string",
    "type": "string",
    "participants": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "isOnline": "boolean"
      }
    ],
    "documents": [],
    "createdAt": "string",
    "status": "active"
  },
  "joinUrl": "string"
}
```

### List Workspaces
```
GET /api/collab/workspaces

Response:
{
  "success": true,
  "workspaces": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "participants": ["object"],
      "lastModified": "string",
      "status": "string"
    }
  ]
}
```

### Get Workspace Details
```
GET /api/collab/workspace/:id

Response:
{
  "success": true,
  "workspace": {
    "id": "string",
    "name": "string",
    "type": "string",
    "participants": ["object"],
    "documents": ["object"],
    "createdAt": "string",
    "lastModified": "string",
    "status": "string"
  }
}
```

## Grant Intelligence Endpoints

### Get All Grants
```
GET /api/grants/all

Response:
{
  "success": true,
  "grants": [
    {
      "id": "string",
      "title": "string",
      "organization": "string",
      "amount": "string",
      "deadline": "string",
      "eligibility": ["string"],
      "industry": "string",
      "region": "string",
      "description": "string"
    }
  ]
}
```

### Search Grants
```
GET /api/grants/search?industry=fintech&country=Kenya&amount_min=10000

Response:
{
  "success": true,
  "grants": ["object"],
  "total": "number",
  "filters": {
    "industry": "string",
    "country": "string",
    "amount_min": "number"
  }
}
```

### Match Grants
```
POST /api/grants/match
Content-Type: application/json

Body:
{
  "industry": "string",
  "country": "string",
  "businessType": "string",
  "fundingAmount": "number"
}

Response:
{
  "success": true,
  "matches": [
    {
      "grant": "object",
      "matchScore": "number",
      "reasons": ["string"]
    }
  ]
}
```

## User Management Endpoints

### Get User Subscription
```
GET /api/user/subscription

Response:
{
  "tier": "free|hustler_plus|founder|corporate",
  "subscriptionId": "string|null",
  "expiresAt": "string|null",
  "features": ["string"]
}
```

### Get User Credits
```
GET /api/user/credits

Response:
{
  "openai_remaining": "number",
  "openai_total": "number",
  "deepseek_remaining": "number", 
  "deepseek_total": "number",
  "documents_remaining": "number",
  "documents_total": "number"
}
```

### Update User Profile
```
PUT /api/user/profile
Content-Type: application/json

Body:
{
  "name": "string",
  "industry": "string",
  "country": "string",
  "company": "string"
}

Response:
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "name": "string",
    "industry": "string",
    "country": "string"
  }
}
```

## Payment Endpoints

### Create Payment Intent
```
POST /api/create-payment-intent
Content-Type: application/json

Body:
{
  "amount": "number",
  "currency": "usd|kes|ngn|ghs",
  "plan": "hustler_plus|founder|corporate"
}

Response:
{
  "clientSecret": "string",
  "amount": "number",
  "currency": "string"
}
```

### M-Pesa Payment
```
POST /api/mpesa/payment
Content-Type: application/json

Body:
{
  "phone": "string",
  "amount": "number",
  "plan": "string"
}

Response:
{
  "success": true,
  "transactionId": "string",
  "status": "pending",
  "instructions": "string"
}
```

## Analytics Endpoints

### Get Africa Analytics
```
GET /api/analytics/africa

Response:
{
  "success": true,
  "analytics": {
    "activeUsers": {
      "Kenya": "number",
      "Nigeria": "number",
      "Ghana": "number",
      "South Africa": "number"
    },
    "revenueStreams": {
      "mpesa": "number",
      "flutterwave": "number",
      "card": "number"
    },
    "topFeatures": [
      {
        "name": "string",
        "usage": "number"
      }
    ],
    "conversionRates": {
      "freeToHustler": "number",
      "hustlerToFounder": "number"
    }
  }
}
```

### Track Feature Usage
```
POST /api/analytics/track
Content-Type: application/json

Body:
{
  "feature": "string",
  "action": "string",
  "metadata": "object"
}

Response:
{
  "success": true,
  "tracked": true
}
```

## System Configuration Endpoints

### Get Configuration
```
GET /api/config

Response:
{
  "features": {
    "collaborationEnabled": "boolean",
    "grantIntelligenceEnabled": "boolean",
    "paymentEnabled": "boolean"
  },
  "limits": {
    "free": {
      "pitchDecks": "number",
      "documents": "number"
    },
    "hustler_plus": {
      "pitchDecks": "number",
      "documents": "number"
    }
  },
  "regions": ["string"],
  "industries": ["string"]
}
```

## Error Handling

All endpoints return standardized error responses:

```
{
  "success": false,
  "error": "string",
  "code": "string",
  "details": "object (optional)"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limited
- 500: Internal Server Error

## Rate Limiting

- Free tier: 100 requests per hour
- Hustler Plus: 500 requests per hour
- Founder: 2000 requests per hour
- Corporate: Unlimited

## Authentication

Most endpoints require authentication via session cookies. Include credentials in requests:

```
fetch('/api/endpoint', {
  credentials: 'include',
  // ... other options
})
```

## File Upload Limits

- Maximum file size: 50MB
- Supported formats: PDF, DOCX, TXT, PNG, JPG
- Multiple files per request: Up to 5 files

This documentation covers all available API endpoints with request/response examples for developer integration.