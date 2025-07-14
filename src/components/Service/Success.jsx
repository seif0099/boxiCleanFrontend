import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./sucess.css"; // updated file name

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
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
          setReservation(data.reservation);
          console.log("✅ Payment verified:", data.reservation);
        } else {
          setError(
            data.message || "Erreur lors de la vérification du paiement"
          );
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("Erreur lors de la vérification du paiement");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="reservation-success-page">
        <div className="reservation-success-content">
          <h1>⏳ Vérification du paiement...</h1>
          <p>
            Veuillez patienter pendant que nous confirmons votre réservation.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-success-page">
        <div className="reservation-success-content">
          <h1>❌ Erreur</h1>
          <p>{error}</p>
          <button
            onClick={() => navigate("/client-dashboard")}
            className="reservation-success-btn"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-success-page">
      <div className="reservation-success-content">
        <h1>✅ Paiement Réussi!</h1>
        <p>Votre réservation a été confirmée avec succès.</p>
        {reservation && (
          <div className="reservation-success-details">
            <h3>Détails de la réservation:</h3>
            <p>
              <strong>ID:</strong> {reservation.id}
            </p>
            <p>
              <strong>Date:</strong> {reservation.date}
            </p>
            <p>
              <strong>Heure:</strong> {reservation.heure}
            </p>
            <p>
              <strong>Statut:</strong> {reservation.statut}
            </p>
          </div>
        )}
        <button
          onClick={() => navigate("/client-dashboard")}
          className="reservation-success-btn"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default Success;
