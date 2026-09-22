# CloudCafe Admin

A Next.js (App Router) admin dashboard for the CloudCafe restaurant management platform. Provides role-based access, RTK Query-powered data fetching, and a localized UI (English / Bengali) wired with `next-intl` + Redux Toolkit.

## Tech Stack

| Concern | Library |
| --- | --- |
| Framework | Next.js 16 (App Router, Server + Client components) |
| UI runtime | React 19 |
| State | Redux Toolkit + React-Redux |
| Server data | RTK Query (`createApi`, `injectEndpoints`) |
| Auth | NextAuth v5 (`auth.js` / `proxy.js` middleware) |
| i18n | `next-intl` + Redux-managed active locale |
| Forms | `react-hook-form` + `zod` (`@hookform/resolvers`) |
| Tables | `@tanstack/react-table` |
| Charts | `echarts` |
| Toasts | `react-toastify` |
| Icons | `lucide-react`, `react-icons` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Lint | ESLint (`eslint-config-next`) |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

### Environment

Create a `.env` at the project root. The only variable the app reads explicitly is:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001/api
```

If unset, `config/siteConfig.js` falls back to the same default.

---

## Project Structure

```
app/                       App Router routes (server components by default)
  layout.jsx               Root layout: fonts, providers, html lang/dir
  page.jsx                 Public landing / login entry
  (admin)/                 Authenticated route group
    layout.jsx             Admin chrome (Sidebar + Topbar)
    dashboard/             Dashboard route
    user-management/       Users + roles
  api/auth/[...nextauth]   NextAuth route handler

components/
  providers/               Cross-cutting React providers (Redux, Session, Localization, Theme)
  layouts/                 Sidebar, Topbar, menuItems (route metadata)
  i18n/                    LocaleSwitcher (UI for changing language)
  common/                  Reusable presentational components (cards, tables, modals, drawers, charts)
  Forms/                   Form-field wrappers around react-hook-form
  hooks/                   Custom hooks (useDebounce, useToaster)
  modules/                 Feature modules grouped by domain (admin / public)

store/                     Redux store
  index.js                 configureStore + setupListeners
  reducers.js              combineReducers (api, user, i18n)
  apiSlice.js              Base RTK Query API (auth header, baseUrl)
  user/                    Authenticated user slice
  i18n/                    Active-locale slice (i18nSlice.js)
  auth/                    Auth-related state
  admin/                   Feature-scoped RTK Query endpoints (dashboard, user-management)
  attachment/              Attachment endpoints

config/
  siteConfig.js            baseUrl + other env-driven config

utils/
  responseTransformer.js   Normalizes list/single responses for RTK Query

messages/                  Translation source files
  index.js                 Loader that builds the per-locale messages tree
  en/                      English strings
  bn/                      Bengali strings

i18n/
  request.js               next-intl server config (cookie-driven locale)

proxy.js                   NextAuth middleware (protects /dashboard, /profile)

auth.js                    NextAuth v5 configuration
next.config.js             next-intl plugin + image remotePatterns
```

---

## Localization (i18n)

The app supports **English (`en`)** and **Bengali (`bn`)**. Default locale is `en`. The active locale lives in Redux (`state.i18n.locale`) and is mirrored to both `localStorage['app_locale']` and the `app_locale` cookie so SSR can pick the right language on first paint without a hydration mismatch.

### Flow

1. The server root layout (`app/layout.jsx`) reads the `app_locale` cookie via `next/headers`, validates it against `SUPPORTED_LOCALES`, and renders `<html lang dir>` with `initialLocale` passed to `LocalizationProvider`. This guarantees the SSR HTML matches the first client paint.
2. `LocalizationProvider` mounts `NextIntlClientProvider` with `messages[activeLocale]`, using `key={activeLocale}` so React fully remounts the provider on language switch (clean state reset, no stale translations).
3. On mount, `hydrateLocale()` reads `localStorage['app_locale']` (falling back to the cookie) and updates Redux — switching silently if it differs from the SSR value, no reload needed.
4. Switching the language via `LocaleSwitcher` dispatches `setLocale(next)`, which updates Redux + writes to both `localStorage` and the cookie so the next navigation stays in the chosen language.

### Key files

| File | Responsibility |
| --- | --- |
| `store/i18n/i18nSlice.js` | `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_STORAGE_KEY` (= `'app_locale'`); reducers `setLocale`, `hydrateLocale`; selector `selectLocale` |
| `components/providers/LocalizationProvider.jsx` | Wraps the tree in `NextIntlClientProvider`, syncs `document.documentElement.lang`/`dir`, handles client hydration |
| `components/i18n/LocaleSwitcher.jsx` | UI for switching between supported locales |
| `messages/index.js` | Builds the static `messages` object keyed by locale, then by namespace |
| `messages/en/<ns>.json`, `messages/bn/<ns>.json` | Per-locale translation sources |
| `i18n/request.js` | Server-side locale config used by `next-intl` (reads `app_locale` cookie) |
| `app/layout.jsx` | SSR: reads cookie, sets `<html lang dir>`, passes `initialLocale` to provider |

### Message file layout

One JSON file per feature namespace, kept identical in key shape across locales (only values change). Example:

```
messages/
├── index.js
├── en/
│   └── landingPage.json      { "title": "Admin Panel" }
└── bn/
    └── landingPage.json      { "title": "অ্যাডমিন প্যানেল" }
