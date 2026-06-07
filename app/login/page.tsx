import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PasswordField } from "@/components/auth/password-field";
import { getAdminSession } from "@/lib/auth/session";
import { loginAction } from "./actions";

interface LoginPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

function getErrorMessage(error?: string) {
  if (error === "missing-email") {
    return "Email admin wajib diisi.";
  }

  if (error === "missing-password") {
    return "Password wajib diisi.";
  }

  if (error === "invalid-login") {
    return "Email atau password salah.";
  }

  if (error === "not-found") {
    return "Email belum terdaftar sebagai admin aktif.";
  }

  return "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="login-shell">
      <section className="login-panel">
        <Image src="/assets/fitaru-logo-horizontal.svg" alt="Fitaru" width={154} height={45} />
        <div>
          <h1>Admin Login</h1>
          <p>Masuk memakai email dan password admin yang terdaftar di Fitaru CMS.</p>
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <form action={loginAction} className="form-grid login-form">
          <label>
            Email admin
            <input name="email" placeholder="admin@fitaru.app" required type="email" />
          </label>
          <PasswordField />
          <Link className="auth-link auth-link-right" href="/forgot-password">
            Lupa password?
          </Link>
          <button className="primary-button" type="submit">
            Masuk Dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
