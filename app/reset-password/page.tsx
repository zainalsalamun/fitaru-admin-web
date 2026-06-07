import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <Image src="/assets/fitaru-logo-horizontal.svg" alt="Fitaru" width={154} height={45} />
        <div>
          <h1>Password Baru</h1>
          <p>Buat password admin baru setelah membuka link reset dari email Supabase.</p>
        </div>

        <ResetPasswordForm />

        <Link className="auth-link" href="/login">
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
