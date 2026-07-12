// src/app/api/revalidate/route.ts
// On-demand revalidation endpoint. The admin panel calls this after storefront
// mutations so changed products, categories, settings, and posts appear
// immediately instead of waiting for the Data Cache `revalidate` window.
//
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

type PathEntry = string | { path: string; type?: "page" | "layout" };

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    paths?: PathEntry[];
    tags?: string[];
  };

  for (const entry of body.paths ?? []) {
    if (typeof entry === "string") revalidatePath(entry);
    else revalidatePath(entry.path, entry.type);
  }

  for (const tag of body.tags ?? []) {
    if (typeof tag === "string" && tag.trim()) {
      revalidateTag(tag, { expire: 0 });
    }
  }

  return NextResponse.json({
    revalidated: true,
    paths: body.paths?.length ?? 0,
    tags: body.tags?.length ?? 0,
    now: Date.now(),
  });
}
