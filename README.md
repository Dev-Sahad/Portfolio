<div align="center">

# ✦ Portfolio V1

**A modern, animated developer portfolio with a full-stack admin system**

[![Live](https://img.shields.io/badge/Live-portfolio--v1--eta--nine.vercel.app-black?style=flat-square&logo=vercel)](https://portfolio-v1-eta-nine.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-13-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=flat-square&logo=three.js)](https://threejs.org)

</div>

---

## Overview

A personal portfolio built from scratch with Next.js 13 App Router, featuring a 3D interactive hero section, smooth page animations, a live comments system, and a fully secured admin dashboard for managing all content.

The site is designed around a dark, minimal aesthetic — fast to load, smooth to navigate, and easy to maintain through the admin panel without touching any code.

---

## Architecture

```
portfolio-v1/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Root entry, renders PageClient
│   │   ├── PageClient.tsx        # Orchestrates welcome screen + sections
│   │   ├── admin/                # Protected admin dashboard
│   │   │   ├── dashboard/        # Stats, recent activity
│   │   │   ├── projects/         # CRUD for portfolio projects
│   │   │   ├── certificates/     # CRUD for certificates
│   │   │   ├── comments/         # Moderate visitor comments
│   │   │   ├── technologies/     # Manage tech stack display
│   │   │   └── login/            # Auth gate
│   │   ├── portfolio/[id]/       # Dynamic project detail pages
│   │   └── auth/callback/        # Supabase OAuth callback
│   ├── components/
│   │   ├── band/
│   │   │   ├── App.js            # Three.js word cloud scene
│   │   │   └── TextType.tsx      # Typewriter animation component
│   │   ├── sections/
│   │   │   ├── Hero.tsx          # Landing section with 3D canvas
│   │   │   ├── About.tsx         # About / skills section
│   │   │   ├── PortfolioShowcase.tsx
│   │   │   └── contact/          # Contact form + comments
│   │   ├── WelcomeScreen.tsx     # Intro animation on first load
│   │   └── AnimatedBackground.tsx
│   ├── lib/
│   │   └── supabase.ts           # Lazy singleton Supabase client
│   └── middleware.ts             # Route protection for /admin
```

---

## Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **Next.js 13** | App Router, SSR/SSG, file-based routing |
| **React 18** | Component model, hooks, Suspense |
| **TypeScript** | Type safety across the codebase |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Page transitions, scroll animations, entrance effects |
| **GSAP** | Timeline-based animation sequences |

### 3D Layer
| Technology | Role |
|---|---|
| **Three.js** | WebGL rendering engine |
| **@react-three/fiber** | React renderer for Three.js scenes |
| **@react-three/drei** | `Text`, `TrackballControls` and helper abstractions |
| **troika-three-text** | GPU-accelerated SDF text rendering in WebGL |

### Backend & Data
| Technology | Role |
|---|---|
| **Supabase** | PostgreSQL database, Auth, real-time |
| **@supabase/ssr** | Server-side session handling in Next.js |
| **Row Level Security** | Database-level access control per table |

### UI & Utilities
| Technology | Role |
|---|---|
| **Lucide React** | Icon system |
| **React Icons** | Brand icons (GitHub, LinkedIn, Instagram…) |
| **SweetAlert2** | Styled confirmation dialogs in admin |

### Infrastructure
| Technology | Role |
|---|---|
| **Vercel** | Hosting, edge deployment, preview URLs |
| **GitHub** | Source control, triggers Vercel deploys on push |

---

## How It Works

### Page Load Flow

```
User visits /
  → PageClient.tsx checks sessionStorage for "heroPlayed"
  → First visit: WelcomeScreen plays intro animation (~3.5s)
  → Then: Hero mounts, Three.js canvas loads on the right half
  → Subsequent visits: intro skipped, jumps straight to Hero
```

The welcome screen runs once per browser session using `sessionStorage`. After it plays, a flag is set so refreshing the page skips straight to the content.

### 3D Hero Scene

The right side of the hero section renders a Three.js scene via `@react-three/fiber`. A word cloud (`Cloud` component) distributes words spherically using `THREE.Spherical` coordinates. The group auto-rotates on every frame via a `useFrame` hook — no user interaction needed, and `pointerEvents: none` on the canvas ensures scroll is never blocked.

Words include navigation links and social handles. Clicking a word navigates using Next.js router or opens an external link.

### Data Flow (Supabase)

All portfolio content lives in Supabase PostgreSQL tables:

```
projects        → title, description, technologies, image_url, live_url, github_url
certificates    → name, issuer, date, image_url
comments        → name, comment, likes, is_pinned, created_at
technologies    → name, icon, category
```

The Supabase client is a **lazy singleton** — it's only instantiated in the browser, never during Next.js SSR. An SSR-safe proxy wraps all calls so imports never crash server-side.

### Admin System

The `/admin` route tree is protected at two levels:

1. **Middleware** (`middleware.ts`) — intercepts all `/admin/*` requests and calls `updateSession` to validate the Supabase session cookie before the page renders
2. **Client-side guard** — each admin page also calls `supabase.auth.getSession()` on mount and redirects to `/admin/login` if no session exists

Login uses Supabase email/password Auth. After sign-in, a session cookie is set and the middleware handles all subsequent validation automatically.

The dashboard aggregates live counts from all tables in parallel using `Promise.all`, then displays recent comments and projects with quick-action links.

### Animations

- **Framer Motion** handles most UI animations: hero text entrance, section scroll reveals, sidebar active-state transitions, card hovers
- **GSAP** is used for timeline-sequenced animations in the welcome screen
- CSS `backdrop-filter` + semi-transparent borders give the glassmorphism card aesthetic throughout

---

## Database Tables

```sql
-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  technologies text,        -- comma-separated string
  image_url text,
  live_url text,
  github_url text,
  key_features text,
  created_at timestamptz default now()
);

-- Comments (visitor guestbook)
create table comments (
  id uuid primary key default gen_random_uuid(),
  name text,
  comment text,
  likes int default 0,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- Certificates
create table certificates (
  id uuid primary key default gen_random_uuid(),
  name text,
  issuer text,
  date text,
  image_url text,
  created_at timestamptz default now()
);

-- Technologies
create table technologies (
  id uuid primary key default gen_random_uuid(),
  name text,
  icon text,
  category text,
  created_at timestamptz default now()
);
```

---

## Deployment

The project auto-deploys to Vercel on every push to `main`. No manual steps — Vercel detects the Next.js project, runs `npm run build`, and publishes.

Environment variables required on Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Author

**Muhammad Sahad** — Frontend Developer

[![GitHub](https://img.shields.io/badge/GitHub-Dev--Sahad-black?style=flat-square&logo=github)](https://github.com/Dev-Sahad)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-muhammad--sahad-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/muhammad-sahad-78b827352)
[![Instagram](https://img.shields.io/badge/Instagram-sahad_____sha-E1306C?style=flat-square&logo=instagram)](https://www.instagram.com/sahad_____sha)
