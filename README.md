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
```

## Lead Storage

The API route writes each submission to Google Sheets with exactly two columns:

- Column A: Name
- Column B: Mobile

This keeps exports directly compatible with the CRM upload format.
