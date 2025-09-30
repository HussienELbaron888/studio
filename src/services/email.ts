
'use server';
import * as Brevo from '@getbrevo/brevo';

type ConfirmationEmailPayload = {
  studentName: string;
  activityTitle: string;
  userEmail: string;
};

/**
 * Sends a confirmation email to the user and admin using Brevo.
 */
export async function sendConfirmationEmail(payload: ConfirmationEmailPayload) {
  const { studentName, activityTitle, userEmail } = payload;
  
  // الخطوة التالية: استبدل هذه العناوين بمعلوماتك الحقيقية
  const adminEmail = 'hussienelbaron888@gmail.com'; // <--- ضع هنا بريدك الإلكتروني كمسؤول
  const senderEmail = 'hussienelbaron888@gmail.com'; // <--- ضع هنا بريدك المعتمد في Brevo

  if (!process.env.BREVO_API_KEY) {
    console.error('Brevo API key is not set. Skipping email sending.');
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
    return { success: false, error: 'Email service is not configured.' };
  }

  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  try {
    // Send to User
    sendSmtpEmail.to = [{ email: userEmail, name: studentName }];
    sendSmtpEmail.sender = { email: senderEmail, name: 'Al-Nadi Activities' };
    sendSmtpEmail.subject = `Subscription Confirmation: ${activityTitle}`;
    sendSmtpEmail.htmlContent = `<html><body><h1>Hello ${studentName}!</h1><p>You have successfully subscribed to the activity: <strong>${activityTitle}</strong>.</p></body></html>`;
    sendSmtpEmail.textContent = `Hello ${studentName}! You have successfully subscribed to the activity: ${activityTitle}.`;
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Send to Admin
    sendSmtpEmail.to = [{ email: adminEmail }];
    sendSmtpEmail.subject = `New Subscription: ${activityTitle}`;
    sendSmtpEmail.htmlContent = `<html><body><h1>New Subscription</h1><p>A new user has subscribed:</p><ul><li>Email: ${userEmail}</li><li>Student: ${studentName}</li><li>Activity: ${activityTitle}</li></ul></body></html>`;
    sendSmtpEmail.textContent = `New subscription for ${activityTitle} from ${userEmail} (Student: ${studentName}).`;
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return { success: true };
  } catch (error) {
    console.error('Email sending with Brevo failed:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}
