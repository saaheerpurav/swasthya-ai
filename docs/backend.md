# SwasthyaAI — Backend Specification

## Overview

Node.js backend exposing a REST API. Runs as an **Express server locally** and deploys as **individual AWS Lambda functions** (one per handler group) behind API Gateway. Build and test locally against a mock in-memory DB first; AWS service integration (Bedrock, DynamoDB, S3, Transcribe, Polly, Rekognition, SNS) is wired in a second pass.

All endpoints are prefixed `/v1`.

---

## Tech Stack

- **Runtime**: Node.js 20 (ESM or CJS, your choice — keep consistent)
- **Framework**: Express 5 (local dev) → Lambda handlers (deploy)
- **Language**: JavaScript (or TypeScript — match the existing whatsapp-reply style)
- **Local DB mock**: In-memory Map / JSON file (swap for DynamoDB client later)
- **AI placeholder**: Return static canned responses (swap for Bedrock later)
- **Voice placeholder**: Echo back transcript stub (swap for Transcribe/Polly later)
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Deploy**: Serverless Framework (`serverless.yml`)

---

## Folder Structure

```
backend/
├── src/
│   ├── app.js                  # Express app (local dev entry point)
│   ├── lambda.js               # Lambda adapter wrapping app.js
│   ├── handlers/               # One file per Lambda function group
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── voice.js
│   │   ├── whatsapp.js
│   │   ├── sms.js
│   │   ├── facilities.js
│   │   ├── alerts.js
│   │   ├── vaccination.js
│   │   ├── image.js
│   │   ├── users.js
│   │   ├── admin.js
│   │   └── scheduler.js        # No HTTP — triggered by EventBridge cron
│   ├── services/               # Pure business logic, no HTTP concerns
│   │   ├── aiService.js        # generateHealthResponse(), detectLanguage(), classifyIntent()
│   │   ├── ragService.js       # retrieveContext(), updateKnowledgeBase()
│   │   ├── voiceService.js     # transcribeAudio(), synthesizeSpeech()
│   │   ├── locationService.js  # findNearbyFacilities(), getRegionalAlerts()
│   │   ├── alertService.js     # createAlert(), distributeAlert(), expireAlerts()
│   │   ├── vaccinationService.js # generateSchedule(), sendReminders()
│   │   ├── imageService.js     # analyzeImage()
│   │   ├── safetyService.js    # applyDisclaimers(), checkEmergency(), blockDiagnosis()
│   │   └── notificationService.js # sendWhatsApp(), sendSMS(), sendSNS()
│   ├── middleware/
│   │   ├── auth.js             # verifySessionToken(), requireAdmin()
│   │   ├── rateLimit.js        # per-IP and per-user rate limiting
│   │   └── validate.js         # Zod schema middleware factory
│   ├── db/
│   │   ├── client.js           # DB interface — swap implementation without changing callers
│   │   ├── mock.js             # In-memory implementation (local dev)
│   │   └── dynamo.js           # DynamoDB implementation (AWS deploy)
│   ├── models/                 # Zod schemas (single source of truth for shapes)
│   │   ├── user.js
│   │   ├── query.js
│   │   ├── facility.js
│   │   ├── alert.js
│   │   ├── outbreak.js
│   │   ├── vaccination.js
│   │   └── session.js
│   └── utils/
│       ├── language.js         # mapLanguageCode(), detectScript()
│       ├── response.js         # success(), error(), paginated() response helpers
│       └── crypto.js           # generateToken(), hashIdentifier()
├── tests/
│   ├── unit/
│   └── integration/
├── serverless.yml
├── package.json
└── .env.example
```

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development          # development | staging | production

# Auth
JWT_SECRET=your-secret-here
ADMIN_API_KEY=admin-secret-here
SESSION_TTL_HOURS=24

# DB (leave blank for mock)
DYNAMODB_REGION=us-east-1
DYNAMODB_ENDPOINT=           # http://localhost:8000 for local DynamoDB

# S3 (leave blank for mock)
S3_REGION=us-east-1
S3_KNOWLEDGE_BUCKET=swasthyaai-knowledge
S3_USERDATA_BUCKET=swasthyaai-userdata

# AI (leave blank to use stub responses)
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=biomistral-7b

# Voice (leave blank to use stub)
TRANSCRIBE_REGION=us-east-1
POLLY_REGION=us-east-1

# Image (leave blank to use stub)
REKOGNITION_REGION=us-east-1

# Notifications
SNS_REGION=us-east-1
SNS_ADMIN_TOPIC_ARN=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_SMS_NUMBER=+1234567890
TWILIO_WEBHOOK_VERIFY_TOKEN=your-verify-token

