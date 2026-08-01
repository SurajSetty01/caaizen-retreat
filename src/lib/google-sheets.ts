import { google, sheets_v4 } from "googleapis";
import type { Lead } from "@/lib/lead-validation";

let sheetsClient: sheets_v4.Sheets | null = null;

function getPrivateKey() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!rawKey) {
    return undefined;
  }

  return rawKey.replace(/\\n/g, "\n");
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
  const privateKey = serviceAccount?.private_key ?? getPrivateKey();

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
