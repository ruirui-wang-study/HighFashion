import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "ADMIN_UNAUTHORIZED", message: "Admin login required" } }, { status: 401 });
  }

  revalidateTag("site-copy", "max");
  return NextResponse.json({ success: true, data: { revalidated: true } });
}
