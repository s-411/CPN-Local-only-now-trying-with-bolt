**What's current on DigitalOcean App Platform (2025)**

-  **Node runtime (App Platform default):** Node **22 LTS** (the NodeJS buildpack now defaults to v22).  

-  **Build/Run commands, envs, secrets, bindables:** Use App Settings → Build/Run + encrypted envs (BUILD_TIME vs RUN_TIME) + bindable vars (like ${APP_URL} and DB URLs).  

-  **Build limits/timeouts:** 4 vCPU / 10 GiB RAM / 24 GiB disk per build; **1-hour** build timeout. (Also, DO publicly documents 8 GiB as the traditional combined RAM/disk constraint for older articles --- the official Limits page is the source of truth.)  

-  **Edge/CDN & caching:** DO can cache static sites with default Cache-Control policies; for web services (Next.js SSR) set your own headers. Spaces CDN is available for assets.

⸻

**Recommended versions (Aug 26, 2025)**

These are the versions I recommend **pinning** (or using as your package baselines):

**Layer**  **Version**  **Why**

**Node.js**  **22.x**  Default DO buildpack; modern features; Supabase is dropping Node 18 support (Oct 31 2025).   

**Next.js**  **15.5**  Current stable in 2025 with fixes over 15.0; good self-host support incl. output: 'standalone'.

**Tailwind CSS**  **4.1** (+ @tailwindcss/postcss 4.1)  v4 simplifications; Next.js guide uses the @tailwindcss/postcss plugin.   

**Package manager**  **npm (bundled with Node 22)**  Zero friction with DO buildpack; if you prefer pnpm, enable Corepack and set explicit commands. (Buildpack supports npm/yarn/pnpm.)

Notes

- If you use **Auth.js (NextAuth)**, v5 is current (formerly beta) and aligned with the App Router; it relies on NEXTAUTH_URL/NEXTAUTH_SECRET (or AUTH_* names). If you use **Clerk**, follow their env-var matrix.    

- For **Supabase**, prefer **pooled** connection strings (Supavisor/PgBouncer) for containers; transaction-pooler runs on **port 6543**, and prepared statements must be disabled (e.g., ?pgbouncer=true).

⸻

**package.json (template)**

*Minimal core that deploys cleanly to DO. Add your libs (Stripe, Supabase, auth) as needed.*

{

 "name": "cpn-app",

 "private": true,

 "engines": { "node": "22.x" },

 "scripts": {

 "dev": "next dev",

 "build": "next build",

 "start": "next start -p ${PORT:-3000}"

 },

 "dependencies": {

 "next": "15.5.0",

 "react": "19.0.0",

 "react-dom": "19.0.0",

 "tailwindcss": "4.1.0",

 "@tailwindcss/postcss": "4.1.0",

 "postcss": "8.4.41"

 },

 "devDependencies": {

 "typescript": "5.6.2"

 }

}

-  Node 22 matches DO's default buildpack.  

-  Next 15.5 reference: official blog (July 31, 2025).

-  Tailwind 4.1 + @tailwindcss/postcss via Tailwind's guide.

