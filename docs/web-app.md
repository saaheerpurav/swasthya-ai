# SwasthyaAI — Web Application Specification

## Overview

Three distinct parts in one React app:

1. **Landing Page** (`/`) — Public-facing marketing site. Links to WhatsApp chatbot, mobile app download, and includes a live embedded AI demo widget judges can interact with.
2. **Public Health Intelligence Dashboard** (`/dashboard`) — **The hackathon wow factor.** A live, interactive choropleth map of India showing disease outbreak intensity, active alerts by state, vaccination coverage, and platform usage statistics. Publicly accessible, no login.
3. **Admin Panel** (`/admin/*`) — Protected panel for health officials. Manage alerts, outbreaks, vaccination drives. View user analytics, query trends, escalations.

**Why the public dashboard wins the hackathon:**
Most health AI projects submit a chatbot. SwasthyaAI's public dashboard shows the *systemic impact* — a real-time India health intelligence layer that aggregates outbreak data, weather-disease correlations, and platform signals on a live map. It is visually stunning, immediately comprehensible to judges, and demonstrates capability no other team can replicate quickly.

---

## Tech Stack

| Category | Package | Notes |
|----------|---------|-------|
| Framework | React 18 + Vite 5 + TypeScript 5 | |
| Styling | Tailwind CSS v3 + shadcn/ui | |
| Routing | React Router v6 | |
| Server state | TanStack Query v5 | |
| Forms | React Hook Form + Zod | |
| Charts | Recharts | Line, bar, pie, area |
| India map | react-simple-maps | GeoJSON choropleth of India states |
| Animations | framer-motion | Landing page, map tooltips |
| AI (live demo) | OpenAI API (direct fetch from browser) | `gpt-4o-mini`, health system prompt |
| Icons | lucide-react | |
| Toasts | Sonner | |
| Date utils | date-fns | |

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/v1
VITE_ADMIN_KEY=admin-secret-here
VITE_OPENAI_API_KEY=sk-...
```

---

## Project Structure

```
web/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
├── .env
├── public/
│   ├── india.geojson            # India states GeoJSON for choropleth map
│   └── og-image.png
└── src/
    ├── main.tsx
    ├── App.tsx                  # Router + QueryClientProvider
    ├── lib/
    │   ├── api.ts               # apiFetch wrapper + all API functions
    │   ├── openai.ts            # Direct OpenAI call for live demo
    │   └── utils.ts             # cn(), formatNumber(), relativeTime()
    ├── types/
    │   └── index.ts             # All TypeScript interfaces
    ├── constants/
    │   ├── regions.ts           # Indian states + region codes
    │   ├── diseases.ts
    │   └── vaccines.ts
    ├── hooks/
    │   ├── useAdminAuth.ts      # Admin key + session token management
    │   └── usePublicStats.ts    # Public dashboard data
    ├── components/
    │   ├── ui/                  # shadcn-generated components (do not edit)
    │   ├── SeverityBadge.tsx
    │   ├── ChannelBadge.tsx
    │   ├── LanguageBadge.tsx
    │   ├── IntentBadge.tsx
    │   ├── RelativeTime.tsx
    │   ├── StatCard.tsx
    │   ├── PaginationControls.tsx
    │   ├── EmptyState.tsx
    │   └── ConfirmDialog.tsx
    ├── pages/
    │   ├── landing/
    │   │   └── LandingPage.tsx
    │   ├── dashboard/
    │   │   └── PublicDashboardPage.tsx
    │   ├── admin/
    │   │   ├── AdminLayout.tsx          # Sidebar + topbar shell
    │   │   ├── AdminDashboardPage.tsx
    │   │   ├── AdminAlertsPage.tsx
    │   │   ├── AdminOutbreaksPage.tsx
    │   │   ├── AdminUsersPage.tsx
    │   │   ├── AdminUserDetailPage.tsx
    │   │   ├── AdminQueriesPage.tsx
    │   │   ├── AdminVaccinationPage.tsx
    │   │   └── AdminAnalyticsPage.tsx
    │   └── NotFoundPage.tsx
    └── features/
        ├── india-map/
        │   ├── IndiaMap.tsx             # react-simple-maps choropleth
        │   ├── MapTooltip.tsx
        │   └── mapUtils.ts             # state code → outbreak severity mapping
        └── live-demo/
            ├── LiveDemoWidget.tsx       # Landing page AI chat demo
            └── useHealthChat.ts         # OpenAI direct call hook
