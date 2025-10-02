
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

const BREVO_API_KEY = defineSecret("BREVO_API_KEY");
const BREVO_FROM_EMAIL = defineSecret("BREVO_FROM_EMAIL");
const BREVO_FROM_NAME = defineSecret("BREVO_FROM_NAME");
const ADMIN_EMAIL = defineSecret("ADMIN_EMAIL");
const ADMIN_EMAILS = defineSecret("ADMIN_EMAILS");

// غيّر المنطقة هنا لو حابب، واحرص تطابق الواجهة.
// مثال: "us-central1" أو "europe-west6".
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

    const fromEmail =
      BREVO_FROM_EMAIL.value() || "noreply@ags-activity.com";
    const fromName =
      BREVO_FROM_NAME.value() || "AGS Activity Platform";

    // Handle admin emails for CC
    const adminRaw = (ADMIN_EMAILS.value() || ADMIN_EMAIL.value() || "").trim();
    const split = adminRaw
      ? adminRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const adminList = split.filter(e => emailRegex.test(e));

    const cc = adminList.length ? adminList.map(e => ({email: e})) : undefined;
    const replyTo = adminList.length ? {email: adminList[0], name: fromName} : undefined;

    try {
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({
          sender: {email: fromEmail, name: fromName},
          to: [{email: to}],
          ...(cc && { cc }),
          ...(replyTo && { replyTo }),
          subject,
          htmlContent: html,
        }),
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
      const msg =
        e instanceof Error ? e.message : String(e);
      console.error("Send email failed:", msg);
      throw new HttpsError("internal", msg);
    }
  }
);
