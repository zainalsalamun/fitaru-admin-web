import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { requestPasswordResetAction } from "./actions";

interface ForgotPasswordPageProps {
  searchParams?: Promise<{
    error?: string;
    sent?: string;
  }>;
}

function getErrorMessage(error?: string) {
  if (error === "missing-email") {
    return "Email admin wajib diisi.";
  }

  if (error === "send-failed") {
    return "Email reset belum bisa dikirim. Coba lagi beberapa saat.";
  }

  return "";
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);
  const isSent = params?.sent === "1";

  return (
    <main className="login-shell">
      <section className="login-panel">
        <Image src="/assets/fitaru-logo-horizontal.svg" alt="Fitaru" width={154} height={45} />
        <div>
          <h1>Lupa Password</h1>
          <p>Masukkan email admin. Kalau email terdaftar, Supabase akan mengirim link reset password.</p>
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {isSent && (
          <p className="form-success">
            Link reset sudah dikirim. Cek inbox atau spam, lalu buka link dari Supabase.
          </p>
        )}

        <form action={requestPasswordResetAction} className="form-grid login-form">
          <label>
            Email admin
            <input name="email" placeholder="admin@fitaru.app" required type="email" />
          </label>
          <button className="primary-button" type="submit">
            Kirim Link Reset
          </button>
        </form>

        <Link className="auth-link" href="/login">
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
