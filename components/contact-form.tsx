"use client";

import { useState } from "react";
import { services } from "@/lib/site";

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  message: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  preferredDate: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send your message.");
      }
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send your message.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.2em] text-mist/70";
  const fieldClass =
    "mt-3 w-full rounded-xl border border-white/10 bg-navy/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-mist/40 focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            value={form.name}
            onChange={update("name")}
            required
            minLength={2}
            autoComplete="name"
            className={fieldClass}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            autoComplete="tel"
            className={fieldClass}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label htmlFor="contact-service" className={labelClass}>
            Service or project type
          </label>
          <select
            id="contact-service"
            name="service"
            value={form.service}
            onChange={update("service")}
            className={fieldClass}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.title} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-date" className={labelClass}>
          Preferred date{" "}
          <span className="font-normal normal-case tracking-normal text-mist/50">
            (optional)
          </span>
        </label>
        <input
          id="contact-date"
          name="preferredDate"
          type="date"
          value={form.preferredDate}
          onChange={update("preferredDate")}
          className={`${fieldClass} [color-scheme:dark]`}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={update("message")}
          required
          minLength={10}
          rows={5}
          className={`${fieldClass} resize-none`}
          placeholder="Tell us about your project, date and location."
        />
      </div>

      {success ? (
        <p
          role="status"
          className="rounded-xl border border-whatsapp/40 bg-whatsapp/10 px-4 py-3 text-sm text-white"
        >
          Thank you — your message has been sent. We will be in touch shortly.
        </p>
      ) : null}

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
        className="inline-flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,217,26,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
