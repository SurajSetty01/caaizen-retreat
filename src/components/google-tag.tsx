import { GOOGLE_ADS_ID, trackingEnabled } from "@/lib/gtag";

const BOOTSTRAP = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`;

/**
 * The account-level Google tag, once, on every page.
 *
 * PLAIN <script> TAGS, NOT `next/script`. Both of that component's strategies
 * were tried and the built HTML measured in each case. With `afterInteractive`
 * AND with `beforeInteractive`, gtag.js was absent from the served HTML
 * entirely - Next injects it from the client during hydration. Two things
 * suffer. Attribution: gtag.js writes the `_gcl_aw` cookie from the ad click's
 * `gclid` when it loads, and a visitor who leaves before hydration is never
 * tied back to the ad that brought them. And verification: anyone checking the
 * install with view-source or Google's Tag Assistant sees no tag and concludes
 * it was never added.
 *
 * React 19 hoists a plain `<script async src>` into <head> and de-duplicates it
 * by src. Measured on the built output: exactly one gtag.js tag, inside <head>,
 * with the bootstrap running once at the top of <body>. That is Google's
 * instruction, and it is visible in view-source.
 *
 * ONE TAG PER PAGE IS LOAD-BEARING. Google's "never add more than one Google
 * tag to a page" is not style advice - a second copy double-counts every
 * conversion, and Smart Bidding learns from the inflated number. Anyone
 * tempted to "modernise" this back to `next/script`, or to add a tag manager
 * alongside it: count the executing tags in the built HTML first, and ignore
 * matches inside the RSC payload, which are serialised data rather than
 * scripts.
 */
export function GoogleTag() {
  // Dev and local production builds stay out of the Ads account entirely -
  // reloading the thank-you page on localhost is not a lead.
  if (!trackingEnabled) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
    </>
  );
}
