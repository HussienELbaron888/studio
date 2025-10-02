
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp, getApps} from "firebase-admin/app";
import {getAuth as getAdminAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

// Initialize admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

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


export const getStats = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async () => {
    try {
      const [
        subscriptionsSnap,
        activitiesSnap,
        eventsSnap,
        tripsSnap,
        talentsSnap,
      ] = await Promise.all([
        db.collection("subscriptions").count().get(),
        db.collection("activities").get(),
        db.collection("events").count().get(),
        db.collection("trips").count().get(),
        db.collection("talents").count().get(),
      ]);

      let paidActivities = 0;
      let freeActivities = 0;
      activitiesSnap.forEach((doc) => {
        if (doc.data().type === "Paid") {
          paidActivities++;
        } else {
          freeActivities++;
        }
      });

      const stats = {
        subscriptions: subscriptionsSnap.data().count,
        paidActivities: paidActivities,
        freeActivities: freeActivities,
        events: eventsSnap.data().count,
        trips: tripsSnap.data().count,
        talents: talentsSnap.data().count,
      };

      return {ok: true, data: stats};
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Failed to get stats:", msg);
      throw new HttpsError("internal", `Failed to get stats: ${msg}`);
    }
  }
);

export const sendAdminEmail = onCall(
  {
    secrets: [BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME],
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req) => {
    const ctx = req.auth;
    if (!ctx) {
      throw new HttpsError("unauthenticated", "Login required to send emails.");
    }

    // This checks custom claims on the user's token
    const role = (ctx.token.role as string) || "user";
    if (role !== "admin") {
      throw new HttpsError("permission-denied", "You must be an admin to send bulk emails.");
    }

    const {to, subject, html} = req.data || {};

    if (!Array.isArray(to) || to.length === 0) {
      throw new HttpsError("invalid-argument", "`to` must be a non-empty string array.");
    }
    if (!subject || !html) {
      throw new HttpsError("invalid-argument", "Subject and html are required.");
    }

    const apiKey = BREVO_API_KEY.value();
    const fromEmail = BREVO_FROM_EMAIL.value();
    const fromName = BREVO_FROM_NAME.value() || "AGS Activity Platform";

    if (!apiKey || !fromEmail) {
      throw new HttpsError("failed-precondition", "Brevo environment variables are missing.");
    }

    const recipients = [...new Set(to as string[])].map((email: string) => ({email}));

    const payload = {
      sender: {email: fromEmail, name: fromName},
      to: recipients,
      subject,
      htmlContent: html,
    };

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error(`Brevo error: ${res.status}`, msg);
        throw new HttpsError("internal", `Brevo API error: ${res.status} ${msg}`);
      }
      return {ok: true};
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Failed to send admin email:", msg);
      throw new HttpsError("internal", msg);
    }
  });

    