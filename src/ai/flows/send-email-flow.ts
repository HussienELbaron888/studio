
// src/ai/flows/send-email-flow.ts
'use server';

/**
 * @fileOverview A Genkit flow for sending transactional emails via Brevo.
 *
 * - sendEmail - A function that sends a confirmation email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as Brevo from '@getbrevo/brevo';

const SendEmailInputSchema = z.object({
  studentName: z.string().describe('The name of the student subscribing.'),
  itemTitle: z.string().describe('The title of the item (activity or trip).'),
  itemType: z.string().describe('The type of item (e.g., "Activity", "Trip").'),
  userEmail: z.string().email().describe('The email of the user to send the confirmation to.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput) {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
  },
  async (payload) => {
    const { studentName, itemTitle, itemType, userEmail } = payload;
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey || brevoApiKey === 'YOUR_BREVO_API_KEY') {
      const errorMessage = 'Brevo API key is not set. Please ensure it is in your .env file and restart the server.';
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }

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
      sendSmtpEmail.subject = `Subscription Confirmation: ${itemTitle}`;
      sendSmtpEmail.htmlContent = `<html><body><h1>Hello ${studentName}!</h1><p>You have successfully subscribed to the ${itemType.toLowerCase()}: <strong>${itemTitle}</strong>.</p></body></html>`;
      sendSmtpEmail.textContent = `Hello ${studentName}! You have successfully subscribed to the ${itemType.toLowerCase()}: ${itemTitle}.`;
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Send to Admin
      sendSmtpEmail.to = [{ email: adminEmail }];
      sendSmtpEmail.subject = `New Subscription: ${itemTitle}`;
      sendSmtpEmail.htmlContent = `<html><body><h1>New Subscription</h1><p>A new user has subscribed:</p><ul><li>Email: ${userEmail}</li><li>Student: ${studentName}</li><li>${itemType}: ${itemTitle}</li></ul></body></html>`;
      sendSmtpEmail.textContent = `New subscription for ${itemTitle} (${itemType}) from ${userEmail} (Student: ${studentName}).`;
      await apiInstance.sendTransacEmail(sendSmtpEmail);

      return { success: true };
    } catch (error: any) {
      console.error('Email sending with Brevo failed:', error.response ? error.response.body : error);
      const errorMessage = error.response?.body?.message || error.message || 'Failed to send email.';
      return { success: false, error: errorMessage };
    }
  }
);
