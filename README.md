# Dev Sahad — Developer Portfolio

<a id="top"></a>

<p align="center">
  <img src="./public/readme-banner.svg" width="100%" alt="Dev Sahad Portfolio — designed to move, built to perform" />
</p>

<p align="center">
  <a href="https://sahad.is-a.dev/"><img src="https://img.shields.io/badge/Live-sahad.is--a.dev-a78bfa?style=for-the-badge&logo=vercel&logoColor=white" alt="Live portfolio" /></a>
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js" alt="Next.js 15.5" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-00ff88?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Spotify-API-1db954?style=for-the-badge&logo=spotify&logoColor=white" alt="Spotify API" />
  <img src="https://img.shields.io/github/last-commit/Dev-Sahad/Portfolio?style=for-the-badge&color=6366f1" alt="Last commit" />
</p>

<p align="center">
  A cinematic, data-driven developer portfolio featuring 3D Three.js scenes, AI Voice Assistant, Web Audio SFX, Spotify Web Player, Developer Terminal CLI, Live Code Sandbox, 3D Skill Galaxy, Guestbook Doodle Canvas, Project Comparison Tool, and an authenticated Admin Operations Center.
</p>

---

## 🌟 World-Class Features Breakdown

### 🤖 1. AI Voice & Speech Assistant

- Built-in Web Speech API voice recognition mic input and text-to-speech voice synthesis.
- Answers visitor questions regarding Sahad's technical skills, experience, availability, and resume.

### 💻 2. Full-Screen Developer CLI / Terminal Mode

- Interactive terminal modal accessible directly from the Navbar (`sahad@portfolio:~$`).
- Supports terminal commands (`whoami`, `cat resume.txt`, `ls projects`, `skills`, `clear`, `sudo hire-sahad`).
- Features a celebratory hiring confetti animation! 🎉

### 🌌 3. 3D Interactive Skill Orbit Galaxy

- Built in Three.js and React Three Fiber embedded in the About section.
- Interactive spinning tech stack spheres (`Next.js 15`, `React 19`, `TypeScript`, `Three.js`, `Supabase`, `Tailwind CSS`) with hover tooltips and mastery metrics.

### 🎨 4. Guestbook Doodle & Signature Canvas

- Interactive HTML5 drawing pad integrated into the comment submission form.
- Allows visitors to draw custom doodles or digital signatures saved directly to Supabase storage.

### ⚔️ 5. Side-by-Side Project Comparison Tool

- Select up to 3 showcase projects to compare technical metrics, architecture, tech stack badges, and live demo links side-by-side.

### 🎓 6. Verified Credentials & Certificate Badges

- Glassmorphic modal showcasing official issuer badges, verification links, and live smartphone QR verification codes.

### 🎧 7. Portfolio Music Engine & Spotify Integration

- Embedded Spotify Web Player with customizable playlist loading and a mode-switcher to the Web Audio procedural synth drone.

### 🖼️ 8. High-Tech Graphic Scroll Banner & Exit Intent Outro Screen

- Infinite horizontal scroll marquee displaying visual technical graphic badges.
- `OutroExitModal` triggering a glassmorphic thank-you exit screen when visitors move their cursor off top of page.

---

## 📐 Application Architecture

<p align="center">
  <img src="./public/readme-architecture.svg" width="100%" alt="Portfolio application architecture" />
</p>

The browser renders the public portfolio and authenticated admin tools. Next.js handles server rendering, protected API routes, sessions, analytics, and webhook delivery. Supabase provides Postgres, Auth, Realtime, Storage, and RLS. Vercel builds and serves the application globally.

---

## 🛠 Technology Stack

| Area | Technologies |
| --- | --- |
| **Framework** | Next.js 15 App Router, React 19, TypeScript |
| **3D & Graphics** | Three.js, React Three Fiber, Drei, HTML5 Canvas |
| **Audio Engine** | Web Audio API (Synthesizer), Spotify Web Embed API |
| **AI & Voice** | Web Speech API (SpeechRecognition & SpeechSynthesis) |
| **Styling & Motion** | Tailwind CSS 3, Glassmorphism UI, Framer Motion, GSAP |
| **Backend & Database** | Supabase Postgres, Auth, Realtime, Storage, Nodemailer |
| **Analytics & Webhooks** | Discord Webhooks (Visitor, Contact, Comments), Vercel Analytics |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Dev-Sahad/Portfolio.git
cd Portfolio
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

DISCORD_WEBHOOK_URL=your-primary-discord-webhook
CONTACT_DISCORD_WEBHOOK_URL=your-contact-discord-webhook
COMMENTS_DISCORD_WEBHOOK_URL=your-comments-discord-webhook
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

---

## 📫 Connect & Social Media

<p align="center">
  <a href="https://sahad.is-a.dev/"><img src="https://img.shields.io/badge/Website-sahad.is--a.dev-a78bfa?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website" /></a>
  <a href="https://github.com/Dev-Sahad/"><img src="https://img.shields.io/badge/GitHub-Dev--Sahad-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/muhammad--sahad"><img src="https://img.shields.io/badge/LinkedIn-Muhammad--Sahad-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://www.instagram.com/sahad_____sha/"><img src="https://img.shields.io/badge/Instagram-@sahad_____sha-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://www.youtube.com/@SAHAD-IS-LIVE"><img src="https://img.shields.io/badge/YouTube-SAHAD--IS--LIVE-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
  <a href="https://www.tiktok.com/@sahad_____sha"><img src="https://img.shields.io/badge/TikTok-@sahad_____sha-000000?style=for-the-badge&logo=tiktok&logoColor=white" alt="TikTok" /></a>
  <a href="https://drive.google.com/file/d/1KqECb-TA5sgncNXY2pajnUX7bwAM6ASM/view?usp=drivesdk"><img src="https://img.shields.io/badge/Resume-View%20CV-4285F4?style=for-the-badge&logo=googledrive&logoColor=white" alt="Resume CV" /></a>
</p>

<p align="center">
  Designed & Built with ❤️ by <b>Muhammad Sahad</b>
</p>
