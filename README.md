# Snap Track

![CI](https://github.com/Schb7090/snap/actions/workflows/ci.yml/badge.svg)

Hungarian receipt-scanning and expense-management mobile app. Photograph a paper receipt, Gemini Flash 2.0 extracts the data (merchant, date, bruttó/nettó/ÁFA, line items), the app stores and categorizes everything, and exports to CSV/Excel.

Built for: Hungarian freelancers, small businesses, and cost-conscious individuals.

## Tech stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 54 (managed workflow) |
| Language | TypeScript (strict mode + `noUncheckedIndexedAccess`) |
| Backend | Firebase (Auth + Firestore + Storage, JS SDK) |
| AI / OCR | Gemini Flash 2.0 (`gemini-2.0-flash`) |
| State | Zustand |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind v4 (Tailwind for RN) |
| Testing | Jest + React Native Testing Library |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in Firebase + Gemini keys
npm start                    # press a/i for Android/iOS, or scan QR with Expo Go
```

The app runs in **dev mode** without Firebase/Gemini keys — login accepts any credentials, scan creates mock receipts. Add real keys to `.env.local` to wire the backend.

### Required env vars

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GEMINI_API_KEY=
```

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Expo dev server with QR for Expo Go |
| `npm run android` | Open in Android emulator |
| `npm run ios` | Open in iOS simulator (Mac only) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `expo lint` |
| `npm test` | Jest (114 tests) |
| `npm run format` | Prettier on all sources |

## Project structure

```
app/                      Expo Router screens (file-based routing)
  (auth)/                 Login, register, onboarding
  (tabs)/                 Dashboard, scan, expenses, settings
  receipt/[id].tsx        Detail + edit
  receipt/new.tsx         Manual entry / OCR fallback
  upgrade.tsx             Tier pricing modal
  export.tsx              CSV / Excel export modal
src/
  components/             UI building blocks (no business logic)
  services/               External I/O — Firebase, Gemini, exports
  store/                  Zustand stores
  hooks/                  Cross-cutting React hooks
  types/                  Shared TS interfaces
  utils/                  Pure functions (vat math, currency, dates)
  constants/              Tier configs, categories
__tests__/                Mirror of src/ for Jest
firestore.rules           Server-side validation + security
.github/workflows/ci.yml  Lint + typecheck + test + bundle
```

## Hungarian business rules

- VAT rates: 27% (standard), 18% (hospitality), 5% (food/books/medicine)
- Amounts stored as integer HUF (no decimals) — enforced by branded `Huf` TS type
- Date format: `YYYY.MM.DD` (Hungarian standard)
- Currency display: `12 500 Ft`

## Deploying Firebase rules

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## License

Private — all rights reserved.
