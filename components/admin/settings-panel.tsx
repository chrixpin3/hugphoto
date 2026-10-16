"use client";

import { useState } from "react";
import type { ToastKind } from "@/components/admin/toast";
import type { SiteSettingsDTO, SocialLinksDTO } from "@/lib/types";

interface SettingsPanelProps {
  username: string;
  provider: string;
  initialSettings: SiteSettingsDTO;
  onUnauthorized: () => void;
  onLogout: () => void;
  notify: (kind: ToastKind, message: string) => void;
}

const SOCIAL_FIELDS: { key: keyof SocialLinksDTO; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "other", label: "Other link" },
];

export function SettingsPanel({
  username,
  provider,
  initialSettings,
  onUnauthorized,
  onLogout,
  notify,
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<SiteSettingsDTO>(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField =
    (key: Exclude<keyof SiteSettingsDTO, "socials">) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((current) => ({ ...current, [key]: event.target.value }));
    };

  const updateSocial =
    (key: keyof SocialLinksDTO) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((current) => ({
        ...current,
        socials: { ...current.socials, [key]: event.target.value },
      }));
    };

  const onSaveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsError(null);

    if (!settings.websiteName.trim()) {
      setSettingsError("Website name is required.");
      return;
    }

    setSavingSettings(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        settings?: SiteSettingsDTO;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save settings.");
      }
      if (data.settings) setSettings(data.settings);
      notify("success", "Website settings saved.");
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : "Unable to save settings.",
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const onChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update the password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify("success", "Password updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update the password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="admin-panel p-6 sm:p-8">
        <h2 className="text-lg font-medium tracking-tight text-white">
          Account
        </h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <dt className="text-mist/60">Username</dt>
            <dd className="text-white">{username}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-mist/60">Image storage</dt>
            <dd className="text-white">
              {provider === "cloudinary" ? "Cloudinary" : "Local disk"}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={onSaveSettings} className="admin-panel p-6 sm:p-8">
        <h2 className="text-lg font-medium tracking-tight text-white">
          Website &amp; contact details
        </h2>
        <p className="mt-2 text-sm text-mist/70">
          These details are shown across the public website — footer, contact
          page and the floating WhatsApp button.
        </p>

        <div className="mt-6 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="settings-website-name" className="admin-label">
              Website name
            </label>
            <input
              id="settings-website-name"
              value={settings.websiteName}
              onChange={updateField("websiteName")}
              required
              maxLength={80}
              className="admin-input mt-2"
              placeholder="HUG Photos"
            />
          </div>
          <div>
            <label htmlFor="settings-telephone" className="admin-label">
              Telephone
            </label>
            <input
              id="settings-telephone"
              value={settings.telephone}
              onChange={updateField("telephone")}
              maxLength={40}
              className="admin-input mt-2"
              placeholder="+1 (555) 012-3456"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="admin-label">
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={settings.email}
              onChange={updateField("email")}
              maxLength={160}
              className="admin-input mt-2"
              placeholder="hello@hugphotos.com"
            />
          </div>
          <div>
            <label htmlFor="settings-whatsapp" className="admin-label">
              WhatsApp number
            </label>
            <input
              id="settings-whatsapp"
              value={settings.whatsapp}
              onChange={updateField("whatsapp")}
              maxLength={40}
              className="admin-input mt-2"
              placeholder="+1 (555) 012-3456"
            />
          </div>
          <div>
            <label htmlFor="settings-location" className="admin-label">
              Location
            </label>
            <input
              id="settings-location"
              value={settings.location}
              onChange={updateField("location")}
              maxLength={200}
              className="admin-input mt-2"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="text-sm font-medium tracking-tight text-white">
            Social media
          </h3>
          <p className="mt-1 text-sm text-mist/70">
            Paste full links (starting with http:// or https://). Leave a field
            blank to hide that link.
          </p>
          <div className="mt-5 grid max-w-3xl gap-5 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`settings-social-${field.key}`}
                  className="admin-label"
                >
                  {field.label}
                </label>
                <input
                  id={`settings-social-${field.key}`}
                  value={settings.socials[field.key]}
                  onChange={updateSocial(field.key)}
                  maxLength={300}
                  className="admin-input mt-2"
                  placeholder="https://"
                />
              </div>
            ))}
          </div>
        </div>

        {settingsError ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {settingsError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={savingSettings}
          className="admin-btn-primary mt-6"
        >
          {savingSettings ? "Saving…" : "Save settings"}
        </button>
      </form>

      <div className="admin-panel p-6 sm:p-8">
        <h2 className="text-lg font-medium tracking-tight text-white">
          Change password
        </h2>
        <p className="mt-2 text-sm text-mist/70">
          Replace the default password before deploying to production. Use at
          least 8 characters.
        </p>

        <form onSubmit={onChangePassword} className="mt-6 max-w-md space-y-5">
          <div>
            <label htmlFor="current-password" className="admin-label">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="admin-input mt-2"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="admin-label">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="admin-input mt-2"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="admin-label">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="admin-input mt-2"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="admin-btn-primary"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>

      <div className="admin-panel p-6 sm:p-8">
        <h2 className="text-lg font-medium tracking-tight text-white">
          Session
        </h2>
        <p className="mt-2 text-sm text-mist/70">
          Signing out will end this admin session on this device.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="admin-btn-outline mt-6"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
