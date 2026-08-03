import { google, sheets_v4 } from "googleapis";
import type { Lead } from "@/lib/lead-validation";

let sheetsClient: sheets_v4.Sheets | null = null;

/**
 * Turn whatever the host handed us into a canonical PEM.
 *
 * A hosting panel is free to mangle a multi-line value on its way into
 * process.env: keep the quotes a .env line used, escape the backslash a second
 * time, swap LF for CRLF, or drop the separators entirely. Any of those breaks
 * OpenSSL, which reports the lot as "no start line". Rather than trust the
 * transport, we rebuild the block from its base64 body, so only the body itself
 * has to survive intact.
 */
export function normalizePrivateKey(raw: string) {
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Resolve escape sequences, double-escaped form first: a panel that escapes
  // the backslash a second time would otherwise leave a stray backslash welded
  // to the end of the BEGIN line. `\r` is dropped rather than translated —
  // its `r` is a valid base64 character, so leaving it to the body filter below
  // would silently corrupt the key instead of failing loudly.
  const unescape = (s: string) =>
    s.replace(/\\\\([nr])/g, (_, c) => (c === "n" ? "\n" : ""));

  key = unescape(key).replace(/\\([nr])/g, (_, c) => (c === "n" ? "\n" : ""));

  const pem = key.match(/-----BEGIN ([A-Z ]+?)-----([\s\S]*?)-----END \1-----/);

  if (!pem) {
    return key; // not recognisably PEM — let OpenSSL say so
  }

  const body = pem[2].replace(/[^A-Za-z0-9+/=]/g, "");
  const lines = body.match(/.{1,64}/g) ?? [];

  return `-----BEGIN ${pem[1]}-----\n${lines.join("\n")}\n-----END ${pem[1]}-----\n`;
}

function getPrivateKey() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!rawKey) {
    return undefined;
  }

  return normalizePrivateKey(rawKey);
}

/**
 * A structural, redacted description of the credentials the RUNTIME can see —
 * logged when a submission fails so a mangled or stale value can be identified
 * from the host's log instead of inferred. Deliberately emits no key material:
 * only lengths, counts, and whether the fixed public PEM markers are present.
 */
export function describeCredentialEnv() {
  const describeKey = (k: string | undefined) => {
    if (k === undefined) return "absent";
    const trimmed = k.trim();
    return [
      `len=${k.length}`,
      `beginMarker=${trimmed.startsWith("-----BEGIN PRIVATE KEY-----")}`,
      `endMarker=${trimmed.includes("-----END PRIVATE KEY-----")}`,
      `realLF=${(k.match(/\n/g) ?? []).length}`,
      `escapedLF=${(k.match(/\\n/g) ?? []).length}`,
      `doubleEscapedLF=${(k.match(/\\\\n/g) ?? []).length}`,
      `quoted=${/^["']/.test(k)}`,
      `normalizesToPem=${normalizePrivateKey(k).startsWith("-----BEGIN PRIVATE KEY-----\n")}`,
    ].join(",");
  };

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  let b64State: string;

  if (!b64) {
    b64State = "absent";
  } else {
    try {
      const parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
      b64State = `len=${b64.length},decode=ok,email=${Boolean(parsed.client_email)},key{${describeKey(parsed.private_key)}}`;
    } catch (error) {
      b64State = `len=${b64.length},decode=FAILED(${(error as Error).message})`;
    }
  }

  return [
    `JSON_BASE64{${b64State}}`,
    `EMAIL{${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "present" : "absent"}}`,
    `PRIVATE_KEY{${describeKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)}}`,
    `SPREADSHEET_ID{${process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? "present" : "absent"}}`,
    `SHEET_NAME{${process.env.GOOGLE_SHEETS_SHEET_NAME ?? "unset"}}`,
  ].join(" ");
}

function getServiceAccountFromBase64() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!encoded) {
    return null;
  }

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  return JSON.parse(decoded) as {
    client_email?: string;
    private_key?: string;
  };
}

function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  const serviceAccount = getServiceAccountFromBase64();
  const clientEmail =
    serviceAccount?.client_email ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Normalised on both paths: the base64 blob protects the key in transit, but
  // the JSON inside it can still carry a key that was mangled before encoding.
  const privateKey = serviceAccount?.private_key
    ? normalizePrivateKey(serviceAccount.private_key)
    : getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credentials are not configured.");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// Written as "YYYY-MM-DD HH:mm:ss" in IST so Sheets stores it as a real
// datetime under USER_ENTERED, which keeps sorting and filtering working.
function formatSubmittedAt(date: Date) {
  const parts = timestampFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export async function appendLeadToSheet(lead: Lead) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME ?? "Sheet1";

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured.");
  }

  // Columns A and B stay exactly as the CRM expects. The timestamp goes in
  // column C so a CRM export of A:B is still a straight copy.
  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:C`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[lead.name, lead.mobile, formatSubmittedAt(new Date())]],
    },
  });
}