# OpenAI (fallback if Bedrock not configured)
OPENAI_API_KEY=
```

---

## Local Dev Setup

```bash
npm install
cp .env.example .env
# Leave AWS vars blank — mock implementations are used automatically
npm run dev        # nodemon src/app.js on PORT=3000
npm test           # jest
```

`DB_MOCK=true` is automatically set when `NODE_ENV=development` and no `DYNAMODB_ENDPOINT` is set. All mock data resets on server restart. Seed data is loaded from `tests/fixtures/seed.js`.

---

## Auth Model

Sessions are identified by a **Bearer token** in the `Authorization` header.

- Anonymous sessions (web/mobile) are created automatically on first request if no token is provided — a guest token is returned.
- WhatsApp/SMS users are identified by their phone number and get a persistent session.
- Admin endpoints require an `X-Admin-Key` header with the value of `ADMIN_API_KEY`.

Token format: opaque UUID v4 stored in the sessions table with a TTL.

---

## Common Response Envelope

**Success:**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Paginated success:**
```json
{
  "ok": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

**Error:**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { }
  }
}
```

**Standard error codes:**

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Request body/params failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid session token |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 503 | AI backend unavailable, fallback used |
| `VOICE_ERROR` | 503 | Transcription or TTS failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Lambda Functions

Each handler file exports a standard Express router AND a Lambda-compatible handler. The `lambda.js` adapter wraps the Express app using `serverless-http`.

| Lambda Name | HTTP Routes | Handler File |
|-------------|-------------|--------------|
| `swasthya-auth` | `POST /v1/auth/session`, `DELETE /v1/auth/session` | `handlers/auth.js` |
| `swasthya-chat` | `POST /v1/chat`, `GET /v1/chat/history` | `handlers/chat.js` |
| `swasthya-voice` | `POST /v1/voice/transcribe`, `POST /v1/voice/synthesize`, `POST /v1/voice/query` | `handlers/voice.js` |
| `swasthya-whatsapp` | `POST /v1/webhooks/whatsapp`, `GET /v1/webhooks/whatsapp` | `handlers/whatsapp.js` |
| `swasthya-sms` | `POST /v1/webhooks/sms` | `handlers/sms.js` |
| `swasthya-facilities` | `GET /v1/facilities`, `GET /v1/facilities/:facilityId` | `handlers/facilities.js` |
| `swasthya-alerts` | `GET /v1/alerts`, `POST /v1/alerts`, `PUT /v1/alerts/:alertId`, `DELETE /v1/alerts/:alertId` | `handlers/alerts.js` |
| `swasthya-vaccination` | `GET /v1/vaccination/profile`, `POST /v1/vaccination/profile`, `POST /v1/vaccination/records`, `DELETE /v1/vaccination/records/:vaccineId`, `GET /v1/vaccination/schedule`, `GET /v1/vaccination/centers` | `handlers/vaccination.js` |
| `swasthya-image` | `POST /v1/image/analyze` | `handlers/image.js` |
| `swasthya-users` | `GET /v1/users/me`, `PUT /v1/users/me`, `DELETE /v1/users/me` | `handlers/users.js` |
| `swasthya-admin` | `GET /v1/admin/*` (all admin routes) | `handlers/admin.js` |
| `swasthya-scheduler` | No HTTP — EventBridge cron triggers | `handlers/scheduler.js` |

---

## API Endpoints

---

### Authentication

#### `POST /v1/auth/session`

Create or retrieve a user session. Call this on app start or first message.

**Headers:** None required

**Request body:**
```json
{
  "channel": "web",
  "identifier": "+919876543210"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `channel` | string | Yes | `web`, `mobile`, `whatsapp`, `sms`, `voice` |
| `identifier` | string | No | Phone number. Omit for anonymous sessions |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "sess_abc123",
    "userId": "usr_xyz789",
    "token": "eyJhbGci...",
    "isNew": true,
    "expiresAt": "2025-01-02T12:00:00Z"
  }
}
```

---

#### `DELETE /v1/auth/session`

End the current session.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{ "ok": true, "data": { "success": true } }
```

---

### Chat

#### `POST /v1/chat`

Send a text health query, receive an AI-generated health education response.

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "message": "What are symptoms of dengue fever?",
  "language": "en",
  "locationContext": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "regionCode": "KA_BLR"
  }
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `message` | string | Yes | Raw user text, max 2000 chars |
| `language` | string | No | `en`, `hi`, `kn`, `te`. Auto-detected if omitted |
| `locationContext` | object | No | Used to add region-specific context |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "responseId": "resp_abc123",
    "queryId": "qry_def456",
    "content": "Dengue fever is caused by the dengue virus...",
    "language": "en",
    "detectedLanguage": "en",
    "intent": "health_question",
    "sources": [
      {
        "name": "WHO Dengue Guidelines",
        "url": "https://www.who.int/...",
        "type": "WHO"
      }
    ],
    "disclaimers": [
      "This is health education information only. For diagnosis, consult a qualified doctor."
    ],
    "escalationRequired": false,
    "emergencyDetected": false,
    "suggestedActions": [
      "Use mosquito repellent",
      "Eliminate standing water around your home"
    ]
  }
}
```

**Safety behavior:**
- If `intent` is `emergency`: set `emergencyDetected: true`, prepend emergency line, include emergency number 108.
- If `intent` is `diagnostic_request`: response explains the system cannot diagnose, redirects to doctor.
- Always include at least one disclaimer.

---

#### `GET /v1/chat/history`

Get the conversation history for the current user.

**Headers:** `Authorization: Bearer <token>`

**Query params:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `limit` | number | 20 | Max 100 |
| `before` | ISO timestamp | — | Cursor for pagination |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "messages": [
      {
        "id": "msg_abc",
        "role": "user",
        "content": "What are symptoms of dengue?",
        "timestamp": "2025-01-01T10:00:00Z",
        "language": "en"
      },
      {
        "id": "msg_def",
        "role": "assistant",
        "content": "Dengue fever is caused by...",
        "timestamp": "2025-01-01T10:00:02Z",
        "language": "en",
        "responseId": "resp_abc123"
      }
    ],
    "hasMore": false
  }
}
```

---

### Voice

#### `POST /v1/voice/transcribe`

Convert uploaded audio to text.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request body (FormData):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `audio` | File | Yes | WAV or MP3, max 10MB |
| `language` | string | No | Hint for transcription. Auto-detected if omitted |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "transcript": "What medicines help with fever?",
    "detectedLanguage": "en",
    "confidence": 0.94
  }
}
```

**Response `422` — unclear audio:**
```json
{
  "ok": false,
  "error": {
    "code": "VOICE_UNCLEAR",
    "message": "Audio was unclear. Please speak slowly and clearly, or type your question."
  }
}
```

---

#### `POST /v1/voice/synthesize`

Convert text to speech audio. Returns a URL to the audio file (stored in S3 / temp storage locally).

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "text": "Dengue fever is spread by mosquitoes...",
  "language": "en"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `text` | string | Yes | Max 3000 chars |
| `language` | string | Yes | `en`, `hi`, `kn`, `te` |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "audioUrl": "https://storage.example.com/audio/resp_abc123.mp3",
    "durationSeconds": 12.4,
    "format": "mp3",
    "expiresAt": "2025-01-01T11:00:00Z"
  }
}
```

---

#### `POST /v1/voice/query`

Full voice round-trip: audio in → transcript → AI response → TTS audio out.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request body (FormData):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `audio` | File | Yes | WAV or MP3 |
| `language` | string | No | Hint |
| `locationContext` | string | No | JSON-encoded location object |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "transcript": "What medicines help with fever?",
    "detectedLanguage": "en",
    "response": {
      "responseId": "resp_abc",
      "content": "For fever, you can use paracetamol...",
      "language": "en",
      "sources": [],
      "disclaimers": ["This is health education only..."],
      "escalationRequired": false,
      "emergencyDetected": false
    },
    "audioUrl": "https://storage.example.com/audio/resp_abc.mp3",
    "audioDurationSeconds": 8.2
  }
}
```

---

### WhatsApp Webhook

#### `POST /v1/webhooks/whatsapp`

Receives inbound messages from Twilio WhatsApp. Twilio will POST here.

**Note:** This endpoint does NOT use the standard Bearer token auth. It uses Twilio webhook signature verification via `X-Twilio-Signature` header.

**Request body:** Twilio webhook form-encoded payload

| Field | Notes |
|-------|-------|
| `From` | `whatsapp:+919876543210` |
| `To` | Your Twilio WhatsApp number |
| `Body` | Text message content |
| `MediaUrl0` | Present if user sent an image |
| `MediaContentType0` | e.g. `image/jpeg` |
| `MessageSid` | Twilio message ID |
| `NumMedia` | Number of media items |

**Behavior:**
1. Verify Twilio signature. Reject with `403` if invalid.
2. Parse `From` to extract phone number.
3. Get or create user session for phone number.
4. If `NumMedia > 0` and `MediaContentType0` starts with `image/`: route to image analysis flow.
5. Else: route to chat flow.
6. Send response back via Twilio REST API (not in HTTP response body).
7. Return `200` with empty TwiML `<Response/>`.

**Response `200`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response/>
```

---

#### `GET /v1/webhooks/whatsapp`

Webhook verification endpoint (used during Twilio setup, not WhatsApp Business API verify).

**Response `200`:** `OK`

---

### SMS Webhook

#### `POST /v1/webhooks/sms`

Receives inbound SMS from Twilio.

**Note:** Twilio signature verification required (same as WhatsApp).

**Request body:** Twilio SMS form-encoded payload

| Field | Notes |
|-------|-------|
| `From` | `+919876543210` |
| `To` | Your Twilio SMS number |
| `Body` | SMS text content |
| `MessageSid` | Twilio message ID |

**Behavior:**
1. Verify Twilio signature.
2. Parse phone number from `From`.
3. Get or create user session.
4. Route message text to chat service.
5. Split response if > 1600 chars.
6. Send response via Twilio SMS REST API.
7. Return `200` with TwiML.

**Response `200`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response/>
```

---

### Facilities

#### `GET /v1/facilities`

Find nearby healthcare facilities.

**Headers:** `Authorization: Bearer <token>`

**Query params:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `lat` | number | Yes | User latitude |
| `lng` | number | Yes | User longitude |
| `type` | string | No | `hospital`, `clinic`, `pharmacy`, `phc`, `chc`, `vaccination_center`. Omit for all |
| `radius` | number | No | Search radius in km. Default: `10` |
| `language` | string | No | Filter by facilities supporting this language |
| `limit` | number | No | Default: `20`, max: `50` |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "facilities": [
      {
        "facilityId": "fac_abc123",
        "name": "Rajiv Gandhi Government Hospital",
        "facilityType": "hospital",
        "distance": 2.3,
        "isOpen": true,
        "location": {
          "latitude": 12.975,
          "longitude": 77.597,
          "address": "Seshadri Rd, Bengaluru, Karnataka 560001"
        },
        "contactInfo": {
          "phoneNumber": "+918022213801",
          "email": null,
          "website": null
        },
        "services": ["emergency", "outpatient", "pediatrics", "vaccination"],
        "languagesSupported": ["en", "kn", "hi"],
        "operatingHours": {
          "emergency24x7": true,
          "monday": { "open": "09:00", "close": "17:00", "closed": false }
        }
      }
    ],
    "total": 8,
    "searchRadius": 10
  }
}
```

---

#### `GET /v1/facilities/:facilityId`

Get full details for a single facility.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "facility": { /* full HealthFacility object */ }
  }
}
```

---

### Alerts

#### `GET /v1/alerts`

Get active health alerts for a region.

**Headers:** `Authorization: Bearer <token>`

**Query params:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `regionCode` | string | Yes | e.g. `KA_BLR`, `TN_CHE` |
| `language` | string | No | Return alerts translated to this language |
| `type` | string | No | `outbreak`, `weather`, `health` |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "alerts": [
      {
        "alertId": "alert_abc",
        "type": "outbreak",
        "severity": "high",
        "title": "Dengue Outbreak Warning",
        "message": "Dengue cases have increased in Bengaluru South...",
        "regionCode": "KA_BLR",
        "sourceUrl": "https://mohfw.gov.in/...",
        "createdAt": "2025-01-01T08:00:00Z",
        "expiresAt": "2025-01-15T08:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

#### `POST /v1/alerts`

Create a new health alert. **Admin only.**

**Headers:** `Authorization: Bearer <token>`, `X-Admin-Key: <admin-key>`

**Request body:**
```json
{
  "type": "outbreak",
  "severity": "high",
  "title": "Dengue Outbreak Warning",
  "message": "Dengue cases have increased significantly in Bengaluru South ward...",
  "affectedRegions": ["KA_BLR", "KA_MYS"],
  "expiresAt": "2025-01-15T08:00:00Z",
  "sourceUrl": "https://mohfw.gov.in/alerts/dengue-2025"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `type` | string | Yes | `outbreak`, `weather`, `health` |
| `severity` | string | Yes | `critical`, `high`, `medium`, `low` |
| `title` | string | Yes | Max 200 chars |
| `message` | string | Yes | Max 2000 chars |
| `affectedRegions` | string[] | Yes | Array of region codes |
| `expiresAt` | ISO date | Yes | — |
| `sourceUrl` | string | No | — |

**Response `201`:**
```json
{
  "ok": true,
  "data": {
    "alert": { /* Alert object */ },
    "notificationsSent": 142
  }
}
```

---

#### `PUT /v1/alerts/:alertId`

Update an alert. **Admin only.**

**Request body:** Any subset of Alert fields (same schema as POST, all optional).

**Response `200`:** `{ "ok": true, "data": { "alert": { ... } } }`

---

#### `DELETE /v1/alerts/:alertId`

Delete an alert. **Admin only.**

**Response `200`:** `{ "ok": true, "data": { "success": true } }`

---

### Vaccination

#### `GET /v1/vaccination/profile`

Get the vaccination profile for the current user (including family members).

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "profile": {
      "profileId": "vp_abc",
      "userId": "usr_xyz",
      "dateOfBirth": "1990-05-15",
      "gender": "female",
      "vaccinations": [
        {
          "vaccineId": "vrec_abc",
          "vaccineName": "COVID-19 (Covishield)",
          "dateAdministered": "2021-04-01",
          "facilityId": "fac_abc",
          "batchNumber": "4120Z001",
          "nextDueDate": null
        }
      ],
      "upcomingVaccines": [
        {
          "vaccineId": "vac_flu",
          "vaccineName": "Influenza",
          "dueDate": "2025-10-01",
          "reminderSent": false,
          "priority": "medium"
        }
      ],
      "familyMembers": [
        {
          "memberId": "fm_abc",
          "name": "Arjun",
          "relationship": "child",
          "dateOfBirth": "2020-03-10",
          "upcomingVaccines": [ ]
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

---

#### `POST /v1/vaccination/profile`

Create or replace vaccination profile (initial setup).

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "familyMembers": [
    {
      "name": "Arjun",
      "relationship": "child",
      "dateOfBirth": "2020-03-10"
    }
  ]
}
```

**Response `201`:** Full profile object (same as GET response)

---

#### `POST /v1/vaccination/records`

Add a vaccination record for self or a family member.

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "vaccineName": "COVID-19 (Covishield)",
  "dateAdministered": "2021-04-01",
  "facilityId": "fac_abc",
  "batchNumber": "4120Z001",
  "memberId": null
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vaccineName` | string | Yes | — |
| `dateAdministered` | ISO date | Yes | — |
| `facilityId` | string | No | — |
| `batchNumber` | string | No | — |
| `memberId` | string | No | Null = self, otherwise family member ID |

**Response `201`:**
```json
{
  "ok": true,
  "data": {
    "record": { /* VaccinationRecord */ },
    "adjustedReminders": ["Influenza reminder updated to 2026-04-01"]
  }
}
```

---

#### `DELETE /v1/vaccination/records/:vaccineId`

Remove a vaccination record.

**Headers:** `Authorization: Bearer <token>`

**Query params:** `?memberId=fm_abc` (omit for self)

**Response `200`:** `{ "ok": true, "data": { "success": true } }`

---

#### `GET /v1/vaccination/schedule`

Get the recommended vaccination schedule for an age/gender profile.

**Query params:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `dateOfBirth` | ISO date | Yes | — |
| `gender` | string | Yes | `male`, `female`, `other` |
| `language` | string | No | Response language |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "schedule": [
      {
        "vaccineId": "vac_hep_b",
        "vaccineName": "Hepatitis B",
        "recommendedAgeMonths": 0,
        "dueDate": "2020-03-10",
        "status": "completed"
      },
      {
        "vaccineId": "vac_flu",
        "vaccineName": "Influenza",
        "recommendedAgeMonths": null,
        "dueDate": "2025-10-01",
        "status": "upcoming"
      }
    ]
  }
}
```

`status` values: `completed`, `upcoming`, `overdue`, `not_applicable`

---

#### `GET /v1/vaccination/centers`

Find vaccination centers near a location.

**Headers:** `Authorization: Bearer <token>`

**Query params:** `lat`, `lng`, `radius` (same as facilities)

**Response `200`:** Same as `GET /v1/facilities` but pre-filtered to `facilityType: vaccination_center`.

---

### Image Analysis

#### `POST /v1/image/analyze`

Analyze a symptom image and return health education information.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request body (FormData):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `image` | File | Yes | JPEG or PNG, max 5MB |
| `language` | string | No | Default: `en` |
| `description` | string | No | User's text description of the symptom, max 500 chars |

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "analysisId": "img_abc123",
    "educationalInfo": "The image appears to show a skin rash. Rashes can be caused by...",
    "similarConditions": [
      {
        "name": "Contact Dermatitis",
        "description": "Skin reaction from contact with irritants or allergens.",
        "whenToSeekCare": "Seek care if rash spreads, has blisters, or causes difficulty breathing."
      }
    ],
    "concerningSymptoms": false,
    "recommendations": [
      "Avoid scratching the affected area",
      "Apply cool compress for relief",
      "Visit a dermatologist if it persists beyond 3 days"
    ],
    "disclaimers": [
      "Visual assessment CANNOT replace professional medical diagnosis. Please consult a doctor."
    ],
    "escalationRequired": false,
    "imageQualityIssue": null
  }
}
```

**Response `422` — poor image quality:**
```json
{
  "ok": false,
  "error": {
    "code": "IMAGE_QUALITY_INSUFFICIENT",
    "message": "Image is too blurry to analyze. Please take a clearer photo in good lighting."
  }
}
```

---

### Users

#### `GET /v1/users/me`

Get the current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "userId": "usr_xyz",
      "preferredLanguage": "kn",
      "channels": ["whatsapp"],
      "location": {
        "regionCode": "KA_BLR",
        "address": "Bengaluru, Karnataka"
      },
      "privacySettings": {
        "shareLocation": true,
        "allowAlerts": true,
        "dataRetentionDays": 365
      },
      "onboardingComplete": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActive": "2025-01-01T10:00:00Z"
    }
  }
}
```

---

#### `PUT /v1/users/me`

Update user profile fields.

**Headers:** `Authorization: Bearer <token>`

**Request body:** Any subset of updatable fields:
```json
{
  "preferredLanguage": "hi",
  "location": {
    "regionCode": "KA_BLR",
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "privacySettings": {
    "allowAlerts": false
  }
}
```

**Response `200`:** Updated user object.

---

#### `DELETE /v1/users/me`

Schedule deletion of all user data. Deletion completes within 30 days.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "success": true,
    "deletionScheduledAt": "2025-01-01T10:00:00Z",
    "deletionCompletesBy": "2025-01-31T10:00:00Z"
  }
}
```

---

### Admin

All admin endpoints require `X-Admin-Key: <ADMIN_API_KEY>` header in addition to a valid session token.

---

#### `GET /v1/admin/users`

List all registered users with pagination.

**Query params:**

| Param | Default | Notes |
|-------|---------|-------|
| `page` | 1 | — |
| `limit` | 20 | Max 100 |
| `search` | — | Search by phone number |
| `language` | — | Filter by preferred language |
| `channel` | — | Filter by channel (`whatsapp`, `sms`, `web`, `mobile`) |
| `onboardingComplete` | — | `true` or `false` |

**Response `200`:**
```json
{
  "ok": true,
  "data": [
    {
      "userId": "usr_xyz",
      "phoneNumber": "+919876543210",
      "preferredLanguage": "kn",
      "channels": ["whatsapp"],
      "queryCount": 42,
      "onboardingComplete": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActive": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": { "total": 1247, "page": 1, "limit": 20, "hasMore": true }
}
```

---

#### `GET /v1/admin/users/:userId`

Full user detail with query history and vaccination profile.

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "user": { /* full User object */ },
    "queryHistory": [ /* last 10 HealthQuery objects */ ],
    "vaccinationProfile": { /* VaccinationProfile or null */ }
  }
}
```

---

#### `GET /v1/admin/stats`

Platform-wide statistics.

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "totalUsers": 5678,
    "activeUsersToday": 312,
    "activeUsersWeek": 1890,
    "totalQueries": 89234,
    "queriesToday": 1203,
    "channelBreakdown": {
      "whatsapp": 72340,
      "sms": 8210,
      "web": 5400,
      "mobile": 3284
    },
    "languageBreakdown": {
      "en": 32000,
      "hi": 28000,
      "kn": 18000,
      "te": 11234
    },
    "escalationCount": 412,
    "emergencyCount": 28,
    "topQueryCategories": [
      { "category": "fever", "count": 12000 },
      { "category": "vaccination", "count": 8400 },
      { "category": "dengue", "count": 6200 }
    ]
  }
}
```

