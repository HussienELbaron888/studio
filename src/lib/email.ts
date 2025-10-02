
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

const functionsRegion = "us-central1";
const functionsInstance = getFunctions(app, functionsRegion);

const sendEmailCallable = httpsCallable(functionsInstance, "sendConfirmationEmail");

export async function sendConfirmationEmail(to: string, subject: string, html: string) {
  try {
    const result = await sendEmailCallable({ to, subject, html });
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error sending email through callable function:", error);
    // The error object from a callable function has a 'message' property
    const err = error as { code: string; message: string; details?: any };
    return { success: false, error: err.message || "An unknown error occurred." };
  }
}
