# Project LOOP — Multi-Tenant AI Customer Feedback Intelligence Platform

Project LOOP is an enterprise-grade Voice-of-Customer (VoC) analytics platform engineered to aggregate multi-channel customer signals, perform real-time sentiment scoring, cluster emerging themes with NLP, and power interactive AI copilot queries with grounded vector search.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Dynamic API Routes) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a curated design system and custom color tokens
- **Database & ORM**: PostgreSQL (Neon Serverless compatible) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js (Auth.js)](https://next-auth.js.org/) Credentials provider with BCrypt password hashing & RBAC
- **Unified Multi-AI Provider Engine**:
  - **Anthropic Claude** (`claude-sonnet-4-6`)
  - **OpenAI** (`gpt-4o`, `gpt-4o-mini`)
  - **Google Gemini** (`gemini-2.0-flash`)
  - *Automated fallback failover on API rate limits or quota exhaustion.*
- **Embeddings & Vector Search**: Voyage AI / HuggingFace embedding models with cosine similarity vector matching
- **Data Visualization**: Custom SVG vector geometry & Recharts (Annular Donut, Multi-Period Flow Trajectories, Rating Scatter Matrix, Capsule Volume Charts)
- **Validation**: Strict Zod schema validation across all endpoints

---

## ✨ Core Platform Capabilities

### 1. Multi-Tenant Architecture & RBAC
- **Strict Tenant Isolation**: Every database read/write query is strictly scoped by `workspaceId`.
- **Role-Based Permissions**:
  - `ADMIN`: Full management of workspaces, feedback, themes, reports, and team invitation/role governance.
  - `ANALYST`: Ingest feedback, trigger AI re-classification, manage theme clusters, and generate reports.
  - `VIEWER`: Read-only access to dashboards, feedback inbox, themes, and reports.

### 2. Multi-Channel Feedback Ingestion
- **Bulk CSV Upload**: Smart CSV parsing with column auto-mapping and background AI classification.
- **Manual Entry**: Granular submission with custom customer metadata, channel attribution, and tags.
- **Live Channel Simulator**: Native simulation for App Store reviews, Zendesk support tickets, Intercom messages, and NPS surveys.

### 3. Precision Feedback Inbox
- **Multi-Dimensional Filters**: Filter by search text, channel source, sentiment category, lifecycle status, and theme tags.
- **Workflow State Management**: Status progression (`NEW` → `REVIEWED` → `ACTIONED`).
- **AI Classification Engine**: NLP sentiment scoring (-1.0 to +1.0), feature area categorization, evidence-backed rationale, and theme assignment.

### 4. Real-Time AI Analytics Dashboard
- **Executive AI Narrative**: Live header synthesizing dominant customer friction and growth drivers from real feedback records.
- **Card 1: Feature Area Volume**: Capsule distribution with highlighted active peak driver.
- **Card 2: Multi-Period Trajectory**: Ascending cumulative volume streams with smooth cubic-bezier ribbon curves.
- **Card 3: Satisfaction Matrix**: Floating coordinate blocks divided into satisfaction ratings (`5.0★ Positive`, `4.2★ Neutral`, `3.8★ Critical`).
- **Card 4: Precision Themes Donut**: Exact 360° annular geometry with vibrant palettes and interactive center hub metrics.

### 5. Ask LOOP (Grounded Vector RAG Copilot)
- **Semantic Vector Search**: Vector embedding comparison against ingested feedback items.
- **Grounded Q&A**: Real-time synthesized responses constrained to verified customer feedback context.
- **Interactive Citations**: Clickable source cards displaying exact verbatim feedback quotes.

### 6. Executive Voice-of-Customer Reports
- **Statistical Aggregation**: Automatic period comparison, sentiment shifts, and theme deltas.
- **AI Narrative Generation**: Synthesized key findings, customer voice quotes, and recommended product initiatives.
- **Export & Sharing**: Clean printable layout and shareable executive brief links.

### 7. Public Governance Pages
- **Public Terms of Service** ([`/terms`](http://localhost:3000/terms)): Accessible without authentication.
- **Public Privacy Policy** ([`/privacy`](http://localhost:3000/privacy)): Accessible without authentication.

---

## 🛠️ Developer Hub & Diagnostics Portal (`/dev`)

Project LOOP includes a password-protected **Developer & Diagnostics Panel** accessible at **`/dev`**:

### How to Access `/dev`
1. Navigate to [`http://localhost:3000/dev`](http://localhost:3000/dev) in your browser.
2. Enter the developer access password (configured in `.env` as `DEV_PANEL_PASSWORD`, default: `loop-dev-2026` or `admin123`).

### Features in `/dev`:

| Module | Description |
| :--- | :--- |
| **System Status & Health** | Real-time database latency metrics, Prisma connection status, server uptime, and external API responsiveness. |
| **Multi-AI Engine Config** | Live hot-swapping between **Anthropic Claude**, **OpenAI GPT-4o**, and **Google Gemini**. Test API credentials and adjust model parameters with live verification. |
| **Environment Variable Manager** | Secure, masked `.env` viewer and editor allowing instant secret updates without restarting the application. |
| **Database Inspector** | Live row counts for Users, Workspaces, Feedback Items, Themes, and Vector Embeddings. |
| **Fast Dev Login** | 1-click authentication switcher between Admin, Analyst, and Viewer roles for rapid local testing. |

---

## 💻 Local Installation & Setup

1. **Clone Repository & Install Dependencies**
   ```bash
   git clone https://github.com/Dhruv6019/Project-LOOP-T5.git
   cd Project-LOOP-T5/loop
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `loop` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/loop_db"
   NEXTAUTH_SECRET="your-32-character-random-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # AI Provider Keys (At least one required)
   ANTHROPIC_API_KEY="sk-ant-..."
   OPENAI_API_KEY="sk-..."
   GOOGLE_API_KEY="AIzaSy..."

   # Embeddings
   VOYAGE_API_KEY="pa-..."

   # Developer Panel Password
   DEV_PANEL_PASSWORD="loop-dev-2026"
   ```

3. **Database Migration & Seeding**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Default Demo Accounts

After running `npx prisma db seed`, use any of the seeded credentials:

- **Admin Account**: `admin@acme.com` / `Demo1234!`
- **Analyst Account**: `analyst@acme.com` / `Demo1234!`
- **Viewer Account**: `viewer@acme.com` / `Demo1234!`
- **Dev Portal Password**: `loop-dev-2026` (at `/dev`)

---

## 📄 License
MIT © 2026 Project LOOP. All rights reserved.
