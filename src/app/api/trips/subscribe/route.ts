
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({ ok: false, message: "This endpoint is deprecated." }, { status: 410 });
}
