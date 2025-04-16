import { db } from "@/app/lib/firebase"
import Stripe from "stripe"

export async function handleStripeCancelSubscription(
  event: Stripe.CustomerSubscriptionDeletedEvent
) {
  const metadata = event.data.object.metadata

  const userId = metadata?.userId

  if (!userId) {
    console.error("User ID not found")
    return
  }

  await db.collection("users").doc(userId).update({
    subscriptionStatus: "inactive",
  })
}