```

---

## Routing

```tsx
// src/App.tsx
<Routes>
  {/* Public */}
  <Route path="/"          element={<LandingPage />} />
  <Route path="/dashboard" element={<PublicDashboardPage />} />

  {/* Admin */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index          element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"  element={<AdminDashboardPage />} />
    <Route path="alerts"     element={<AdminAlertsPage />} />
    <Route path="outbreaks"  element={<AdminOutbreaksPage />} />
    <Route path="users"      element={<AdminUsersPage />} />
    <Route path="users/:userId" element={<AdminUserDetailPage />} />
    <Route path="queries"    element={<AdminQueriesPage />} />
    <Route path="vaccination" element={<AdminVaccinationPage />} />
    <Route path="analytics"  element={<AdminAnalyticsPage />} />
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

`AdminLayout` checks for admin key in localStorage on mount. If missing, shows a simple password entry sheet (just a text field — enter admin key to proceed).

---

---

# Part 1: Landing Page (`/`)

---

## LandingPage

A single-page scroll with distinct sections. Dark/light toggle in nav. Designed to impress hackathon judges who open the URL.

---

### Section 1 — Navbar

Fixed top bar. Logo (leaf + cross) + "SwasthyaAI" text on left. Right side:
- "Live Dashboard" link → `/dashboard`
- "Admin" link → `/admin`
- "Try on WhatsApp" button (primary green) → opens `https://wa.me/<TWILIO_WHATSAPP_NUMBER>?text=Hello`

---

### Section 2 — Hero

Full-viewport-height hero section. Split layout: left text, right animated graphic.

**Left side:**
- Eyebrow label: `AI for Bharat Hackathon • AWS`
- Headline: **"Healthcare in Your Language, In Your Hands"** (large, bold — use `text-5xl font-bold`)
- Subheadline: "Multilingual AI public health guidance for 450 million rural Indians. Voice, WhatsApp, SMS, or App — in Hindi, Kannada, Telugu, and English."
- CTA buttons (row):
  - **"Try on WhatsApp"** (primary, green, WhatsApp icon) → `https://wa.me/...`
  - **"Download App"** (secondary, outlined) → app store link placeholder
  - **"Live Health Map"** (ghost) → `/dashboard`
- Language switcher pills below CTAs: `English` | `हिन्दी` | `ಕನ್ನಡ` | `తెలుగు` — clicking each plays a sample audio phrase (use Polly TTS URL from S3 or hardcode an mp3)

**Right side:**
- Animated card stack showing the 5 channels:
  - WhatsApp chat bubble (green)
  - SMS message bubble (gray)
  - Voice waveform animation
  - Mobile app screenshot
  - Web dashboard preview thumbnail
- Use `framer-motion` `AnimatePresence` to cycle through them.

---

### Section 3 — Impact Numbers

Full-width dark green band. 4 animated count-up numbers:

| Number | Label |
|--------|-------|
| 450M | Rural Indians Enabled |
| 4 | Languages Supported |
| 5 | Access Channels |
| <10s | Response Time |

Use `framer-motion` `useInView` + a count-up hook to animate numbers when section scrolls into view.

---

### Section 4 — Live AI Demo Widget ⭐ (Hackathon highlight)

**This is what wins over judges.** They can type a real health question and get an instant AI response directly on the landing page, in any of the 4 languages.

**Layout:**
- Section headline: "Try It Right Now" / "कोशिश करें"
- Language selector tabs: `EN` | `हिं` | `ಕನ್` | `తె`
- A simulated chat window (phone-frame mockup styled div) containing:
  - Pre-seeded opening message from AI: "Hello! I'm SwasthyaAI. Ask me any health question." (in selected language)
  - Scrollable message list
  - Text input + Send button at bottom
  - Mic icon (decorative or functional — optional)

**Behavior:**
- User types a health question and hits Send.
- App calls `OpenAI gpt-4o-mini` directly from the browser (same medical safety system prompt as mobile app, in the selected language).
- Response appears in the chat window.
- `EmergencyBadge` shown if response contains "EMERGENCY".
- Disclaimer shown below every AI response.
- No backend involved. No auth. Works for judges instantly.
- Show "Powered by OpenAI + AWS Bedrock" note below the widget.

**`src/features/live-demo/useHealthChat.ts`:**
```ts
export function useHealthChat(language: Language) {
  const [messages, setMessages] = useState<DemoMessage[]>([
    { role: 'assistant', content: GREETING[language] }
  ])
  const [loading, setLoading] = useState(false)

  async function sendMessage(userText: string) {
    const updated = [...messages, { role: 'user', content: userText }]
    setMessages(updated)
    setLoading(true)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: HEALTH_SYSTEM_PROMPT[language] },
          ...updated.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 300,
        temperature: 0.2,
      })
    })
    const data = await response.json()
    const reply = data.choices[0].message.content
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  return { messages, loading, sendMessage }
}
```

---

### Section 5 — How It Works

3-column cards (or horizontal stepper) explaining the flow:

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 📱 | Ask in Your Language | Send a voice message, WhatsApp text, SMS, or use the app — in Hindi, Kannada, Telugu, or English |
| 2 | 🧠 | AI Processes Your Query | Amazon Lex detects intent. BioMistral-7B via Amazon Bedrock + verified RAG from WHO/MoHFW generates a safe, grounded response |
| 3 | ✅ | Get Verified Health Guidance | Response delivered on your preferred channel with sources, disclaimers, and emergency escalation if needed |

Below the 3 columns: a mini architecture flow diagram (SVG or simple Tailwind boxes + arrows): `User → API Gateway → Lambda → Bedrock+RAG → Lambda → Twilio/Polly → User`

---

### Section 6 — Features Grid

2×3 grid of feature cards (or 3×2 on desktop):

| Feature | Icon | Headline | Body |
|---------|------|----------|------|
| Verified RAG | shield-check | Zero Hallucinations | All responses grounded in WHO and MoHFW knowledge base. No guessing. |
| True Multilingual | globe | Native NLU, Not Translation | Amazon Lex v2 understands medical vocabulary in Hindi, Kannada, Telugu, English natively. |
| Emergency Detection | alert-triangle | <10 Sec Emergency Response | Amazon Comprehend Medical detects emergency symptoms instantly and escalates before any other response. |
| Vaccine Booking | syringe | Booking in <2 Minutes | Agentic Step Functions workflow books vaccination slots and sends confirmation. |
| Geospatial Discovery | map-pin | Nearest Clinic in 50ms | PostGIS-powered facility discovery finds the nearest PHC, hospital, or pharmacy instantly. |
| Weather-Disease Alerts | cloud-rain | Daily 6AM Outbreak Alerts | IMD weather data correlated with disease patterns sends proactive warnings to at-risk communities. |

---

### Section 7 — Channel Access

Horizontal scrollable row (or 5-column grid) showing each channel with icon, name, and "how to use" blurb:

| Channel | Icon | How to use |
|---------|------|-----------|
| WhatsApp | WhatsApp logo | Save our number and send "Hello" to start |
| SMS | message-square | Text any health question to our number — works on any phone |
| Voice | mic | Call our helpline and speak in your language |
| Mobile App | smartphone | Download the Flutter app (Android/iOS) |
| Web | monitor | Use this website directly |

Each channel card has a CTA button (WhatsApp → link, SMS → tel: link, etc.).

---

### Section 8 — Health Intelligence Preview

A teaser preview of the public dashboard with a blurred/dimmed India map thumbnail in the background. Overlay text:

> "SwasthyaAI doesn't just answer questions — it monitors India's public health in real time."

With a "View Live Health Map →" button → `/dashboard`.

Brief stat row below: "X active alerts across Y states • Last updated Z minutes ago" (live data from `GET /v1/alerts`).

---

### Section 9 — Tech Stack Logos

"Built on AWS" section with logos of: AWS, Amazon Bedrock, Lambda, DynamoDB, Amazon Transcribe, Amazon Polly, Twilio, OpenAI, Flutter.

---

### Section 10 — Footer

Links: Live Dashboard | Admin Panel | WhatsApp Bot | GitHub Repo | Team: Neura Rangers

Disclaimer: "SwasthyaAI provides health education only. It is not a substitute for professional medical diagnosis or treatment."

---

---

# Part 2: Public Health Intelligence Dashboard (`/dashboard`) ⭐

---

## PublicDashboardPage

**The hackathon-winning centerpiece.** A publicly accessible, no-login-required page showing the state of public health across India in real time. This is what differentiates SwasthyaAI from every other health chatbot project.

**Key visual:** A full-page interactive choropleth map of India with disease outbreak intensity overlaid by state. Click any state for a drill-down. Sidebar shows active alerts feed. Top bar shows live counters.

---

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [SwasthyaAI Logo]   INDIA PUBLIC HEALTH DASHBOARD  │
│  Last updated: 5 mins ago        [Admin →] [Try →]  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  LEFT PANEL  │         INDIA MAP (choropleth)        │
│  (300px)     │                                      │
│              │   States colored by outbreak         │
│  Active       │   severity. Clickable.               │
│  Alerts feed │                                      │
│              │   Legend: [Low][Medium][High][Crit]  │
│              │                                      │
├──────────────┴──────────────────────────────────────┤
│  STAT BAR: Queries Today | Active Users | Alerts    │
│            | Escalations | Emergency Events         │
├─────────────────────────────────────────────────────┤
│  [Trend Chart: Queries 30d]  [Language Breakdown]   │
│  [Top Diseases This Week]    [Vaccination Drives]   │
└─────────────────────────────────────────────────────┘
```

---

### Subcomponent: India Choropleth Map

**Library:** `react-simple-maps` with `india.geojson` (Indian state boundaries).

**Color scale (by outbreak severity in that state):**
- No outbreaks → `#E8F5E9` (pale green)
- Low → `#A5D6A7`
- Medium → `#FFF59D` (yellow)
- High → `#FFAB40` (orange)
- Critical → `#EF5350` (red)

**State color computed from:** The highest severity active outbreak in that state from `GET /v1/admin/outbreaks?active=true` (public endpoint — no admin key needed for read-only).

**On state hover:** Tooltip showing:
- State name
- Active outbreaks count + disease names
- Active alerts count
- Number of vaccination drives scheduled

**On state click:** Opens a right `Sheet` (drawer) with:
- State name (large heading)
- Active Outbreaks: cards with disease name, cases count, trend arrow, severity badge
- Active Alerts: list with severity + title
- Upcoming Vaccination Drives in this state
- "View All Alerts" link

**Map controls:**
- Overlay toggle buttons (top-right corner of map):
  - `[Outbreaks]` (default on) — fills states by outbreak severity
  - `[Alerts]` — overlays alert indicators
  - `[Vaccination]` — shows vaccination drive pin markers
- Zoom in/out buttons
- Reset view button

---

### Subcomponent: Left Panel — Active Alerts Feed

A scrollable feed (max-height: 100% of map area) of active alerts across India, sorted by severity desc.

Each alert item:
- `SeverityBadge` + type badge
- Region name (not just code — use `REGIONS` constant to resolve)
- Title (bold, 2 lines max)
- Time ago (e.g. "3 hours ago")
- Clicking → opens same state drill-down sheet

**Header:** "Active Alerts (N)" with a pulsing red dot if any critical alerts exist.

Auto-refreshes every 5 minutes.

---

### Subcomponent: Live Stat Bar

Full-width bar below the map. 5 animated counters:

| Stat | Data source | Icon |
|------|------------|------|
| Queries Today | `GET /v1/admin/stats` → `queriesToday` | `message-circle` |
| Active Users Today | `activeUsersToday` | `users` |
| Active Alerts | count of alerts from alerts query | `bell` |
| Escalations | `escalationCount` | `alert-circle` |
| Emergency Events | `emergencyCount` | `siren` (or `alert-triangle` red) |

Each counter has a subtle count-up animation on page load.

---

### Subcomponent: Trend Charts Row

Two side-by-side charts:

**1. Query Volume — Last 30 Days** (Area chart, Recharts)
- X-axis: date, Y-axis: query count
- Fill: green gradient
- Data: `GET /v1/admin/analytics?period=30d` → `queriesByDay`

**2. Channel Breakdown** (Pie chart)
- Segments: WhatsApp / SMS / Mobile / Web
- Legend below
- Data: `channelBreakdown` from analytics

---

### Subcomponent: Top Diseases + Vaccination Drives Row

**Left: Top 5 Diseases This Week** (Horizontal bar chart)
- Disease name → bar width proportional to query count
- Data: `topQueryCategories` from stats, filtered to disease-related categories

**Right: Upcoming Vaccination Drives** (simple list)
- Location, date, vaccines offered, organizer
- "View all" link
- Data: `GET /v1/admin/vaccination-drives?upcoming=true&limit=5`

---

### Data Sources Summary (Dashboard)

All read-only. No auth required.

| Endpoint | Used for |
|----------|---------|
| `GET /v1/admin/stats` | Stat bar counters |
| `GET /v1/admin/analytics?period=30d` | Query volume chart, channel breakdown |
| `GET /v1/admin/outbreaks?active=true` | Map state coloring + left panel outbreaks |
| `GET /v1/alerts` | Left panel alerts feed |
| `GET /v1/admin/vaccination-drives?upcoming=true&limit=5` | Bottom-right section |

**Note:** The `/v1/admin/*` endpoints used here must be made accessible without an `X-Admin-Key` for read-only GET requests (the backend should allow `GET /v1/admin/stats`, `GET /v1/admin/analytics`, `GET /v1/admin/outbreaks` without admin key). Only POST/PUT/DELETE require admin key.

---

---

# Part 3: Admin Panel (`/admin/*`)

---

## AdminLayout

Collapsible left sidebar + top bar.

**Sidebar nav items:**

| Icon | Label | Route |
|------|-------|-------|
| `layout-dashboard` | Dashboard | `/admin/dashboard` |
| `bell` | Alerts | `/admin/alerts` |
| `activity` | Outbreaks | `/admin/outbreaks` |
| `users` | Users | `/admin/users` |
| `message-square` | Queries | `/admin/queries` |
| `syringe` | Vaccination | `/admin/vaccination` |
| `bar-chart-2` | Analytics | `/admin/analytics` |

**Top bar:** App logo + "Admin Panel" + region selector (for context) + "View Dashboard →" link (opens `/dashboard` in new tab).

**Admin key gate:** On mount, if `localStorage.getItem('admin_key')` is null, show a centered dialog:
- Input for admin key
- "Enter" button → saves to localStorage
- All API calls attach `X-Admin-Key: <key>`
- If a call returns 403, clear key and show dialog again

---

## AdminDashboardPage (`/admin/dashboard`)

**Data source:** `GET /v1/admin/stats`, `GET /v1/admin/analytics?period=30d`

**Row 1 — 4 stat cards:**

| Card | Value |
|------|-------|
| Total Users | `totalUsers` with "+N this week" sub-label |
| Queries Today | `queriesToday` |
| Active Alerts | count of active alerts from `GET /v1/admin/alerts?active=true` |
| Emergency Events | `emergencyCount` with red accent if > 0 |

**Row 2 — Charts (3 columns):**

1. **Queries Over Time** — Line chart, 30 days (Recharts `LineChart`)
2. **Channel Split** — Pie chart: WhatsApp / SMS / Mobile / Web
3. **Language Split** — Bar chart: EN / HI / KN / TE

**Row 3 — Tables (2 columns):**

1. **Recent Queries** (last 10) — Time, User (truncated ID), Channel, Intent, Safety flags, Query preview
2. **Active Outbreaks** (top 5 by severity) — Disease, Region, Cases, Severity badge, Trend arrow

Each table has a "View all →" link to the respective page.

---

## AdminAlertsPage (`/admin/alerts`)

**Data:**
- List: `GET /v1/admin/alerts`
- Create: `POST /v1/admin/alerts`
- Update: `PUT /v1/admin/alerts/:alertId`
- Delete: `DELETE /v1/admin/alerts/:alertId`

**Top bar:**
- "Create Alert" button (primary) → opens `CreateAlertSheet`
- Filters: Active/All toggle | Type select | Severity select

**Alerts table:**

| Column | Notes |
|--------|-------|
| Severity | `SeverityBadge` |
| Type | `outbreak` / `weather` / `health` badge |
| Title | — |
| Regions | Resolved region names (comma-separated) |
| Expires | Date + red "Expired" badge if past |
| Status | Active / Expired |
| Notifications sent | From create response (stored) |
| Actions | Edit pencil / Delete trash |

**`CreateAlertSheet` / `EditAlertSheet`** — right-side sheet with form:

| Field | Input | Validation |
|-------|-------|------------|
| Type | `Select`: Outbreak / Weather / Health | Required |
| Severity | `Select`: Critical / High / Medium / Low | Required |
| Title | `Input` | Required, max 200 chars |
| Message | `Textarea` | Required, max 2000 chars |
| Affected Regions | Multi-select from `REGIONS` list | Required, ≥1 |
| Expires At | `DateTimePicker` | Required, must be future |
| Source URL | `Input` | Optional, valid URL |

Submit → POST/PUT. On success: close sheet, invalidate query, show toast "Alert created and N notifications sent."

Delete: `ConfirmDialog` → DELETE. Toast "Alert deleted."

---

## AdminOutbreaksPage (`/admin/outbreaks`)

**Data:**
- List: `GET /v1/admin/outbreaks`
- Create: `POST /v1/admin/outbreaks`
- Update: `PUT /v1/admin/outbreaks/:outbreakId`

**Top stats row (4 cards):**
- Total active outbreaks
- Critical count (red badge)
- High count (orange badge)
- States affected (unique regionCodes count)

**Filters:** Region | Disease | Severity | Active toggle

**"Report Outbreak" button** → `CreateOutbreakSheet`:

| Field | Input |
|-------|-------|
| Disease | `Input` with datalist from `COMMON_DISEASES` |
| Region | `Select` from `REGIONS` |
| Cases | `NumberInput` |
| Severity | `Select` |
| Trend | `Select`: Rising ↑ / Falling ↓ / Stable → |
| Description | `Textarea` |
| Source | `Input` (e.g. "BBMP Health Dept") |

**Outbreaks displayed as cards** (not table — cards look more dramatic):

Each card:
- Header: disease name + region (bold, large) + severity badge
- Cases count (e.g. "342 cases") + trend indicator (colored arrow)
- Description text (2-line truncated)
- Source + date
- Footer: Edit / "Mark Resolved" buttons

"Mark Resolved" → `PUT` with `{ active: false }` → toast + invalidate.

---

## AdminUsersPage (`/admin/users`)

**Data:** `GET /v1/admin/users`

**Controls:**
- Search input (debounced 300ms) → `?search=`
- Filters: Language | Channel | Onboarding complete toggle

**Table:**

| Column | Notes |
|--------|-------|
| User ID | Truncated. Copy icon on hover. |
| Phone | Masked: `+91 98765 ×××××` |
| Language | `LanguageBadge` |
| Channels | `ChannelBadge`(s) |
| Queries | Count |
| Last Active | `RelativeTime` |
| Onboarding | `Badge`: Complete (green) / Incomplete (gray) |
| Actions | "View" link → `/admin/users/:userId` |

Pagination: 20/page. `PaginationControls`.

---

## AdminUserDetailPage (`/admin/users/:userId`)

**Data:** `GET /v1/admin/users/:userId`

Three sections (stacked vertically):

**1. Profile Card**
User ID, phone, preferred language, channels used, region, privacy settings (read-only), created/last-active dates, onboarding status.

**2. Query History Table**
Columns: Timestamp | Channel | Language | Intent | Safety Flags | Query (truncated, expand on click) | Response preview
Last 20. "Load more" button appends next 20.
Safety flags shown as small colored badges.

**3. Vaccination Profile** (if exists — else "No vaccination profile yet")
- User's vaccinations table: vaccine name, date, batch number
- Upcoming vaccines list with due dates and priority badges
- Family members accordion

---

## AdminQueriesPage (`/admin/queries`)

**Data:** `GET /v1/admin/queries`

**Filters bar:**
- Date range: `from` / `to` date pickers
- Intent: All / health_question / facility_search / vaccination_info / emergency / general_info
- Language
- Channel
- "Show flagged only" toggle (safety_flags not empty)

**Table:**

| Column | Notes |
|--------|-------|
| Time | `RelativeTime` |
| User | Truncated ID, link to user detail |
| Channel | `ChannelBadge` |
| Language | `LanguageBadge` |
| Intent | `IntentBadge` |
| Safety Flags | `SeverityBadge`-style badges: EMERGENCY (red), DIAGNOSTIC (orange), ESCALATION (yellow) |
| Query | First 80 chars |
| Response | First 80 chars |

**Row expand:** Clicking a row expands an inline drawer showing full query text + full response text + sources list + disclaimers. No separate page needed.

---

## AdminVaccinationPage (`/admin/vaccination`)

**Data:**
- Drives: `GET /v1/admin/vaccination-drives`
- Create: `POST /v1/admin/vaccination-drives`
- Update: `PUT /v1/admin/vaccination-drives/:driveId`
- Stats: from `GET /v1/admin/stats`

**Stats row (4 cards):**
- Users with vaccination profiles
- Total vaccination records logged
- Upcoming drives
- Reminders sent this week

**"Schedule Drive" button** → `CreateDriveSheet`:

| Field | Input |
|-------|-------|
| Vaccines | Multi-select from `COMMON_VACCINES` |
| Region | `Select` from `REGIONS` |
| Location name | `Input` |
| Full address | `Textarea` |
| Date | `DatePicker` |
| Time slot | `Input` (e.g. "09:00–17:00") |
| Capacity | `NumberInput` |
| Organizer | `Input` |

**Drives table:**

| Column | Notes |
|--------|-------|
| Date | — |
| Location | Name + address (2 lines) |
| Vaccines | Comma-separated |
| Region | — |
| Capacity | `registeredCount / capacity` progress bar |
| Organizer | — |
| Status | Upcoming (blue) / Ongoing (green) / Past (gray) |
| Actions | Edit / Cancel |

---

## AdminAnalyticsPage (`/admin/analytics`)

**Data:** `GET /v1/admin/analytics?period=<period>&breakdown=<type>`

**Period selector tabs:** 7d | 30d | 90d

**Charts (full-width stacked):**

**1. Queries Over Time** — Stacked area chart by channel (WhatsApp/SMS/Mobile/Web).
Data: `queriesByDay` from analytics.

**2. User Growth** — Line chart: new users/day + total cumulative.
Data: `userGrowthByDay`.

**3. Intent Distribution** — Horizontal bar chart: health_question / facility_search / vaccination_info / emergency / general_info.

**4. Language Trends Over Time** — Stacked area chart by language (EN/HI/KN/TE).

**5. Safety Events Table**

| Metric | Value |
|--------|-------|
| Total escalations | `safetyEvents.escalations` |
| Emergency events | `safetyEvents.emergencies` (red) |
| Diagnostic blocks | `safetyEvents.diagnosticBlocks` |

**6. Top Health Topics** — Word cloud style: top 10 query categories displayed as chips sized by frequency.

---

---

# Shared Components

### `StatCard`
```tsx
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: { value: number; direction: 'up' | 'down'; positive?: boolean }
  icon?: LucideIcon
  accentColor?: string
}
```
Renders shadcn `Card` with icon, large value, optional trend badge. Trend color logic: if `positive=true`, up=green/down=red; if `positive=false` (e.g. emergency count), up=red/down=green.

### `SeverityBadge`
```tsx
<SeverityBadge severity="high" />
// → orange Badge: "High"
```
Colors: `critical`=red, `high`=orange, `medium`=yellow, `low`=blue.

### `ChannelBadge`
```tsx
<ChannelBadge channel="whatsapp" />
```
Colors: whatsapp=green, sms=gray, web=blue, mobile=purple, voice=teal.

### `LanguageBadge`
```tsx
<LanguageBadge language="kn" />
// → "ಕನ್ನಡ" with flag
```

### `IntentBadge`
Colors: emergency=red, health_question=blue, vaccination_info=green, facility_search=teal, general_info=gray.

### `RelativeTime`
```tsx
<RelativeTime timestamp="2025-01-01T10:00:00Z" />
// renders: "3 hours ago"  title: "Jan 1, 2025 10:00 AM"
```

### `EmptyState`
```tsx
<EmptyState
  icon={<Bell />}
  title="No alerts found"
  description="No active health alerts in the selected region."
  action={<Button>Create Alert</Button>}
/>
```

### `ConfirmDialog`
```tsx
<ConfirmDialog
  open={open}
  title="Delete Alert"
  description="This will remove the alert and cancel notifications. This action cannot be undone."
  destructive
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
/>
```

---

# API Layer (`src/lib/api.ts`)

```ts
const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('session_token')
  const adminKey = localStorage.getItem('admin_key')
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(adminKey ? { 'X-Admin-Key': adminKey } : {}),
      ...options?.headers,
    },
  })
  const body = await res.json()
  if (!body.ok) throw new Error(body.error?.message ?? 'API Error')
  return body.data as T
}
```

**Session bootstrap** (run in `main.tsx` before render, or in a top-level component):
```ts
async function bootstrapSession() {
  const existing = localStorage.getItem('session_token')
  if (existing) return
  const data = await apiFetch<{ token: string }>('/auth/session', {
    method: 'POST',
    body: JSON.stringify({ channel: 'web' }),
  })
  localStorage.setItem('session_token', data.token)
}
```

**All API functions:**

```ts
// Stats & Analytics
export const getAdminStats = () => apiFetch<Stats>('/admin/stats')
export const getAdminAnalytics = (period = '30d') =>
  apiFetch<Analytics>(`/admin/analytics?period=${period}`)

// Users
export const listUsers = (params: URLSearchParams) =>
  apiFetch<Paginated<UserSummary>>(`/admin/users?${params}`)
export const getUserDetail = (userId: string) =>
  apiFetch<UserDetail>(`/admin/users/${userId}`)

// Queries
export const listQueries = (params: URLSearchParams) =>
  apiFetch<Paginated<QuerySummary>>(`/admin/queries?${params}`)

// Alerts
export const listAlerts = (params?: URLSearchParams) =>
  apiFetch<{ alerts: Alert[] }>(`/admin/alerts${params ? `?${params}` : ''}`)
export const createAlert = (data: CreateAlertInput) =>
  apiFetch<{ alert: Alert; notificationsSent: number }>('/admin/alerts', {
    method: 'POST', body: JSON.stringify(data),
  })
export const updateAlert = (id: string, data: Partial<CreateAlertInput>) =>
  apiFetch<{ alert: Alert }>(`/admin/alerts/${id}`, {
    method: 'PUT', body: JSON.stringify(data),
  })
export const deleteAlert = (id: string) =>
  apiFetch<void>(`/admin/alerts/${id}`, { method: 'DELETE' })

// Public alerts (no admin key)
export const getPublicAlerts = (regionCode?: string) =>
  apiFetch<{ alerts: Alert[] }>(`/alerts${regionCode ? `?regionCode=${regionCode}` : ''}`)

// Outbreaks
export const listOutbreaks = (params?: URLSearchParams) =>
  apiFetch<Paginated<Outbreak>>(`/admin/outbreaks${params ? `?${params}` : ''}`)
export const createOutbreak = (data: CreateOutbreakInput) =>
  apiFetch<Outbreak>('/admin/outbreaks', { method: 'POST', body: JSON.stringify(data) })
export const updateOutbreak = (id: string, data: Partial<CreateOutbreakInput>) =>
  apiFetch<Outbreak>(`/admin/outbreaks/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// Vaccination drives
export const listVaccinationDrives = (params?: URLSearchParams) =>
  apiFetch<Paginated<VaccinationDrive>>(`/admin/vaccination-drives${params ? `?${params}` : ''}`)
export const createDrive = (data: CreateDriveInput) =>
  apiFetch<VaccinationDrive>('/admin/vaccination-drives', {
    method: 'POST', body: JSON.stringify(data),
  })
export const updateDrive = (id: string, data: Partial<CreateDriveInput>) =>
  apiFetch<VaccinationDrive>(`/admin/vaccination-drives/${id}`, {
    method: 'PUT', body: JSON.stringify(data),
  })
```

---

# TypeScript Types (`src/types/index.ts`)

```ts
export type Language  = 'en' | 'hi' | 'kn' | 'te'
export type Channel   = 'whatsapp' | 'sms' | 'web' | 'mobile' | 'voice'
export type Intent    = 'health_question' | 'facility_search' | 'vaccination_info' | 'emergency' | 'general_info'
export type SafetyFlag = 'diagnostic_request' | 'emergency_symptoms' | 'inappropriate_content'
export type AlertType = 'outbreak' | 'weather' | 'health'
export type Severity  = 'critical' | 'high' | 'medium' | 'low'
export type Trend     = 'up' | 'down' | 'stable'
export type FacilityType = 'hospital' | 'clinic' | 'pharmacy' | 'phc' | 'chc' | 'vaccination_center'

export interface Stats {
  totalUsers: number
  activeUsersToday: number
  activeUsersWeek: number
  totalQueries: number
  queriesToday: number
  channelBreakdown: Record<Channel, number>
  languageBreakdown: Record<Language, number>
  escalationCount: number
  emergencyCount: number
  topQueryCategories: { category: string; count: number }[]
}

export interface Analytics {
  period: string
  queriesByDay: { date: string; count: number }[]
  userGrowthByDay: { date: string; newUsers: number; total: number }[]
  breakdown: {
    byLanguage: Record<Language, number>
    byChannel: Record<Channel, number>
    byIntent: Record<Intent, number>
    safetyEvents: { escalations: number; emergencies: number; diagnosticBlocks: number }
  }
}

export interface UserSummary {
  userId: string
  phoneNumber?: string
  preferredLanguage: Language
  channels: Channel[]
  queryCount: number
  onboardingComplete: boolean
  createdAt: string
  lastActive: string
}

export interface UserDetail {
  user: UserSummary & { location?: { regionCode: string; address?: string }; privacySettings: { shareLocation: boolean; allowAlerts: boolean } }
  queryHistory: QuerySummary[]
  vaccinationProfile: VaccinationProfile | null
}

export interface QuerySummary {
  queryId: string
  userId: string
  channel: Channel
  originalText: string
  language: Language
  intent: Intent
  safetyFlags: SafetyFlag[]
  timestamp: string
  responsePreview: string
}

export interface Alert {
  alertId: string
  type: AlertType
  severity: Severity
  title: string
  message: string
  regionCode: string
  affectedRegions?: string[]
  sourceUrl?: string
  createdAt: string
  expiresAt: string
  active?: boolean
}

export interface Outbreak {
  outbreakId: string
  disease: string
  regionCode: string
  regionName?: string
  cases: number
  severity: Severity
  trend: Trend
  description: string
  source: string
  reportedAt: string
  active: boolean
}

export interface VaccinationDrive {
  driveId: string
  vaccines: string[]
  regionCode: string
  location: string
  address: string
  date: string
  time: string
  capacity: number
  registeredCount: number
  organizer: string
  active: boolean
}

export interface VaccinationProfile {
  profileId: string
  dateOfBirth: string
  gender: string
  vaccinations: { vaccineId: string; vaccineName: string; dateAdministered: string; batchNumber?: string }[]
  upcomingVaccines: { vaccineId: string; vaccineName: string; dueDate: string; priority: 'high' | 'medium' | 'low' }[]
  familyMembers: { memberId: string; name: string; relationship: string; upcomingVaccines: unknown[] }[]
}

export interface Paginated<T> {
  items?: T[]
  data?: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CreateAlertInput {
  type: AlertType
  severity: Severity
  title: string
  message: string
  affectedRegions: string[]
  expiresAt: string
  sourceUrl?: string
}

export interface CreateOutbreakInput {
  disease: string
  regionCode: string
  cases: number
  severity: Severity
  trend: Trend
  description: string
  source: string
}

export interface CreateDriveInput {
  vaccines: string[]
  regionCode: string
  location: string
  address: string
  date: string
  time: string
  capacity: number
  organizer: string
}
```

---

# Constants

### `src/constants/regions.ts`

```ts
export const REGIONS = [
  { code: 'KA_BLR', name: 'Bengaluru', state: 'Karnataka', stateCode: 'KA' },
  { code: 'KA_MYS', name: 'Mysuru', state: 'Karnataka', stateCode: 'KA' },
  { code: 'TN_CHE', name: 'Chennai', state: 'Tamil Nadu', stateCode: 'TN' },
  { code: 'TN_COI', name: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN' },
  { code: 'AP_HYD', name: 'Hyderabad', state: 'Andhra Pradesh', stateCode: 'AP' },
  { code: 'AP_VJA', name: 'Vijayawada', state: 'Andhra Pradesh', stateCode: 'AP' },
  { code: 'TS_HYD', name: 'Hyderabad', state: 'Telangana', stateCode: 'TS' },
  { code: 'MH_MUM', name: 'Mumbai', state: 'Maharashtra', stateCode: 'MH' },
  { code: 'MH_PUN', name: 'Pune', state: 'Maharashtra', stateCode: 'MH' },
  { code: 'DL_DEL', name: 'Delhi', state: 'Delhi', stateCode: 'DL' },
  { code: 'UP_LKN', name: 'Lucknow', state: 'Uttar Pradesh', stateCode: 'UP' },
  { code: 'RJ_JAI', name: 'Jaipur', state: 'Rajasthan', stateCode: 'RJ' },
  { code: 'GJ_AMD', name: 'Ahmedabad', state: 'Gujarat', stateCode: 'GJ' },
  { code: 'WB_KOL', name: 'Kolkata', state: 'West Bengal', stateCode: 'WB' },
  { code: 'OR_BHU', name: 'Bhubaneswar', state: 'Odisha', stateCode: 'OR' },
]

// Map from state ISO code → array of region codes (for map coloring)
export const STATE_REGIONS: Record<string, string[]> = {
  KA: ['KA_BLR', 'KA_MYS'],
  TN: ['TN_CHE', 'TN_COI'],
  AP: ['AP_HYD', 'AP_VJA'],
  TS: ['TS_HYD'],
  MH: ['MH_MUM', 'MH_PUN'],
  DL: ['DL_DEL'],
  UP: ['UP_LKN'],
  RJ: ['RJ_JAI'],
  GJ: ['GJ_AMD'],
  WB: ['WB_KOL'],
  OR: ['OR_BHU'],
}
```

### `src/constants/diseases.ts`
```ts
export const COMMON_DISEASES = [
  'Dengue', 'Malaria', 'Cholera', 'Typhoid', 'COVID-19',
  'Influenza', 'Tuberculosis', 'Chikungunya', 'Japanese Encephalitis',
  'Leptospirosis', 'Hepatitis A', 'Acute Gastroenteritis',
  'Hand Foot Mouth Disease', 'Conjunctivitis',
]
```

### `src/constants/vaccines.ts`
```ts
export const COMMON_VACCINES = [
  'BCG', 'Hepatitis B', 'OPV (Oral Polio)', 'DPT', 'Hib',
  'IPV', 'Rotavirus', 'PCV', 'MMR', 'Typhoid', 'Hepatitis A',
  'Varicella', 'COVID-19 (Covishield)', 'COVID-19 (Covaxin)',
  'Influenza', 'Vitamin A', 'HPV', 'Meningococcal',
]
```

---

# Auth Flow Summary

**Session token** (auto, no user action):
- On app start: POST `/v1/auth/session` with `{ channel: "web" }`.
- Store token in `localStorage`. Attach to every API call.
- On 401: clear token, regenerate.

**Admin key** (manual, for admin panel):
- Stored in `localStorage.admin_key`.
- If missing on `/admin/*` route: show key-entry modal.
- Attach as `X-Admin-Key` header on all requests.
- On 403: clear key, show modal again.

---

# Local Dev Setup

```bash
# Prerequisites: Node.js 20, backend running on localhost:3000

cd web
npm install
cp .env.example .env
# Edit .env:
#   VITE_API_BASE_URL=http://localhost:3000/v1
#   VITE_ADMIN_KEY=admin-secret-here
#   VITE_OPENAI_API_KEY=sk-...

npm run dev    # Vite on http://localhost:5173
npm run build  # Production build to dist/
```

For the India map, download `india.geojson` from a public source (e.g., https://github.com/geohacker/india) and place it in `public/india.geojson`. The GeoJSON must include a `ST_CODE` or `state_code` property on each feature matching the 2-letter ISO state codes used in `STATE_REGIONS`.

---

# package.json (dependencies)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.55.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "recharts": "^2.12.0",
    "react-simple-maps": "^3.0.0",
    "framer-motion": "^11.5.0",
    "lucide-react": "^0.441.0",
    "sonner": "^1.5.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```