---

#### `GET /v1/admin/queries`

Browse all health queries across all users.

**Query params:** `page`, `limit`, `userId`, `intent`, `language`, `channel`, `from` (ISO date), `to` (ISO date)

**Response `200`:**
```json
{
  "ok": true,
  "data": [
    {
      "queryId": "qry_abc",
      "userId": "usr_xyz",
      "channel": "whatsapp",
      "originalText": "What are dengue symptoms?",
      "language": "en",
      "intent": "health_question",
      "safetyFlags": [],
      "timestamp": "2025-01-01T10:00:00Z",
      "responsePreview": "Dengue fever is caused by..."
    }
  ],
  "pagination": { "total": 89234, "page": 1, "limit": 20, "hasMore": true }
}
```

---

#### `GET /v1/admin/alerts`

List all alerts (active and expired).

**Query params:** `regionCode`, `type`, `severity`, `active` (`true`/`false`)

**Response `200`:** Array of Alert objects with pagination.

---

#### `POST /v1/admin/alerts`

Same as `POST /v1/alerts` (this is the canonical admin route).

---

#### `PUT /v1/admin/alerts/:alertId`

Update an alert (same body as POST, all fields optional).

---

#### `DELETE /v1/admin/alerts/:alertId`

Delete an alert.

---

#### `GET /v1/admin/outbreaks`

