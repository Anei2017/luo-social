# Deploy LUO SOCIAL (step-by-step)

This guide takes you from zero to a live site on **Vercel** with **Clerk** (Google, Facebook, email) and **Convex** (database + real-time feed).

---

## What you need

- [GitHub](https://github.com) account (for Vercel deploy)
- [Clerk](https://clerk.com) account (free tier works)
- [Convex](https://convex.dev) account (free tier works)
- Node.js 20+ installed locally

---

## Part 1 — Clerk (authentication)

### 1. Create application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **Add application** → name it **LUO SOCIAL**.
2. Copy **Publishable key** and **Secret key**.

### 2. Enable sign-in methods

In Clerk → **User & Authentication** → **Email, Phone, Username**:

- Enable **Email address** (email + password or magic link).
- Enable **Social connections**:
  - **Google** — follow Clerk’s OAuth setup (Google Cloud Console).
  - **Facebook** — follow Clerk’s Meta app setup.

### 3. Paths

In Clerk → **Paths** (or configure via env):

| Setting | Value |
|--------|--------|
| Sign-in URL | `/sign-in` |
| Sign-up URL | `/sign-up` |
| After sign-in | `/onboarding` |
| After sign-up | `/onboarding` |

### 4. JWT for Convex

1. Clerk → **JWT templates** → **New template** → choose **Convex**.
2. Copy the **Issuer URL** (looks like `https://xxx.clerk.accounts.dev`).
3. You will add this to Convex as `CLERK_JWT_ISSUER_DOMAIN` in Part 2.

---

## Part 2 — Convex (database)

### 1. Install CLI and log in

```bash
cd /Users/admin/Projects-HDD/ghost-2
npx convex login
```

### 2. Start dev (links project + generates types)

```bash
npx convex dev
```

- Create a new project when prompted (e.g. `luo-social`).
- Leave this terminal running while developing locally.
- It writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.

### 3. Set Clerk issuer in Convex

In [dashboard.convex.dev](https://dashboard.convex.dev) → your project → **Settings** → **Environment variables**:

| Name | Value |
|------|--------|
| `CLERK_JWT_ISSUER_DOMAIN` | Issuer URL from Clerk Convex JWT template |

Redeploy Convex functions after saving (Convex dev terminal usually picks this up automatically).

### 4. Deploy Convex to production

```bash
npx convex deploy
```

Copy the **production** `NEXT_PUBLIC_CONVEX_URL` for Vercel.

---

## Part 3 — Local environment

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...   # or pk_test_ for dev
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

Run the app:

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):

1. **Join free** → sign up with Google / Facebook / email.
2. Complete **onboarding** (username + display name).
3. Open **Feed** → create a post, like, comment.

---

## Part 4 — Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "LUO SOCIAL: Clerk auth, Convex feed, African branding"
git remote add origin https://github.com/YOUR_USER/luo-social.git
git push -u origin main
```

### 2. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → import your repo.
2. Framework: **Next.js** (auto-detected).

### 3. Environment variables on Vercel

Add every variable from `.env.local`:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Clerk — server only |
| `NEXT_PUBLIC_CONVEX_URL` | Production Convex URL |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/onboarding` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |

`CLERK_JWT_ISSUER_DOMAIN` lives in **Convex**, not Vercel.

### 4. Deploy

Click **Deploy**. When the build finishes, open your `*.vercel.app` URL.

### 5. Clerk production URLs

In Clerk → **Domains** → add your Vercel URL:

- `https://your-app.vercel.app`
- Custom domain later if you add one.

Update Google/Facebook OAuth redirect URIs to include production Clerk callbacks (Clerk docs show exact URLs).

---

## Part 5 — Custom domain (optional)

1. Vercel → project → **Domains** → add `luosocial.com` (example).
2. Add the DNS records Vercel shows.
3. Add the same domain in Clerk **Domains**.

---

## App routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/onboarding` | Username / profile setup |
| `/feed` | Main social feed (posts, likes, comments) |
| `/discover` | Discovery grid |
| `/profile` | Your profile |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Not authenticated” on post | Signed in with Clerk but Convex JWT missing → check `CLERK_JWT_ISSUER_DOMAIN` in Convex |
| Redirect loop | Clear cookies; ensure `/onboarding` is not listed as public in `proxy.ts` |
| Build fails on Vercel | All `NEXT_PUBLIC_*` vars must be set in Vercel project settings |
| Google/Facebook login fails | OAuth app in test mode / wrong redirect URI in Google or Meta console |
| Empty feed | Create a post after onboarding; Convex dev must be running locally |

---

## Ideas already in the app

- **Ubuntu** community tagline on feed
- **Topic chips** on posts (Culture, Diaspora, Music, etc.)
- **Kente-style** accent strip + warm African color palette
- **Custom LUO sun logo** (SVG)
- Real-time feed via Convex `useQuery`

## Mobile apps (iOS & Android)

See **[MOBILE.md](./MOBILE.md)** for Capacitor wrappers, PWA install, store costs ($25 Google / $99 Apple), and free APK distribution.

---

## Next features you can add

- Image uploads (Convex file storage or Uploadthing)
- Follow button on profiles (`follows.toggle` is ready)
- Notifications table + bell icon
- Direct messages
- Mobile PWA manifest

---

When deployment succeeds, share your Vercel URL and we can wire a custom domain or add uploads next.
