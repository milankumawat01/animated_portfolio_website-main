# Milan Kumawat — AI Engineer & Backend Developer Portfolio

A personal portfolio for **Milan Kumawat**, built with Next.js 16, React 19, TypeScript, Convex, and Tailwind CSS.

## Content workflow

- Use Milan Admin for Projects, Blog, Experience, Skills, Media, and Leads. Settings has been removed from the admin.
- Edit infrequently changed biography, hero stats, quotes, handwriting, process copy, and contact cards in `apps/web/data/portfolioData.ts`. Public pages read these values from code.
- Projects and blogs can be drafts, published, or archived. Blogs can also be scheduled for a future local date and time; Convex publishes them at that time.
- Media is uploaded to R2 through the admin. Referenced assets cannot be deleted; Replace updates project and blog references. Images are limited to 10 MB, videos and documents to 50 MB.
- Existing lead statuses and experience display dates are upgraded when their admin screens first open after the backend is deployed.

---

## 🚀 Sections Overview

1. **01 Hero & Navigation (`#home`)**
   - Monogram logo `MK` and sticky glassmorphic navigation header with active section spy indicator
   - Headline: **"Milan Kumawat"** with vibrant electric blue gradient
   - Subtitle: *"Building AI-powered products and scalable systems for a better tomorrow."*
   - Direct CTA buttons: `View My Work →` and `Download Resume ↓`
   - Quantified metrics bar: `5K+ Users Impacted`, `10+ Projects Built`, `2+ Years Experience`
   - Interactive tech stack pill bar featuring official brand vectors (Python, FastAPI, Next.js, PostgreSQL, MongoDB, Redis, Docker, OpenAI)
   - Atmospheric dark coder desk setup background and interactive scroll wheel indicator

2. **02 About Me (`#about`)**
   - Section header: `— 02 ABOUT ME` & heading: *"Turning ideas into real solutions."*
   - Narrative biography and 3 core value cards: Clean Code, Problem Solver, Team Player
   - High-fidelity portrait card of Milan Kumawat with floating location pill (`Jaipur, India`), authentic dark sticky note (`Good Code Better Products`), and handwritten doodle arrow (`_Same Curiosity Different Problems`)
   - 4 domain capability cards (`WHAT I WORK ON`): AI Integration, Backend Systems, Product Development, Real World Impact
   - Quotation bar: *“Good code, better products, brighter possibilities.”* and handwritten signature *“Let's Build What's Next.”*

3. **03 Projects (`#projects`)**
   - Section header: `— 03 PROJECTS` & heading: *"Projects that create real impact."*
   - Handwritten doodle: *“Build Ship Improve Repeat.”* + carousel slide controls
   - 4 showcased projects:
     - **Hiro**: AI-powered resume management platform (FastAPI, Next.js, PostgreSQL, OpenAI)
     - **Salezo**: AI sales outreach platform with multi-channel messaging (Python, FastAPI, Redis, OpenAI)
     - **AutoResumeBot**: Automated job application & ATS matching platform (Next.js, FastAPI, OpenAI, MongoDB)
     - **Internal Tools**: Enterprise document parsing & workflow suite (Python, FastAPI, Docker, Supabase)
   - Interactive modal integration: clicking any project card opens the full architectural case study, metrics, and live/source links
   - Bottom status bar: *"MORE PROJECTS COMING SOON... Always building 🔵"*

4. **04 Experience (`#experience`)**
   - Section header: `— 04 EXPERIENCE` & heading: *"Where I've been building."*
   - Summary cards: Real Products, Growing Responsibility, Impact Driven
   - Vertical timeline tree with timeline nodes and timeframe badges:
     - **True Value Infosoft Pvt. Ltd.** (`AI Engineer`, May 2025 – Present)
     - **eAdmin Business Process Pvt. Ltd.** (`Full Stack Developer`, Jul 2024 – Dec 2025)
     - **Freelance & Personal Projects** (`Independent Developer`, 2022 – 2024)
   - Handwritten annotations & inspirational quote: *“Every role has taught me something new, and I'm still just getting started.”*

