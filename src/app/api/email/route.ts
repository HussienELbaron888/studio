// src/app/api/email/route.ts
// ✅ This is server-only code – it never loads on the client
export const runtime = 'nodejs'; // Ensure we're on the Node runtime (important for Firebase App Hosting)
export const dynamic = 'force-dynamic'; // Avoid any caching/edge environments

import * as Brevo from '@getbrevo/brevo';

type Payload = {
  studentName: string;
  activityTitle: string;
  userEmail: string;
};

function assertEnv() {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    throw new Error('BREVO_API_KEY is not set in the environment variables.');
  }
  // Prevent mixing up SMTP key with API key
  if (key.startsWith('xsmtpsib-')) {
    throw new Error(
      'You have provided an SMTP key (starts with xsmtpsib-). The Brevo REST library requires a v3 API key (starts with xkeysib-).'
    );
  }
  return key;
}

async function sendEmailViaBrevo({ studentName, activityTitle, userEmail }: Payload) {
  const apiKey = assertEnv();

  const api = new Brevo.TransactionalEmailsApi();
  api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const senderEmail = process.env.SENDER_EMAIL || 'noreply@ags-activity.com';
  const senderName = process.env.SENDER_NAME || 'AGS Activities';

  // Email to the user
  const toUser = new Brevo.SendSmtpEmail();
  toUser.sender = { email: senderEmail, name: senderName };
  toUser.to = [{ email: userEmail }];
  toUser.subject = `Subscription Confirmation: ${activityTitle}`;
  toUser.htmlContent = `<html><body>
    <h1>Subscription Confirmation</h1>
    <p>Thank you, ${studentName}! Your subscription to <b>${activityTitle}</b> has been confirmed.</p>
  </body></html>`;
  toUser.textContent = `Subscription Confirmation: ${activityTitle} - Thank you, ${studentName}.`;

  await api.sendTransacEmail(toUser);

  // Notification to the admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const toAdmin = new Brevo.SendSmtpEmail();
    toAdmin.sender = { email: senderEmail, name: senderName };
    toAdmin.to = [{ email: adminEmail }];
    toAdmin.subject = `New Subscription: ${activityTitle}`;
    toAdmin.htmlContent = `<html><body>
      <h1>New Subscription</h1>
      <ul>
        <li>Student: ${studentName}</li>
        <li>Email: ${userEmail}</li>
        <li>Activity: ${activityTitle}</li>
      </ul>
    </body></html>`;
    toAdmin.textContent = `New subscription for ${activityTitle} from ${userEmail} (Student: ${studentName}).`;

    await api.sendTransacEmail(toAdmin);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Payload>;
    if (!body?.studentName || !body?.activityTitle || !body?.userEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing data.' }), { status: 400 });
    }

    await sendEmailViaBrevo({
      studentName: body.studentName,
      activityTitle: body.activityTitle,
      userEmail: body.userEmail,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Email API error:', err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Failed to send email.' }), {
      status: 500,
    });
  }
}
