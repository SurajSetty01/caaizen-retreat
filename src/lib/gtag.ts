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
 * ONE CONVERSION ACTION, TWO TRIGGERS. The Ads account has a single "Contact"
 * conversion action, and both the callback form and the WhatsApp button report
 * to it. Telling the two apart in reporting would need a SECOND conversion
 * action created in the Ads console and a second label added here — it is not
 * something this file can split on its own.
 *
 * FIRING ONCE PER VISIT IS DELIBERATE. Somebody who submits the form and then
 * also taps WhatsApp is one contact, not two, and somebody who taps WhatsApp
 * five times is still one. Inflated conversions are worse than no conversions,
 * because Smart Bidding learns from them. The "already counted" flag lives in
 * `sessionStorage`, so it is per tab and resets on a genuinely new visit.
 */

/** The account-level Google tag. Same on every page. */
export const GOOGLE_ADS_ID = "AW-18300583994";

/** The "Contact" conversion action's send_to target. */
export const CONTACT_CONVERSION_LABEL = "AW-18300583994/y5R5CKzPmvscELqAs5ZE";

const FIRED_KEY = "caaizen:contact-conversion-fired";
const PENDING_LEAD_KEY = "caaizen:pending-lead";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Production only. A `npm run dev` session or a local `npm start` should never
 * put rows into the Ads account — the numbers there drive bidding, and a
 * developer reloading the thank-you page is not a lead. Verify the live site
 * with Google's Tag Assistant, not localhost.
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
 * would otherwise count as a conversion. Only a real successful POST mints a
 * token, and /thank-you spends it exactly once.
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
 * Reports one contact to Google Ads, at most once per tab.
 *
 * `transaction_id` is passed when we have one so Google can discard a duplicate
 * on its side too, which covers the case where the same person converts from a
 * second tab.
 */
export function fireContactConversion(transactionId?: string) {
  if (typeof window === "undefined" || !trackingEnabled) return;
  if (readSession(FIRED_KEY)) return;

  writeSession(FIRED_KEY, "1");

  resolveGtag()("event", "conversion", {
    send_to: CONTACT_CONVERSION_LABEL,
    value: 1.0,
    currency: "INR",
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });
}
