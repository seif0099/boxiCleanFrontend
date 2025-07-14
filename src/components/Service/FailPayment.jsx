// pages/FailPayment.js - Updated to handle payment failure
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './failPayment.css'
const FailPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verifyPaymentFailure = async () => {
      if (!sessionId) {
        setError("Session ID manquant");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token manquant");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/payments/verify-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );

        const data = await response.json();

        if (data.success) {
          // If payment actually succeeded, redirect to success page
          navigate(`/success?session_id=${sessionId}`);
        } else {
          // Payment failed - store the failure details
          setPaymentDetails({
            reason: data.message || "Le paiement n'a pas pu être traité",
            sessionId: sessionId,
            timestamp: new Date().toLocaleString(),
          });
          console.log("❌ Payment failed:", data.message);
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("Erreur lors de la vérification du paiement");
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentFailure();
  }, [sessionId, navigate]);

  const handleRetryPayment = () => {
    // Navigate back to the booking/payment page
    navigate("/services");
  };

  const handleContactSupport = () => {
    // You can implement contact support functionality here
    // For now, we'll just show an alert
    alert("Veuillez contacter le support à l'adresse: support@example.com");
  };

  if (loading) {
    return (
      <div className="fail-payment-page">
        <div className="fail-payment-content">
          <h1>⏳ Vérification du paiement...</h1>
          <p>
            Veuillez patienter pendant que nous vérifions le statut de votre
            paiement.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fail-payment-page">
        <div className="fail-payment-content">
          <h1>❌ Erreur</h1>
          <p>{error}</p>
          <div className="button-group">
            <button
              onClick={() => navigate("/client-dashboard")}
              className="btn btn-secondary"
            >
              Retour au tableau de bord
            </button>
            <button onClick={handleRetryPayment} className="btn btn-primary">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fail-payment-page">
      <div className="fail-payment-content">
        <h1>❌ Paiement Échoué</h1>
        <p>Nous sommes désolés, mais votre paiement n'a pas pu être traité.</p>

        {paymentDetails && (
          <div className="payment-failure-details">
            <h3>Détails de l'échec:</h3>
            <div className="detail-item">
              <strong>Raison:</strong> {paymentDetails.reason}
            </div>
            <div className="detail-item">
              <strong>Session ID:</strong> {paymentDetails.sessionId}
            </div>
            <div className="detail-item">
              <strong>Heure:</strong> {paymentDetails.timestamp}
            </div>
          </div>
        )}

        <div className="failure-suggestions">
          <h3>Que faire maintenant?</h3>
          <ul>
            <li>Vérifiez que votre carte a suffisamment de fonds</li>
            <li>
              Assurez-vous que les informations de votre carte sont correctes
            </li>
            <li>Contactez votre banque si le problème persiste</li>
            <li>Essayez avec une autre méthode de paiement</li>
          </ul>
        </div>

        <div className="button-group">
          <button onClick={handleRetryPayment} className="btn btn-primary">
            🔄 Réessayer le paiement
          </button>
          <button
            onClick={() => navigate("/client-dashboard")}
            className="btn btn-secondary"
          >
            📊 Retour au tableau de bord
          </button>
          <button onClick={handleContactSupport} className="btn btn-outline">
            📞 Contacter le support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailPayment;
