// Public-facing project copy with work context confirmed by the portfolio owner.
export const projectCatalog = [
  {
    "slug": "adiveda",
    "title": "Adiveda",
    "subtitle": "Website, member platform and owner admin",
    "description": "A full-stack platform for a spiritual foundation: public website, offerings, donations, a member dashboard and a complete owner admin.",
    "longDescription": "Adiveda Sadhana Foundation needed one home for its sadhanas, retreats, stotrams, rituals, films and seva work, and a team that could run that home without a developer. I built the whole product: a public website on one shared offering template, Razorpay donations confirmed by server-side verification, TagMango checkout with enrolment sync, a member dashboard, and an owner admin where every page, photo, menu and offering can be edited and published. A new course or event goes live from admin and appears on its own page, in the catalogue, on the home tabs and in the header menu with no code change.",
    "tags": [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "PostgreSQL",
      "Drizzle ORM",
      "Better Auth",
      "Razorpay",
      "Tailwind CSS",
      "Docker",
      "Coolify"
    ],
    "keyFeatures": [
      "One offering template for sadhanas, retreats, stotrams, rituals and events",
      "Owner admin for pages, media, menus, offerings and publishing",
      "Razorpay donations confirmed by server-side verification",
      "TagMango checkout with enrolment sync",
      "Member dashboard for courses, sessions, purchases and donations",
      "Queued transactional email with an owner outbox"
    ],
    "architecture": [
      "Next.js App Router with server components in a production Docker build",
      "PostgreSQL through Drizzle ORM, with typed validation for every content and offering section",
      "Better Auth sessions with separate owner and member access",
      "Background workers for email, TagMango sync and analytics sync",
      "Self-hosted on a VPS with Coolify, deploying from every push to main"
    ],
    "stats": [
      {
        "label": "Offerings published",
        "value": "15"
      },
      {
        "label": "Offering formats on one template",
        "value": "5"
      },
      {
        "label": "Public pages tested at desktop and phone width",
        "value": "28"
      }
    ],
    "liveUrl": "https://adiveda.com/milan.kumawat",
    "githubUrl": "",
    "company": "Adiveda Sadhana Foundation",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/adiveda-1.webp",
    "galleryUrls": [
      "/images/projects/adiveda-2.webp",
      "/images/projects/adiveda-3.webp",
      "/images/projects/adiveda-4.webp",
      "/images/projects/adiveda-5.webp",
      "/images/projects/adiveda-6.webp",
      "/images/projects/adiveda-7.webp",
      "/images/projects/adiveda-8.webp",
      "/images/projects/adiveda-9.webp",
      "/images/projects/adiveda-10.webp",
      "/images/projects/adiveda-11.webp",
      "/images/projects/adiveda-12.webp",
      "/images/projects/adiveda-13.webp",
      "/images/projects/adiveda-14.webp",
      "/images/projects/adiveda-15.webp"
    ],
    "featured": true,
    "order": 15
  },
  {
    "slug": "hiro",
    "title": "Hiro",
    "subtitle": "AI hiring and resume management",
    "description": "An AI hiring and resume-management workspace for screening, assessments and interview workflows.",
    "longDescription": "Hiro, also known as AutoResumeBot, is a hiring and resume-management project built while working at True Value Infosoft. Its interface brings candidate screening, scoring, assessments and interview stages into one workspace, helping recruitment teams review applicants and organize their hiring pipeline. The public preview presents the candidate-management experience without exposing real applicant information.",
    "tags": [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Resume and candidate management — A shared workspace for reviewing applicants and their career information.",
      "Candidate screening and scoring — A clear interface for comparing candidates and organizing a shortlist.",
      "Assessment and interview stages — Hiring stages presented together for a more consistent review process."
    ],
    "architecture": [
      "React and TypeScript frontend",
      "Vite build tooling with Tailwind CSS"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "True Value Infosoft",
    "workType": "company",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built while working at True Value Infosoft.",
    "imageUrl": "/images/projects/hiro-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 10
  },
  {
    "slug": "salezo",
    "title": "Salezo",
    "subtitle": "Multi-channel sales automation",
    "description": "A sales workspace for lead sources, outreach sequences and campaign reporting.",
    "longDescription": "Salezo presents a sales automation workflow that collects leads from advertising and business listing sources, then organizes outreach across WhatsApp, SMS, RCS and email. Its interface explains scheduled sequences and response tracking so sales teams can follow up consistently. Product capabilities are described from the supplied interface; message throughput and conversion results are not asserted.",
    "tags": [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Zustand"
    ],
    "keyFeatures": [
      "Lead-source and outreach-sequence interface — Organizes incoming lead sources and planned follow-up sequences.",
      "WhatsApp, SMS, RCS and email channel presentation — Presents outreach across the channels used in the sales workflow.",
      "Campaign reporting and engagement views — Provides interfaces for reviewing responses and campaign activity."
    ],
    "architecture": [
      "React frontend with TypeScript and Vite",
      "Zustand state management and React Query",
      "Recharts for reporting interfaces"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "True Value Infosoft",
    "workType": "company",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built while working at True Value Infosoft.",
    "imageUrl": "/images/projects/salezo-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 20
  },
  {
    "slug": "employee-portal",
    "title": "Employee Portal",
    "subtitle": "Workforce operations dashboard",
    "description": "An employee workspace for attendance, tasks, leave and team engagement.",
    "longDescription": "The True Value Infosoft Employee Portal brings daily workforce activities into a single dashboard. The supplied screen includes clock-in, time summaries, task management, leave tracking, team information and engagement features. It helps employees find everyday work information without switching between separate tools. All personal names, attendance figures and internal operational details in the portfolio preview have been concealed.",
    "tags": [],
    "keyFeatures": [
      "Attendance and clock-in interface — Gives employees a place to manage their daily attendance.",
      "Task and work-hour summaries — Brings everyday tasks and time information into one dashboard.",
      "Leave management and team information — Presents leave requests and team information alongside daily work.",
      "Employee engagement and announcements — Makes team updates and engagement features easier to find."
    ],
    "architecture": [],
    "stats": [],
    "liveUrl": "https://employee.truevalueinfosoft.co.in/employee-home",
    "githubUrl": "",
    "company": "True Value Infosoft",
    "workType": "company",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built while working at True Value Infosoft.",
    "imageUrl": "/images/projects/employee-portal-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 30
  },
  {
    "slug": "kontent-ops",
    "title": "Kontent Ops",
    "subtitle": "Creative production operations",
    "description": "A production workspace for client pipelines, editor capacity and quality-control stages.",
    "longDescription": "Kontent Ops is an internal project-management platform for creative production at Kontent Media. It organizes editing jobs into client pipelines, makes assignment and delivery stages visible, and supports quality-control routing and team-capacity reporting. The portfolio preview conceals client identities, personnel and operational figures. This case study describes the workflow without exposing private business activity.",
    "tags": [
      "React",
      "TypeScript",
      "FastAPI",
      "PostgreSQL",
      "Docker"
    ],
    "keyFeatures": [
      "Client production pipelines and job assignment — Organizes creative work by client and delivery stage.",
      "Quality-control routing and delivery tracking — Makes review and delivery steps visible to the team.",
      "Team capacity and analytics — Presents workload and operational reporting in one workspace.",
      "Role-based operational workspace — Provides focused views for different responsibilities."
    ],
    "architecture": [
      "React frontend with React Query and Zustand",
      "FastAPI services with SQLAlchemy and PostgreSQL",
      "Docker deployment and Alembic migrations"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "Kontent Media",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/kontent-ops-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 40
  },
  {
    "slug": "aspire",
    "title": "Aspire Developers",
    "subtitle": "Real estate brand website",
    "description": "A visual real-estate website showcasing modern spaces and property imagery.",
    "longDescription": "Aspire Developers is a property-focused brand website with an image-led home page, company information, a gallery and contact navigation. Large interior photographs and a rotating hero help visitors explore the visual character of the properties before making an enquiry. The implementation uses a traditional HTML, CSS and JavaScript website structure.",
    "tags": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "keyFeatures": [
      "Rotating property and interior imagery",
      "Company information and contact navigation",
      "Property gallery"
    ],
    "architecture": [
      "Static HTML pages with CSS and JavaScript assets"
    ],
    "stats": [],
    "liveUrl": "https://aspire-milankumawat.vercel.app/",
    "githubUrl": "https://github.com/milankumawat01/aspire",
    "company": "",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/aspire-1.webp",
    "galleryUrls": [
      "/images/projects/aspire-2.webp"
    ],
    "featured": true,
    "order": 50
  },
  {
    "slug": "raas-rang",
    "title": "Raas Rang",
    "subtitle": "AI dance learning experience",
    "description": "A dance-learning interface introducing movement analysis and guided practice.",
    "longDescription": "Raas Rang presents an AI-assisted dance-learning experience for practising from home. The public landing page and supplied screenshot introduce real-time movement feedback, pose detection, dance styles and guided learning. The project communicates how learners can practise and review their technique through a responsive product interface. Accuracy and learner-count claims shown in marketing artwork are not treated as verified portfolio outcomes.",
    "tags": [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Dance-style discovery and learning entry points",
      "Movement analysis and pose-detection product presentation",
      "Video and demo sections"
    ],
    "architecture": [
      "React and TypeScript interface with Vite",
      "Tailwind CSS and reusable UI components"
    ],
    "stats": [],
    "liveUrl": "https://raasrangdance.com/",
    "githubUrl": "",
    "company": "",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/raas-rang-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 60
  },
  {
    "slug": "minaxi-marketing",
    "title": "Minaxi Marketing",
    "subtitle": "Bilingual commerce storefront",
    "description": "An online product catalogue with guest checkout, wholesale enquiries and order tracking.",
    "longDescription": "Minaxi Marketing is an e-commerce storefront for a Jodhpur supari and gond business. Customers can browse products, use a guest cart and checkout flow, track orders and enquire about wholesale purchases. English and Hindi interfaces help serve the local audience. The repository documents Next.js and Convex for the store, with payment and shipping integrations available in the implementation.",
    "tags": [
      "Next.js",
      "TypeScript",
      "Convex",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Product catalogue and guest cart",
      "Guest checkout and order tracking",
      "Wholesale and distributor enquiries",
      "English / Hindi interface"
    ],
    "architecture": [
      "Next.js App Router frontend with next-intl",
      "Convex database and server functions",
      "Payment and shipping integration support"
    ],
    "stats": [],
    "liveUrl": "https://www.minaximarketing.com/",
    "githubUrl": "",
    "company": "Minaxi Marketing",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/minaxi-marketing-1.webp",
    "galleryUrls": [
      "/images/projects/minaxi-marketing-2.webp",
      "/images/projects/minaxi-marketing-3.webp"
    ],
    "featured": true,
    "order": 70
  },
  {
    "slug": "aep-engineering",
    "title": "AEP Engineering",
    "subtitle": "Engineering website and AI assistant",
    "description": "A waste-to-energy engineering website with a scoped assistant and authenticated administration.",
    "longDescription": "AEP Engineering showcases advanced waste-to-energy technologies through a company website and a focused AI assistant. The implementation includes Google sign-in, an administrative interface and streaming chat responses. The assistant is constrained to the business domain, with server-side scope checks and rate limiting. This makes technical information easier to explore while keeping service credentials on the server.",
    "tags": [
      "React",
      "Vite",
      "Supabase",
      "PostgreSQL"
    ],
    "keyFeatures": [
      "Engineering and waste-to-energy company presentation",
      "Domain-scoped streaming AI assistant",
      "Google sign-in and administrative interface",
      "Rate limiting and conversation persistence"
    ],
    "architecture": [
      "React marketing frontend built with Vite",
      "Vercel Edge API for streaming assistant responses",
      "Supabase authentication and PostgreSQL"
    ],
    "stats": [],
    "liveUrl": "https://www.aepgroup.io/",
    "githubUrl": "",
    "company": "AEP Engineering",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/aep-engineering-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 80
  },
  {
    "slug": "daamji",
    "title": "Daamji Misthaan Bhandaar",
    "subtitle": "Traditional sweets commerce",
    "description": "A bilingual sweets storefront with guest orders and WhatsApp checkout handoff.",
    "longDescription": "Daamji Misthaan Bhandaar offers a catalogue of sweets and celebration hampers with guest ordering. Checkout saves an order server-side, notifies the shop by email and gives the customer a WhatsApp handoff to arrange payment and delivery. The project also supports custom and bulk enquiries. Payment is arranged directly with the shop rather than through an online payment gateway.",
    "tags": [
      "Next.js",
      "TypeScript",
      "Convex",
      "Cloudflare R2",
      "Resend"
    ],
    "keyFeatures": [
      "Sweets and gifting catalogue",
      "Guest cart and persistent order records",
      "WhatsApp checkout handoff and email notification",
      "Custom and bulk-order enquiries",
      "English / Hindi interface"
    ],
    "architecture": [
      "Next.js frontend with next-intl",
      "Convex database and scheduled functions",
      "Cloudflare R2 product media and Resend notifications"
    ],
    "stats": [],
    "liveUrl": "https://www.daamji.com/",
    "githubUrl": "",
    "company": "Daamji Misthaan Bhandaar",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/daamji-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 90
  },
  {
    "slug": "banarsi-cafe",
    "title": "Banarsi Lassi & Cafe",
    "subtitle": "Restaurant operations system",
    "description": "A cafe management system connecting ordering, kitchen, counter and staff workflows.",
    "longDescription": "The Banarsi Lassi & Cafe system connects table ordering with the people preparing and serving each order. It includes QR-based customer menus, kitchen queues, counter billing, waiter views, inventory and recipe administration. Role-specific staff interfaces and real-time updates help the cafe coordinate service. Preview images conceal staff identity, order details and business figures.",
    "tags": [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Drizzle ORM",
      "SSE"
    ],
    "keyFeatures": [
      "QR-based table ordering",
      "Kitchen and waiter order queues",
      "Counter billing and credit tracking",
      "Inventory, recipes and staff administration"
    ],
    "architecture": [
      "Next.js application with role-specific staff interfaces",
      "PostgreSQL persistence through Drizzle ORM",
      "Server-Sent Events for real-time order updates"
    ],
    "stats": [],
    "liveUrl": "https://banarsilassiandcafe.com/",
    "githubUrl": "",
    "company": "Banarsi Lassi & Cafe",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/banarsi-cafe-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 100
  },
  {
    "slug": "yolo-trips",
    "title": "Yolo Trips",
    "subtitle": "Travel discovery and enquiries",
    "description": "A travel website showcasing destinations and personalised holiday planning.",
    "longDescription": "Yolo Trips is a travel website that introduces holiday destinations and customised trip planning. The supplied site includes destination discovery, testimonials, company information and contact navigation. It gives travellers a visual starting point for exploring options and contacting the team about their next trip. The public Trails repository verifies the React implementation.",
    "tags": [
      "React",
      "Vite",
      "CSS",
      "EmailJS"
    ],
    "keyFeatures": [
      "Destination discovery and travel imagery",
      "Testimonials and company information",
      "Contact and trip-enquiry entry points"
    ],
    "architecture": [
      "React frontend with React Router",
      "EmailJS browser integration"
    ],
    "stats": [],
    "liveUrl": "https://trails-alpha.vercel.app/",
    "githubUrl": "https://github.com/milankumawat01/Trails",
    "company": "Yolo Trips",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/yolo-trips-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 110
  },
  {
    "slug": "sanatan-vishwa",
    "title": "Sanatan Trust",
    "subtitle": "Community trust website",
    "description": "A bilingual trust website presenting its mission, initiatives and participation.",
    "longDescription": "The Sanatan Trust website presents the trust's mission, history and community initiatives. English and Hindi interfaces, image-led storytelling and participation calls to action help visitors understand the trust and find ways to connect. The repository verifies a Next.js frontend with Supabase; participation and donation-related integrations are present in the implementation, without asserting fundraising or membership results.",
    "tags": [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "English / Hindi presentation",
      "Foundation history and initiative information",
      "Participation and contact entry points"
    ],
    "architecture": [
      "Next.js frontend with Tailwind CSS",
      "Supabase-backed application services"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "Sanatan Trust",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/sanatan-vishwa-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 120
  },
  {
    "slug": "internal-tools",
    "title": "Software for Central Intelligence",
    "subtitle": "Visitor management software",
    "description": "A visitor management software project created as freelance work for Central Intelligence.",
    "longDescription": "Visitor management software created for Central Intelligence as a freelance project. The application is focused on organizing visitor information and supporting day-to-day visitor management workflows. Screenshots will be added through the admin once the previews are ready for publication.",
    "imageUrl": "",
    "galleryUrls": [],
    "caseStudyUrl": "",
    "tags": [],
    "keyFeatures": [
      "Visitor records — Organizes visitor information in a dedicated application.",
      "Visitor management workflows — Supports the everyday visitor-management process."
    ],
    "architecture": [],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "Central Intelligence",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance visitor management project.",
    "featured": true,
    "order": 40
  },
  {
    "slug": "infumarket",
    "title": "InfuMarket",
    "subtitle": "Creator-economy marketplace with crypto escrow",
    "description": "A marketplace for buying and selling YouTube, Instagram and TikTok channels, Play Buttons, brand deals and creator services, with escrow paid in cryptocurrency.",
    "longDescription": "InfuMarket brings five creator businesses under one account, one verified identity and one escrow-protected wallet: buying and selling monetised channels, brand deals and sponsorships, a growth services panel, courses and digital products, and a store for Silver and Gold Play Button plaques. The highlight is the payment layer. Buyers pay in the cryptocurrency and network of their choice through Heleket, the platform settles in USDT, and sellers withdraw USDT on Tron, Ethereum or BNB Smart Chain after admin approval, with a signature-verified webhook crediting every top-up. A WhatsApp bot built directly on Meta's Cloud API handles phone OTP, deal updates and transfer reminders, and a full admin panel covers KYC review, disputes, chat moderation and an audit log on every change.",
    "tags": [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "PostgreSQL",
      "Drizzle ORM",
      "Better Auth",
      "Heleket Crypto",
      "WhatsApp Cloud API",
      "Tailwind CSS",
      "Docker",
      "Coolify"
    ],
    "keyFeatures": [
      "Crypto pay-ins in any coin, settled in USDT, with USDT payouts on Tron, Ethereum and BNB Smart Chain",
      "Escrow deals with a transfer window and admin dispute mediation",
      "WhatsApp bot for OTP login, deal updates and transfer reminders",
      "Automatic channel listing once ownership is verified, with scheduled re-checks",
      "Free channel valuation tool on its own subdomain",
      "Admin panel with KYC review, role-based access, chat moderation and audit log"
    ],
    "architecture": [
      "Next.js App Router with domain logic in framework-free service modules",
      "PostgreSQL through Drizzle ORM, with money stored as integer cents",
      "Signature-checked webhooks for crypto payments and WhatsApp",
      "Cron-driven outbox for WhatsApp messages and listing re-checks",
      "Self-hosted with Docker and Coolify behind Cloudflare"
    ],
    "stats": [],
    "liveUrl": "https://infumarket.com",
    "githubUrl": "",
    "company": "InfuMarket",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/infumarket-1.webp",
    "galleryUrls": [
      "/images/projects/infumarket-2.webp",
      "/images/projects/infumarket-3.webp",
      "/images/projects/infumarket-4.webp"
    ],
    "featured": true,
    "order": 12
  },
  {
    "slug": "zeni",
    "title": "Zeni",
    "subtitle": "Personal finance workspace, with Onorian Finance OS as its beta",
    "description": "A private money workspace that keeps accounts, cards, bills, people and statements in one ledger. Onorian Finance OS was the beta that became Zeni.",
    "longDescription": "Zeni is a finance product from my studio, Rovezi. It started as Onorian Finance OS, a private beta I used to run my own money: statement imports with OCR, bank-alert email sweeps, reconciliation per account and an AI assistant that acts through permissioned tools. Zeni rebuilds that beta for many users. Statements are imported and reviewed line by line, card-payment and statement emails land in an inbox as drafts, and accounts, bills, splits with people, projects, vehicles, share holdings and IPO allotments all live in one ledger. It ships as a web app, an installable PWA and an iPhone app, and an MCP connection lets an AI assistant read and log entries with the user's consent.",
    "tags": [
      "React",
      "Vite",
      "Astro",
      "Hono",
      "Cloudflare Workers",
      "Neon Postgres",
      "Better Auth",
      "Expo",
      "MCP",
      "Next.js",
      "Turso"
    ],
    "keyFeatures": [
      "Statement import and line-by-line review with undo",
      "Email inbox that unlocks statement PDFs and drafts card payments",
      "Accounts, bills, people, splits, projects and vehicles in one ledger",
      "Share holdings with cost basis, plus IPO allotments",
      "MCP assistant connection with an OAuth consent screen",
      "Passkey sign-in and an iPhone app alongside the web app"
    ],
    "architecture": [
      "Astro public site, React PWA and Hono API on Cloudflare Workers",
      "Neon Postgres with checksum-checked migrations and ledger rules enforced by triggers",
      "Shared contracts and UI packages in a pnpm monorepo",
      "Expo mobile app with feature parity and an offline demo mode",
      "Beta (Onorian): Next.js PWA on Vercel with Turso, R2 and QStash"
    ],
    "stats": [],
    "liveUrl": "https://rovezi.tech/zeni",
    "githubUrl": "",
    "company": "Rovezi",
    "workType": "personal",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "My own product, from the Onorian beta to Zeni.",
    "imageUrl": "/images/projects/zeni-1.webp",
    "galleryUrls": [
      "/images/projects/zeni-2.webp",
      "/images/projects/zeni-3.webp"
    ],
    "featured": true,
    "order": 25
  },
  {
    "slug": "agrivia",
    "title": "Agrivia",
    "subtitle": "AI billing and credit ledger for rural agri shops",
    "description": "A Hindi-first app for fertiliser, seed and pesticide shops: bills, farmer credit, stock and an AI scanner that reads supplier invoices.",
    "longDescription": "Agrivia replaces the paper credit notebook and hand-written bills of rural agriculture shops. Shop owners make Hindi bills that look like the ones their customers already know and share them on WhatsApp, keep a credit ledger for every farmer by village, and track stock with GST, purchase prices and expiry dates. The AI scanner reads a batch of supplier invoice photos, compresses them on the phone for slow networks, and shows a review screen before anything is saved. Every bill is saved in one atomic step that writes the bill, updates the farmer's balance and deducts stock together.",
    "tags": [
      "React",
      "Vite",
      "Supabase",
      "PostgreSQL",
      "Edge Functions",
      "OpenRouter",
      "Gemini",
      "PWA",
      "i18next",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Hindi bills exported as PDF and shared on WhatsApp",
      "AI invoice scanner with a review step before saving",
      "Farmer credit ledger with village filters, payments and returns",
      "Inventory with GST, purchase price, loss warnings and expiry alerts",
      "Phone OTP login and push notifications",
      "Separate admin app for data imports"
    ],
    "architecture": [
      "Installable React PWA built for low-end phones and slow networks",
      "Supabase Postgres with row-level security and atomic RPCs for billing",
      "Edge functions for OTP, AI proxying, WhatsApp and push",
      "Soft deletes that reverse the money side first"
    ],
    "stats": [],
    "liveUrl": "https://www.agrivia.in",
    "githubUrl": "",
    "company": "Agrivia",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/agrivia-1.webp",
    "galleryUrls": [
      "/images/projects/agrivia-2.webp",
      "/images/projects/agrivia-3.webp"
    ],
    "featured": true,
    "order": 35
  },
  {
    "slug": "the-soul-root",
    "title": "The Soul Root",
    "subtitle": "Live satellite plot viewer for a farmhouse estate",
    "description": "An interactive satellite map where buyers explore every farmhouse plot, see availability and price, and enquire on WhatsApp, plus the estate's website.",
    "longDescription": "The Soul Root is a luxury farmhouse estate near Jaipur. I built its website and a live plot viewer at plots.thesoulroot.in. Visitors fly over the estate on satellite imagery in a tilted 3D view, hover or click any plot to see its area, side lengths, price, status and photos, and send an enquiry that opens WhatsApp with the plot already filled in. Inside the boundary the map shows the architect's masterplan instead of bare land. Behind it is a Map Studio where the owner draws plots that snap together, measures sides automatically, and publishes changes that reach visitors at once.",
    "tags": [
      "Next.js",
      "React",
      "MapLibre GL",
      "Hono",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Cloudflare R2",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Satellite map with a tilted 3D view of every plot",
      "Plot details with area, sides, price, status and photos",
      "WhatsApp enquiry with the plot pre-filled, saved as a lead",
      "Map Studio to draw, snap and measure plots",
      "Enquiry inbox with CSV export",
      "Brochure viewer and showcase videos on the estate website"
    ],
    "architecture": [
      "Static Next.js viewer with a Hono API on a Cloudflare Worker",
      "D1 for plots and leads, R2 for photos and the brochure",
      "Public map data cached at the edge and purged on every admin save",
      "Whole stack on Cloudflare's free tier"
    ],
    "stats": [],
    "liveUrl": "https://plots.thesoulroot.in",
    "githubUrl": "",
    "company": "The Soul Root",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/the-soul-root-1.webp",
    "galleryUrls": [
      "/images/projects/the-soul-root-2.webp",
      "/images/projects/the-soul-root-3.webp"
    ],
    "featured": true,
    "order": 45
  },
  {
    "slug": "sj-visitor",
    "title": "SJ Visitor",
    "subtitle": "Visitor and student-pickup system for a school",
    "description": "A gate tablet app and admin console for S.J. Public School, Jaipur, that records every visitor, verifies student pickups and issues gate passes.",
    "longDescription": "Everyone who enters S.J. Public School is now on record. Security staff check visitors in on a tablet: phone OTP, identity, a live photo and the reason for the visit, whether that is a half-day pickup, a meeting with a teacher or the principal, an admission enquiry or a fee payment. The app issues a gate pass that can be printed or shared. Student pickups are verified by OTP or a parent pickup card, so a child only leaves with an authorised adult. The admin console shows live counters and an activity feed, and manages students, parents, cards, staff and devices, while teachers see only their own class.",
    "tags": [
      "Expo",
      "React Native",
      "React",
      "Vite",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Tablet check-in with OTP, identity, photo and visit reason",
      "Printable and shareable gate passes",
      "Student pickup verified by OTP or parent pickup card",
      "Admin console with live counters, activity feed, reports and CSV export",
      "Separate admin, security and teacher roles"
    ],
    "architecture": [
      "Expo tablet app and React admin on one Supabase backend",
      "Row-level security on every table and an activity log written by triggers",
      "Private storage with signed URLs; photos compressed before upload",
      "Scheduled job that deletes old visitor photos automatically"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "True Value Infosoft",
    "workType": "company",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built at True Value Infosoft.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 55
  },
  {
    "slug": "amity-compliance",
    "title": "Amity Facility & Compliance",
    "subtitle": "Complaint ticketing and compliance checklists for Amity University",
    "description": "A facility management system for Amity University: maintenance complaints, staff assignment and routine compliance checks with photo proof.",
    "longDescription": "Built for Amity University to run campus maintenance and compliance in one place. Residents raise complaints for carpentry, civil, plumbing or electrical work through a public form, admins assign them to staff by trade, and a job closes only with an OTP and a rating from the resident. On the compliance side, admins set up locations, time slots and task templates such as water tank cleaning, design custom checklists with a drag-and-drop builder, and staff upload before and after photos as proof. WhatsApp messages and push notifications keep everyone informed, and reports export to Excel. A later rewrite fixed connection and schema problems found in a written root-cause analysis.",
    "tags": [
      "Next.js",
      "Prisma",
      "MySQL",
      "PostgreSQL",
      "Firebase Cloud Messaging",
      "WhatsApp",
      "Docker",
      "Expo"
    ],
    "keyFeatures": [
      "Public complaint form with running complaint numbers",
      "Assignment by trade, OTP closure and resident rating",
      "Compliance checklists with a drag-and-drop form builder",
      "Before and after photo proof for every task",
      "WhatsApp and push notifications on assignment",
      "Filters, search and Excel reports per employee"
    ],
    "architecture": [
      "Next.js app with Prisma, first on MySQL and rewritten on Postgres",
      "Rewrite driven by a root-cause analysis of connection-pool and schema drift issues",
      "Containerised stack with Postgres, Redis and object storage",
      "Expo staff app for field work"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "True Value Infosoft",
    "workType": "company",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built at True Value Infosoft for Amity University.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 65
  },
  {
    "slug": "yamato-docs",
    "title": "DocuQuery & ETMS",
    "subtitle": "AI document search and an operations suite for Yamato Logistics India",
    "description": "Two prototypes for Yamato Logistics India: DocuQuery, an offline AI that reads scanned records and answers questions, followed by ETMS, an expense and operations suite.",
    "longDescription": "Yamato Logistics India, part of a Japanese logistics group, wanted to digitise years of scanned paperwork and then run its internal operations on one system. The first prototype, DocuQuery, reads scanned PDFs with OCR, sorts them into categories such as accounts, HR, leasing and legal, and lets staff search by meaning or chat with the documents, with every answer citing its page. It runs fully on-premise with a local language model, so no document leaves the office. The second prototype, ETMS, grew from that work into an operations suite: business trips and claims, mileage, advances, departmental requisitions, purchase orders, vendor onboarding, asset checks, a SaaS risk register and approval and finance consoles, demonstrated to the client behind Microsoft sign-in.",
    "tags": [
      "FastAPI",
      "Python",
      "Tesseract OCR",
      "Sentence Transformers",
      "Ollama",
      "SQLite",
      "React",
      "TypeScript",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "OCR for scanned PDFs with background processing",
      "Automatic document categories and per-document summaries",
      "Semantic search and chat with page-cited answers",
      "Fully offline: local embeddings and local LLM",
      "ETMS: trips, claims, mileage, advances and requisitions",
      "ETMS: purchase orders, vendor onboarding, asset checks and approvals"
    ],
    "architecture": [
      "DocuQuery: single FastAPI service with OCR, chunked embeddings and cosine search",
      "Streaming answers with source lists",
      "On-premise by design so records never leave the network",
      "ETMS: clickable React prototype planned for Azure AD, HRMS and Tally integration"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "True Value Infosoft",
    "workType": "company",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built at True Value Infosoft for Yamato Logistics India.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 75
  },
  {
    "slug": "hisaab",
    "title": "Hisaab",
    "subtitle": "Invoices, reconciliation and GST for small businesses",
    "description": "Upload a bill or a bank statement and Hisaab reads it, books the invoice and matches the payment, with GST tracking and Tally and Zoho sync.",
    "longDescription": "Hisaab takes the month-end chores off small Indian businesses. Upload a PDF or a phone photo of a bill and it extracts the vendor, GSTIN, invoice number, line items, tax and totals, then books the invoice for review. Import a bank statement from any bank and each payment is matched to the right invoice, with part-payments, duplicates and unknown debits sent to an exceptions queue. Categorise a transaction once and Hisaab learns the rule. Input and output GST is tracked by period and split into CGST, SGST and IGST, TDS and party ledgers sit alongside, verified invoices sync to Tally or Zoho Books, and bills that arrive by email are pulled in automatically.",
    "tags": [
      "Next.js",
      "React",
      "TypeScript",
      "AI Extraction",
      "GST",
      "Tally",
      "Zoho Books",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "AI bill extraction from PDFs and phone photos",
      "Bank statement matching with an exceptions queue",
      "Reconciliation rules learned from one categorisation",
      "GST by period with CGST, SGST and IGST split, plus TDS",
      "Tally and Zoho Books sync with logged runs",
      "Mailbox import, multiple companies and team access"
    ],
    "architecture": [
      "Review-first flow: nothing is booked without the user's approval",
      "Rules per bank account or across accounts",
      "Every change recorded for an audit trail"
    ],
    "stats": [],
    "liveUrl": "https://hisaab.truevalueinfosoft.co.in",
    "githubUrl": "",
    "company": "",
    "workType": "personal",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "My own product.",
    "imageUrl": "/images/projects/hisaab-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 85
  },
  {
    "slug": "bhoomi-rakshak",
    "title": "Bhoomi Rakshak",
    "subtitle": "Doctor and patient portals with AI voice prescriptions",
    "description": "A health platform where patients book doctors online and doctors dictate prescriptions by voice, turned into a structured prescription by AI.",
    "longDescription": "Bhoomi Rakshak connects patients and doctors through two portals on one API. Patients sign in with OTP, book appointments and keep their prescriptions, lab results, vitals and medicine reminders in one place. Doctors run their day from a live OPD queue and a consultation workspace where they simply speak: the recording is transcribed, AI extracts the medicines, diagnosis and notes, checks for drug interactions and produces a prescription PDF in moments. The interface works in six languages, including regional tribal languages, and an assistant helps patients find their way.",
    "tags": [
      "FastAPI",
      "PostgreSQL",
      "SQLAlchemy",
      "Socket.IO",
      "React",
      "Vite",
      "TypeScript",
      "Whisper",
      "Gemini",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Online booking with OTP sign-in",
      "Voice dictation turned into a structured prescription",
      "Drug-interaction check before the prescription is issued",
      "Prescription PDFs and patient health records",
      "Live OPD queue for doctors",
      "Six interface languages and an AI patient assistant"
    ],
    "architecture": [
      "FastAPI with async SQLAlchemy on PostgreSQL",
      "Socket.IO for the live queue",
      "Speech-to-text with Whisper, structured extraction with Gemini",
      "Two React portals served as static builds behind Nginx"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 95
  },
  {
    "slug": "kairos",
    "title": "KairOS",
    "subtitle": "AI agents that deliver a daily market briefing",
    "description": "A multi-agent system built for a client that collects launches and discussions from Reddit, Hacker News and Product Hunt and delivers a morning report.",
    "longDescription": "The client wanted to start every day knowing what had happened in their market without reading a dozen sites. KairOS runs a team of agents overnight: they collect new launches and discussions from Reddit, Hacker News, Product Hunt and Indie Hackers, store them in vector memory, link them in a knowledge graph and score each opportunity on demand, competition and effort. Each morning a report agent writes a daily briefing with the top opportunity, market discoveries, competitor launches and keyword ideas, and sends it to Slack or Discord, with a dashboard to explore everything behind it.",
    "tags": [
      "Python",
      "FastAPI",
      "Qdrant",
      "Google Gemini",
      "APScheduler",
      "Next.js",
      "React",
      "Docker"
    ],
    "keyFeatures": [
      "Research agents for Reddit, Hacker News, Product Hunt and Indie Hackers",
      "Vector memory and a knowledge graph of everything collected",
      "Opportunity scoring on demand, competition and effort",
      "Daily morning report delivered to Slack or Discord",
      "Dashboard with live agent logs"
    ],
    "architecture": [
      "Separate agents for research, memory, decisions, reports and notifications",
      "FastAPI service with async SQLAlchemy and a Qdrant vector store",
      "Scheduled daily run with webhook delivery and a local fallback",
      "Docker Compose for the full stack"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built for a client as a freelance project.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 105
  },
  {
    "slug": "shiv-hotel",
    "title": "Shiv Hotel & Dining",
    "subtitle": "QR table ordering for a hotel restaurant",
    "description": "Guests scan the QR on their table and order from their phone; the order reaches the kitchen, cashier and waiter screens at once.",
    "longDescription": "Built on the same foundation as the Banarsi Lassi & Cafe system, Shiv Hotel lets guests scan the QR on their table, browse the menu, order and track it live from their own phone, and call a waiter or ask for the bill with a tap. Each order moves through placed, confirmed, preparing, ready and served across separate screens for the kitchen, cashier, waiter and admin. Table sessions, walk-ins, counter sales, inventory with recipes, a customer credit ledger and a daily day book complete the restaurant's back office.",
    "tags": [
      "Next.js 16",
      "TypeScript",
      "Drizzle ORM",
      "Supabase",
      "PostgreSQL",
      "Server-Sent Events",
      "shadcn/ui",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "QR menu, cart and live order tracking for guests",
      "Waiter call and bill request from the table",
      "Kitchen, cashier, waiter and admin screens",
      "Table sessions, walk-ins and counter quick sale",
      "Inventory with recipes and stock movements",
      "Customer credit ledger and daily day book"
    ],
    "architecture": [
      "Real-time updates over Server-Sent Events with a polling fallback",
      "Server-side price checks and role-based access",
      "Idempotent orders keyed by a client request ID",
      "Hosted on Vercel in Mumbai with Supabase Postgres"
    ],
    "stats": [],
    "liveUrl": "https://shivhotel.vercel.app",
    "githubUrl": "",
    "company": "Shiv Hotel",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/shiv-hotel-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 115
  },
  {
    "slug": "khatu-cab-service",
    "title": "Khatu Cab Service",
    "subtitle": "Taxi and pilgrimage booking website",
    "description": "A booking website for a Khatu Shyam taxi service: darshan trips, Rajasthan tour packages, vehicles and hotel help, with WhatsApp enquiries.",
    "longDescription": "Khatu Cab Service takes pilgrims to Khatu Shyam Ji and travellers across Rajasthan. The site presents darshan yatras, tour packages, the vehicle fleet and hotel booking help, and its enquiry form validates the trip details and opens WhatsApp with everything pre-filled, so the owner gets bookings without a backend. It was rebuilt from a written plan and checked for accessibility and layout across phone and desktop widths before launch.",
    "tags": [
      "Next.js 16",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Playwright",
      "axe-core"
    ],
    "keyFeatures": [
      "WhatsApp enquiry form with validation",
      "Darshan yatra and Rajasthan tour packages",
      "Vehicle fleet and hotel booking help",
      "Swipeable carousels on mobile",
      "Accessible mobile menu with focus trap"
    ],
    "architecture": [
      "Static Next.js site with no backend to maintain",
      "Automated accessibility and layout checks across screen widths",
      "Deployed to Vercel through a signed webhook on every push"
    ],
    "stats": [],
    "liveUrl": "https://www.khatucabservice.com",
    "githubUrl": "",
    "company": "Khatu Cab Service",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/khatu-cab-service-1.webp",
    "galleryUrls": [
      "/images/projects/khatu-cab-service-2.webp",
      "/images/projects/khatu-cab-service-3.webp"
    ],
    "featured": true,
    "order": 125
  },
  {
    "slug": "rajasthan-tours",
    "title": "Rajasthan Tours & Travels",
    "subtitle": "Taxi, tour package and hotel booking website",
    "description": "A website for a Rajasthan taxi and tour operator with vehicles, tour packages, hotels and WhatsApp booking.",
    "longDescription": "Rajasthan Tours & Travels sells taxis, tour packages and hotel stays across Rajasthan. The site shows the fleet from sedans to Urbania, tour packages with detailed itineraries in dialogs, hotels and reviews, and a booking form that opens a pre-filled WhatsApp enquiry. Every heading and price is real text rather than baked into images, which keeps it fast and searchable, and structured data, a sitemap and an llms.txt help search engines and AI assistants understand the business.",
    "tags": [
      "Next.js",
      "React",
      "TypeScript",
      "Playwright",
      "SEO",
      "Vercel"
    ],
    "keyFeatures": [
      "Fleet and tour packages with detail dialogs",
      "WhatsApp booking form and QR code",
      "Structured data, sitemap, robots and llms.txt",
      "Lazy-loaded WebP imagery and self-hosted fonts",
      "End-to-end tests for navigation, dialogs and links"
    ],
    "architecture": [
      "Statically exported Next.js site",
      "No customer data stored; enquiries go straight to WhatsApp",
      "Deployed to Vercel through a signed webhook"
    ],
    "stats": [],
    "liveUrl": "https://www.rajasthantaxitourshotels.com",
    "githubUrl": "",
    "company": "Rajasthan Tours & Travels",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "/images/projects/rajasthan-tours-1.webp",
    "galleryUrls": [
      "/images/projects/rajasthan-tours-2.webp",
      "/images/projects/rajasthan-tours-3.webp"
    ],
    "featured": true,
    "order": 130
  },
  {
    "slug": "tooljar",
    "title": "ToolJar",
    "subtitle": "Free image tools that run entirely in the browser",
    "description": "An open, free suite of image tools (compress, resize, crop, convert, image to PDF and more) where files never leave the user's device.",
    "longDescription": "ToolJar is a free image toolkit I built and run: compress, resize, crop, convert, rotate and flip, image to PDF, watermark, colour palette and image to Base64. Every tool runs in the browser with the Canvas API, so nothing is uploaded and it works offline once loaded. The site is built for search: each tool has its own page with FAQ structured data, and programmatic landing pages answer specific needs such as compressing a photo for an exam form or resizing for WhatsApp, with a scheduled job adding new pages automatically. It draws steady international traffic at zero hosting cost.",
    "tags": [
      "Astro",
      "TypeScript",
      "Canvas API",
      "Cloudflare Pages",
      "SEO",
      "JSON-LD",
      "GitHub Actions"
    ],
    "keyFeatures": [
      "Image tools that never upload files",
      "Image to PDF, watermark, palette and Base64 tools",
      "Programmatic SEO landing pages for common tasks",
      "FAQ and WebApplication structured data",
      "One data file drives navigation, footer and tool grid"
    ],
    "architecture": [
      "Static Astro site on Cloudflare Pages",
      "Scheduled GitHub Action generates and publishes new SEO pages",
      "Sitemap generated at build with clean URLs"
    ],
    "stats": [],
    "liveUrl": "https://tooljar.pages.dev",
    "githubUrl": "",
    "company": "",
    "workType": "personal",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "My own product.",
    "imageUrl": "/images/projects/tooljar-1.webp",
    "galleryUrls": [
      "/images/projects/tooljar-2.webp"
    ],
    "featured": true,
    "order": 135
  },
  {
    "slug": "dekko",
    "title": "Dekko",
    "subtitle": "Automatic Trakt tracking for everything you watch",
    "description": "A PWA and browser extension that marks shows and movies as watched on Trakt automatically while you watch them in the browser.",
    "longDescription": "Dekko removes the chore of logging what you watch on Trakt. A browser extension notices playback and the app scrobbles it to Trakt on its own; when a match is uncertain it waits in an inbox for one confirmation and learns the site for next time. The PWA brings Trakt's Up Next, calendar, discover, library, history and reports into one fast app with push notifications. It runs entirely on Cloudflare's free tier at dekko.rovezi.tech, with Trakt tokens encrypted at rest and refreshed before they expire.",
    "tags": [
      "React",
      "Vite",
      "TypeScript",
      "Hono",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Chrome Extension",
      "PWA",
      "Tailwind CSS"
    ],
    "keyFeatures": [
      "Automatic scrobbling from a browser extension",
      "Inbox for uncertain matches that learns site rules",
      "Up Next, calendar, discover, library and reports",
      "Web push notifications",
      "Trakt sign-in with an invite allowlist"
    ],
    "architecture": [
      "One Cloudflare Worker serves the PWA and the API",
      "Trakt tokens encrypted with AES-GCM in D1 and refreshed by cron",
      "Image proxy with caching for Trakt artwork",
      "Tests run against a fake Trakt server"
    ],
    "stats": [],
    "liveUrl": "https://dekko.rovezi.tech",
    "githubUrl": "",
    "company": "Rovezi",
    "workType": "personal",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "My own product.",
    "imageUrl": "/images/projects/dekko-1.webp",
    "galleryUrls": [],
    "featured": true,
    "order": 140
  },
  {
    "slug": "starting-core-mailer",
    "title": "Starting Core Mailer",
    "subtitle": "Self-hosted email marketing for an agency",
    "description": "A rebranded, self-hosted listmonk deployment that lets an agency run newsletters, campaigns and transactional email on its own server.",
    "longDescription": "Starting Core needed to send campaigns and newsletters without paying per subscriber to a SaaS. I rebranded the open-source listmonk as Starting Core Mailer and set it up on their own infrastructure: subscriber lists and segments, campaigns built in Markdown or a visual email builder, transactional email, bounce processing, analytics and a public subscription page with captcha. It ships as a single Go binary or a Docker image on PostgreSQL, with systemd units for running it on a server.",
    "tags": [
      "Go",
      "Vue",
      "PostgreSQL",
      "Docker",
      "listmonk",
      "SMTP"
    ],
    "keyFeatures": [
      "Campaigns, newsletters and transactional email",
      "Subscriber lists, segments and import",
      "Markdown and visual email builder templates",
      "Bounce processing and campaign analytics",
      "Public subscription page with captcha"
    ],
    "architecture": [
      "Rebranded fork of the open-source listmonk",
      "Single Go binary serving the API and the bundled frontend",
      "PostgreSQL with SQL queries kept in files",
      "Docker Compose and systemd deployment"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "Starting Core",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Rebranded and deployed as a freelance project.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 145
  },
  {
    "slug": "sc-media-discord",
    "title": "SC Media Discord",
    "subtitle": "Discord server and bots for a video-editor agency",
    "description": "A scripted Discord server and moderation bot that run recruitment and onboarding for a clipping agency's community of video editors.",
    "longDescription": "SC Media recruits video editors at scale through Discord. I designed the whole server and automated it: scripts build every role, colour, permission and channel category from scratch, and a bot runs the recruitment funnel. Applicants read the rules, watch training, open a ticket, receive test footage and submit their edit. Reviewers accept or reject with one command; accepted editors are promoted, announced and assigned a page, rejected ones get feedback by DM, and every decision is logged.",
    "tags": [
      "Python",
      "discord.py",
      "Discord",
      "Automation"
    ],
    "keyFeatures": [
      "Server built automatically: roles, permissions and categories",
      "Applicant to verified-editor recruitment funnel",
      "Accept and reject commands with announcements and DMs",
      "Ticket closing and review logs"
    ],
    "architecture": [
      "Python scripts with discord.py for setup and cleanup",
      "Bot commands restricted to reviewer roles",
      "Works alongside Ticket Tool and Carl-bot"
    ],
    "stats": [],
    "liveUrl": "",
    "githubUrl": "",
    "company": "SC Media",
    "workType": "freelance",
    "buildMethod": "unspecified",
    "role": "",
    "contribution": "Built as a freelance project.",
    "imageUrl": "",
    "galleryUrls": [],
    "featured": true,
    "order": 150
  }
] as const