List disease outbreaks.

**Query params:** `regionCode`, `disease`, `active` (`true`/`false`), `page`, `limit`

**Response `200`:**
```json
{
  "ok": true,
  "data": [
    {
      "outbreakId": "ob_abc",
      "disease": "Dengue",
      "regionCode": "KA_BLR",
      "regionName": "Bengaluru",
      "cases": 342,
      "severity": "high",
      "trend": "up",
      "description": "Rising dengue cases in south Bengaluru wards...",
      "source": "BBMP Health Department",
      "reportedAt": "2025-01-01T00:00:00Z",
      "active": true
    }
  ],
  "pagination": { "total": 12, "page": 1, "limit": 20, "hasMore": false }
}
```

---

#### `POST /v1/admin/outbreaks`

Create an outbreak record.

**Request body:**
```json
{
  "disease": "Dengue",
  "regionCode": "KA_BLR",
  "cases": 342,
  "severity": "high",
  "trend": "up",
  "description": "Rising dengue cases...",
  "source": "BBMP Health Department"
}
```

**Response `201`:** Outbreak object.

---

#### `PUT /v1/admin/outbreaks/:outbreakId`

Update an outbreak record. All fields optional.

**Response `200`:** Updated outbreak object.

---

#### `GET /v1/admin/vaccination-drives`

