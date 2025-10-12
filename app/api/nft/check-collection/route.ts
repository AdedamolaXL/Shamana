import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("playlistId");
  const userId = searchParams.get("userId");

  if (!playlistId || !userId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("playlist_collections")
    .select("id")
    .eq("playlist_id", playlistId)
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({ collected: !!data });
}
