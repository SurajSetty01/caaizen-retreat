/**
 * Backfills column C of the leads sheet with the timestamps recovered by
 * scripts/recover-lead-timestamps.mjs.
 *
 * Safety rules:
 *   - Only column C is ever written. Columns A and B are never touched.
 *   - A row is only filled if its name and mobile still match the recovered
 *     record, so a sheet that changed since the recovery run cannot be
 *     mis-stamped.
 *   - A row whose column C already has a value is left alone.
 *
 * Usage:
 *   node scripts/write-recovered-timestamps.mjs --dry-run   (preview, default)
 *   node scripts/write-recovered-timestamps.mjs --write     (apply)
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const recoveredFile = resolve(
  scriptDir,
  "output",
  "recovered-lead-timestamps.csv",
);

const HEADER_LABEL = "Submitted At";
const apply = process.argv.includes("--write");

process.loadEnvFile(resolve(projectRoot, ".env.local"));

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME ?? "Sheet1";

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!spreadsheetId) {
  fail("GOOGLE_SHEETS_SPREADSHEET_ID is not set in .env.local");
}

function getServiceAccount() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

  if (encoded) {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  }

  return {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    ),
  };
}

const serviceAccount = getServiceAccount();

if (!serviceAccount.client_email || !serviceAccount.private_key) {
  fail("Google service account credentials are not configured in .env.local");
}

const auth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

function parseCsv(text) {
  const input = text.replace(/^﻿/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char !== '"') {
        field += char;
      } else if (input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  while (rows.length > 0 && rows.at(-1).every((cell) => cell.trim() === "")) {
    rows.pop();
  }

  return rows;
}

const key = (name, mobile) =>
  `${String(name ?? "").trim().toLowerCase()}|${String(mobile ?? "").trim()}`;

async function main() {
  let recoveredCsv;

  try {
    recoveredCsv = readFileSync(recoveredFile, "utf8");
  } catch {
    fail(
      `Could not read ${recoveredFile}\nRun "npm run recover-timestamps" first.`,
    );
  }

  const recoveredRows = parseCsv(recoveredCsv).slice(1);

  // key -> queue of timestamps, so duplicate submissions stay distinct
  const recovered = new Map();

  for (const row of recoveredRows) {
    const [, name, mobile, timestamp] = row;

    if (!timestamp?.trim()) {
      continue;
    }

    const entryKey = key(name, mobile);
    const queue = recovered.get(entryKey) ?? [];
    queue.push(timestamp.trim());
    recovered.set(entryKey, queue);
  }

  console.log(`Spreadsheet: ${spreadsheetId}`);
  console.log(`Tab: ${sheetName}`);
  console.log(`Recovered records: ${recoveredRows.length}\n`);

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:C`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const sheetRows = current.data.values ?? [];

  if (sheetRows.length === 0) {
    fail("The sheet is empty.");
  }

  const hasHeader = /^(name|full name)$/i.test(
    String(sheetRows[0]?.[0] ?? "").trim(),
  );

  const updates = [];
  const skipped = [];
  const used = new Map();

  for (let index = 0; index < sheetRows.length; index += 1) {
    const rowNumber = index + 1;
    const row = sheetRows[index];
    const [name, mobile, existing] = row;

    if (hasHeader && index === 0) {
      if (String(existing ?? "").trim() === "") {
        updates.push({ rowNumber, value: HEADER_LABEL, label: "(header)" });
      }
      continue;
    }

    if (`${name ?? ""}${mobile ?? ""}`.trim() === "") {
      continue;
    }

    if (String(existing ?? "").trim() !== "") {
      skipped.push(`row ${rowNumber} (${name}) already has a value in C`);
      continue;
    }

    const entryKey = key(name, mobile);
    const occurrence = used.get(entryKey) ?? 0;
    const timestamp = recovered.get(entryKey)?.[occurrence];

    if (!timestamp) {
      skipped.push(`row ${rowNumber} (${name}) has no recovered timestamp`);
      continue;
    }

    used.set(entryKey, occurrence + 1);
    updates.push({ rowNumber, value: timestamp, label: String(name) });
  }

  if (updates.length === 0) {
    console.log("Nothing to write. Every row already has a timestamp.");
    return;
  }

  for (const update of updates) {
    console.log(`  C${update.rowNumber} = ${update.value}   ${update.label}`);
  }

  for (const note of skipped) {
    console.log(`  skipped: ${note}`);
  }

  if (!apply) {
    console.log(
      `\nDry run. ${updates.length} cell(s) would be written.` +
        `\nRe-run with --write to apply.`,
    );
    return;
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates.map((update) => ({
        range: `${sheetName}!C${update.rowNumber}`,
        values: [[update.value]],
      })),
    },
  });

  console.log(`\nWrote ${updates.length} cell(s) to column C.`);
}

main().catch((error) => {
  const message =
    error?.response?.data?.error?.message ?? error?.message ?? String(error);
  fail(`${error?.status ?? error?.code ?? "Error"}: ${message}`);
});
