import { createClient } from "@supabase/supabase-js";
import { env, hasSupabasePublicEnv } from "@/lib/env";

export function createSupabaseAuthClient() {
  if (!hasSupabasePublicEnv()) {
    throw new Error("Supabase public env is not configured.");
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
