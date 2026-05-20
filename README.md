markdown<div align="center">

# HealthLense

### AI-Powered Medical Report Analysis & Symptom Intelligence Platform

*Upload reports. Describe symptoms. Find nearby labs. Get instant insights — in English, Hindi, or Marathi.*

---

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%204-F55036?style=flat-square&logo=meta&logoColor=white)](https://groq.com/)
[![Resend](https://img.shields.io/badge/Resend-Email-000000?style=flat-square&logo=mail.ru&logoColor=white)](https://resend.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](#live-demo) · [Report Bug](https://github.com/yourusername/healthlense/issues) · [Request Feature](https://github.com/yourusername/healthlense/issues)

</div>

---

## Problem Statement

Healthcare in India faces a significant accessibility gap. Millions of patients receive medical lab reports they simply cannot understand — dense tables of values, cryptic abbreviations, and clinical language that means nothing to a layperson. Further compounding this:

- **Language barriers** — Most reports are in English, but a large portion of patients are more comfortable in Hindi or Marathi.
- **Access to guidance** — Consulting a doctor just to interpret a routine blood test is expensive and time-consuming.
- **Symptom blindness** — Patients who want to proactively seek testing often don't know which tests are relevant to their symptoms.
- **Lab discovery** — Finding a nearby pathology lab or diagnostic centre is a fragmented, manual process.

> Most people can get a blood test done. Almost nobody can properly read what it means.

---

## Solution

HealthLense bridges the gap between raw medical data and patient understanding:

1. **AI-Powered Report Analysis** — Upload a PDF, Word doc, or image of any medical report. Get a structured interpretation in seconds, in the language of your choice.
2. **Multilingual Symptom Checker** — Describe symptoms in English, Hindi, Marathi, or Hinglish. Receive a curated list of recommended diagnostic tests with clinical reasoning.
3. **Nearby Lab Finder** — Automatically surface pathology labs, hospitals, diagnostic centres, and pharmacies close to the user's current location using real map data.
4. **Full History** — Every report analysis and symptom query is persisted and accessible, with the ability to revisit and delete records.

---

## Live Demo

| Environment | URL |
|---|---|
| Production | [https://healthlense.app](https://healthlense.app) |
| API Health | [https://api.healthlense.app/health](https://api.healthlense.app/health) |

> **Note:** The live demo uses free-tier Groq API credits. High-volume usage may result in temporary rate limiting.

---

## Features

### Core Features
- **Report Analysis** — Supports PDF (multi-page), DOCX/DOC, JPG, PNG, WEBP; up to 5 images per batch
- **Two Analysis Modes** — "Full Analysis" (all test values + interpretation + follow-ups) or "Conclusion" (key findings only)
- **Multilingual Output** — Results in English, Hindi (`hi`), or Marathi (`mr`)
- **Symptom Analysis** — Free-text input with auto language detection; enriched by quick-select symptom chips
- **Nearby Labs Map** — Interactive Leaflet map with lab markers, tooltips, and a sorted distance list
- **History Dashboard** — Unified timeline of past reports and symptom queries with expand/collapse and delete
- **Thumbnail Previews** — Cloudinary-generated thumbnails for uploaded PDFs and images

### Auth & Security
- JWT-based authentication with 7-day token expiry
- Bcrypt password hashing (12 rounds)
- Per-user MongoDB-backed rate limiting on AI endpoints
- CORS restricted to configured origins via `ALLOWED_ORIGINS`
- Global error handling with multer, JWT, and Mongoose-specific responses

### Notifications
- Welcome email on signup (plain-text via Resend)
- Admin notification on each new user registration

### Real-time
- Socket.IO authenticated lab-finder stream — clients emit coordinates, server streams back nearby results

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js 4 |
| Database | MongoDB (Mongoose ODM) |
| AI / Vision | Groq — LLaMA 4 Scout 17B (Vision), LLaMA 3.3 70B (Text) |
| File Storage | Cloudinary (images & PDFs as `image` resource; DOCX as `raw`) |
| Email | Resend |
| Real-time | Socket.IO 4 |
| Auth | JSON Web Tokens + bcryptjs |
| File Upload | Multer (memory storage) |
| Rate Limiting | Custom MongoDB TTL-based sliding window middleware |
| Geocoding | Nominatim (OpenStreetMap) |
| Async Errors | express-async-errors |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| State Management | Zustand |
| HTTP Client | Axios (with JWT interceptor + 401 auto-logout) |
| Maps | Leaflet 1.9 (CDN) |
| Charts | Recharts |
| Real-time | Socket.IO Client |
| Fonts | Google Fonts — Outfit, DM Serif Display, DM Mono |
| Styling | Vanilla CSS with CSS custom properties |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐    │
│  │ AuthPages│  │AnalyzePg │  │SymptomsPage│ │HistoryPage   │    │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘    │
│       └─────────────┴──────────────┴───────────────┘            │
│                   Axios + JWT Interceptor / Socket.IO Client    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────▼──────────────────────────────────┐
│                     SERVER (Express + Socket.IO)                │
│                                                                 │
│  AuthMiddleware (JWT)  ·  RateLimiter (MongoDB TTL)  ·  Multer  │
│                                                                 │
│              /auth  /reports  /symptoms  /history               │
│                                                                 │
│    AIService (Groq)  ·  CloudinaryService  ·  OverpassService   │
│                                                                 │
│                    MongoDB Atlas                                │
│          Users · Reports · SymptomQueries · RateLimits          │
│                                                                 │
│                  Email (Resend)                                 │
│         Welcome Email · Admin Signup Notification               │
└─────────────────────────────────────────────────────────────────┘

```
### Data Flow — Report Analysis

```
User uploads file(s)
│
▼
Multer (memory buffer)
│
▼
Cloudinary upload
PDF → image resource  |  DOCX → raw  |  IMG → image
│
▼
AIService.analyzeReport()
PDF  → pdfToImageUrls(publicId, min(pages, 4)) → per-page JPEG URLs
DOCX → Cloudinary raw URL
IMG  → Cloudinary secure URL
│
▼
Groq Vision (LLaMA 4 Scout) — multi-image prompt
│
▼
analysisResult (string) → Report.create() → MongoDB → Response

```
---

## Folder Structure

```
healthlense/
│
├── backend/
│   ├── config/
│   │   ├── Cloudinary.js          # Cloudinary SDK config
│   │   └── DB.js                  # Mongoose connection
│   │
│   ├── controllers/
│   │   ├── AuthController.js      # register, login, getMe, updateLang
│   │   ├── ReportController.js    # analyze, getReports, getReport, deleteReport
│   │   ├── SymptomController.js   # analyze, getQueries, getQuery, deleteQuery
│   │   └── HistoryController.js   # getDashboard, getFullHistory
│   │
│   ├── middleware/
│   │   ├── AuthMiddleware.js      # JWT protect middleware
│   │   └── RateLimiter.js        # MongoDB-backed sliding window rate limiter
│   │
│   ├── models/
│   │   ├── User.js                # bcrypt pre-save hook
│   │   ├── Report.js
│   │   ├── SymptomQuery.js
│   │   └── RateLimit.js          # TTL-indexed rate limit schema
│   │
│   ├── routes/
│   │   ├── AuthRoutes.js
│   │   ├── ReportRoutes.js        # multer upload.array("files", 5)
│   │   ├── SymptomRoutes.js
│   │   └── HistoryRoutes.js
│   │
│   ├── services/
│   │   ├── AIService.js           # Groq Vision + Text completions
│   │   ├── CloudinaryService.js   # uploadBuffer, deleteFile, pdfToImageUrls
│   │   └── EmailService.js        # Resend welcome + admin emails
│   │
│   ├── socket/
│   │   └── SocketHandler.js       # JWT auth + find:labs socket event
│   │
│   ├── app.js                     # Express app (CORS, routes, error handlers)
│   └── server.js                  # HTTP server + Socket.IO bootstrap
│
├── frontend/
│   ├── public/
│   │   └── healthLense.png
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance with JWT interceptor
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── sidebar/       # Sidebar.jsx + Sidebar.css
│   │   │   │   └── navbar/        # Navbar.jsx + Navbar.css
│   │   │   ├── report/
│   │   │   │   ├── upload/        # UploadZone.jsx
│   │   │   │   └── analysis/      # AnalysisResult.jsx
│   │   │   ├── history/
│   │   │   │   ├── reportcard/    # ReportCard.jsx
│   │   │   │   └── symptomcard/   # SymptomCard.jsx
│   │   │   ├── symptoms/
│   │   │   │   ├── SymptomChips.jsx
│   │   │   │   └── TestSuggestions.jsx
│   │   │   ├── map/               # LabsMap.jsx
│   │   │   └── ToastContainer.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useGeolocation.js
│   │   │   └── useSocket.js
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/              # LoginPage.jsx, SignupPage.jsx
│   │   │   ├── dashboard/         # DashboardPage.jsx
│   │   │   ├── analyze/           # AnalyzePage.jsx
│   │   │   ├── symptoms/          # SymptomsPage.jsx
│   │   │   └── history/           # HistoryPage.jsx
│   │   │
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand — user, token, fetchMe, logout
│   │   │
│   │   ├── utils/
│   │   │   └── toast.js           # Pub/sub toast bus
│   │   │
│   │   ├── App.jsx                # BrowserRouter + route tree + auth guards
│   │   ├── main.jsx
│   │   └── index.css              # Global styles + CSS variables
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .env.example
└── README.md

```
---

## Database Schemas & ER Diagram

### User
User {
_id:           ObjectId  (PK)
name:          String    required, 2–50 chars
email:         String    required, unique, lowercase
password:      String    bcrypt-hashed (12 rounds), select: false
preferredLang: String    enum: en | hi | mr, default: en
createdAt:     Date
updatedAt:     Date
}

### Report
Report {
_id:             ObjectId  (PK)
user:            ObjectId  (FK → User, indexed)
fileUrl:         String    Cloudinary secure URL
filePublicId:    String    for deletion
fileType:        String    enum: pdf | image | word
thumbnailUrl:    String    Cloudinary transformation URL
additionalFiles: [{ fileUrl, filePublicId, fileType, thumbnailUrl }]
analysisType:    String    enum: full | conclusion
outputLang:      String    enum: en | hi | mr
analysisResult:  String    AI-generated text (excluded from list queries)
reportDate:      Date
createdAt:       Date
updatedAt:       Date
}

### SymptomQuery
SymptomQuery {
_id:           ObjectId  (PK)
user:          ObjectId  (FK → User, indexed)
inputText:     String    required
detectedLang:  String    enum: en | hi | mr | hinglish
selectedChips: [String]
suggestions:   [{ testName: String, reason: String }]
nearbyLabs:    [{ name, lat, lon, address, distance, type, phone }]
userLat:       Number
userLon:       Number
createdAt:     Date
updatedAt:     Date
}

### RateLimit (TTL Collection)
RateLimit {
key:       String    unique  e.g. "rl:userId"
requests:  [Number]  array of timestamps (ms)
updatedAt: Date      TTL index — auto-deleted after 120s
}

### ER Diagram

```
┌──────────────┐   1        ┌──────────────────────┐
│     User     │────────────│        Report         │
├──────────────┤   N        ├──────────────────────┤
│ _id (PK)     │            │ _id (PK)              │
│ name         │            │ user (FK)             │
│ email        │            │ fileUrl / fileType    │
│ password     │            │ thumbnailUrl          │
│ preferredLang│            │ additionalFiles[]     │
└──────────────┘            │ analysisType          │
│                    │ outputLang            │
│ 1                  │ analysisResult        │
│ N                  └──────────────────────┘
│
│     ┌──────────────────────────────────┐
└─────│         SymptomQuery             │
├──────────────────────────────────┤
│ _id (PK)                         │
│ user (FK)                        │
│ inputText / detectedLang         │
│ selectedChips[]                  │
│ suggestions[]{ testName, reason }│
│ nearbyLabs[]{ name, lat, lon, …} │
│ userLat / userLon                │
└──────────────────────────────────┘
         ┌──────────────────────────────────┐
         │           RateLimit              │
         ├──────────────────────────────────┤
         │ key (unique)  "rl:userId"        │
         │ requests[]  timestamps (ms)      │
         │ updatedAt   TTL: 120s            │
         └──────────────────────────────────┘

```
---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ✗ | Create account, receive token |
| POST | `/login` | ✗ | Login, receive token |
| GET | `/me` | ✓ | Get current user profile |
| PATCH | `/lang` | ✓ | Update preferred language |

### Reports — `/api/reports`

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/analyze` | ✓ | ✓ | Upload & analyze file(s) |
| GET | `/` | ✓ | | List all user reports (no `analysisResult`) |
| GET | `/:id` | ✓ | | Get single report (with `analysisResult`) |
| DELETE | `/:id` | ✓ | | Delete report + Cloudinary files |

**POST `/analyze` — multipart/form-data**

| Field | Type | Required | Notes |
|---|---|---|---|
| `files` | File[] | yes | 1 PDF/Word OR up to 5 images, max 10 MB each |
| `analysisType` | string | no | `"full"` (default) \| `"conclusion"` |
| `outputLang` | string | no | `"en"` (default) \| `"hi"` \| `"mr"` |

### Symptoms — `/api/symptoms`

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/analyze` | ✓ | ✓ | Analyze symptoms, get test suggestions + nearby labs |
| GET | `/` | ✓ | | List all symptom queries |
| GET | `/:id` | ✓ | | Get single query |
| DELETE | `/:id` | ✓ | | Delete query |

**POST `/analyze` — JSON body**
```json
{
  "inputText":     "Kal se sir dard ho raha hai",
  "selectedChips": ["Headache", "Fever"],
  "lat":           18.5204,
  "lon":           73.8567
}
```

### History — `/api/history`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | ✓ | Latest 5 reports + 5 queries |
| GET | `/` | ✓ | Full combined timeline (sorted by date) |

### WebSocket Events

Connect with `{ auth: { token } }`.

**Emit:**

| Event | Payload | Description |
|---|---|---|
| `find:labs` | `{ lat, lon, radiusKm? }` | Request nearby labs |

**Receive:**

| Event | Payload | Description |
|---|---|---|
| `labs:loading` | `{ message }` | Server started searching |
| `labs:result` | `{ labs[] }` | Array of nearby places |
| `labs:error` | `{ message }` | Something went wrong |

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/healthlense

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq
GROQ_API_KEY=gsk_...
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
GROQ_TEXT_MODEL=llama-3.3-70b-versatile

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=HealthLense <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com

# Rate Limiting
GROK_RATE_LIMIT_PER_MIN=10
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Installation & Setup

### Prerequisites

- Node.js ≥ 20.x and npm ≥ 9.x
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Groq API key — [console.groq.com](https://console.groq.com)
- Resend account — [resend.com](https://resend.com) (optional, for emails)

### 1. Clone

```bash
git clone https://github.com/yourusername/healthlense.git
cd healthlense
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in all values in .env
node server.js
```

Verify:
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}
```

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL and VITE_SOCKET_URL
npm run dev
```

App opens at `http://localhost:5173`.

### 4. Verify Cloudinary

Upload any image through the Analyze page and confirm it appears in your Cloudinary media library under `healthlense/reports/`.

### 5. Configure Resend (optional)

Add a verified sending domain in Resend, then set `RESEND_FROM_EMAIL`. Without this, welcome emails fail silently (non-blocking).

---

## Usage

### Analyzing a Medical Report

1. Navigate to **Analyze Report** from the sidebar.
2. Drag and drop or click to upload your file (PDF, DOCX, or up to 5 images).
3. Choose **Analysis Type** — Full Analysis or Conclusion.
4. Choose **Output Language** — English, Hindi, or Marathi.
5. Click **⚡ Analyze Report** and wait ~5–15 seconds.
6. The structured analysis appears below with section headings, test values, and recommendations.

### Using the Symptom Checker

1. Navigate to **Symptoms** from the sidebar.
2. Type your symptoms in the text area in any language (English, Hindi, Marathi, Hinglish).
3. Optionally tap **Quick Add** chips to include common symptoms.
4. Click **⚡ Analyze Symptoms**.
5. Receive 5–7 ranked test recommendations with clinical reasoning.
6. The map auto-populates with nearby labs if location access was granted.

### Finding Nearby Labs

The app requests geolocation on the Symptoms page. If granted, your position appears as a blue marker and nearby hospitals, pathology labs, diagnostic centres, clinics, and pharmacies appear as green markers. Hover to see the name; click for full details including distance and type. A sorted list also renders below the map.

---

## Performance & Rate Limiting

### Rate Limiter Design

HealthLense uses a custom sliding window rate limiter backed by MongoDB (no Redis dependency):

- **Window:** 60 seconds (configurable via `GROK_RATE_LIMIT_PER_MIN`)
- **Default limit:** 10 AI requests per user per minute
- **Key:** `rl:<userId>`
- **Storage:** TTL-indexed `RateLimit` collection — auto-purges after 120 seconds
- **Fail-open:** MongoDB unavailability is logged as a warning and bypasses the limiter
- **Response headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- **429 response:** Includes `retryAfter` seconds until the oldest request expires

### AI Prompt Optimization

- PDF pages are capped at 4 per call to stay within Groq context limits
- `max_tokens` scales with page count: `min(1500 + (pages - 1) × 400, 4000)`
- Conclusion mode is capped at 600 tokens for faster responses
- Temperature is fixed at 0.1 for factual accuracy

### Nominatim (Lab Search)

- Respects Nominatim ToS: 1 request/second enforced via `sleep(1100ms)`
- Search radius expands progressively (10km → 25km → 50km) until ≥3 results found
- Up to 15 API calls per symptom analysis (5 terms × 3 radius tiers)
- `AbortSignal.timeout(8000)` prevents hanging requests
- Deduplication by normalized name prevents duplicates

---

## Security

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt with 12 salt rounds |
| Authentication | JWT (HS256), 7-day expiry, verified on every protected route |
| Authorisation | All DB queries scoped to `req.user._id` |
| File uploads | Multer enforces 10 MB limit and MIME type allowlist server-side |
| Rate limiting | Per-user sliding window prevents AI endpoint abuse |
| CORS | Restricted to `ALLOWED_ORIGINS` env variable |
| Token storage | `localStorage` with automatic 401-triggered logout |
| Error leakage | Production errors return generic messages; stack traces stay server-side |
| Cloudinary cleanup | Report deletion triggers `cloudinary.uploader.destroy` for all associated files |

---


## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`.

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):
feat:     A new feature
fix:      A bug fix
docs:     Documentation changes
style:    Formatting, no logic change
refactor: Code restructure, no feature/fix
perf:     Performance improvement
test:     Adding or fixing tests
chore:    Tooling, dependencies

### Code Style

- ES Modules on the frontend; CommonJS on the backend.
- No ESLint rule suppression without an explanatory comment.
- All new API routes must include corresponding error handling.
- Mongoose queries must always be scoped to `req.user._id`.

---


## Author

| | |
|---|---|
| **Name** | Jay |
| **Email** | imjaydigambarshelke@gmail.com |
| **GitHub** | [@imjay05](https://github.com/imjay05) |
| **LinkedIn** | [linkedin.com/in/jay-shelke](https://www.linkedin.com/in/jay-shelke-4323a22a5/) |
| **Location** | Pune, Maharashtra, India |

---

## Acknowledgements

- [Groq](https://groq.com/) — for blazing-fast LLaMA inference
- [Cloudinary](https://cloudinary.com/) — for PDF-to-image conversion and media management
- [OpenStreetMap & Nominatim](https://nominatim.openstreetmap.org/) — for open geocoding and place data
- [Resend](https://resend.com/) — for clean transactional email delivery
- [Leaflet.js](https://leafletjs.com/) — for the lightweight open-source mapping library
- [Outfit Font](https://fonts.google.com/specimen/Outfit) — for the clean UI typography
- [express-async-errors](https://github.com/davidbanham/express-async-errors) — for painless async error propagation

---

<div align="center">

Made with Dedication in Pune, Maharashtra

*HealthLense — because everyone deserves to understand their own health.*

</div>