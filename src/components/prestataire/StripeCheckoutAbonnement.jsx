// components/StripeCheckout.js
import { loadStripe } from "@stripe/stripe-js";

// Use the SAME public key everywhere - choose one and stick with it
const stripePromise = loadStripe(
  "pk_test_51RfQbRR7JdBksZPnrNBFbLbFJx40SjRiRAJNplzrgLB2gd0pBqBCZuLyzavs0yzMbGek8fib9lu2xPMTyweAIbSN00oY4M1163"
);



export const handleStripePaymentAbonnement = async ({ endpoint, payload }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("❌ Vous devez être connecté pour effectuer un paiement");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Échec de la session Stripe");
    }

    const data = await res.json();
    const stripe = await stripePromise;

    if (!stripe) throw new Error("Stripe n’a pas pu être chargé");

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.id || data.sessionId || data.session_id || data.session?.id,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("❌ Erreur Stripe:", error.message);
    alert("Erreur Stripe: " + error.message);
  }
};
