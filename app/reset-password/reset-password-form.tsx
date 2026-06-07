"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { PasswordField } from "@/components/auth/password-field";

type ResetState = "checking" | "ready" | "submitting" | "success" | "invalid";

export function ResetPasswordForm() {
  const [state, setState] = useState<ResetState>("checking");
  const [message, setMessage] = useState("");
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        {
          auth: {
            detectSessionInUrl: true,
            persistSession: true,
          },
        },
      ),
    [],
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) {
          return;
        }

        setState(data.session ? "ready" : "invalid");
      })
      .catch(() => {
        if (mounted) {
          setState("invalid");
        }
      });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(formData: FormData) {
    const password = String(formData.get("password") ?? "");

    if (password.length < 8) {
      setMessage("Password minimal 8 karakter.");
      return;
    }

    setState("submitting");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setState("ready");
      setMessage("Password belum bisa diubah. Buka ulang link reset dari email.");
      return;
    }

    await supabase.auth.signOut();
    setState("success");
    setMessage("Password berhasil diubah. Silakan login dengan password baru.");
  }

  if (state === "checking") {
    return <p className="form-success">Memeriksa link reset...</p>;
  }

  if (state === "invalid") {
    return (
      <p className="form-error">
        Link reset tidak valid atau sudah kedaluwarsa. Minta link baru dari halaman lupa password.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="form-grid login-form">
      {message && (
        <p className={state === "success" ? "form-success" : "form-error"}>{message}</p>
      )}
      {state !== "success" && (
        <>
          <PasswordField label="Password baru" placeholder="Minimal 8 karakter" />
          <button className="primary-button" disabled={state === "submitting"} type="submit">
            {state === "submitting" ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </>
      )}
    </form>
  );
}