If you add auth/payments/db SDKs, use these **safe baselines** (don't need pin-exact for DO compatibility; your lockfile will pin):

@supabase/supabase-js **^2.x**, stripe **^16.x**, next-auth **^5.x** or @clerk/nextjs **^6.x**. (Supabase explicitly advises Node 20+ and pooled connections; Clerk & Auth.js have stable Next.js guides.)

⸻

**next.config.js (optimized for DO)**

*/*** *@type* *{**import('next').NextConfig**} */*

const nextConfig = {

 output: 'standalone', *// smaller runtime image; faster boot*

 reactStrictMode: true,

 poweredByHeader: false,

 compress: true,

 images: {

 remotePatterns: [

 *// allow images you serve (Spaces/Supabase/CDN)*

{ protocol: 'https', hostname: '**.digitaloceanspaces.com' },

{ protocol: 'https', hostname: '**.supabase.co' }

 ]

 },

 *// Example: cache static assets aggressively; adjust to your needs*

 async headers() {

 return [

 {

 source: "/_next/static/:path*",

 headers: [

{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }

 ]

 },

 {

 source: "/public/:path*",

 headers: [

{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }

 ]

 }

 ];

 }

};

module.exports = nextConfig;

-  output: 'standalone' is the self-hosting recommendation.

-  You control Cache-Control on your app responses; DO caches static sites by default but your SSR app should set headers itself.

⸻

**Tailwind v4 config (vital changes)**

Tailwind 4 uses PostCSS plugin + a simple CSS import; no @tailwind base/components/utilities lines.

1.  **Install** (already in package.json versions above).

2.  **postcss.config.mjs**

export  default {

 plugins: {

 "@tailwindcss/postcss": {}

 }

}

3.  **app/globals.css**

@import  "tailwindcss";

*/* Your layers/customizations follow */*

Docs: Tailwind's framework guide (Next.js) + v4 info.

⸻

**.env structure (examples)**

Create these in DO App Settings → **Environment Variables**. Encrypt sensitive ones. (Use RUN_TIME for runtime, BUILD_TIME for things needed during next build such as analytics keys if your build inlines them.)

*# App*

NEXT_PUBLIC_APP_URL=https://cpn.yourdomain.com

NODE_ENV=production

*# Supabase (client)*

NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=pk_live_xxx

*# Supabase (server / DB)*

DATABASE_URL="postgres://postgres.YOURREF:YOURPASS@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

*# Use pooled connection (6543, transaction mode). Avoid prepared statements with PgBouncer. [oai_citation:22‡Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres?utm_source=chatgpt.com)*

*# Stripe*

STRIPE_SECRET_KEY=sk_live_xxx

STRIPE_WEBHOOK_SECRET=whsec_xxx

*# (If using Auth.js)*

NEXTAUTH_URL=https://cpn.yourdomain.com

NEXTAUTH_SECRET=generate_a_strong_secret

*# Auth.js also infers AUTH_* provider keys. [oai_citation:23‡Auth.js](https://authjs.dev/reference/nextjs?utm_source=chatgpt.com)*

*# (If using Clerk)*

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx

CLERK_SECRET_KEY=sk_live_xxx

*# Optional Clerk redirect/tuning vars are documented. [oai_citation:24‡Clerk](https://clerk.com/docs/deployments/clerk-environment-variables)*

-  DO secrets & bindables (like ${APP_URL}) are supported; you can set app-wide or component-level envs, encrypted.

⸻

**Database (Supabase) connection best practices**

-  **Use the pooled URL** (port **6543**) in containers to avoid exhausting connections; transaction poolers don't allow prepared statements → add ?pgbouncer=true (Prisma/other ORMs honor this).   

-  Supabase is **dropping Node 18** (Oct 31 2025) → your Node 22 baseline is future-proof.  

-  If you run migrations at build time, point migrations to a **direct** connection (5432) while your app uses the **pooler** at runtime.

⸻

**Build & deployment settings (DO App Platform)**

**Component type:** Web Service (Node)

**Build command (npm):**  npm ci && npm run build

**Run command:** npm start (our script binds to ${PORT})

**Node version:** inherited (22.x via buildpack) or specify via engines.node in package.json.  

**Env vars:** add in Settings → Environment Variables (encrypt secrets; choose RUN_TIME vs BUILD_TIME).  

**Custom domains + TLS:** Add domain in Networking → DO issues cert automatically. (Standard DO flow.)

**Build/Deploy limits** you should keep in mind: 1-hour timeout; per-build resources; large repos or heavy image optimization can blow RAM --- use output: 'standalone', prune dev assets, and consider Docker images or external CI if needed.

⸻

**CDN, static assets & images**

-  For **static sites**, DO sets default Cache-Control (24h edge, short browser). For **web services/Next SSR**, you control headers yourself (see next.config.js headers above).  

-  For **global asset delivery**, put user-generated files on **Spaces (with CDN)** or **Supabase Storage (CDN at edge)**, then whitelist the hostnames in images.remotePatterns.   

-  You can **tune Spaces CDN TTL and purge** via the bucket settings.

⸻

**Step-by-step deployment checklist**

1.  **Prep repo**

-  Add package.json and next.config.js above.

-  Tailwind v4: postcss.config.mjs + @import "tailwindcss"; in app/globals.css.  

2.  **Create DO App**

-  Connect Git → Create a **Web Service** from the Next.js repo.

-  Set **Build Command**  npm ci && npm run build; **Run Command**  npm start.  

3.  **Environment & secrets**

-  Add encrypted envs (RUN_TIME/BUILD_TIME) and any bindables you want (e.g., set BASE_URL=${APP_URL}).  

4.  **Database**

-  Use **Supabase pooled**  DATABASE_URL (6543 + pgbouncer=true).

-  For migrations, use direct 5432 during CI only.   

5.  **Payments**

-  Create /app/api/stripe/webhook/route.ts using Stripe's raw body requirements, and store STRIPE_WEBHOOK_SECRET. (Standard Stripe/Next guide; no DO-specific gotchas.)

6.  **Auth**

-  **Auth.js**: set NEXTAUTH_URL, NEXTAUTH_SECRET (and/or AUTH_* provider keys). Or **Clerk**: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, optional redirect vars.    

7.  **Domains**

-  Add your custom domain; DO provisions TLS automatically. (Then set CORS allowed origins in your app code accordingly.)  

8.  **Deploy**

-  First deploy should boot cleanly. If build RAM spikes, see "Common issues" below.

⸻

**Common issues (and fast fixes)**

-  **Build OOM / timeouts** (large repos, heavy image compile): keep repo lean; enable output: 'standalone'; optionally build in CI → push Docker image to DOCR to bypass DO's build step.  

-  **PORT binding / health checks**: use next start -p ${PORT} and listen on 0.0.0.0. If you see 408s in logs, they're often harmless health checks.  

-  **Tailwind 4 migration gotcha**: use @tailwindcss/postcss + @import "tailwindcss"; --- don't mix with v3's @tailwind base/components/utilities.  

-  **Static file 404s**: files must live in /public (served at root) or be emitted by Next (/_next/static).

-  **Next/Image external hosts blocked**: add Spaces/Supabase hostnames in images.remotePatterns.

-  **DB connection limits**: use **pooler URL**; add ?pgbouncer=true&connection_limit=1 with Prisma/pg; don't use prepared statements against transaction poolers.   

-  **CORS**: configure in your API handlers/middleware to your **custom domain(s)**; DO doesn't inject a CORS layer for web services by default. (App spec CORS is for certain resource types; handle CORS in your Next app.)

⸻

**Performance tuning**

-  **Bundle size**: rely on Next's SWC minify/tree-shake; avoid huge client imports; consider next/dynamic for dashboard charts.

-  **Images**: serve user content from Spaces/Supabase; enable image domains; allow long-lived immutable caching for hashed assets.   

-  **Caching**: set Cache-Control headers in route handlers or via headers() config; Spaces CDN TTL is configurable; static sites get managed defaults.

⸻

**TL;DR "copy-paste" deploy recipe for your CPN app**

1.  Pin Node 22 / Next 15.5 / Tailwind 4.1 (package.json above).  

2.  Add output: 'standalone' (next.config.js above).

3.  On DO: set **Build**  npm ci && npm run build, **Run**  npm start, add **encrypted envs**.  

4.  Use Supabase **pooler** DB URL (6543 + pgbouncer=true&connection_limit=1).  

5.  Serve images/files via Spaces or Supabase Storage; whitelist hostnames in images.remotePatterns.   

6.  Add Stripe webhook route + secret; Auth (Clerk or Auth.js) envs per docs.