/**
 * The sales WhatsApp line.
 *
 * Lifted out of the floating button when the thank-you page started offering
 * the same channel: two hardcoded copies of a phone number is how one of them
 * ends up stale.
 */

/** wa.me's format: country code, no +, no spaces. */
export const WHATSAPP_NUMBER = "919731133655";

export const WHATSAPP_MESSAGE =
  "Hi, I'd like to know more about The Retreat by Caaizen Realty — price, availability and location.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;
