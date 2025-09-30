
'use server';

type ConfirmationEmailPayload = {
  studentName: string;
  activityTitle: string;
  userEmail: string;
};

/**
 * Sends a confirmation email to the user and admin.
 * This is a placeholder function. To implement actual email sending, you would:
 * 1. Choose an email service provider (e.g., SendGrid, Mailgun, Resend).
 * 2. Install their SDK (e.g., `npm install @sendgrid/mail`).
 * 3. Configure an API key in your environment variables (e.g., SENDGRID_API_KEY).
 * 4. Replace the console.log statements with the actual email sending logic.
 * 
 * NOTE: This function should be triggered from a secure, server-side environment
 * (like a Next.js Server Action, API Route, or a Firebase Cloud Function) to protect your API keys.
 * The current implementation simulates the action without sending real emails.
 */
export async function sendConfirmationEmail(payload: ConfirmationEmailPayload) {
  const { studentName, activityTitle, userEmail } = payload;
  const adminEmail = 'admin@example.com'; // Replace with your admin email

  console.log('--- SIMULATING EMAIL ---');
  console.log(`To: ${userEmail}`);
  console.log(`Subject: Subscription Confirmation: ${activityTitle}`);
  console.log(`Body: Hello ${studentName}, you have successfully subscribed to ${activityTitle}.`);
  console.log('------------------------');

  console.log('--- SIMULATING EMAIL ---');
  console.log(`To: ${adminEmail}`);
  console.log(`Subject: New Subscription: ${activityTitle}`);
  console.log(`Body: A new user (${userEmail}, student: ${studentName}) has subscribed to ${activityTitle}.`);
  console.log('------------------------');

  // Example with SendGrid (after setup):
  /*
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const userMsg = {
      to: userEmail,
      from: 'you@example.com', // Use a verified sender email
      subject: `Subscription Confirmation: ${activityTitle}`,
      text: `Hello ${studentName}, you have successfully subscribed to ${activityTitle}.`,
      html: `<strong>Hello ${studentName},</strong><p>You have successfully subscribed to ${activityTitle}.</p>`,
    };

    const adminMsg = {
      to: adminEmail,
      from: 'you@example.com',
      subject: `New Subscription: ${activityTitle}`,
      text: `A new user (${userEmail}, student: ${studentName}) has subscribed to ${activityTitle}.`,
      html: `<strong>New Subscription:</strong><p>A new user (${userEmail}, student: ${studentName}) has subscribed to ${activityTitle}.</p>`,
    };

    await sgMail.send(userMsg);
    await sgMail.send(adminMsg);
    
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: 'Failed to send email.' };
  }
  */

  return { success: true };
}
