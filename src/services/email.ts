
'use server';
import * as Brevo from '@getbrevo/brevo';
import { brevoApiKey } from '@/lib/config';

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
  
  const adminEmail = 'hussienelbaron888@gmail.com'; 
  const senderEmail = 'hussienelbaron888@gmail.com';

  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = brevoApiKey;

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
  } catch (error: any) {
    console.error('Email sending with Brevo failed:', error.response ? error.response.body : error);
    // Extracting a more specific error message if available
    const errorMessage = error.response?.body?.message || error.message || 'Failed to send email.';
    return { success: false, error: errorMessage };
  }
}
