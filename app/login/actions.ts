"use server";

import { redirect } from "next/navigation";
import {
  getActiveAdminAccountByEmail,
  markAdminLastLogin,
} from "@/lib/admin-repository";
import { normalizeAdminRole } from "@/lib/auth/permissions";
import { createAdminSession } from "@/lib/auth/session";
import { createSupabaseAuthClient } from "@/lib/supabase/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/login?error=missing-email");
  }

  if (!password) {
    redirect("/login?error=missing-password");
  }

  const supabase = createSupabaseAuthClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user?.email) {
    redirect("/login?error=invalid-login");
  }

  const admin = await getActiveAdminAccountByEmail(email);

  if (!admin) {
    redirect("/login?error=not-found");
  }

  await markAdminLastLogin(admin.id);
  await createAdminSession({
    email: admin.email,
    id: admin.id,
    name: admin.name,
    role: normalizeAdminRole(admin.role),
  });

  redirect("/");
}
