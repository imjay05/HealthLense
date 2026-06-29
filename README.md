<div align="center">

<img src="frontend/public/healthLense.png" alt="HealthLense Logo" width="80" />

# HealthLense

### AI-Powered Medical Report Analysis & Symptom Intelligence Platform

**A full-stack production system that turns confusing medical reports into plain-language insights — in English, Hindi, or Marathi — and connects patients to nearby diagnostic care, in real time.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%204%20Vision-F55036?style=flat-square&logo=meta&logoColor=white)](https://groq.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Pipeline-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

[**Live Demo**](https://healthlense.vercel.app/) · [API Reference](#api-reference) · [Architecture](#system-architecture)

</div>

---

## Why This Project Exists

Healthcare in India has a comprehension gap, not just an access gap. A patient can walk into any pathology lab and get tested — but almost nobody can read the report that comes back. Dense tables, cryptic units, and English-only jargon stand between a diagnosis and a person actually understanding their own health.

HealthLense closes that gap end-to-end:

- **Upload a report → get a plain-language explanation**, in the patient's own language, in seconds.
- **Describe symptoms in natural text (even Hinglish)** → get clinically-reasoned test recommendations.
- **Get routed to real nearby labs and hospitals**, streamed live over a WebSocket as they're found.

This isn't a CRUD demo — it's a system that had to solve real engineering problems: multi-modal AI inference, third-party rate limits, duplicate-cost prevention, multi-page document pipelines, and graceful degradation when external services fail.

---

## Engineering Highlights

*(The parts of this build that actually required design decisions, not boilerplate.)*

- **Cost-aware AI pipeline** — every uploaded file is SHA-256 hashed before any Cloudinary/Groq call. If a user re-submits a report they've already uploaded, the system reuses the existing asset and only re-runs the LLM inference — cutting redundant storage costs without losing analysis history (`ReportController.js`).
- **Multi-modal document normalization** — PDFs, Word docs, and images all funnel into a single vision-model pipeline. PDFs are converted to per-page JPEGs on the fly via Cloudinary transformations (capped at 4 pages to respect model context limits) so a 10-page lab report and a single JPEG hit the exact same analysis code path.
- **Dependency-free rate limiting** — instead of reaching for Redis, I built a sliding-window rate limiter on top of MongoDB's native TTL indexes, with a deliberate **fail-open** policy: if the DB hiccups, AI requests still go through rather than blocking real users over an infra blip.
- **Resilient third-party geocoding** — the nearby-labs feature respects Nominatim's strict 1 req/sec ToS, progressively expands its search radius (10km → 25km → 50km) only when results are sparse, and deduplicates by normalized name — turning a free, rate-limited API into a reliable feature.
- **Real-time + REST hybrid** — lab search runs over an authenticated Socket.IO channel (`labs:loading` → `labs:result`) so the UI can show progressive "searching..." feedback, while everything else stays simple, cacheable REST.
- **Multi-language LLM output control** — system prompts enforce a hard single-language constraint per response (no code-mixing) and a strict output schema (JSON-only, no markdown fences) for the symptom-analysis endpoint, parsed defensively with regex fallback extraction.
- **Per-user data isolation by construction** — every Mongoose query is scoped to `req.user._id` at the controller level; there is no code path that can return another user's data, enforced as a contributor-facing convention (see [Contributing](#contributing)).

---

## Features

### Core
- **Report Analysis** — PDF (multi-page), DOCX/DOC, JPG, PNG, WEBP; up to 5 images per batch
- **Two Analysis Modes** — *Full Analysis* (every test value + interpretation + next steps) or *Conclusion* (3-sentence summary)
- **Multilingual Output** — English, Hindi, Marathi — selectable per request, not per account
- **Symptom Checker** — free-text input in English/Hindi/Marathi/Hinglish with auto language detection, returns 5–7 clinically-reasoned diagnostic test suggestions
- **Nearby Labs & Hospitals Map** — interactive Leaflet map streamed in real time over WebSocket, sorted by distance
- **Unified History Timeline** — every report and symptom query in one chronological feed, with per-entry expand/delete
- **Auto-generated Thumbnails** — Cloudinary-derived previews for every uploaded document or image

### Platform
- JWT auth (7-day expiry) + bcrypt (12 rounds)
- Per-user MongoDB-backed sliding-window rate limiting on AI endpoints
- CORS locked to an explicit allow-list
- Centralized error handling for Multer, JWT, and Mongoose failure modes
- Transactional welcome + admin-notification emails via Resend (non-blocking, failure-tolerant)

---

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Backend**
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js 4 |
| Database | MongoDB Atlas (Mongoose) |
| AI / Vision | Groq — LLaMA 4 Scout 17B (Vision), LLaMA 3.3 70B (Text) |
| Storage | Cloudinary (image + raw resource pipelines) |
| Real-time | Socket.IO 4 |
| Email | Resend |
| Auth | JWT + bcryptjs |
| Uploads | Multer (in-memory buffers) |
| Rate Limiting | Custom MongoDB TTL sliding window |
| Geocoding | Nominatim (OpenStreetMap) |

</td>
<td valign="top" width="50%">

**Frontend**
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| State | Zustand |
| HTTP | Axios (JWT interceptor + 401 auto-logout) |
| Maps | Leaflet 1.9 |
| Charts | Recharts |
| Real-time | Socket.IO Client |
| Styling | Vanilla CSS, custom design tokens |

</td>
</tr>
</table>

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│  AuthPages · AnalyzePage · SymptomsPage · HistoryPage           │
│       Axios + JWT Interceptor          Socket.IO Client         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / WebSocket
┌──────────────────────────────▼──────────────────────────────────┐
│                  SERVER (Express + Socket.IO)                   │
│   AuthMiddleware (JWT) · RateLimiter (Mongo TTL) · Multer       │
│              /auth   /reports   /symptoms   /history            │
│     AIService (Groq)   CloudinaryService   OverpassService      │
│                       MongoDB Atlas                             │
│         Users · Reports · SymptomQueries · RateLimits           │
│                    Email (Resend)                               │
└─────────────────────────────────────────────────────────────────┘
```

**Report Analysis Data Flow**

```
Upload  →  Multer (memory)  →  SHA-256 dedupe check
   │
   ├─ Cache hit  → reuse existing Cloudinary asset
   └─ Cache miss → Cloudinary upload (PDF/IMG → image, DOCX → raw)
   │
   ▼
AIService.analyzeReport()
   PDF  → per-page JPEG URLs (capped at 4 pages)
   IMG  → direct secure URL
   DOCX → raw Cloudinary URL
   │
   ▼
Groq Vision (LLaMA 4 Scout) — multi-image, language-locked prompt
   │
   ▼
Persisted as a versioned "analysis entry" on the Report → MongoDB → JSON response
```

> Each `Report` document stores an **array of analysis entries**, so a user can re-run analysis on the same file in a different language or mode without re-uploading — every past result stays accessible.

---

## Database Design

```
User { name, email, password (hashed), preferredLang }
   │ 1
   │
   │ N
Report {
  user (FK), fileUrl, fileHash (deduped), fileType, thumbnailUrl,
  additionalFiles[], analyses[ { analysisType, outputLang, analysisResult, analyzedAt } ]
}

SymptomQuery {
  user (FK), inputText, detectedLang, selectedChips[],
  suggestions[ { testName, reason } ],
  nearbyLabs[ { name, lat, lon, address, distance, type } ]
}

RateLimit { key (unique), requests[], updatedAt (TTL: 120s) }
```

`fileHash` carries a sparse unique index per user — the dedupe guarantee is enforced at the database layer, not just in application logic.

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ✗ | Create account, receive token |
| POST | `/login` | ✗ | Login, receive token |
| GET | `/me` | ✓ | Current user profile |
| PATCH | `/lang` | ✓ | Update preferred language |

### Reports — `/api/reports`
| Method | Endpoint | Auth | Rate-limited | Description |
|---|---|---|---|---|
| POST | `/analyze` | ✓ | ✓ | Upload & analyze 1 PDF/DOCX **or** up to 5 images |
| GET | `/` | ✓ | | List reports (analysis text excluded) |
| GET | `/:id` | ✓ | | Full report incl. analysis history |
| DELETE | `/:id` | ✓ | | Delete report + Cloudinary cleanup |
| DELETE | `/:id/analyses/:entryId` | ✓ | | Delete a single analysis entry |

### Symptoms — `/api/symptoms`
| Method | Endpoint | Auth | Rate-limited | Description |
|---|---|---|---|---|
| POST | `/analyze` | ✓ | ✓ | Symptom text → ranked test suggestions + nearby labs |
| GET | `/` `/:id` | ✓ | | List / fetch queries |
| DELETE | `/:id` | ✓ | | Delete a query |

### History — `/api/history`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Latest 5 reports + 5 symptom queries |
| GET | `/` | Full combined, sorted timeline |

### WebSocket
Connect with `{ auth: { token } }`.
| Direction | Event | Payload |
|---|---|---|
| Emit | `find:labs` | `{ lat, lon, radiusKm? }` |
| Receive | `labs:loading` / `labs:result` / `labs:error` | progressive search status |

---

## Performance Decisions

| Concern | Approach |
|---|---|
| Duplicate AI spend | SHA-256 file hash dedupe before any upload/inference call |
| Groq context limits | PDF pages capped at 4; `max_tokens` scales with page count |
| Response latency (conclusion mode) | Token budget capped at 150 for short-form output |
| Nominatim rate limits | Enforced 1 req/sec, progressive radius expansion, name-based dedupe |
| Infra resilience | Rate limiter fails **open** on DB error — never blocks a legitimate user |

---

## Security

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt, 12 salt rounds |
| Authentication | JWT (HS256), 7-day expiry, verified on every protected route |
| Authorization | Every Mongoose query scoped to `req.user._id` |
| File uploads | Server-side MIME allow-list + 10MB hard limit via Multer |
| Abuse prevention | Per-user sliding-window rate limit on all AI endpoints |
| CORS | Explicit `ALLOWED_ORIGINS` allow-list, no wildcard |
| Error handling | Generic messages to clients; full errors server-side only |
| Storage cleanup | Cascading Cloudinary deletion on report removal |

---

## Getting Started

### Prerequisites
- Node.js ≥ 20, npm ≥ 9
- MongoDB Atlas (free tier works)
- Cloudinary account
- Groq API key — [console.groq.com](https://console.groq.com)
- Resend account (optional — emails fail silently without it)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your keys
node server.js
curl http://localhost:5000/health   # → {"status":"ok"}
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev   # → http://localhost:5173
```

<details>
<summary><strong>Environment variables</strong></summary>

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

```env
# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
</details>

---

## Project Structure

```
healthlense/
├── backend/
│   ├── config/         # Cloudinary + MongoDB connection
│   ├── controllers/     # Auth, Report, Symptom, History
│   ├── middleware/      # JWT auth, sliding-window rate limiter
│   ├── models/          # User, Report, SymptomQuery, RateLimit
│   ├── routes/
│   ├── services/        # AIService (Groq), CloudinaryService, OverpassService, EmailService
│   ├── socket/           # Authenticated lab-finder WebSocket handler
│   ├── app.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/          # Axios instance + JWT interceptor
        ├── components/   # layout, report, history, symptoms, map
        ├── hooks/        # useGeolocation, useSocket
        ├── pages/        # auth, dashboard, analyze, symptoms, history
        └── store/        # Zustand auth store
```

---

## Roadmap

- [ ] Trend tracking across repeated reports (e.g. HbA1c over time, as a chart)
- [ ] PDF export of a full analysis for sharing with a doctor
- [ ] Push notifications for retest reminders
- [ ] Admin dashboard for usage analytics

---

## Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add some feature"
git push origin feature/your-feature-name
```

This project follows [Conventional Commits](https://www.conventionalcommits.org/). A hard rule for all backend PRs: **every Mongoose query touching user data must be scoped to `req.user._id`** — no exceptions, no "trusted" internal routes.

---

## Author

**Jay Shelke** — Pune, Maharashtra, India
[GitHub @imjay05](https://github.com/imjay05) · [LinkedIn](https://www.linkedin.com/in/jay-shelke-4323a22a5/) · imjaydigambarshelke@gmail.com

---

## Acknowledgements

[Groq](https://groq.com/) · [Cloudinary](https://cloudinary.com/) · [OpenStreetMap / Nominatim](https://nominatim.openstreetmap.org/) · [Resend](https://resend.com/) · [Leaflet.js](https://leafletjs.com/)

<div align="center">

*HealthLense — because everyone deserves to understand their own health.*

</div>
