# Caaizen Retreat Landing Page

Production Next.js landing page for Caaizen Retreat with a Google Sheets-backed lead form.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For Google Sheets setup, environment variables, and launch steps, see [setup.md](./setup.md).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run recover-timestamps
```

## Lead Storage

The API route writes each submission to Google Sheets as:

- Column A: Name
- Column B: Mobile
- Column C: Submitted at (IST, `YYYY-MM-DD HH:mm:ss`)

The CRM only accepts name and contact number, so export columns A and B for the
CRM upload and leave column C behind. Keeping the timestamp out of A:B means the
CRM-facing export is unchanged from before.

## Recovering Timestamps for Older Leads

Leads captured before column C existed have no stored timestamp, but Google's
revision history for the spreadsheet does. To reconstruct them:

```bash
npm run recover-timestamps                             # reconstruct from revision history
node scripts/write-recovered-timestamps.mjs --write    # backfill column C
```

This has already been run for the leads captured up to 2026-07-26, so column C
is populated for every existing row. See
[setup.md](./setup.md#8-recovering-timestamps-for-older-leads) for the
prerequisites and how to read the output.
