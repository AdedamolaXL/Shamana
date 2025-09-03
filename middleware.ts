import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//     const res = NextResponse.next()
//     const supabase = createMiddlewareClient({req, res});

//     await supabase.auth.getSession();
//     return res;
// }

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/pinata-jwt')) {
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return res;
}