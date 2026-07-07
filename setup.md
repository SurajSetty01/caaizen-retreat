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
3. Keep exactly two columns:
   - Column A: `Name`
   - Column B: `Mobile`
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
```

No timestamp or extra CRM-breaking columns are added.

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
4. Export the sheet as CSV or XLSX for CRM import. The export will match the CRM structure because only columns A and B are written.
