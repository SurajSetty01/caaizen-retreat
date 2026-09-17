# Caaizen Retreat Landing Page Setup

## 1. Install and run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2. Create the Google Spreadsheet

1. Create a Google Sheet.
2. Rename the lead tab if needed and set `GOOGLE_SHEETS_SHEET_NAME` to that tab title.
   `WEBSITE FORM` is fine.
3. Keep three columns:
   - Column A: `Name`
   - Column B: `Mobile`
   - Column C: `Submitted At`
4. Copy the spreadsheet ID and tab ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit#gid=SHEET_ID_HERE
```

The spreadsheet ID identifies the whole file. The sheet ID identifies the
specific tab and stays stable even if the tab is renamed.

## 3. Create Google service account credentials

1. Go to Google Cloud Console.
2. Create or select a project.
3. Enable the Google Sheets API.
4. Create a Service Account.
5. Create a JSON key for that Service Account and download it.
6. Open the Google Sheet and share it with the service account email, using Editor access.

The service account email looks like:

```text
your-service-account@your-project.iam.gserviceaccount.com
```

## 4. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill these values:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_SHEET_NAME=WEBSITE FORM
GOOGLE_SHEETS_SHEET_ID=0
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`GOOGLE_SHEETS_SHEET_ID` is recommended for production. If the tab is renamed,
the app resolves the current tab title from this stable ID before appending the
lead.

If the private key has real line breaks, keep it inside quotes. If you paste it as one line, replace each line break with `\n`.

Alternative: base64 encode the full downloaded JSON key and set only:

```env
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=base64_encoded_json_here
```

## 5. How lead capture works

The form collects only:

- Name
- Mobile

When submitted:

1. The client validates the name and Indian mobile number.
2. `POST /api/leads` validates the same fields again on the server.
3. The server normalizes the mobile number to 10 digits.
4. The server appends one row to the configured Google Sheet.
5. The row format is exactly:

```text
Column A = Name
Column B = Mobile
Column C = Submitted At (IST, YYYY-MM-DD HH:mm:ss)
```

The CRM accepts only name and contact number, so the timestamp is deliberately
parked in column C. Export columns A and B for the CRM upload and the file is
identical in shape to what you uploaded before.

## 6. Verify before launch

```bash
npm run lint
npm run build
```

Submit a test lead from the site and confirm one row appears in the sheet.

## 7. Deploy

On Vercel or another Next.js host:

1. Add the same environment variables in the hosting dashboard.
   For the current Caaizen sheet, use `GOOGLE_SHEETS_SHEET_ID=0` for the
   `WEBSITE FORM` tab.
2. Deploy the project.
3. Test a lead submission on the production URL.
4. Export columns A and B as CSV or XLSX for CRM import. Column C holds the
   timestamp and is not part of the CRM upload.

## 8. Recovering timestamps for older leads

Leads captured before column C existed have no stored timestamp. They can still
be recovered, because every append the API made is recorded as an edit in the
spreadsheet's Google Drive revision history.

`npm run recover-timestamps` lists every revision, exports each one as CSV,
and diffs consecutive snapshots. Rows appearing for the first time in a
revision are attributed to that revision's time.

### Prerequisite

Enable the **Google Drive API** in the same Cloud project as the service
account:

Google Cloud Console -> APIs & Services -> Library -> Google Drive API -> Enable

No new credentials or sharing changes are needed. The script is read-only and
never writes to the spreadsheet.

### Run it

```bash
npm run recover-timestamps
```

Output is written to `scripts/output/recovered-lead-timestamps.csv`, which is
gitignored because it contains personal data.

### Reading the output

Each row carries a `Precision` value:

| Precision | Meaning |
| --- | --- |
| `exact` | The revision added this one row. Accurate to the minute. |
| `between` | The revision added several rows at once. The lead arrived between `Earliest Possible` and `Recovered Date/Time`. |
| `on-or-before` | The row already existed in the oldest revision Google still retains. Only an upper bound is known. |

Google merges older fine-grained revisions over time, so recent leads resolve
precisely while older ones may only resolve to a window. The date is reliable
in nearly all cases; the exact time is not always.

Rows are matched by identity (name plus mobile), not by position, so rows that
were deleted from the middle of the sheet do not shift the dates of the rows
below them. If a row appeared in an earlier revision but is gone from the sheet
today, the script reports the count and leaves it out of the output.

### Writing the recovered values into the sheet

```bash
node scripts/write-recovered-timestamps.mjs            # preview only
node scripts/write-recovered-timestamps.mjs --write    # apply
```

This fills column C from the recovered CSV. It only ever writes column C, only
fills cells that are currently empty, and only fills a row whose name and mobile
still match the recovered record, so a sheet that changed after the recovery run
cannot be mis-stamped. Run it without `--write` first to see exactly what it
would do.

This backfill has already been run for the leads captured up to 2026-07-26.

## 9. Google Ads conversion tracking

### What is installed

The account-level Google tag (`AW-18300583994`) is on every page, and one
conversion action — "Contact" — is reported from two places:

| Trigger | Where it fires |
| --- | --- |
| Callback form submitted | `/thank-you`, after a successful POST to `/api/leads` |
| WhatsApp tapped | Wherever the WhatsApp link appears (floating button, thank-you page) |

Both IDs live in one file, [src/lib/gtag.ts](./src/lib/gtag.ts). Nothing else
hardcodes them.

### Why the form now redirects

Submitting used to show a line of text in place. It now lands on `/thank-you`,
because a conversion tag needs a URL that Google Ads (and later any other ad
platform) can point a trigger at, and because someone who has just raised their
hand is the best possible audience for a WhatsApp prompt.

### The count is protected on purpose

A thank-you URL can be reloaded, bookmarked, shared and crawled, and each of
those would otherwise be counted as a lead. Inflated conversions are worse than
none, because Smart Bidding optimises against them. Three guards:

1. A successful POST mints a one-shot token; `/thank-you` spends it exactly
   once. No token — a direct visit, a refresh, a crawler — means the page still
   renders but reports nothing.
2. The conversion fires at most once per tab, so form-then-WhatsApp is one
   contact, and five WhatsApp taps are one contact.
3. `/thank-you` is `noindex, nofollow` and is kept out of `sitemap.ts`.

### Nothing fires outside production

`trackingEnabled` is `NODE_ENV === "production"`, so `npm run dev` and a local
`npm start` never touch the Ads account. Verify on the live site with Google's
Tag Assistant, not on localhost.

### Verifying after a deploy

1. View source on the live site. There must be **exactly one**
   `googletagmanager.com/gtag/js` script tag, in `<head>`. More than one
   double-counts every conversion.
2. Submit a real form. You should land on `/thank-you`, and Tag Assistant
   should show one `conversion` event.
3. Reload `/thank-you`. Tag Assistant should show **no** second conversion.
4. Google Ads → Goals → Conversions takes a few hours to move. "Unverified"
   there until the first real conversion arrives is normal.

### Two things this does not do yet

- **Form fills and WhatsApp taps cannot be told apart in reporting**, because
  they share one conversion action. Separating them needs a second conversion
  action created in the Ads console and a second label in `gtag.ts`.
- **A closed sale is not tied back to the ad.** The conversion says "someone
  made contact", not "someone bought", so bidding optimises for volume of
  enquiries rather than revenue. Fixing that is enhanced conversions for leads
  plus an offline upload of won deals, and it needs sale outcomes coming back
  from wherever the leads are worked.
