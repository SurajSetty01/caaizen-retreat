/**
 * Floating WhatsApp mark.
 *
 * The page already offers a callback form and a phone number, but both ask the
 * visitor to hand over their details and wait. WhatsApp is the one channel where
 * a buyer can ask a single question ("what's the price?") at no cost to
 * themselves, so it stays reachable from any scroll position.
 *
 * DELIBERATELY JUST THE MARK. An earlier version wrapped it in a pill with a
 * "CHAT ON WHATSAPP" label; against this site's restrained palette and hard
 * edges that read as an ad bolted onto the page. The logo alone is already
 * universally understood — a label only added noise. Everything here is tuned to
 * stay quiet: no text, no border, a soft shadow rather than a hard one, and the
 * only motion is a small lift on hover.
 *
 * A plain anchor, so it needs no client-side JavaScript and works from a server
 * component. It carries a prefilled message so the sales team sees which project
 * the enquiry is about without having to ask.
 *
 * NOTE ON SHAPE: globals.css resets `a { border-radius: 0 }` for the site's
 * hard-edged look. `rounded-full` is a class, so it outranks that element rule —
 * the circle is intentional, and is what makes this read as the WhatsApp mark
 * rather than as another site button.
 */

/** The sales WhatsApp line, in wa.me's format: country code, no +, no spaces. */
const WHATSAPP_NUMBER = "919731133655";

const PREFILLED_MESSAGE =
  "Hi, I'd like to know more about The Retreat by Caaizen Realty — price, availability and location.";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  PREFILLED_MESSAGE,
)}`;

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Caaizen Realty on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex size-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/15 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366]"
    >
      {/* The official WhatsApp glyph, drawn inline: lucide carries no brand
          marks, and an <img> would cost a request for 700 bytes of path. */}
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.898 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.688 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
      </svg>
    </a>
  );
}