```

`messages/index.js` exports a nested object:

```js
export const messages = {
  en: { landingPage: { title: "Admin Panel" } },
  bn: { landingPage: { title: "অ্যাডমিন প্যানেল" } },
};
```

### Using translations in a component

```jsx
"use client";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const t = useTranslations("landingPage");
  return <span>{t("title")}</span>; // "Admin Panel" or "অ্যাডমিন প্যানেল"
}
```

### Switching language

```jsx
import { useDispatch, useSelector } from "react-redux";
import { selectLocale, setLocale } from "@/store/i18n/i18nSlice";

const dispatch = useDispatch();
const locale   = useSelector(selectLocale);

dispatch(setLocale("bn")); // updates Redux + localStorage + cookie
                            // all useTranslations consumers re-render
```

### Adding a new namespace

1. Create `messages/en/<name>.json` and `messages/bn/<name>.json` with identical keys.
2. Import both in `messages/index.js` and add to the `messages` object:
   ```js
   import enUsers from "./en/users.json";
   import bnUsers from "./bn/users.json";
   export const messages = {
     en: { landingPage: enLandingPage, users: enUsers },
     bn: { landingPage: bnLandingPage, users: bnUsers },
   };
   ```
3. In the component: `const t = useTranslations("users"); t("list.title")`.

### Adding a new locale

1. Create `messages/<code>/` with the same JSON file list as `en/`.
2. In `messages/index.js`, import every per-locale JSON and add a `<code>: { ... }` block mirroring `en`.
3. Add `'<code>'` to `SUPPORTED_LOCALES` in `store/i18n/i18nSlice.js`.
4. Add the option to `OPTIONS` in `components/i18n/LocaleSwitcher.jsx`.
5. If the locale is right-to-left, add the code to `RTL_LOCALES` in the slice.

### Non-negotiables

- Never read `localStorage` / `document.cookie` during SSR or the initial render. Guard with `typeof window !== 'undefined'` or run inside `useEffect`.
- The SSR HTML must match the first client paint — `app/layout.jsx` reads the cookie server-side and passes `initialLocale` to `LocalizationProvider`.
- Keep translation keys identical across locales; only values change.
- `key={activeLocale}` on `NextIntlClientProvider` forces a clean remount on language switch.

---

## State Management (Redux Toolkit)

The store is composed in `store/reducers.js`:

```
combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,   // RTK Query cache
  user: UserReducer,                          // authenticated user
  i18n: I18nReducer,                          // active locale
})
```

`store/index.js` configures the store with `serializableCheck: false` (RTK Query payloads) and registers `apiSlice.middleware` plus `setupListeners` for refetch-on-focus/reconnect.

### RTK Query

`store/apiSlice.js` defines the base API with `credentials: "include"` and a `prepareHeaders` that attaches `Authorization: Bearer <token>` from `state.user.token`. Feature endpoints live in `store/<feature>/index.js` and use `apiSlice.injectEndpoints({ endpoints: (builder) => ({...}) })`, so new endpoints are auto-registered at import time without modifying the base slice. Tags (`"userlist"`, etc.) are declared in `tagTypes` for cache invalidation.

`utils/responseTransformer.js` normalizes list/single responses so endpoints can return the same shape regardless of backend wrapping.

---

## Auth

- `auth.js` exports the NextAuth v5 config (credentials provider, callbacks, session shape).
- `app/api/auth/[...nextauth]/route.js` is the route handler.
- `proxy.js` is the middleware (Next.js 16 calls middleware files `proxy.js`) that protects `/dashboard` and `/profile`, redirecting unauthenticated users to `/` with a `callbackUrl` query.
- `components/providers/SessionProvider.jsx` wires `SessionProvider` from `next-auth/react` for client components.
- `components/providers/SessionSync.jsx` mirrors the session into the Redux `user` slice so the rest of the app reads auth state from a single source.

---

## Routing

The `(admin)` folder is a route group — its children inherit the `app/(admin)/layout.jsx` chrome (Sidebar + Topbar) without affecting URLs. Public routes (`/`, `/login`) live at the root of `app/`.

`components/layouts/menuItems.js` is the single source of truth for sidebar entries; it carries `requiredPermissions` so the sidebar can hide items the current user cannot access.

---

## Configuration

`config/siteConfig.js` exposes `baseUrl` from `NEXT_PUBLIC_BACKEND_URL`. `next.config.js` registers the `next-intl` plugin and lists every host allowed for `next/image` (local dev hosts + the Render production backend).

---

## Build & Deploy

```bash
npm run build
npm run start
```

The app is configured for both local development (`http://localhost:8001`) and a Render-hosted backend (`resturant-backend-3khk.onrender.com`) via `next.config.js` `images.remotePatterns`. No additional deploy configuration is required beyond the standard Next.js host (Vercel, Render, etc.).