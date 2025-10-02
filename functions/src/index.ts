import {onCall} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import fetch from "node-fetch";

const BREVO_API_KEY = defineSecret("BREVO_API_KEY");
const BREVO_FROM_EMAIL = defineSecret("BREVO_FROM_EMAIL");
const BREVO_FROM_NAME = defineSecret("BREVO_FROM_NAME");
const ADMIN_EMAIL = defineSecret("ADMIN_EMAIL");

export const sendConfirmationEmail = onCall(
  {
    secrets: [BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME, ADMIN_EMAIL],
    region: "us-central1",
  },
  async (req) => {
    const apiKey = BREVO_API_KEY.value();
    if (!apiKey) throw new Error("BREVO_API_KEY is missing");

    const {to, subject, html} = req.data || {};
    if (!to || !subject || !html) throw new Error("Missing: to, subject, html");

    const fromEmail = BREVO_FROM_EMAIL.value() || "noreply@ags-activity.com";
    const fromName = BREVO_FROM_NAME.value() || "AGS Activity Platform";
    const adminEmail = ADMIN_EMAIL.value() || "admin@example.com";

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
        cc: [{email: adminEmail}],
        subject,
        htmlContent: html,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Brevo error: ${resp.status} ${text}`);
    }

    return {ok: true};
  }
);
