"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { leadSchema } from "@/lib/lead-validation";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function LeadForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      mobile: String(formData.get("mobile") ?? ""),
    };

    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0] ?? "",
        mobile: errors.mobile?.[0] ?? "",
      });
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as {
        error?: string;
        issues?: Record<string, string[]>;
      };

      if (!response.ok) {
        setFieldErrors({
          name: result.issues?.name?.[0] ?? "",
          mobile: result.issues?.mobile?.[0] ?? "",
        });
        throw new Error(result.error ?? "Submission failed");
      }

      form.reset();
      setStatus("success");
      setMessage("Thank you. Our team will call you shortly.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={[
        "border border-white/15 bg-[#10170f]/90 p-5 text-white shadow-2xl shadow-black/30 backdrop-blur-md",
        compact ? "space-y-3" : "space-y-4 md:p-6",
      ].join(" ")}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9a25d]">
          Priority callback
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight">
          Get price, availability and exact location
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Share your details and the Caaizen Realty team will call you.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm text-white/80" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            className="h-12 w-full border border-white/15 bg-white px-4 text-base text-[#182015] outline-none transition focus:border-[#c9a25d] focus:ring-2 focus:ring-[#c9a25d]/30"
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-xs text-[#ffb4a8]">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-white/80" htmlFor="mobile">
            Mobile number
          </label>
          <input
            id="mobile"
            name="mobile"
            autoComplete="tel"
            inputMode="tel"
            placeholder="10-digit mobile number"
            className="h-12 w-full border border-white/15 bg-white px-4 text-base text-[#182015] outline-none transition focus:border-[#c9a25d] focus:ring-2 focus:ring-[#c9a25d]/30"
          />
          {fieldErrors.mobile ? (
            <p className="mt-1 text-xs text-[#ffb4a8]">{fieldErrors.mobile}</p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group flex h-12 w-full items-center justify-center gap-2 bg-[#c9a25d] px-5 text-sm font-bold uppercase tracking-[0.18em] text-[#10170f] transition hover:bg-[#e0bd76] disabled:cursor-not-allowed disabled:opacity-75"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting
          </>
        ) : (
          <>
            Request callback
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {message ? (
        <p
          className={[
            "flex items-start gap-2 text-sm leading-5",
            status === "success" ? "text-[#bfe8bc]" : "text-[#ffb4a8]",
          ].join(" ")}
          role="status"
        >
          {status === "success" ? <CheckCircle2 className="mt-0.5 size-4" /> : null}
          <span>{message}</span>
        </p>
      ) : null}

      <p className="text-xs leading-5 text-white/45">
        Your details are used only for this project callback.
      </p>
    </form>
  );
}
