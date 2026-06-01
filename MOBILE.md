# LUO SOCIAL — Mobile apps (iOS & Android)

Your **web app stays the source of truth** on Vercel (`https://luo-social.vercel.app`). The mobile apps are a **native shell** (Capacitor) that loads that site in a full-screen WebView — **same design, theme, Clerk auth, and Convex features**. When you update the website, mobile users get updates automatically (no app resubmit for UI changes).

---

## Cheapest ways to get the app to users

| Method | Cost | Who can install | Notes |
|--------|------|-----------------|--------|
| **Use the website** | **$0** | Everyone | Already live on Vercel |
| **PWA “Add to Home Screen”** | **$0** | iPhone & Android | Install from browser; see [PWA](#pwa-free-install-no-store) |
| **Android APK** (direct download) | **$0** | Android only | You host the `.apk` on your site; users enable “Install unknown apps” |
| **Google Play Store** | **$25 one-time** | Android worldwide | Official store listing |
| **Apple App Store** | **$99/year** | iPhone/iPad | Required for public iOS distribution |
| **Apple TestFlight** (beta) | **$99/year** | Up to 10,000 testers | Same Apple Developer account |

**There is no way to publish on the Apple App Store for free** — Apple charges **$99 USD per year** for the Developer Program. Google Play is **$25 one-time**.

**Lowest total cost for both stores:** **~$124 first year**, then **~$99/year** (Apple renewal only).

---

## What was added in this repo

- `capacitor.config.ts` — loads `https://luo-social.vercel.app`
- `www/` — minimal placeholder (Capacitor build requirement)
- `app/manifest.ts` — PWA install (same branding `#121212` / yellow accent icon)
- npm scripts: `cap:sync`, `cap:open:ios`, `cap:open:android`, `icons:generate`

---

## Prerequisites

- **Mac with Xcode** (for iOS builds and App Store)
- **Android Studio** (for Android builds and Play Store)
- Node.js 20+
- Apple Developer account ($99/yr) for iOS store
- Google Play Console ($25 once) for Play Store

---

## 1. Generate icons (once)

```bash
npm run icons:generate
```

Creates `public/icon-192.png`, `public/icon-512.png`, `public/icon.svg`.

Optional native splash/icon assets:

```bash
npm run mobile:assets
```

---

## 2. Add native projects (once)

```bash
npx cap add ios
npx cap add android
npx cap sync
```

Commit the `ios/` and `android/` folders if you want CI or teammates to build.

---

## 3. Open and run on a device

**iOS (simulator or iPhone):**

```bash
npm run cap:open:ios
```

In Xcode: select your team → run on device.

**Android (emulator or phone):**

```bash
npm run cap:open:android
```

In Android Studio: Run ▶ on device.

The app opens your **live Vercel site** — sign in, post, chat, etc. should behave like the browser.

### Test against a different URL

```bash
CAPACITOR_SERVER_URL=https://your-preview.vercel.app npx cap sync
```

---

## PWA (free install, no store)

1. Deploy web app (already on Vercel).
2. On **Android Chrome**: menu → **Install app** / **Add to Home screen**.
3. On **iPhone Safari**: Share → **Add to Home Screen**.

Uses the same UI; no Apple/Google fees.

---

## Android — free APK (no Play Store)

1. Open Android Studio from `npm run cap:open:android`.
2. **Build → Generate Signed Bundle / APK** → APK.
3. Upload the APK to your website (e.g. `https://luo-social.vercel.app/download`).
4. Users download and install (enable unknown sources).

**Cost: $0** — good for community beta; less discoverable than Play Store.

---

## Google Play Store ($25 one-time)

1. [play.google.com/console](https://play.google.com/console) — pay **$25** registration (once).
2. Create app → **LUO SOCIAL**.
3. Build release AAB in Android Studio: **Build → Generate Signed Bundle / APK** → **Android App Bundle**.
4. Complete store listing (screenshots, description, privacy policy URL).
5. **Privacy policy**: required — host a simple page (can be a Notion/Google Doc link).
6. Submit to **Production** or **Internal testing** (internal testing is free, limited testers).

**Target API / content**: Social app — declare user-generated content, moderation, data safety form.

---

## Apple App Store ($99/year)

1. [developer.apple.com](https://developer.apple.com) — enroll **Apple Developer Program** (**$99/year**).
2. Xcode → **Signing & Capabilities** → your Team.
3. **Product → Archive** → **Distribute App** → App Store Connect.
4. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) — new app, bundle ID `com.luosocial.app` (must match `capacitor.config.ts`).
5. Screenshots (6.7" and 5.5" iPhone sizes), description, privacy policy URL.
6. **Review note**: Explain app is a community social client for `luo-social.vercel.app`; login via Clerk.

**Apple guideline 4.2**: Very simple “website wrappers” are sometimes rejected. Your app is a full **authenticated social product** (feed, messages, profiles), which helps. If rejected, reply explaining native features (camera for photos via web, push can be added later).

**TestFlight** (same $99 account): upload build → invite testers by email — free distribution for beta.

---

## Clerk on mobile

- The shell loads **your production URL**; Clerk runs in the WebView like mobile Safari/Chrome.
- In Clerk Dashboard → **Domains**, ensure `https://luo-social.vercel.app` is allowed.
- For **Google/Facebook** login on mobile, OAuth redirect URLs must include Clerk’s production callbacks (same as web).

---

## Convex on mobile

No change — `NEXT_PUBLIC_CONVEX_URL` is already on Vercel. Mobile uses the same deployed backend.

---

## Updating the app

| Change type | What to do |
|-------------|------------|
| UI, feed, colors, features (web only) | Deploy to Vercel — **mobile updates instantly** |
| App name, icon, splash, bundle ID | Edit native project / Capacitor config → rebuild → resubmit stores |
| New native plugin (e.g. push notifications) | `npm install` plugin → `npx cap sync` → rebuild → resubmit |

---

## Cost summary (cheapest path)

1. **Now ($0):** Share `https://luo-social.vercel.app` + teach users **Add to Home Screen** (PWA).
2. **Android only ($25):** Google Play one-time fee.
3. **Both platforms (~$124 year 1):** $25 Google + $99 Apple.
4. **Skip Apple ($25 total):** Play Store + PWA for iPhone users (no App Store listing).

---

## Commands cheat sheet

```bash
npm run icons:generate    # PWA / store icons
npx cap add ios           # once
npx cap add android       # once
npx cap sync              # after config changes
npm run cap:open:ios      # Xcode
npm run cap:open:android  # Android Studio
```

---

## Need help next?

- First Android APK or Play Store listing walkthrough  
- TestFlight setup  
- Privacy policy template for store forms  

Say which platform you want to ship first (Android is cheaper to start).
