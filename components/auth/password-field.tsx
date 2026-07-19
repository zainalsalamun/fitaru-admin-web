"use client";

import { useId, useState } from "react";

interface PasswordFieldProps {
  label?: string;
  placeholder?: string;
}

export function PasswordField({
  label = "Password",
  placeholder = "Masukkan password",
}: PasswordFieldProps) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <label htmlFor={inputId}>
      {label}
      <span className="password-field">
        <input
          id={inputId}
          name="password"
          placeholder={placeholder}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Sembunyikan password" : "Lihat password"}
          onClick={() => setVisible((value) => !value)}
          type="button"
        >
          {visible ? (
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 3l18 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                d="M9.1 5.2A9.8 9.8 0 0 1 12 4.8c4.8 0 8.2 4.1 9.3 5.7a1.9 1.9 0 0 1 0 2.2 15.3 15.3 0 0 1-2 2.4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M6.4 6.7a15.6 15.6 0 0 0-3.7 3.8 1.9 1.9 0 0 0 0 2.2c1.1 1.6 4.5 5.7 9.3 5.7 1.4 0 2.7-.3 3.9-.9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ) : (
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path
                d="M2.7 10.5C3.8 8.9 7.2 4.8 12 4.8s8.2 4.1 9.3 5.7a1.9 1.9 0 0 1 0 2.2c-1.1 1.6-4.5 5.7-9.3 5.7s-8.2-4.1-9.3-5.7a1.9 1.9 0 0 1 0-2.2Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M12 14.8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}
