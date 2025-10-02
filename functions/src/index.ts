import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

const BREVO_API_KEY = defineSecret("BREVO_API_KEY");
const BREVO_FROM_EMAIL = defineSecret("BREVO_FROM_EMAIL");
const BREVO_FROM_NAME = defineSecret("BREVO_FROM_NAME");
const ADMIN_EMAIL = defineSecret("ADMIN_EMAIL");
const ADMIN_EMAILS = defineSecret("ADMIN_EMAILS"); // اختياري: قائمة أدمنز

export const sendConfirmationEmail = onCall(
  {
    secrets: [
      BREVO_API_KEY,
      BREVO_FROM_EMAIL,
      BREVO_FROM_NAME,
      ADMIN_EMAIL,
      ADMIN_EMAILS,
    ],
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req) => {
    const apiKey = BREVO_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "BREVO_API_KEY is missing"
      );
    }

    const {to, subject, html} = req.data || {};
    if (!to || !subject || !html) {
      throw new HttpsError(
        "invalid-argument",
        "Missing: to, subject, html"
      );
    }

    const fromEmailRaw =
      BREVO_FROM_EMAIL.value() || "noreply@ags-activity.com";
    const fromEmail = fromEmailRaw.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fromEmail)) {
      throw new HttpsError(
        "failed-precondition",
        "Invalid BREVO_FROM_EMAIL"
      );
    }

    const fromName =
      (BREVO_FROM_NAME.value() || "AGS Activity Platform").trim();

    const adminRaw =
      (ADMIN_EMAILS.value() || ADMIN_EMAIL.value() || "").trim();

    const split = adminRaw ?
      adminRaw.split(",").map((s) => s.trim()).filter(Boolean) :
      [];

    const emailRx = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const adminList = split.filter((e) => emailRx.test(e));

    const cc = adminList.length ?
      adminList.map((e) => ({email: e})) :
      undefined;

    const replyTo = adminList.length ?
      {email: adminList[0], name: fromName} :
      undefined;

    try {
      const payload: Record<string, unknown> = {
        sender: {email: fromEmail, name: fromName},
        to: [{email: to}],
        subject,
        htmlContent: html,
      };
      if (cc) payload.cc = cc; // بدلاً من {..., cc}
      if (replyTo) payload.replyTo = replyTo;

      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.error("Brevo HTTP", resp.status, text);
        throw new HttpsError(
          "failed-precondition",
          `Brevo ${resp.status}: ${text}`
        );
      }

      console.log("Brevo OK:", text);
      return {ok: true};
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Send email failed:", msg);
      throw new HttpsError("internal", msg);
    }
  }
);