List vaccination drives.

**Query params:** `regionCode`, `upcoming` (`true`/`false`), `page`, `limit`

**Response `200`:**
```json
{
  "ok": true,
  "data": [
    {
      "driveId": "drv_abc",
      "vaccines": ["Polio (OPV)", "Vitamin A"],
      "regionCode": "KA_BLR",
      "location": "Community Hall, Jayanagar",
      "address": "32nd Cross, Jayanagar 4th Block, Bengaluru",
      "date": "2025-02-15",
      "time": "09:00-17:00",
      "capacity": 500,
      "registeredCount": 212,
      "organizer": "BBMP",
      "active": true
    }
  ],
  "pagination": { "total": 8, "page": 1, "limit": 20, "hasMore": false }
}
```

---

#### `POST /v1/admin/vaccination-drives`

Create a vaccination drive.

**Request body:**
```json
{
  "vaccines": ["Polio (OPV)", "Vitamin A"],
  "regionCode": "KA_BLR",
  "location": "Community Hall, Jayanagar",
  "address": "32nd Cross, Jayanagar 4th Block, Bengaluru",
  "date": "2025-02-15",
  "time": "09:00-17:00",
  "capacity": 500,
  "organizer": "BBMP"
}
```

**Response `201`:** Drive object.

---

#### `PUT /v1/admin/vaccination-drives/:driveId`

