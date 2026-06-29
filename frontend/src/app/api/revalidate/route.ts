// src/app/api/revalidate/route.ts
// On-demand revalidation endpoint. The admin panel calls this after blog
// mutations so newly published/updated posts appear immediately instead of
// waiting for the Data Cache `revalidate` window.
//
// Uses revalidatePath (stable signature in Next 16) rather than revalidateTag,
// which now requires a cache-profile argument tied to the `use cache` model.
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type PathEntry = string | { path: string; type?: "page" | "layout" };

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { paths?: PathEntry[] };

  for (const entry of body.paths ?? []) {
    if (typeof entry === "string") revalidatePath(entry);
    else revalidatePath(entry.path, entry.type);
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
