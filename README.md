# Pairwise — Human-Centered Matchmaking Dashboard

> *Thoughtful matches. Human-first decisions.*

Pairwise is an internal workspace for matchmaking professionals. It helps a matchmaker keep every client's biodata and partner preferences in one place, track each client's journey stage, generate ranked and explainable match recommendations from a pool of candidates, and send a human-reviewed introduction.

Built for the **The Date Crew (TDC) Full Stack Developer Internship assessment**: "Build the Matchmaker Algo and Dashboard MVP".

**The problem.** Matchmakers manage a growing list of clients, each at a different stage. They need to see verified profiles, know where each client is, shortlist compatible people, record call notes, and introduce matches without losing context. Pairwise puts these in one tool.

**Design principle.** The algorithm assists; the matchmaker decides. Scores come from a deterministic, explainable engine, and AI is used only to draft wording that the matchmaker reviews, edits and confirms.

**Why it fits the assignment.** It covers the required login, client dashboard, full biodata view, a pool of 100+ fictional opposite-gender profiles, gender-specific matching logic, AI usage, a "Send Match" action, and notes. The extra work is in explainable scoring, a mutual (two-way) compatibility score, and persistence of match actions.

> All profiles, names, phone numbers and emails in this repository are fictional seed data. Nothing here describes real people.

---

## Table of contents