Update a vaccination drive. All fields optional.

**Response `200`:** Updated drive object.

---

#### `GET /v1/admin/analytics`

Detailed analytics breakdown (charts data).

**Query params:** `period` (`7d`, `30d`, `90d`), `breakdown` (`language`, `channel`, `intent`, `region`)

**Response `200`:**
```json
{
  "ok": true,
  "data": {
    "period": "30d",
    "queriesByDay": [
      { "date": "2025-01-01", "count": 1203 }
    ],
    "userGrowthByDay": [
      { "date": "2025-01-01", "newUsers": 45, "total": 5678 }
    ],
    "breakdown": {
      "byLanguage": { "en": 32000, "hi": 28000, "kn": 18000, "te": 11234 },
      "byChannel": { "whatsapp": 72340, "sms": 8210, "web": 5400, "mobile": 3284 },
      "byIntent": { "health_question": 65000, "facility_search": 12000, "vaccination_info": 8400, "emergency": 28, "general_info": 3806 },
      "safetyEvents": { "escalations": 412, "emergencies": 28, "diagnosticBlocks": 1203 }
    }
  }
}
```

---

## Scheduled Lambda Functions

These are triggered by **EventBridge cron rules**, not HTTP.

### `scheduler-health-data`

**Schedule:** Daily at 02:00 UTC