5. **05 Skills & Stack (`#skills`)**
   - Section header: `— 05 SKILLS & STACK` & heading: *"Tools I use to build real solutions."*
   - Desk photograph card with Goku figure, ambient lighting, and *"Always learning / Always building"* pulse badge
   - 6 Categorized Skill Cards with official SVG brand vector icons:
     - **Backend**: Python, FastAPI, Node.js, PostgreSQL, MongoDB, Redis
     - **AI / Machine Learning**: OpenAI, Claude, Gemini, LangChain, LlamaIndex, RAG
     - **Frontend**: Next.js, React, TypeScript, Tailwind CSS, HTML, CSS
     - **Database & BaaS**: PostgreSQL, MongoDB, Supabase, Convex, Cloudflare R2, Firebase
     - **DevOps & Infrastructure**: Docker, Nginx, Vercel, DigitalOcean, Cloudflare, Ubuntu
     - **Tools & Others**: GitHub, Postman, Figma, Resend, VS Code, Notion
   - Quotation bar: *“The right tools don't make a developer. How you use them does.”*

6. **06 How I Build (`#how-i-build`)**
   - Section header: `— 06 HOW I BUILD` & heading: *"From idea to real impact."*
   - Interactive Mac terminal mockup (`build.sh`) with code loop and *"⚡ Small steps. Big products."* badge
   - 5-Step Process Flow:
     1. **01 Understand** (Research, User needs, Scope, Milestones)
     2. **02 Design** (System design, Database schema, API architecture, Scalability)
     3. **03 Build** (Backend development, AI integrations, Testing & iteration)
     4. **04 Deploy** (Cloud deployment, Monitoring, Performance tuning)
     5. **05 Iterate** (User feedback, New features, Refactoring, Scaling)
   - 4 foundational pillars: Real Problems, Clean Code, Real Users, Continuous Growth

7. **07 Writing & Insights (`#writing`)**
   - Section header: `— 07 WRITING & INSIGHTS` & heading: *"Things I'm building, learning and thinking about."*
   - Handwritten doodle: *“Better Ideas Through Writing.”* + carousel controls
   - 4 Technical Articles with real diagrams and preview images:
     - *Building AI-Powered Applications with FastAPI*
     - *Designing Scalable Backend Systems*
     - *Lessons from Building AutoResumeBot*
     - *From Idea to Production*
   - Interactive Article Reader modal for in-depth technical takeaways
   - Quotation bar: *“Writing is how I debug my thoughts.”*

8. **08 Get In Touch & Footer (`#contact`)**
   - Section header: `— 08 GET IN TOUCH` & heading: *"Have an idea worth building?"*
   - 4 interactive contact cards:
     - **Email**: `hey@milankumawat.in` (one-click copy to clipboard with feedback)
     - **LinkedIn**: `linkedin.com/in/milankumawat`
     - **GitHub**: `github.com/milankumawat`
     - **Resume**: Interactive CV modal & printable PDF view
   - Primary `Let's Talk →` pill button triggering the contact modal with instant confetti feedback
   - Curved split background with atmospheric night desk setup and quote *“Same Developer. Bigger Things Ahead.”*
   - Dark footer with branding, handwritten *“Keep Building.”* doodle, navigation links, social icons, and copyright notice.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Typography**: Plus Jakarta Sans, Caveat (Google Fonts), JetBrains Mono
- **Icons**: Lucide React + Custom SVG Brand Vector Library
- **Micro-Interactions**: Canvas Confetti, Framer Motion transitions

---

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

---

## 📜 Git Commits History

- `chore(setup)`: initialize Next.js 15 with TypeScript, Tailwind CSS and dependencies
- `feat(assets)`: extract and optimize pixel-accurate image assets and mockups from reference screens
- `feat(design-system)`: implement portfolio data layer, brand SVG icons, handwriting doodles, and UI components
- `feat(sections)`: implement all 8 sections (Hero, About, Projects, Experience, Skills, How I Build, Writing, Contact & Footer)
- `feat(modals)`: integrate interactive case studies, article reader, contact dialog with confetti, and resume viewer modal