1. [Features](#features)
2. [Screenshots](#screenshots)
3. [Technology stack](#technology-stack)
4. [Architecture](#architecture)
5. [System design and UML](#system-design-and-uml)
6. [Folder structure](#folder-structure)
7. [Matching algorithm](#matching-algorithm)
8. [AI integration](#ai-integration)
9. [Database design](#database-design)
10. [API documentation](#api-documentation)
11. [Security and privacy](#security-and-privacy)
12. [Setup and installation](#setup-and-installation)
13. [Environment configuration](#environment-configuration)
14. [Seeding and demo account](#seeding-and-demo-account)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Limitations and future improvements](#limitations-and-future-improvements)
18. [Assignment deliverables](#assignment-deliverables)
19. [Research references](#research-references)

---

## Features

**Implemented**

- **Matchmaker authentication:** login with email or username, sign-up, JWT-protected API, protected frontend routes.
- **Client directory:** summary stats (total clients, verified profiles, ready for matches, follow-ups due), search, filters (journey stage, verification, gender), sorting and pagination. Each row shows name, age, gender, city, marital status, designation, income and stage tags.
- **Client profile:** full biodata (all fields requested in the brief plus diet, horoscope preference, relationship goals, hobbies, mother tongue) and stated partner preferences.
- **Journey tracking:** 11 stages (New Lead to Closed), editable from the client page; changes are written to an audit timeline.
- **Match generation:** a deterministic 5-stage engine ranks candidates with a mutual score, a label (High Potential / Promising / Needs Review), positive alignments, differences and unknowns. An optional "Strict Verified Only" mode excludes unverified candidates.
- **Introduction workflow:** a draft is generated (OpenAI, or a template when AI is unavailable), edited by the matchmaker, and confirmed with "Send Match". Sending is a mock: no email leaves the system.
- **Persistence:** matches, status (`SENT`, with timestamp), the final message, client stage changes and activity events are stored in PostgreSQL.
- **Notes:** call, meeting, follow-up and general notes per client, plus a system audit timeline.
- **Themes and layout:** light and dark themes (toggle, saved in the browser), loading, empty and error states, and a "Philosophy and Rules" page that explains the engine.

**Partial or not implemented**

- Introductions are mock-sent; there is no real email delivery.
- Match statuses `APPROVED`, `ACCEPTED`, `DECLINED`, `FEEDBACK_PENDING` and `CLOSED` exist in the schema, but there is no UI or endpoint to set them. The only transitions implemented are `SUGGESTED` to `SENT`.
- Caste, religion and horoscope preference are stored and displayed but are **not used in scoring**. Free-text `dealbreakers` are stored and displayed but are not enforced by the engine (only age bounds and preferred marital status are hard filters).
- No deployment, automated frontend tests, or integration tests (see [Testing](#testing) and [Deployment](#deployment)).

---

## Screenshots

All images are in [`screenshots/`](screenshots/). Customer-level screens were captured in the light theme only; the landing, authentication and dashboard screens are shown in both themes.

### Landing page
<table>
<tr><td valign="top"><img src="screenshots/image2.jpeg" alt="Pairwise landing page, light theme" width="440"><br><sub><b>Landing — light.</b> Hero with an illustrative recommendation graph.</sub></td><td valign="top"><img src="screenshots/image1.jpeg" alt="Pairwise landing page, dark theme" width="440"><br><sub><b>Landing — dark.</b> Same page in the dark theme.</sub></td></tr>
<tr><td valign="top"><img src="screenshots/image9.jpeg" alt="Compatibility explained section, light theme" width="440"><br><sub><b>Compatibility, explained (light).</b> Two illustrative profiles and why they might work.</sub></td><td valign="top"><img src="screenshots/image5.jpeg" alt="Compatibility explained section, dark theme" width="440"><br><sub><b>Compatibility, explained (dark).</b></sub></td></tr>
<tr><td valign="top"><img src="screenshots/image10.jpeg" alt="Illustrative recommendation preview, light theme" width="440"><br><sub><b>Recommendation preview (light).</b> Score with Aligned / Differences / Still unknown (fictional data).</sub></td><td valign="top"><img src="screenshots/image6.jpeg" alt="Illustrative recommendation preview, dark theme" width="440"><br><sub><b>Recommendation preview (dark).</b></sub></td></tr>
<tr><td valign="top"><img src="screenshots/image3.jpeg" alt="How Pairwise works, light theme" width="440"><br><sub><b>How it works (light).</b> Three-step workflow.</sub></td><td valign="top"><img src="screenshots/image4.jpeg" alt="How Pairwise works, dark theme" width="440"><br><sub><b>How it works (dark).</b></sub></td></tr>
<tr><td valign="top"><img src="screenshots/image7.jpeg" alt="Our approach section: Algorithms assist, people decide" width="440"><br><sub><b>Our approach.</b> Explainable, human-reviewed matching.</sub></td><td valign="top"><img src="screenshots/image12.jpeg" alt="Landing page call to action and footer, light theme" width="440"><br><sub><b>Call to action and footer (light).</b></sub></td></tr>
</table>

### Authentication
<table>
<tr><td valign="top"><img src="screenshots/image16.jpeg" alt="Login page, light theme" width="440"><br><sub><b>Login — light.</b> Email or username and password, with a demo-credentials helper.</sub></td><td valign="top"><img src="screenshots/image15.jpeg" alt="Login page, dark theme" width="440"><br><sub><b>Login — dark.</b></sub></td></tr>
<tr><td valign="top"><img src="screenshots/image13.jpeg" alt="Create account page, light theme" width="440"><br><sub><b>Sign up — light.</b> Matchmaker account creation.</sub></td><td valign="top"><img src="screenshots/image14.jpeg" alt="Create account page, dark theme" width="440"><br><sub><b>Sign up — dark.</b></sub></td></tr>
</table>

### Client directory (dashboard)
<table>
<tr><td valign="top"><img src="screenshots/image17.jpeg" alt="Client directory dashboard, light theme" width="440"><br><sub><b>Dashboard — light.</b> Summary stats, search, filters, and client rows with age, marital status and stage tags.</sub></td><td valign="top"><img src="screenshots/image18.jpeg" alt="Client directory dashboard, dark theme" width="440"><br><sub><b>Dashboard — dark.</b></sub></td></tr>
<tr><td valign="top"><img src="screenshots/image35.jpeg" alt="Dashboard filtered by stage, verification and gender" width="440"><br><sub><b>Filtered view.</b> Stage, verification and gender filters applied.</sub></td><td></td></tr>
</table>

### Customer profile and recommendations (light theme)
<table>
<tr><td valign="top"><img src="screenshots/image23.jpeg" alt="Customer profile before matches are generated" width="440"><br><sub><b>Before generation.</b> Empty state with the Generate Ranked Matches action.</sub></td><td valign="top"><img src="screenshots/image25.jpeg" alt="Ranked match recommendations for a male client" width="440"><br><sub><b>Ranked matches.</b> Mutual score, directional scores and positive alignment.</sub></td></tr>
<tr><td valign="top"><img src="screenshots/image30.jpeg" alt="Match recommendations for another client" width="440"><br><sub><b>Match detail.</b> Explanation, alignment chips and Send Match.</sub></td><td valign="top"><img src="screenshots/image26.jpeg" alt="Strict Verified Only option enabled" width="440"><br><sub><b>Strict Verified Only.</b> Re-runs the engine excluding unverified candidates.</sub></td></tr>
<tr><td valign="top"><img src="screenshots/image27.jpeg" alt="Complete biodata tab" width="440"><br><sub><b>Biodata and preferences.</b> Personal, education and career details.</sub></td><td valign="top"><img src="screenshots/image28.jpeg" alt="Future plans, values and stated partner preferences" width="440"><br><sub><b>Values and preferences.</b> Children, relocation, pets, diet and partner preferences.</sub></td></tr>
</table>

### Notes, introductions and journey stage (light theme)
<table>
<tr><td valign="top"><img src="screenshots/image29.jpeg" alt="Notes and activity history tab" width="440"><br><sub><b>Notes and activity.</b> Log type, note field and system audit timeline.</sub></td><td valign="top"><img src="screenshots/image31.jpeg" alt="Review and prepare introduction modal" width="440"><br><sub><b>Review and send.</b> Editable draft with human-in-the-loop confirmation.</sub></td></tr>
<tr><td valign="top"><img src="screenshots/image32.jpeg" alt="Match marked as Intro Sent" width="440"><br><sub><b>After sending.</b> Match shows Intro Sent; the client stage updates.</sub></td><td valign="top"><img src="screenshots/image33.jpeg" alt="Resend or edit intro button on a sent match" width="440"><br><sub><b>Sent match.</b> Resend / Edit Intro action and areas for discussion.</sub></td></tr>
<tr><td valign="top"><img src="screenshots/image34.jpeg" alt="Journey stage dropdown" width="440"><br><sub><b>Journey stage.</b> The 11 stages a matchmaker can set manually.</sub></td><td valign="top"><img src="screenshots/image19.jpeg" alt="Philosophy and Rules page, the five stages" width="440"><br><sub><b>Philosophy &amp; Rules.</b> In-app explanation of the five stages.</sub></td></tr>
<tr><td valign="top"><img src="screenshots/image20.jpeg" alt="Scoring dimensions, 100 points per direction" width="440"><br><sub><b>Scoring dimensions.</b> Seven weighted dimensions.</sub></td><td valign="top"><img src="screenshots/image21.jpeg" alt="Stated preferences, where AI helps, human review" width="440"><br><sub><b>AI and human review.</b> What AI does and does not do.</sub></td></tr>
</table>

---

## Technology stack

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| Frontend | React 18, TypeScript, Vite | Single-page application and build tooling |
| Routing | React Router v7 | Public and protected routes |
| Data fetching | TanStack Query | Server-state caching for lists, profiles and matches |
| Styling | Tailwind CSS, lucide-react icons | UI, light and dark themes |
| Backend | Node.js, Express 4, TypeScript (run with `tsx`) | REST API |
| Validation (server) | Zod | Request validation on auth, notes, customer update and send-match |
| Database and ORM | PostgreSQL, Prisma 6 with `@prisma/adapter-pg` and `pg` | Persistence |
| Local database | PGlite via `pglite-server` (`scripts/start-db.js`) | Zero-install PostgreSQL for development |
| Authentication | `jsonwebtoken`, `bcryptjs` | JWT sessions and password hashing |
| AI | OpenAI Node SDK, model `gpt-4o-mini` | Introduction draft and explanation text |
| Testing | Vitest | Unit tests for the engine and AI fallback |

---

## Architecture

**Frontend.** A React single-page app. `services/api.ts` wraps `fetch`, adds the `Authorization: Bearer` header from the saved token, and TanStack Query caches the responses. `AuthContext` holds the signed-in matchmaker; `ProtectedRoute` in `App.tsx` redirects anonymous visitors to `/login`.

**Backend.** An Express app (`app.ts`) with CORS, JSON parsing, a health endpoint, three routers (`/api/auth`, `/api/customers`, `/api/matches`) and a central error handler. Controllers validate input and call services. `matchingEngine.ts` is pure TypeScript with no database access. `aiService.ts` is the only code that talks to OpenAI.

**Database.** PostgreSQL through Prisma stores matchmakers, customers, partner preferences, notes, matches and activity events.

**Typical request: "Generate Ranked Matches".** The browser calls `POST /api/customers/:id/matches/generate` with the JWT. Middleware verifies the token, the controller checks the matchmaker may access the client, loads the client and the opposite-gender candidate pool from Prisma, runs the engine, upserts the results into `Match`, writes an activity event, and returns the ranked list. OpenAI is not involved in this step.

```mermaid
flowchart LR
    UI["Browser: React UI"] --> API["API client (services/api.ts)"]
    API -->|"HTTPS JSON + Bearer token"| EX["Express REST API"]
    EX --> MW["CORS, JSON parser, JWT auth middleware"]
    MW --> CT["Controllers (Zod validation)"]
    CT --> ME["Matching engine (deterministic)"]
    CT --> AI["AI service"]
    CT --> PR["Prisma ORM"]
    PR --> PG[("PostgreSQL")]
    AI -->|"draft request"| OA["OpenAI API (optional)"]
    AI -.->|"on missing key or failure"| FB["Template fallback"]
    PG --> PR
    PR --> CT
    CT -->|"JSON response"| UI
```

---

## System design and UML

### Diagram 1 — System architecture

See the diagram in [Architecture](#architecture).

### Diagram 2 — Use-case view

A flowchart used as a use-case view (not formal UML notation).

```mermaid
flowchart LR
    MM(["Matchmaker"])
    subgraph Pairwise
        UC1["Sign up / log in"]
        UC2["View client directory"]
        UC3["Search, filter and sort clients"]
        UC4["Review client profile and preferences"]
        UC5["Set journey stage"]
        UC6["Add and read notes"]
        UC7["Generate ranked matches"]
        UC8["Inspect score and explanation"]
        UC9["Generate, edit and confirm introduction"]
    end
    MM --> UC1
    MM --> UC2
    MM --> UC3
    MM --> UC4
    MM --> UC5
    MM --> UC6
    MM --> UC7
    MM --> UC8
    MM --> UC9
    UC7 -.->|"includes"| UC8
    UC9 -.->|"extends"| UC8
```

### Diagram 3 — Entity relationship diagram

Derived from `prisma/schema.prisma` (key fields only).

```mermaid
erDiagram
    MATCHMAKER ||--o{ CUSTOMER : "manages (optional)"
    MATCHMAKER ||--o{ NOTE : writes
    MATCHMAKER ||--o{ ACTIVITY_EVENT : triggers
    CUSTOMER ||--o| PARTNER_PREFERENCES : has
    CUSTOMER ||--o{ NOTE : receives
    CUSTOMER ||--o{ MATCH : "is seeker in"
    CUSTOMER ||--o{ MATCH : "is candidate in"
    CUSTOMER ||--o{ ACTIVITY_EVENT : logs

    MATCHMAKER {
        string id PK
        string email UK
        string username UK
        string password "bcrypt hash"
        string name
    }
    CUSTOMER {
        string id PK
        string matchmakerId FK "nullable"
        string firstName
        string lastName
        enum gender
        date dateOfBirth
        string city
        float height
        string email UK
        float income
        enum maritalStatus
        enum wantChildren
        enum openToRelocation
        enum openToPets
        enum journeyStage
        enum verificationStatus
    }
    PARTNER_PREFERENCES {
        string id PK
        string customerId FK "unique"
        int preferredAgeMin
        int preferredAgeMax
        float preferredHeightMin
        float preferredHeightMax
        string[] preferredCities
        string[] dealbreakers
    }
    NOTE {
        string id PK
        string customerId FK
        string matchmakerId FK
        string content
        enum category
    }
    MATCH {
        string id PK
        string customerId FK
        string candidateId FK
        float overallScore
        float customerToCandidateScore
        float candidateToCustomerScore
        string compatibilityLabel
        enum status
        string introductionDraft
        datetime sentAt
    }
    ACTIVITY_EVENT {
        string id PK
        string customerId FK
        string matchmakerId FK "nullable"
        string eventType
        string description
        json metadata
    }
```

### Diagram 4 — Authentication sequence

```mermaid
sequenceDiagram
    actor M as Matchmaker
    participant UI as React UI
    participant API as Express API
    participant DB as PostgreSQL

    M->>UI: Enter email or username and password
    UI->>API: POST /api/auth/login
    API->>API: Validate body with Zod
    API->>DB: Find matchmaker by email or username
    DB-->>API: Matchmaker record
    API->>API: bcrypt.compare(password, hash)
    alt valid credentials
        API->>API: Sign JWT (expires in 7 days)
        API-->>UI: 200 token and user
        UI->>UI: Save token in browser storage
        UI->>API: GET /api/customers with Bearer token
        API->>API: authenticateToken verifies JWT
        API-->>UI: 200 customer list
    else invalid credentials
        API-->>UI: 401 Invalid credentials
    end
```

### Diagram 5 — Matching and introduction sequence

```mermaid
sequenceDiagram
    actor M as Matchmaker
    participant UI as React UI
    participant API as Express API
    participant ENG as Matching engine
    participant DB as PostgreSQL
    participant AI as AI service
    participant OAI as OpenAI

    M->>UI: Click Generate Ranked Matches
    UI->>API: POST /api/customers/:id/matches/generate
    API->>DB: Check access, load customer and candidate pool
    DB-->>API: Customer and candidates with preferences
    API->>ENG: generateRecommendations()
    ENG->>ENG: A. Eligibility filters
    ENG->>ENG: B. Directional scores, both ways
    ENG->>ENG: C. Mutual score
    ENG->>ENG: D. Label and explanation, E. Ranking
    ENG-->>API: Ranked recommendations
    API->>DB: Upsert matches, log activity
    API-->>UI: Recommendations

    M->>UI: Click Send Match
    UI->>API: POST /api/matches/:id/draft
    API->>AI: generateAIIntroductionDraft()
    alt API key set and call succeeds
        AI->>OAI: Grounded prompt (profile facts and engine output)
        OAI-->>AI: JSON with draft and explanation
    else no key, timeout, error or invalid JSON
        AI->>AI: Use deterministic template
    end
    AI-->>API: Draft
    API->>DB: Save draft
    API-->>UI: Draft shown in editable modal
    M->>UI: Edit and confirm
    UI->>API: POST /api/matches/:id/send
    API->>DB: Mark SENT only if still SUGGESTED or APPROVED
    API->>DB: Set stage Introduction Sent, log activity
    API-->>UI: Confirmation
```

---

## Folder structure

```text
Pairwise/
├── README.md
├── package.json                  # root scripts + Prisma / pglite-server dev dependencies
├── .env.example                  # documented environment variables
├── .gitignore
├── scripts/
│   └── start-db.js               # local embedded PostgreSQL (PGlite) on port 5432
├── prisma/
│   ├── schema.prisma             # data model (shared by backend and seed)
│   └── seed.ts                   # demo matchmaker + fictional customers / candidates
├── screenshots/                  # product screenshots used in this README
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts             # entry point (loads .env, starts Express)
│       ├── app.ts                # CORS, JSON parsing, health check, routers, error handler
│       ├── config/
│       │   ├── prisma.ts         # PrismaClient with the pg driver adapter
│       │   └── jwt.ts            # JWT secret resolution
│       ├── middleware/
│       │   ├── auth.ts           # Bearer-token verification
│       │   └── errorHandler.ts   # central error handler (Zod -> 400)
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   ├── customerRoutes.ts
│       │   └── matchRoutes.ts
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── customerController.ts
│       │   ├── noteController.ts
│       │   └── matchController.ts
│       ├── services/
│       │   ├── matchingEngine.ts       # deterministic 5-stage matching engine
│       │   ├── matchingEngine.test.ts
│       │   ├── aiService.ts            # OpenAI draft generation + template fallback
│       │   └── aiService.test.ts
│       ├── utils/access.ts       # customer-access check
│       └── types/index.ts
└── frontend/
    ├── package.json
    ├── vite.config.ts            # dev server on :5173, /api proxy to :5000
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx               # routes + protected-route wrapper
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── CustomerDetailPage.tsx
        │   └── PhilosophyPage.tsx
        ├── components/           # AppLayout, Navbar, AuthShell, Badge, StatCard,
        │                         # NotesSection, SendMatchModal, ThemeToggle, PairwiseLogo
        ├── context/              # AuthContext, ThemeContext
        ├── services/api.ts       # fetch wrapper (adds Bearer token)
        ├── hooks/useReveal.ts
        └── types/index.ts
```

Key entry points:

- `backend/src/server.ts` starts the server; `backend/src/app.ts` wires middleware and routers.
- `backend/src/services/matchingEngine.ts` contains all matching logic; `aiService.ts` contains all AI logic.
- `prisma/schema.prisma` is the single data model; `prisma/seed.ts` creates the demo data.
- `frontend/src/App.tsx` defines routes; `pages/` holds the screens; `services/api.ts` is the only place that calls the API.

---

## Matching algorithm

The engine lives in `backend/src/services/matchingEngine.ts`. It is deterministic: the same data always gives the same ranking. It estimates fit to support a matchmaker's judgment; it is **not** a validated predictor of relationship success.

### Stage A — Eligibility (hard filters)

A candidate is removed before scoring if any of these is true:

1. The candidate is the customer.
2. The candidate's journey stage is `CLOSED`.
3. The candidate was already introduced (`SENT`), declined or closed for this customer.
4. "Strict Verified Only" is on and the candidate is not `VERIFIED`.
5. The candidate is not of the opposite gender (the engine supports male-seeking-female and female-seeking-male).
6. The candidate's age is outside the customer's preferred age range, or the customer's age is outside the candidate's range.
7. The customer lists preferred marital statuses and the candidate's is not among them.

### Stage B — Directional score (0 to 100)

Each direction is scored separately (customer to candidate, then candidate to customer) across seven dimensions:

| Dimension | Max | How it is scored |
| :--- | ---: | :--- |
| Relationship goals and values | 15 | Same stated goal 15; different 8; unstated 7 |
| Children and family | 15 | Same answer 15; one side "Maybe" 10; direct Yes/No clash 0; unknown 7 |
| Location and relocation | 15 | Same or preferred city 15; either side open to relocate 11; "Maybe" 8; otherwise 3 |
| Career, education and income | 15 | Education, profession and income points (capped at 15); see gender rules below |
| Language and culture | 10 | Shared mother tongue and language 10; shared language 8; none 3 |
| Age and height | 15 | Age (up to 8) plus height (up to 7), against stated ranges or gender defaults |
| Lifestyle, diet and pets | 15 | Diet (up to 6) plus pets (up to 5) plus shared hobbies (up to 4) |

```text
DirectionalScore(A→B) = min(100, Σ dimension points)
```

Missing data never earns full marks. It receives a middling value and is listed under "unknowns" for the matchmaker.

### Stage C — Mutual score

```text
mutual = round( sqrt( score(A→B) × score(B→A) ) − penalty )
penalty = 0.2 × ( |score(A→B) − score(B→A)| − 25 )   if the gap exceeds 25, otherwise 0
```

The geometric mean stops a very high score in one direction hiding a poor one in the other. It is 0 if either direction is 0, and is clamped to 0–100.

### Stage D — Label and explanation

`High Potential` (80 and above), `Promising` (65 to 79), `Needs Review` (below 65). Each result carries positive alignments, potential mismatches, unknowns and a one-paragraph explanation built from those lists. These explanations come from the engine, not from AI.

### Stage E — Ranking

Sort by mutual score (descending). Ties are broken by the higher of the two directions' minimum score, then `VERIFIED` before others, then candidate ID so the order is stable. Results are limited to 20 by default.

### Gender-specific logic (assessment requirement)

- **Male customers.** The brief asks for women who are younger, shorter, earn less and have matching views on children. Alongside the dimension scores above, an always-on adjustment is applied in the male-to-female direction: a candidate who is older loses 8 points, one who is not shorter loses 6, and one who earns more loses 5. Each violation is shown to the matchmaker as a difference. Children alignment is a full 15-point dimension.
- **Female customers.** The brief asks for thoughtful logic. The engine emphasises career standing (a candidate earning at least 80% of her income scores well), profession, education, relocation openness and values, with peer-or-slightly-older age and peer-or-taller height as defaults.
- **Stated preferences.** A customer's explicit age range, height range, preferred cities, preferred education or professions, minimum income, diet list and children preference are used in the dimension scores. The male core rule above is applied on top of them because the brief states it as a requirement.

### Assumptions and limitations

- These heuristics are the assessment's brief, not a claim about what makes a good match. They are default signals that a matchmaker should read as context, and every difference is visible in the explanation.
- Income, height, age, caste, religion and gender say nothing about a person's worth. Caste, religion and horoscope preference are stored and shown but **do not affect scores**.
- Free-text `dealbreakers` are displayed but not enforced.
- Hobby and diet matching is simple string comparison.
- Weights are design choices for the MVP, not statistically calibrated.

---

## AI integration

**Where.** `backend/src/services/aiService.ts`, called by `POST /api/matches/:id/draft`. Model: `gpt-4o-mini`, 10-second timeout, JSON-mode response, `temperature` 0.7, `max_tokens` 500.

**What AI does.** It returns two things: a short match explanation and an introduction email draft addressed to the customer.

**What AI does not do.** It does not score, rank or filter candidates. The prompt states the engine's score and forbids changing it.

**What is sent.** First name, last name, city, designation, company and relationship goal of the customer; and for the candidate, name, age, city, degree and college, designation, company, diet and hobbies; plus the engine's score, label, positive alignments and differences. Contact details (email, phone), income, caste and religion are not sent.

**Grounding and validation.** The prompt tells the model to use only the supplied facts, not to invent details, and not to make exaggerated claims. The response must be valid JSON containing both `draftMessage` and `matchExplanation`; otherwise the fallback is used. There is no further semantic check of the text, so the human review step matters.

**Fallback.** If `OPENAI_API_KEY` is missing or empty, the call fails, times out, or returns unusable JSON, a deterministic template draft is produced from the same facts. In the UI this is labelled "Deterministic Template" (see the Send Match screenshot). The backend response includes `source: 'ai' | 'fallback'`.

**Human review.** The draft opens in an editable modal. Nothing is recorded until the matchmaker clicks "Confirm & Send Mock Introduction", and the edited text is what gets saved.

> The screenshots in this repository show the template fallback. The OpenAI path has not been exercised with a real key in the captured screens.

---

## Database design

PostgreSQL with Prisma (`prisma/schema.prisma`). The backend connects through the `pg` driver adapter. See [Diagram 3](#diagram-3--entity-relationship-diagram).

| Model | Purpose |
| :--- | :--- |
| `Matchmaker` | Staff account (unique email and username, bcrypt-hashed password) |
| `Customer` | A client or candidate profile: biodata, career, lifestyle, `journeyStage`, `verificationStatus`. `matchmakerId` is optional, so seeded candidates are unassigned |
| `PartnerPreferences` | One-to-one with `Customer`: age and height ranges, preferred cities, education, professions, income minimum, diet, religions, marital statuses, dealbreakers |
| `Note` | A matchmaker's note on a customer (`CALL`, `MEETING`, `FOLLOW_UP`, `GENERAL`) |
| `Match` | A seeker and candidate pair with directional and mutual scores, label, reasons, mismatches, unknowns, status, draft and `sentAt` |
| `ActivityEvent` | Audit trail: notes added, matches generated, introductions sent, stage changes |

**Constraints and indexes.** `Match` has a unique pair `(customerId, candidateId)`, so re-running the engine updates rather than duplicates. `Customer.email`, `Matchmaker.email` and `Matchmaker.username` are unique, and `PartnerPreferences.customerId` is unique. Indexes cover customer `matchmakerId`, `gender`, `city`, `journeyStage` and `verificationStatus`, plus match `customerId`, `candidateId` and `status`. Child rows (`Note`, `Match`, `PartnerPreferences`, `ActivityEvent`) cascade on customer deletion.

**Enums.** `JourneyStage` (11 values), `VerificationStatus`, `MatchStatus` (7 values, only `SUGGESTED` and `SENT` are reachable in the UI), `NoteCategory`, `MaritalStatus`, `DecisionChoice` (`YES`, `NO`, `MAYBE`) and `Gender`.

---

## API documentation

Base path `/api`. Protected routes need `Authorization: Bearer <token>`. Errors return `{ "error": "..." }`; validation failures return 400 with field details.

| Method | Endpoint | Purpose | Auth | Notes |
| :--- | :--- | :--- | :---: | :--- |
| GET | `/health` | Health check | No | `{ status, timestamp, service }` |
| POST | `/auth/login` | Sign in | No | Body: `identifier`, `password`. Returns token and user |
| POST | `/auth/register` | Create matchmaker | No | Body: `name`, `email`, `username`, `password` (8 to 72 chars). 409 if taken |
| GET | `/auth/me` | Current matchmaker | Yes | |
| GET | `/customers` | List clients | Yes | Query: `search`, `journeyStage`, `verificationStatus`, `gender`, `city`, `sortBy`, `sortOrder`, `page`, `limit` (max 100). Returns data, pagination and stats |
| GET | `/customers/:id` | Full profile | Yes | Includes preferences, notes, matches and activity events |
| PATCH | `/customers/:id` | Update stage or verification | Yes | Zod-validated; logs an activity event on stage change |
| GET | `/customers/:id/notes` | List notes | Yes | Newest first |
| POST | `/customers/:id/notes` | Add note | Yes | Body: `content`, `category`. Updates last contact date |
| GET | `/customers/:id/matches` | Stored matches | Yes | Ordered by score |
| POST | `/customers/:id/matches/generate` | Run the engine | Yes | Body (optional): `requireVerifiedOnly`, `limit`. Persists results |
| GET | `/matches/:id` | One match | Yes | |
| POST | `/matches/:id/draft` | Generate draft | Yes | 409 if already sent. Saves the draft |
| POST | `/matches/:id/send` | Confirm mock send | Yes | Body: `introductionMessage` (min 10 chars). 409 if already sent |

Not implemented: endpoints to approve, accept, decline or close a match, to edit or delete notes, and to create customers.

---

## Security and privacy

**Implemented**

- Passwords are hashed with bcrypt; plain text is never stored. Login errors do not reveal whether the account exists.
- JWTs expire after 7 days. In production the server throws instead of using a fallback secret when `JWT_SECRET` is not set (in development it uses an insecure built-in default).
- All `/customers` and `/matches` routes require a valid token, and every customer-scoped action runs an access check (`utils/access.ts`).
- Request bodies for auth, notes, stage updates and sending are validated with Zod; a central handler returns safe errors.
- The OpenAI key is read only on the server and never sent to the browser. Contact details and income are left out of AI prompts.
- Sending is guarded against duplicates: the status update is atomic and only succeeds from `SUGGESTED` or `APPROVED`.
- CORS allows only `CLIENT_URL` and local development origins.
- Seed data is entirely fictional.

**Known gaps (recommended future work)**

- A matchmaker can access customers assigned to them **and unassigned customers**. This is deliberate in the MVP so the candidate pool is browsable, but it means matchmakers share the unassigned pool.
- Sign-up is open to anyone, with no rate limiting or email verification.
- The token is kept in browser local storage and there are no refresh tokens, security headers (for example Helmet) or login attempt limits.
- Phone and email are shown unmasked in the matchmaker UI.
- The application has not had a security audit and should not be considered production-secure.

---

## Setup and installation

**Prerequisites:** Node.js 18 or newer (tested on Node 22), npm, and either the bundled local database or any PostgreSQL instance. The project uses npm (`package-lock.json` files are present).

This is not an npm workspace. The root, `backend/` and `frontend/` each have their own `package.json`, and each needs `npm install`.

```powershell
git clone <GITHUB_REPOSITORY_URL>
cd Pairwise
npm install
cd backend
npm install
npm uninstall @prisma/client prisma
cd ..\frontend
npm install
cd ..
```

The `npm uninstall` line is intentional: Prisma and its client are installed once at the repository root, and a second copy in `backend/` causes a duplicate-client error ("@prisma/client did not initialize").

Create the environment files (see [Environment configuration](#environment-configuration)):

```powershell
copy .env.example .env
copy .env.example backend\.env
```

**Terminal 1: database (leave running)**

```powershell
node scripts/start-db.js
```

**Terminal 2: schema, seed and backend**

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tdc_matchmaking?schema=public"
npx prisma generate --schema=./prisma/schema.prisma
npx prisma db push --schema=./prisma/schema.prisma
cd backend
npx tsx ../prisma/seed.ts
npm run dev
```

The API listens on `http://localhost:5000`. After the first run, `npm run dev` in `backend/` is enough (set `DATABASE_URL` again in any new terminal).

**Terminal 3: frontend**

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173`. In development Vite proxies `/api` to port 5000.

**Production builds**

```powershell
cd frontend
npm run build
cd ..\backend
npm run build
npm start
```

> Schema changes here use `prisma db push`; the repository has no migration files.

---

## Environment configuration

Defined in [`.env.example`](.env.example). Copy it to `.env` (root) and `backend/.env`. Never commit real values.

| Variable | Purpose | Required | Used by |
| :--- | :--- | :---: | :--- |
| `PORT` | API port (default 5000) | Optional | Backend |
| `NODE_ENV` | `development` or `production` | Optional | Backend |
| `DATABASE_URL` | PostgreSQL connection string | Yes | Backend, Prisma, seed |
| `JWT_SECRET` | Signing secret for tokens (required when `NODE_ENV=production`) | Yes in production | Backend |
| `JWT_EXPIRES_IN` | Listed in `.env.example`, but the code currently fixes expiry at 7 days | Not read | — |
| `OPENAI_API_KEY` | Enables AI drafts; if empty the template fallback is used | Optional | Backend |
| `CLIENT_URL` | Allowed CORS origin (the frontend URL) | Yes in production | Backend |
| `VITE_API_URL` | Base URL of the deployed backend, set at frontend build time | Yes when frontend and backend are on different hosts | Frontend |

Example placeholders:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tdc_matchmaking?schema=public"
JWT_SECRET="change-me-to-a-long-random-string"
OPENAI_API_KEY=""
CLIENT_URL="http://localhost:5173"
```

---

## Seeding and demo account

`prisma/seed.ts` creates a demo matchmaker, a small set of assigned demo clients, and two pools of unassigned fictional candidates:

- **110 female** and **110 male** candidate profiles, generated from lists of names, cities, colleges, companies and designations, each with partner preferences. This exceeds the brief's "at least 100 opposite-gender profiles" for clients of either gender.
- A few assigned demo clients at different journey stages, plus sample notes.

With the seed applied, the dashboard shows 225 profiles (see the dashboard screenshots).

| Field | Value |
| :--- | :--- |
| Email | `demo@thedatecrew.com` |
| Username | `matchmaker_demo` |
| Password | `matchmaker123` |

These are fictional demo credentials defined in the seed script. The login page also has a "Fill credentials" shortcut.

**Repeatable, but destructive:** the seed first deletes all activity events, matches, notes, preferences, customers and matchmakers, then recreates them. Running it again resets the demo data to a known state, and also deletes any account created through sign-up.

**Demo limitations:** seeded caste and religion are empty (shown as "Not specified"), and all data is synthetic and patterned, so some profiles look similar.

---

## Testing

| Command | Where | What it does |
| :--- | :--- | :--- |
| `npm test` | `backend/` | Runs Vitest (15 tests) |
| `npm run build` | `frontend/` | Type-checks (`tsc -b`) and builds with Vite |
| `npm run build` | `backend/` | Compiles with `tsc` |

**Tested:** eligibility filters (self, closed, age bounds, same gender), directional scoring and the male core rule (older, taller, higher-earning candidates lose points; not applied in the female direction), missing-data handling, mutual score and asymmetry penalty, ranking, and the AI fallback when no key is set.

**Last verified result:** 15 of 15 backend tests pass, and the frontend production build succeeds. The backend `tsc` build was not re-verified in the environment used to prepare this README.

**Not covered:** HTTP route tests, database integration tests, frontend component or end-to-end tests, the live OpenAI call, accessibility audits, and formal responsive testing. There is no lint script.

---

## Deployment

**Status: not deployed, and no deployment configuration is in the repository.** Live URL: `<DEPLOYED_FRONTEND_URL>` (placeholder).

Suggested approach for this architecture:

1. **Database.** Create a hosted PostgreSQL database (for example Neon or Supabase) and copy its connection string. Locally, run `npx prisma db push --schema=./prisma/schema.prisma` and the seed against it with `DATABASE_URL` set.
2. **Backend** (for example Render or Railway). Build: install root and backend dependencies, then `npx prisma generate --schema=./prisma/schema.prisma` and `npm run build` in `backend/`. Start: `npm start` in `backend/`. Set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (the frontend URL, with no trailing slash) and optionally `OPENAI_API_KEY`. Check `GET /api/health`.
3. **Frontend** (for example Vercel or Netlify). Root directory `frontend/`, build command `npm run build`, output `dist`. Set `VITE_API_URL` to the backend URL. Add an SPA rewrite so all routes serve `index.html`.
4. **CORS.** `CLIENT_URL` must exactly match the deployed frontend origin.

These steps are guidance and have not been run for this project.

---

## Limitations and future improvements

**Current limitations**

- Mock email only; no delivery, tracking or replies.
- Match lifecycle stops at `SENT` in the UI.
- Caste, religion, horoscope and free-text dealbreakers are not part of scoring or filtering.
- Gender-specific defaults reflect the assignment brief and are simplistic; weights are not calibrated against outcomes.
- Heuristic string matching for diet, hobbies and professions.
- Limited automated test coverage (engine and AI fallback only).
- Open sign-up, shared unassigned pool, no rate limiting.
- Customer-level screens were captured in light theme only.

**Possible future work**

- Complete the match lifecycle (approve, accepted, declined, feedback) and feed feedback back into scoring.
- Configurable per-client dimension weights and enforceable dealbreakers.
- Route and integration tests, end-to-end tests and an accessibility pass.
- Real email delivery, audit-log views, security headers and rate limiting, and operational monitoring.

---

## Assignment deliverables

### Requirement coverage

| Requirement | Status | Where |
| :--- | :---: | :--- |
| Matchmaker login (username/password) | Implemented | `authController.ts`, `LoginPage.tsx`; sign-up also provided |
| Dashboard of assigned customers with name, age, city, marital status, status tag | Implemented | `DashboardPage.tsx`. Also lists unassigned profiles (see limitations) |
| Click through to detailed matchmaking view | Implemented | `CustomerDetailPage.tsx` |
| Required biodata fields | Implemented | Detail view and `Customer` model |
| Extra Indian-matchmaking fields | Implemented | Diet, horoscope preference, relationship goals, hobbies, mother tongue, partner preferences |
| 100+ fictional opposite-gender profiles | Implemented | `seed.ts`: 110 female and 110 male candidates |
| Gender-specific matching (male: younger, earns less, shorter, children; female: profession, values, relocation) | Implemented | `matchingEngine.ts`; see [Matching algorithm](#matching-algorithm) |
| Scoring, ranking and explanations | Implemented | Mutual score, labels, alignments, differences, unknowns |
| AI usage | Implemented | OpenAI intro and explanation drafts with fallback. Real-key path not captured in screenshots |
| "Send Match" action with profile info | Implemented | `SendMatchModal.tsx`; mock send, persisted |
| Human-reviewed introductions | Implemented | Editable modal with confirmation |
| Notes from calls or meetings, history | Implemented | Notes tab and audit timeline |
| Track journey stage | Implemented | 11 stages, editable |
| Database design | Implemented | Prisma schema and ER diagram |
| API and validation | Implemented | Express routes with Zod on write endpoints |
| Responsive UI and themes | Partially verified | Light and dark themes implemented; responsive classes used but not formally tested on devices |
| Automated tests | Partially implemented | Backend unit tests only |
| Hosted live demo | Not implemented | Placeholder below |
| Architecture and UML-style diagrams | Implemented | [System design and UML](#system-design-and-uml) |
| Folder structure | Implemented | [Folder structure](#folder-structure) |
| Research into dating and matrimonial apps | Partially implemented | [Research references](#research-references); sources not re-verified in this pass |

### Matching logic write-up

**AI integration.** Matching is deterministic and explainable; AI is used where language adds value. Every recommendation carries a mutual score, a label (High Potential, Promising or Needs Review), positive alignments, differences and unknowns produced by the engine. When the matchmaker chooses Send Match, OpenAI (`gpt-4o-mini`) receives only verified profile facts and the engine's output and drafts a short, personalised introduction and explanation. The model cannot change scores. If the key is missing or the call fails, a grounded template produces the draft instead. The matchmaker reviews and edits it before anything is recorded.

**Algorithm design.** Five stages: hard eligibility filters (self, closed profiles, already-introduced candidates, gender pairing, stated age bounds, marital-status preferences); a 0 to 100 directional score across seven dimensions (relationship goals, children, location and relocation, career and education, language and culture, age and height, lifestyle); a mutual score using a geometric mean with an asymmetry penalty, so one-sided fits are not overstated; a label and explanation; and deterministic ranking with tie-breaks. For male clients, candidates who are older, not shorter, or earn more lose points and are flagged, and children alignment is a full dimension. For female clients the logic emphasises career standing, profession, education, relocation openness and values.

**Assumptions.** Matching is between opposite genders, as in the brief. Explicit partner preferences feed the dimension scores, while the male core rule is applied on top because the brief states it as a requirement. Missing data is treated as unknown, not as a match. Caste, religion and horoscope are stored but not scored. All profiles are fictional, "sending" is mocked, weights are design choices rather than calibrated values, and the matchmaker makes the final decision.


## Research references

The brief asks for research into dating and matrimonial products. Starting points:

- The Date Crew: <https://thedatecrew.com>
- Shaadi.com: <https://www.shaadi.com>
- Jeevansathi: <https://www.jeevansathi.com>

How this informed Pairwise (design decisions, not claims about those companies' internals):

- Matrimonial profiles typically separate **who a person is** from **what they are looking for**, so Pairwise has a `Customer` profile and separate `PartnerPreferences`.
- A match is only useful if it works in **both directions**, hence the two directional scores and a mutual score.
- Because a human matchmaker, not a swipe, is the decision maker, every score is accompanied by reasons, differences and unknowns.
- Indian matchmaking usually weighs family background, relocation, diet and children expectations, so these are first-class fields. Caste and religion are stored but kept out of the scoring on purpose.

These sources were not re-verified when this README was written; check the official sites before submitting if you want to cite specific features.

---

*Pairwise is an assessment prototype. It supports a matchmaker's judgment and does not replace it.*
