import { useEffect, useId, useRef, useState } from "react";
import portfolio from "../content.js";

export const inquirySubjects = [
  "Graphic Design Request",
  "Video Editing Request",
  "UI/UX Design Inquiry",
  "Collaboration / Partnership",
  "General Inquiry"
];

export function validFormspreeEndpoint(value) {
  return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(value);
}

export default function ContactForm({ email, endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || portfolio.profile.formspreeEndpoint || "" }) {
  const configured = validFormspreeEndpoint(endpoint.trim());
  const subjectLabelId = useId();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const controllerRef = useRef(null);
  const inFlight = useRef(false);
  const statusRef = useRef(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function sendRequest(event) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!form.reportValidity()) return;
    if (!name || !message || !inquirySubjects.includes(data.get("subject"))) {
      setError("Please enter your full name and message, and select an inquiry type.");
      setStatus("error");
      return;
    }
    if (!configured) {
      setError("Direct messaging is temporarily unavailable. Please use the email address below.");
      setStatus("error");
      return;
    }
    data.set("name", name);
    data.set("email", String(data.get("email")).trim());
    data.set("message", message);
    // Subject is both a visible message field and Formspree's email subject.
    data.set("_subject", data.get("subject"));
    inFlight.current = true;
    setError("");
    setStatus("sending");
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort("timeout"), 20000);
    try {
      const response = await fetch(endpoint.trim(), {
        method: "POST", body: data, headers: { Accept: "application/json" },
        signal: controller.signal, redirect: "error"
      });
      const result = await response.json().catch(() => null);
      // Formspree confirms acceptance with a JSON `next` string. Never navigate
      // to that URL: the confirmation stays inside this form.
      if (!response.ok || typeof result?.next !== "string" || result.error || result.errors) {
        throw new Error("The message service could not confirm your submission. Please try again or email me directly.");
      }
      if (controller.signal.aborted) return;
      form.reset();
      setStatus("success");
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch {
      if (controller.signal.aborted && controller.signal.reason !== "timeout") return;
      setError(controller.signal.reason === "timeout"
        ? "Sending took too long. Your message is still here; please try again or email me directly."
        : "Your message could not be sent. Your information is still here; please try again or email me directly.");
      setStatus("error");
      requestAnimationFrame(() => statusRef.current?.focus());
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      controllerRef.current = null;
    }
  }

  return <form className="contact-form" onSubmit={sendRequest} aria-busy={status === "sending"}>
    <fieldset disabled={status === "sending"}>
      <legend className="sr-only">Your inquiry</legend>
      <div className="contact-fields">
        <label>Full Name<input autoFocus autoComplete="name" name="name" placeholder="Your full name" required maxLength={150} /></label>
        <label>Email Address<input autoComplete="email" name="email" type="email" placeholder="you@example.com" required maxLength={254} /></label>
      </div>
      <label><span id={subjectLabelId}>Inquiry Type / Subject</span><select name="subject" aria-labelledby={subjectLabelId} defaultValue="" required>
        <option value="" disabled>Select an inquiry type</option>
        {inquirySubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
      </select></label>
      <label>Message<textarea name="message" rows="5" placeholder="What would you like to work on?" required maxLength={10000} /></label>
      <label className="form-honeypot" aria-hidden="true">Leave this field empty<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label>
    </fieldset>
    {!configured && <p className="contact-note">Direct messaging is temporarily unavailable. You can still reach me at <a href={`mailto:${email}`}>{email}</a>.</p>}
    <div ref={statusRef} tabIndex={-1} className="contact-form-status">
      {status === "error" && <p className="form-error" role="alert">{error}</p>}
      <p role="status" aria-live="polite">{status === "success" ? "Thanks for reaching out! Your inquiry was submitted successfully." : status === "sending" ? "Sending your message…" : ""}</p>
    </div>
    <button className="button button-dark contact-submit" type="submit" disabled={!configured || status === "sending"}>
      {status === "sending" ? "Sending…" : "Send Message"}<span aria-hidden="true">↗</span>
    </button>
    <p className="contact-note">{configured ? "Your inquiry is submitted securely through Formspree. You’ll stay on this page." : "Email remains available while direct messaging is being connected."}</p>
  </form>;
}