**What it does:**
1. Fetch latest WHO guidelines and MoHFW bulletins from their public feeds.
2. Diff against existing knowledge base.
3. Process new/changed documents into chunks.
4. Generate embeddings and update vector DB.
5. Store raw documents in S3.
6. Log update summary to DynamoDB.
7. If any step fails: publish failure notification to SNS admin topic.

**Stub behavior (local dev):** Log "health data update simulated" and return.

---

### `scheduler-vaccination-reminders`

**Schedule:** Daily at 08:00 IST (02:30 UTC)

**What it does:**
1. Query all vaccination profiles where `upcomingVaccines[].dueDate` is within 7 days and `reminderSent = false`.
2. For each match: send reminder via user's preferred channel (WhatsApp or SMS).
3. Mark `reminderSent = true` in DB.
4. Also send reminders for family members.

**Stub behavior:** Log "vaccination reminders simulated for N users".

---

### `scheduler-alert-expiry`

**Schedule:** Every hour

**What it does:**
1. Query all alerts where `expiresAt < now` and `active = true`.
2. Set `active = false` in DB.
3. Send follow-up "alert resolved" notifications to affected users.

**Stub behavior:** Log "alert expiry check simulated".

---

### `scheduler-report-generation`

**Schedule:** Every Monday at 06:00 UTC

**What it does:**
1. Generate weekly stats summary (users, queries, escalations, channel breakdown).
2. Store report in S3.
3. Send report summary email/notification to admin SNS topic.

---

## DB Interface (Swappable)

`src/db/client.js` exports these functions. `mock.js` and `dynamo.js` implement the same interface.

