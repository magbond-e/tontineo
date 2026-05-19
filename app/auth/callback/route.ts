import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Si une erreur est retournée par le provider (ex: annulation)
  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const supabase = createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent("Échec de l'authentification. Veuillez réessayer.")}`);
    }

    const isLocalEnv = process.env.NODE_ENV === "development";
    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin avant le load balancer (Vercel)
    
    if (isLocalEnv) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  }

  // Fallback si pas de code
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
