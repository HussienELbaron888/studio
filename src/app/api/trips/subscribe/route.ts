
import { NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/ai/flows/send-email-flow";

export async function POST(req: Request) {
  try {
    const { tripId, studentName, className, phoneNumber, userId, userEmail } = await req.json();
    if (!tripId || !studentName || !className || !phoneNumber || !userId || !userEmail) {
      return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 });
    }

    const tripRef = adminDb.doc(`trips/${tripId}`);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
      return NextResponse.json({ ok: false, message: "Trip not found" }, { status: 404 });
    }
    const trip = tripSnap.data()!;
    const tripTitle = trip.title?.en || "a Trip";

    // Write subscription to the user's subcollection using Admin SDK
    const subscriptionRef = adminDb.collection('users').doc(userId).collection('subscriptions').doc();
    
    await subscriptionRef.set({
        tripId,
        itemTitle: tripTitle,
        itemType: 'trip',
        studentName,
        className,
        phoneNumber,
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send confirmation emails using the existing Genkit flow
    const emailResult = await sendEmail({
        studentName: studentName,
        itemTitle: tripTitle,
        userEmail: userEmail,
        itemType: 'Trip'
    });

    if (!emailResult.success) {
        // Log the error but don't fail the whole request, as the subscription was successful
        console.error("Subscription was successful, but email failed to send:", emailResult.error);
        // Optionally, you could return a specific status to the client
    }

    return NextResponse.json({ ok: true, id: subscriptionRef.id });
  } catch (e: any) {
    console.error("Error in /api/trips/subscribe:", e);
    return NextResponse.json({ ok: false, message: e.message || "Internal server error" }, { status: 500 });
  }
}
