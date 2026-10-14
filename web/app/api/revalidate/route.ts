import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED = /^(projects|settings|project:[a-z0-9-]{1,80})$/;

function authorised(provided: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Called by the NestJS API after an admin change so the public site refreshes immediately. */
export async function POST(request: NextRequest) {
  if (!authorised(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED.test(t))
    : [];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: tags });
}
