# Finance Tracker

Personal finance tracker: Next.js 14 + Google Sheets as DB + Vercel hosting.

## What it tracks
- **Expenses** — category, amount, note, payment mode (UPI/Cash/Card/Net Banking)
- **Income** — Salary, Freelance, Rental, Investment Returns, Other
- **Investments** — FD, SIP, Stocks, PPF, EPF, NPS (with units + buy price)
- **Bank accounts** — balance per account
- **Dashboard** — net worth, monthly summary, holdings breakdown
- **Export** — everything to Excel in one click

---

## Setup (one time)

### 1. Clone and install
```bash
git clone <your-repo>
cd finance-tracker
npm install
```

### 2. Google Sheets

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → enable **Google Sheets API**
3. Go to **IAM & Admin → Service Accounts** → Create service account → create JSON key → download
4. Create a new [Google Spreadsheet](https://sheets.google.com)
5. Share it with the service account email (Editor access)
6. Create **4 sheets (tabs)** with these exact names and headers in row 1:

| Sheet name | Row 1 headers |
|---|---|
| `expenses` | `id` `date` `category` `amount` `note` `payment_mode` |
| `income` | `id` `date` `type` `amount` `note` |
| `holdings` | `id` `type` `name` `amount` `units` `buy_price` `maturity_date` `last_updated` |
| `accounts` | `id` `bank_name` `account_type` `balance` `last_updated` |

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
ADMIN_USERNAME=yourname
ADMIN_PASSWORD=yourpassword
JWT_SECRET=some-long-random-string-at-least-32-chars

GOOGLE_SHEET_ID=          # from the spreadsheet URL: /d/SHEET_ID/edit
GOOGLE_SERVICE_ACCOUNT_JSON=   # paste the entire JSON key file on ONE line
```

> **Tip for the JSON key:** open the downloaded file, select all, and paste it as one line.
> On Mac/Linux: `cat key.json | tr -d '\n' | pbcopy`

### 4. Run locally
```bash
npm run dev
# open http://localhost:3000
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all 5 env vars in **Settings → Environment Variables**
4. Deploy — done!

---

## Tech stack
- **Next.js 14** App Router + TypeScript
- **Google Sheets API v4** — service account auth
- **jose** — JWT auth (edge-compatible)
- **xlsx** — Excel export
- **Tailwind CSS** + **lucide-react**
