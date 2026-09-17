import { NextRequest, NextResponse } from "next/server";
import { appendLeadToSheet, describeCredentialEnv } from "@/lib/google-sheets";
import { leadSchema } from "@/lib/lead-validation";

export const runtime = "nodejs";

const submissions = new Map<string, { count: number; resetAt: number }>();
const windowMs = 60_000;
const maxSubmissionsPerWindow = 5;

type LeadStatus = "invalid" | "rate-limited" | "error";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = submissions.get(ip);

  if (!current || current.resetAt <= now) {
    submissions.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxSubmissionsPerWindow;
}

function acceptsHtml(request: NextRequest) {
  return request.headers.get("accept")?.includes("text/html") === true;
}

function isBrowserFormPost(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  return !contentType.includes("application/json") && acceptsHtml(request);
}

function redirectToLeadForm(request: NextRequest, status: LeadStatus) {
  const url = new URL("/", request.url);
  url.searchParams.set("lead", status);
  url.hash = "lead";

  return NextResponse.redirect(url, { status: 303 });
}

/**
 * The no-JavaScript success path.
 *
 * It lands on the same page as everyone else so the two paths do not drift.
 * No conversion is reported for it and none can be: with scripting off, gtag
 * never loads. That is a rounding error in traffic and not worth engineering
 * around, but it is the reason the number in Google Ads will always sit a
 * shade under the row count in the sheet.
 */
function redirectToThankYou(request: NextRequest) {
  return NextResponse.redirect(new URL("/thank-you", request.url), {
    status: 303,
  });
}

async function readLeadPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return {
      browserFormPost: false,
      payload: await request.json(),
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      browserFormPost: acceptsHtml(request),
      payload: {
        name: String(formData.get("name") ?? ""),
        mobile: String(formData.get("mobile") ?? ""),
      },
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const submission = await readLeadPayload(request);

    if (!submission) {
      if (isBrowserFormPost(request)) {
        return redirectToLeadForm(request, "invalid");
      }

      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 415 },
      );
    }

    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      if (submission.browserFormPost) {
        return redirectToLeadForm(request, "rate-limited");
      }

      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429 },
      );
    }

    const parsed = leadSchema.safeParse(submission.payload);

    if (!parsed.success) {
      if (submission.browserFormPost) {
        return redirectToLeadForm(request, "invalid");
      }

      return NextResponse.json(
        {
          error: "Please check the details and try again.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await appendLeadToSheet(parsed.data);

    if (submission.browserFormPost) {
      return redirectToThankYou(request);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // The credential state goes in the same log line as the error: the message
    // alone can't distinguish a mangled key from a stale or missing one, and the
    // host's environment is the only place that difference is visible.
    console.error("Lead submission failed", error);
    console.error("Lead credential env:", describeCredentialEnv());

    if (isBrowserFormPost(request)) {
      return redirectToLeadForm(request, "error");
    }

    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 500 },
    );
  }
}
