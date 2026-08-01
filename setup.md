# Caaizen Retreat Landing Page Setup

## 1. Install and run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2. Create the Google Spreadsheet

1. Create a Google Sheet.
2. Rename the first tab to `Sheet1`, or use your own tab name and set `GOOGLE_SHEETS_SHEET_NAME`.
3. Keep three columns:
   - Column A: `Name`
   - Column B: `Mobile`
   - Column C: `Submitted At`
4. Copy the spreadsheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

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
GOOGLE_SHEETS_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

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
