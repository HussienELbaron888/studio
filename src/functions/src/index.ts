
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp, getApps} from "firebase-admin/app";
import {getAuth as getAdminAuth} from "firebase-admin/auth";

// Initialize admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const BREVO_API_KEY = defineSecret("BREVO_API_KEY");
const BREVO_FROM_EMAIL = defineSecret("BREVO_FROM_EMAIL");
const BREVO_FROM_NAME = defineSecret("BREVO_FROM_NAME");
const ADMIN_EMAIL = defineSecret("ADMIN_EMAIL");
const ADMIN_EMAILS = defineSecret("ADMIN_EMAILS"); // اختياري: قائمة أدمنز
const ADMIN_GRANT_KEY = defineSecret("ADMIN_GRANT_KEY");


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
      (BREVO_FROM_EMAIL.value() || "noreply@ags-activity.com");
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
      if (cc) payload.cc = cc;
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

type GrantData = {
  email?: string;
  key?: string;
};

export const grantAdmin = onCall(
  {
    secrets: [ADMIN_GRANT_KEY],
    region: "us-central1",
    timeoutSeconds: 15,
  },
  async (req) => {
    const data = (req.data ?? {}) as GrantData;

    const email = (data.email ?? "").trim();
    const key = data.key ?? "";

    if (!email || !key) {
      throw new HttpsError(
        "invalid-argument",
        "email and key required"
      );
    }

    if (key !== ADMIN_GRANT_KEY.value()) {
      throw new HttpsError("permission-denied", "invalid key");
    }

    try {
      const adminAuth = getAdminAuth();
      const user = await adminAuth.getUserByEmail(email);
      await adminAuth.setCustomUserClaims(user.uid, {role: "admin"});
      return {ok: true, uid: user.uid};
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Failed to grant admin role:", msg);
      // eslint-disable-next-line max-len
      throw new HttpsError("not-found", `User not found or an error occurred: ${msg}`);
    }
  }
);

// === Admin-only: delete a subscription document ===
export const adminDeleteSubscription = onCall(
  { secrets: [BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME, ADMIN_EMAIL, ADMIN_EMAILS] },
  async (req) => {
    const ctx = req.auth;
    if (!ctx || ctx.token.role !== "admin") {
      throw new HttpsError("permission-denied", "Admins only.");
    }
    const { subId } = req.data as { subId?: string };
    if (!subId) throw new HttpsError("invalid-argument", "subId is required.");

    // لا نفتح القواعد للعميل؛ نحذف هنا على الخادم
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    const ref = db.collection("subscriptions").doc(subId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Subscription not found.");

    await ref.delete();
    return { ok: true, subId };
  }
);

// === Admin-only: send a custom email to a single subscriber ===
export const sendCustomEmailToSubscription = onCall(
  { secrets: [BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME, ADMIN_EMAIL, ADMIN_EMAILS] },
  async (req) => {
    const ctx = req.auth;
    if (!ctx || ctx.token.role !== "admin") {
      throw new HttpsError("permission-denied", "Admins only.");
    }
    const { subId, subject, html } = req.data as { subId?: string; subject?: string; html?: string };
    if (!subId || !subject || !html) {
      throw new HttpsError("invalid-argument", "subId, subject, html are required.");
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    const doc = await db.collection("subscriptions").doc(subId).get();
    if (!doc.exists) throw new HttpsError("not-found", "Subscription not found.");
    const data = doc.data() || {};
    const userId = data.userId as string | undefined;
    if (!userId) throw new HttpsError("failed-precondition", "Subscription has no userId.");

    // هات إيميل المستخدم بأمان
    const adminAuth = getAdminAuth();
    const user = await adminAuth.getUser(userId);
    const to = user.email;
    if (!to) throw new HttpsError("failed-precondition", "User has no email.");

    // نعيد استخدام نفس منطق sendConfirmationEmail لإرسال Brevo
    const apiKey = BREVO_API_KEY.value();
    if (!apiKey) throw new HttpsError("failed-precondition", "BREVO_API_KEY is missing");
    const fromEmail = (BREVO_FROM_EMAIL.value() || "noreply@example.com").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fromEmail)) {
      throw new HttpsError("failed-precondition", "Invalid BREVO_FROM_EMAIL");
    }
    const fromName = (BREVO_FROM_NAME.value() || "AGS Activity Platform").trim();

    const adminRaw = (ADMIN_EMAILS.value() || ADMIN_EMAIL.value() || "").trim();
    const adminList = adminRaw ? adminRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
    const cc = adminList.length ? adminList.map(e => ({ email: e })) : undefined;
    const replyTo = adminList.length ? { email: adminList[0], name: fromName } : undefined;

    const payload: Record<string, unknown> = {
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };
    if (cc) payload.cc = cc;
    if (replyTo) payload.replyTo = replyTo;

    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    if (!resp.ok) {
      console.error("Brevo HTTP", resp.status, text);
      throw new HttpsError("internal", `Brevo ${resp.status}: ${text}`);
    }
    return { ok: true };
  }
);

// === Admin-only: send a custom email to multiple subscriptions (bulk) ===
export const sendCustomEmailBulk = onCall(
  { secrets: [BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME, ADMIN_EMAIL, ADMIN_EMAILS] },
  async (req) => {
    const ctx = req.auth;
    if (!ctx || ctx.token.role !== "admin") {
      throw new HttpsError("permission-denied", "Admins only.");
    }
    const { subIds, subject, html } = req.data as { subIds?: string[]; subject?: string; html?: string };
    if (!Array.isArray(subIds) || !subIds.length || !subject || !html) {
      throw new HttpsError("invalid-argument", "subIds[], subject, html are required.");
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    const adminAuth = getAdminAuth();

    // إعداد Brevo مرة واحدة
    const apiKey = BREVO_API_KEY.value();
    if (!apiKey) throw new HttpsError("failed-precondition", "BREVO_API_KEY is missing");
    const fromEmail = (BREVO_FROM_EMAIL.value() || "noreply@example.com").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fromEmail)) {
      throw new HttpsError("failed-precondition", "Invalid BREVO_FROM_EMAIL");
    }
    const fromName = (BREVO_FROM_NAME.value() || "AGS Activity Platform").trim();

    const adminRaw = (ADMIN_EMAILS.value() || ADMIN_EMAIL.value() || "").trim();
    const adminList = adminRaw ? adminRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
    const cc = adminList.length ? adminList.map(e => ({ email: e })) : undefined;
    const replyTo = adminList.length ? { email: adminList[0], name: fromName } : undefined;

    const sent: string[] = [];
    const failed: Array<{ subId: string; error: string }> = [];

    for (const subId of subIds) {
      try {
        const doc = await db.collection("subscriptions").doc(subId).get();
        if (!doc.exists) throw new Error("Subscription not found.");
        const data = doc.data() || {};
        const userId = data.userId as string | undefined;
        if (!userId) throw new Error("Subscription has no userId.");
        const user = await adminAuth.getUser(userId);
        if (!user.email) throw new Error("User has no email.");

        const payload: Record<string, unknown> = {
          sender: { email: fromEmail, name: fromName },
          to: [{ email: user.email }],
          subject,
          htmlContent: html,
        };
        if (cc) payload.cc = cc;
        if (replyTo) payload.replyTo = replyTo;

        const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": apiKey, "content-type": "application/json", "accept": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Brevo ${resp.status}: ${text}`);
        }
        sent.push(subId);
      } catch (e: any) {
        failed.push({ subId, error: e?.message || String(e) });
      }
    }

    return { ok: true, sentCount: sent.length, failed };
  }
);
