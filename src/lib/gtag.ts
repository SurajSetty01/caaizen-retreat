/**
 * Google Ads tracking for the Caaizen Retreat landing page.
 *
 * WHY THIS EXISTS. The Google Sheet already records how many people filled the
 * form. What it cannot record is WHICH AD CLICK produced each one. That link
 * lives in a cookie Google Ads sets from the `gclid` on the ad's landing URL,
 * and it only travels back to Google if a conversion tag fires in the same
 * browser. Without it Smart Bidding has no signal to optimise against and keeps
 * spending on whatever is cheapest to click rather than on whatever produces
 * callbacks.
 *
 * TWO SEPARATE CONVERSION ACTIONS. A form submission and a WhatsApp tap are
 * different events with different intent, so they report to different actions
 * in the Ads account and can be bid on and reported separately. They were
 * briefly collapsed into one shared action, which made them indistinguishable
 * in reporting — do not merge them again without a reason.
 *
 * FIRING IS CAPPED PER ACTION, NOT GLOBALLY. That distinction matters. One
 * person who submits the form AND taps WhatsApp is one lead and one WhatsApp
 * enquiry: both should be reported, because they are different actions. But one
 * person tapping WhatsApp five times is still one enquiry. So the "already
 * counted" flag is keyed per action rather than shared. It lives in
 * `sessionStorage`, so it is per tab and resets on a genuinely new visit.
 *
 * Inflated conversions are worse than none: Smart Bidding learns from them.
 */

/** The account-level Google tag. Same on every page. */
export const GOOGLE_ADS_ID = "AW-18300583994";

/** "Submit lead form" — fired from /thank-you after a real submission. */
const LEAD_FORM_CONVERSION = "AW-18300583994/puIMCOfrmvscELqAs5ZE";

/** "Contact" — fired when the WhatsApp link is tapped. */
const WHATSAPP_CONVERSION = "AW-18300583994/y5R5CKzPmvscELqAs5ZE";

const PENDING_LEAD_KEY = "caaizen:pending-lead";
const FIRED_PREFIX = "caaizen:fired:";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Production only. A `npm run dev` session or a local `npm start` must never
 * put rows into the Ads account — those numbers drive bidding, and a developer
 * reloading the thank-you page is not a lead. Verify the live site with
 * Google's Tag Assistant, not localhost.
 */
export const trackingEnabled = process.env.NODE_ENV === "production";

function readSession(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    // Private mode, or a browser set to block site data. Tracking is never
    // worth breaking the page over.
    return null;
  }
}

function writeSession(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Same as above: silently untracked beats a thrown error on a lead form.
  }
}

function clearSession(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Same as above.
  }
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Called by the form the moment a submission is actually accepted by the API.
 *
 * This token is what makes /thank-you trustworthy. The page is a plain URL —
 * it can be reloaded, bookmarked, shared or crawled — and every one of those
 * would otherwise count as a lead. Only a real successful POST mints a token,
 * and /thank-you spends it exactly once.
 */
export function markLeadSubmitted() {
  if (typeof window === "undefined") return;
  writeSession(PENDING_LEAD_KEY, createId());
}

/** Reads and destroys the token. Returns null on a direct visit or a reload. */
export function consumePendingLead() {
  if (typeof window === "undefined") return null;

  const id = readSession(PENDING_LEAD_KEY);

  if (id) {
    clearSession(PENDING_LEAD_KEY);
  }

  return id;
}

function resolveGtag() {
  if (typeof window.gtag === "function") {
    return window.gtag;
  }

  // The tag's bootstrap snippet has not run yet. Queueing onto `dataLayer` is
  // not a fallback hack — it is the same path Google's own snippet takes, and
  // gtag.js drains the queue when it loads.
  window.dataLayer = window.dataLayer ?? [];

  return (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
}

/**
 * `name` keys the once-per-tab flag, so each conversion action is capped
 * independently. `transaction_id` is passed when we have one so Google can
 * discard a duplicate on its side too, which covers converting from a second
 * tab.
 */
function fireConversion(name: string, sendTo: string, transactionId?: string) {
  if (typeof window === "undefined" || !trackingEnabled) return;

  const firedKey = `${FIRED_PREFIX}${name}`;

  if (readSession(firedKey)) return;

  writeSession(firedKey, "1");

  resolveGtag()("event", "conversion", {
    send_to: sendTo,
    value: 1.0,
    currency: "INR",
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });
}

/** A completed callback request. Fired from /thank-you, once per tab. */
export function fireLeadFormConversion(transactionId: string) {
  fireConversion("lead-form", LEAD_FORM_CONVERSION, transactionId);
}

/** A WhatsApp enquiry. Once per tab, however many times the link is tapped. */
export function fireWhatsAppConversion() {
  fireConversion("whatsapp", WHATSAPP_CONVERSION);
}
