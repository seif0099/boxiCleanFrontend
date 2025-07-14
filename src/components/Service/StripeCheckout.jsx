// components/StripeCheckout.js
import { loadStripe } from "@stripe/stripe-js";

// Use the SAME public key everywhere - choose one and stick with it
const stripePromise = loadStripe(
  "pk_test_51RfQbRR7JdBksZPnrNBFbLbFJx40SjRiRAJNplzrgLB2gd0pBqBCZuLyzavs0yzMbGek8fib9lu2xPMTyweAIbSN00oY4M1163"
);

export const handleStripePayment = async ({ service, date, heure }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("❌ Vous devez être connecté pour effectuer un paiement");
    return;
  }

  try {
    // Step 1: Create checkout session with reservation data
    console.log("🔄 Creating checkout session...");
    const res = await fetch(
      "http://localhost:5000/payments/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_id: service.id,
          date,
          heure,
          prestataire_id: service.prestataire_id, // ✅ Include prestataire_id
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Stripe session creation failed");
    }

    const data = await res.json();
    console.log("✅ Checkout session created:", data.id);

    // Step 2: Redirect to Stripe Checkout
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.id,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error.message);
    alert("Erreur Stripe: " + error.message);
  }
};
