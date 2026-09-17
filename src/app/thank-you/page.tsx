import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MapPin, Phone } from "lucide-react";
import { ThankYouConversion } from "@/components/thank-you-conversion";
import { WhatsAppLink } from "@/components/whatsapp-link";

/**
 * Where the callback form lands.
 *
 * Two jobs, and the second one is the one that is easy to forget. The first is
 * to give Google Ads a URL to hang a conversion on — see ThankYouConversion.
 * The second is that this is a second chance to convert: the visitor has just
 * raised their hand and is more interested right now than at any other moment
 * on the site, and the old inline "thank you" line left them sitting on a
 * scrolled page with nothing to do. WhatsApp is here for exactly that.
 *
 * NOINDEX. A thank-you page in search results collects direct visits that are
 * not leads, which is noise in the Ads account even with the token guard.
 * It is also kept out of sitemap.ts.
 */
export const metadata: Metadata = {
  title: "Thank you",
  description: "Your callback request has reached the Caaizen Realty team.",
  robots: { index: false, follow: false },
};

const nextSteps = [
  {
    icon: Phone,
    title: "Price and availability",
    detail: "Current rates, what is still open, and the payment plan.",
  },
  {
    icon: MapPin,
    title: "Exact location",
    detail: "The precise site location and a visit slot that suits you.",
  },
  {
    icon: Clock,
    title: "Usually within a few hours",
    detail: "Calls go out during working hours, Monday to Saturday.",
  },
];

export default function ThankYouPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#10170f] text-white">
      <ThankYouConversion />

      <section className="flex flex-1 items-center px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto w-full max-w-3xl">
          <CheckCircle2 className="size-12 text-[#c9a25d]" aria-hidden="true" />

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-[#c9a25d]">
            Request received
          </p>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
            Thank you. Your request is with our team.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
            A Caaizen Realty advisor will call you on the number you shared. Here
            is what they will cover.
          </p>

          <ul className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {nextSteps.map((step) => (
              <li key={step.title} className="bg-[#10170f] p-5">
                <step.icon className="size-5 text-[#e0bd76]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold leading-6">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/60">{step.detail}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <WhatsAppLink className="group inline-flex h-12 items-center justify-center gap-2 bg-[#25d366] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#0b100a] transition hover:bg-[#3ae07a]">
              Ask on WhatsApp now
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </WhatsAppLink>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center border border-white/25 px-6 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white/10"
            >
              Back to the project
            </Link>
          </div>

          <p className="mt-8 text-sm leading-6 text-white/45">
            Did not mean to submit, or shared a wrong number? Tell us on
            WhatsApp and we will correct it.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-sm leading-6 text-white/45 md:px-8">
        <div className="mx-auto max-w-3xl">
          <p>Caaizen Realty · The Retreat · Bidadi, Bengaluru</p>
        </div>
      </footer>
    </main>
  );
}
