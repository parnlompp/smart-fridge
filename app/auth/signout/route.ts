import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("smart-fridge-demo", "", { maxAge: 0, path: "/" });
  return response;
}
