# Snap Track — Project Context
# AI-powered receipt scanning & expense management app
# Target market: Hungary | Solo dev: Balazs (Vibe Coding)

---

## What This App Does
Mobile app that lets users photograph paper receipts. Gemini Flash 2.0 extracts
the data (merchant, date, amount, VAT, items). The app stores, categorizes, and
exports expense data. Primary users: Hungarian freelancers, small businesses,
and cost-conscious individuals.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Mobile       | React Native + Expo (managed)     |
| Language     | TypeScript (strict mode)          |
| Backend/DB   | Firebase (Firestore + Auth + Storage) |
| AI / OCR     | Gemini Flash 2.0 only (not Pro)   |
| State        | Zustand                           |
| Navigation   | Expo Router (file-based)          |
| Styling      | NativeWind (Tailwind for RN)      |
| Testing      | Jest + React Native Testing Library |

---

## Subscription Tiers

| Tier     | Receipts/month | Key Features                          |
|----------|---------------|---------------------------------------|
| Free     | 10            | Basic scan + manual category          |
| Starter  | 50            | + CSV export                          |
| Pro      | Unlimited     | + Excel export, AI categories, charts |
| Business | Unlimited     | + Multi-user, API access, priority    |

Tier logic lives in: `src/services/subscriptionService.ts`
Never gate-check tier logic in UI components directly — always go through the service.

---

## Folder Structure

```
snap-track/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/             # Login, register, onboarding
│   ├── (tabs)/             # Main tab navigation
│   │   ├── index.tsx       # Dashboard / recent receipts
│   │   ├── scan.tsx        # Camera + OCR trigger
│   │   ├── expenses.tsx    # Expense list + filters
│   │   └── settings.tsx    # Account, subscription, export
│   └── _layout.tsx
├── src/
│   ├── components/         # Reusable UI components (dumb, no business logic)
│   ├── services/           # All external API calls
│   │   ├── ocrService.ts   # Gemini Flash 2.0 integration
│   │   ├── firebaseService.ts
│   │   └── subscriptionService.ts
│   ├── store/              # Zustand stores
│   │   ├── receiptStore.ts
│   │   └── userStore.ts
│   ├── hooks/              # Custom React hooks
│   ├── types/              # Shared TypeScript interfaces
│   │   ├── receipt.ts
│   │   ├── expense.ts
│   │   └── user.ts
│   └── utils/              # Pure helper functions
│       ├── currency.ts     # HUF formatting
│       ├── vat.ts          # Hungarian VAT calculations
│       └── dateFormat.ts   # Hungarian date formats
├── assets/
├── .claude/
│   └── CLAUDE.md           # This file
├── .env.local              # Never commit this
├── app.json
└── package.json
```

---

## Domain Terminology

- **Receipt (nyugta/számla):** The raw scanned document — paper or digital
- **Expense (kiadás):** A processed receipt entry with category and metadata
- **OCR run:** One Gemini API call to extract structured data from a receipt image
- **Category (kategória):** AI-suggested or manually set expense category
- **Tier:** The user's active subscription level
- **ÁFA (VAT):** Hungarian value-added tax — standard rate 27%, reduced 5% or 18%
- **Gross amount (bruttó):** Amount including VAT — what the user paid
- **Net amount (nettó):** Amount excluding VAT — relevant for business deductions

---

## Hungarian Business Rules

- VAT rates: 27% (standard), 18% (hospitality), 5% (food, books, medicine)
- Always store BOTH gross and net amounts as integers in HUF (no decimals needed)
- Date format in UI: YYYY.MM.DD (Hungarian standard)
- Currency display: `12 500 Ft` (space as thousands separator, Ft suffix)
- Business receipts must store the merchant's tax number (adószám) if available

---

## Firebase Data Model (Firestore)

```
users/{userId}
  - email, displayName, tier, createdAt, deletedAt

users/{userId}/receipts/{receiptId}
  - imageRef (Storage path — deleted after OCR)
  - merchant, date, grossAmount, netAmount, vatRate, vatAmount
  - items: [{name, grossAmount, netAmount, vatRate}]
  - category, notes, createdAt, source (camera | upload)

users/{userId}/expenses/{expenseId}
  - receiptId (ref), category, tags, month (YYYY-MM for easy querying)
```

- Never do unbounded Firestore queries — always use `.limit()` or paginate
- Index on: `month`, `category`, `createdAt DESC`
- GDPR cascade delete: when user deletes account, remove Auth + all Firestore docs + Storage files

---

## Gemini OCR Integration

- Model: `gemini-flash-2.0` only — never upgrade to Pro without explicit approval (cost control)
- Input: base64 image
- Expected output: structured JSON (merchant, date, grossAmount, vatAmount, items[])
- Always validate Gemini output before writing to Firestore — it can hallucinate
- If confidence is low or required fields are missing: prompt user to fill in manually
- Delete the Storage image immediately after successful OCR extraction

Prompt template lives in: `src/services/ocrService.ts`

---

## Security Rules

- NEVER hardcode API keys — use `.env.local` and Firebase Remote Config
- Firebase Security Rules: only the authenticated user can read/write their own data
- Never log receipt content, amounts, or any user PII to the console
- GDPR: user must be able to export and fully delete all their data
- Storage: receipt images are private, signed URLs only, auto-delete after OCR

---

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator / device
npm run ios            # Run on iOS simulator / device
npm test               # Jest test suite
npm run lint           # ESLint check
npx expo export        # Production build
```

---

## What Needs Tier Gating

Always check via `subscriptionService.checkLimit()` before these actions:

- Scanning a new receipt (Free: 10/month, Starter: 50/month)
- Exporting to CSV (Starter+)
- Exporting to Excel (Pro+)
- Adding a second user to an account (Business only)

---

## Known Constraints & Decisions

- Expo managed workflow — no custom native modules without ejecting
- Offline-first: receipt data must be readable without internet (Firestore offline cache)
- No backend server — all logic runs client-side or via Firebase Functions
- Firebase Functions only for: subscription webhooks, scheduled data cleanup

---

## Out of Scope (do not implement unless explicitly asked)

- Web version
- Receipt sharing between users
- Bank account integration
- Multi-currency support
