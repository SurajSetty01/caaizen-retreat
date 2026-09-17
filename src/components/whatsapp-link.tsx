"use client";

import type { ReactNode } from "react";
import { fireContactConversion } from "@/lib/gtag";
import { WHATSAPP_URL } from "@/lib/whatsapp";

/**
 * A WhatsApp link that reports the tap to Google Ads.
 *
 * A WhatsApp enquiry is a contact in exactly the way a form submission is, and
 * on this page it is the cheaper of the two for the visitor — leaving it
 * untracked would have Google optimising as though those enquiries never
 * happened.
 *
 * STILL A PLAIN ANCHOR. The click handler is additive: the href, the new tab
 * and the prefilled message all work with JavaScript disabled or broken, and a
 * failed conversion never costs a lead. `fireContactConversion` is itself
 * capped at one per tab, so a visitor tapping this five times is counted once.
 */
export function WhatsAppLink({
  className,
  children,
  "aria-label": ariaLabel,
  title,
}: {
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  title?: string;
}) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => fireContactConversion()}
      aria-label={ariaLabel}
      title={title}
      className={className}
    >
      {children}
    </a>
  );
}
