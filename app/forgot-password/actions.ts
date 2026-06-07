"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAuthClient } from "@/lib/supabase/auth";

function getAppOrigin(headerList: Headers) {
  const origin = headerList.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=missing-email");
  }

  const headerList = await headers();
  const supabase = createSupabaseAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppOrigin(headerList)}/reset-password`,
  });

  if (error) {
    redirect("/forgot-password?error=send-failed");
  }

  redirect("/forgot-password?sent=1");
}
