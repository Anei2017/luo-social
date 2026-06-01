# Luo Social — Admin dashboard setup

Only **super_admin** users can access `/admin`.

## 1. Get your Clerk user ID

1. Sign in to [luo-social.vercel.app](https://luo-social.vercel.app) (or local).
2. Clerk Dashboard → **Users** → open your user → copy **User ID** (starts with `user_`).

## 2. Configure Convex

[Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Environment variables**:

| Name | Value |
|------|--------|
| `SUPER_ADMIN_CLERK_IDS` | Your Clerk user ID, e.g. `user_2abc...` |

Comma-separate multiple IDs if needed.

Redeploy Convex:

```bash
npx convex deploy --yes
npx convex dev --once
```

## 3. First login

1. Open **`/admin/login`**
2. Sign in with the same Clerk account you use on the app
3. Complete **onboarding** on the main app first if you have no profile yet
4. After bootstrap, you are redirected to **`/admin`**

## Routes

| Path | Description |
|------|-------------|
| `/admin/login` | Clerk sign-in (public) |
| `/admin` | Dashboard |
| `/admin/users` | User management |
| `/admin/posts` | Post moderation |
| `/admin/reports` | Report queue |
| `/admin/analytics` | Charts |
| `/admin/settings` | Rules, banner, feature flags |

## Security

- Middleware requires Clerk session for `/admin/*` (except login)
- `(panel)/layout.tsx` server-checks `role === super_admin` via Convex
- All `api.admin.*` mutations/queries call `requireSuperAdmin()` in Convex
