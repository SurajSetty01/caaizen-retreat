"use client";

import { useEffect } from "react";
import { consumePendingLead, fireContactConversion } from "@/lib/gtag";

/**
 * Fires the Ads conversion on /thank-you — but only for a real submission.
 *
 * THIS GUARD IS THE WHOLE POINT. A thank-you URL is the conventional place to
 * put a conversion tag because anyone running the Ads account can point a
 * trigger at it without a developer. The cost of that convenience is that the
 * URL is also reloadable, bookmarkable, shareable and crawlable, and each of
 * those would count as a lead. The form mints a one-shot token on a successful
 * POST; this spends it. No token, no conversion — the page still renders, it
 * just does not report.
 */
export function ThankYouConversion() {
  useEffect(() => {
    const leadId = consumePendingLead();

    // Direct visit, refresh, or a crawler. Nobody filled anything in.
    if (!leadId) return;

    fireContactConversion(leadId);
  }, []);

  return null;
}
