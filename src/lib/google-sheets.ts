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

export async function appendLeadToSheet(lead: Lead) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME ?? "Sheet1";

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured.");
  }

  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:B`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[lead.name, lead.mobile]],
    },
  });
}
