"use client";

import { useState } from "react";

interface AdminAccountMenuProps {
  email: string;
  logoutAction: () => Promise<void>;
  name: string;
  role: string;
}

function formatRole(role: string) {
  return role.replace(/_/g, " ");
}

export function AdminAccountMenu({
  email,
  logoutAction,
  name,
  role,
}: AdminAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="account-menu">
      <button
        aria-expanded={isOpen}
        className="admin-profile profile-trigger"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="avatar">{initials}</span>
        <span>
          <strong>{name}</strong>
          <small>{formatRole(role)}</small>
        </span>
        <span className="dropdown-caret">⌄</span>
      </button>

      {isOpen && (
        <div className="account-dropdown">
          <div className="account-dropdown-head">
            <strong>{name}</strong>
            <span>{email}</span>
          </div>
          <div className="account-role">{formatRole(role)}</div>
          <button
            className="dropdown-logout"
            onClick={() => {
              setIsOpen(false);
              setIsConfirming(true);
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      )}

      {isConfirming && (
        <div className="modal-backdrop" role="presentation">
          <section aria-labelledby="logout-title" className="confirm-modal" role="dialog">
            <div>
              <h2 id="logout-title">Logout dari Fitaru CMS?</h2>
              <p>Sesi admin akan ditutup dan kamu perlu login lagi untuk mengakses dashboard.</p>
            </div>
            <div className="confirm-actions">
              <button
                className="secondary-button"
                onClick={() => setIsConfirming(false)}
                type="button"
              >
                Batal
              </button>
              <form action={logoutAction}>
                <button className="danger-button" type="submit">
                  Ya, Logout
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
