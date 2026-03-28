'use server'

import { createClient } from "@/src/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // This tells Google where to send the user after login
      redirectTo: `${origin}/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.error("Auth error:", error.message);
    return redirect("/login?error=auth-failed");
  }

  // Redirect to Google's consent screen
  if (data.url) {
    return redirect(data.url);
  }
}