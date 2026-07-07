import { NextRequest, NextResponse } from "next/server";
import { appendLeadToSheet } from "@/lib/google-sheets";
import { leadSchema } from "@/lib/lead-validation";

export const runtime = "nodejs";

const submissions = new Map<string, { count: number; resetAt: number }>();
const windowMs = 60_000;
const maxSubmissionsPerWindow = 5;

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

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("content-type")?.includes("application/json") !== true) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 415 },
      );
    }

    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429 },
      );
    }

    const payload = await request.json();
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the details and try again.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await appendLeadToSheet(parsed.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead submission failed", error);

    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 500 },
    );
  }
}
