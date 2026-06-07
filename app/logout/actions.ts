"use server";

import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/auth/session";

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}