```js
// Sessions
createSession(sessionData) → session
getSession(token) → session | null
deleteSession(token) → void

// Users
createUser(userData) → user
getUser(userId) → user | null
getUserByPhone(phone) → user | null
updateUser(userId, updates) → user
deleteUser(userId) → void
listUsers(filters, pagination) → { items, total }

// Queries
saveQuery(queryData) → query
getQueryHistory(userId, pagination) → { items, hasMore }
listQueries(filters, pagination) → { items, total }

// Facilities
listFacilities(location, filters) → facility[]
getFacility(facilityId) → facility | null

// Alerts
createAlert(alertData) → alert
getAlert(alertId) → alert | null
listAlerts(filters) → alert[]
updateAlert(alertId, updates) → alert
deleteAlert(alertId) → void
expireAlerts() → number  // returns count of expired

// Outbreaks
createOutbreak(data) → outbreak
listOutbreaks(filters, pagination) → { items, total }
updateOutbreak(id, updates) → outbreak

// Vaccination
getVaccinationProfile(userId) → profile | null
saveVaccinationProfile(userId, profile) → profile
addVaccinationRecord(userId, record, memberId?) → record
deleteVaccinationRecord(userId, vaccineId, memberId?) → void
getUpcomingVaccinations(daysAhead) → { userId, vaccine }[]

// Vaccination drives
createDrive(data) → drive
listDrives(filters, pagination) → { items, total }
updateDrive(id, updates) → drive

// Stats
getStats() → statsObject
```

---

## Safety Rules (safetyService.js)

These rules are applied to every `/v1/chat` and `/v1/voice/query` response before it is returned:

1. **Always add disclaimer**: Every response gets at least one medical disclaimer appended.
2. **Detect emergency**: If the AI flags emergency symptoms (chest pain, difficulty breathing, loss of consciousness, severe bleeding, stroke symptoms), set `emergencyDetected: true` and prepend: *"EMERGENCY: Please call 108 (ambulance) or go to the nearest hospital immediately."*
3. **Block diagnosis**: If the query intent is `diagnostic_request`, override the AI response with: *"I can share health education information, but I cannot diagnose conditions. Please consult a qualified doctor for diagnosis."*
4. **Escalation flag**: Set `escalationRequired: true` if emergency detected OR confidence < 0.4.

---

## serverless.yml (sketch)

```yaml
service: swasthyaai-backend
provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    NODE_ENV: production
    # ... all env vars

functions:
  auth:
    handler: src/lambda.handler
    events:
      - http: { path: v1/auth/session, method: post }
      - http: { path: v1/auth/session, method: delete }

  chat:
    handler: src/lambda.handler
    events:
      - http: { path: v1/chat, method: post }
      - http: { path: v1/chat/history, method: get }

  voice:
    handler: src/lambda.handler
    events:
      - http: { path: v1/voice/transcribe, method: post }
      - http: { path: v1/voice/synthesize, method: post }
      - http: { path: v1/voice/query, method: post }

  whatsapp:
    handler: src/lambda.handler
    events:
      - http: { path: v1/webhooks/whatsapp, method: post }
      - http: { path: v1/webhooks/whatsapp, method: get }

  sms:
    handler: src/lambda.handler
    events:
      - http: { path: v1/webhooks/sms, method: post }

  facilities:
    handler: src/lambda.handler
    events:
      - http: { path: v1/facilities, method: get }
      - http: { path: "v1/facilities/{facilityId}", method: get }

  alerts:
    handler: src/lambda.handler
    events:
      - http: { path: v1/alerts, method: get }
      - http: { path: v1/alerts, method: post }
      - http: { path: "v1/alerts/{alertId}", method: put }
      - http: { path: "v1/alerts/{alertId}", method: delete }

  vaccination:
    handler: src/lambda.handler
    events:
      - http: { path: v1/vaccination/profile, method: get }
      - http: { path: v1/vaccination/profile, method: post }
      - http: { path: v1/vaccination/records, method: post }
      - http: { path: "v1/vaccination/records/{vaccineId}", method: delete }
      - http: { path: v1/vaccination/schedule, method: get }
      - http: { path: v1/vaccination/centers, method: get }

  image:
    handler: src/lambda.handler
    events:
      - http: { path: v1/image/analyze, method: post }

  users:
    handler: src/lambda.handler
    events:
      - http: { path: v1/users/me, method: get }
      - http: { path: v1/users/me, method: put }
      - http: { path: v1/users/me, method: delete }

  admin:
    handler: src/lambda.handler
    events:
      - http: { path: "v1/admin/{proxy+}", method: any }

  schedulerHealthData:
    handler: src/handlers/scheduler.updateHealthData
    events:
      - schedule: cron(0 2 * * ? *)

  schedulerVaccinationReminders:
    handler: src/handlers/scheduler.sendVaccinationReminders
    events:
      - schedule: cron(30 2 * * ? *)

  schedulerAlertExpiry:
    handler: src/handlers/scheduler.expireAlerts
    events:
      - schedule: rate(1 hour)

  schedulerReports:
    handler: src/handlers/scheduler.generateReport
    events:
      - schedule: cron(0 6 ? * MON *)
```
