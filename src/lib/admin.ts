
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

const region = "us-central1";
const fns = getFunctions(app, region);

export async function adminDeleteSubscription(subId: string) {
  const callable = httpsCallable(fns, "adminDeleteSubscription");
  const res = await callable({ subId });
  return res.data as any;
}

export async function sendCustomEmailToSubscription(args: { subId: string; subject: string; html: string }) {
  const callable = httpsCallable(fns, "sendCustomEmailToSubscription");
  const res = await callable(args);
  return res.data as any;
}

export async function sendCustomEmailBulk(args: { subIds: string[]; subject: string; html: string }) {
  const callable = httpsCallable(fns, "sendCustomEmailBulk");
  const res = await callable(args);
  return res.data as any;
}
