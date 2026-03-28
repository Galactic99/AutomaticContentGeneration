import { createClient } from "@/src/utils/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await createClient();

  // Check if session exists before signing out
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Redirect back to landing page
  redirect("/");
}
