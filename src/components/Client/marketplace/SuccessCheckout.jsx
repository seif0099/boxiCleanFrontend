import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../Service/sucess.css";

const SuccessCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commandes, setCommandes] = useState(null);

  useEffect(() => {
    let isVerified = false;

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

      const verifiedSession = localStorage.getItem(`verified_${sessionId}`);
      if (verifiedSession) {
        try {
          const cachedData = JSON.parse(verifiedSession);
          setCommandes(cachedData.commandes);
          setLoading(false);
          return;
        } catch (err) {
          console.error("Error parsing cached data:", err);
          localStorage.removeItem(`verified_${sessionId}`);
        }
      }

      try {
        const response = await fetch(
          "http://localhost:5000/commande/verify-payment",
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

        if (response.ok && data.success) {
          setCommandes(data.commandes);
          localStorage.setItem(`verified_${sessionId}`, JSON.stringify(data));

          // Store the latest commande ID for tracking
          if (data.commandes && data.commandes.length > 0) {
            const latestCommande = data.commandes[0];
            console.log("Storing commande ID:", latestCommande.id);
            localStorage.setItem(
              "lastCommandeId",
              latestCommande.id.toString()
            );
          }

          isVerified = true;
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

    return () => {
      isVerified = false;
    };
  }, [sessionId]);

  const goToMarketplace = () => {
    navigate("/client-dashboard", { state: { showTracking: true } });
  };
  useEffect(() => {
    if (commandes && commandes.length > 0) {
      const factureUrl = `http://localhost:5000/commande/${commandes[0].id}/facture`;
      window.open(factureUrl, "_blank"); // trigger PDF open in new tab
    }
  }, [commandes]);


  const goToTracking = () => {
    if (commandes && commandes.length > 0) {
      navigate("/delivery-tracking", {
        state: { commandeId: commandes[0].id },
      });
    }
  };

  if (loading) {
    return (
      <div className="reservation-success-page">
        <div className="reservation-success-content">
          <h1>⏳ Vérification du paiement...</h1>
          <p>Veuillez patienter pendant que nous confirmons votre commande.</p>
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
        <p>Votre commande a été confirmée avec succès.</p>

        {commandes && commandes.length > 0 && (
          <div className="reservation-success-details">
            <h3>Détails de vos commandes:</h3>
            {commandes.map((commande) => (
              <div key={commande.id} className="commande-block">
                <p>
                  <strong>ID Commande:</strong> {commande.id}
                </p>
                <p>
                  <strong>Vendeur ID:</strong> {commande.vendeur_id}
                </p>
                <p>
                  <strong>Total:</strong> {commande.total} TND
                </p>
                <p>
                  <strong>Statut:</strong> {commande.statut}
                </p>
                <p>
                  <strong>Mode de paiement:</strong> {commande.mode_paiement}
                </p>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button onClick={goToMarketplace} className="reservation-success-btn">
            Retour au tableau de bord
          </button>

          {commandes && commandes.length > 0 && (
            <button
              onClick={goToTracking}
              className="reservation-success-btn"
              style={{ backgroundColor: "#2196F3" }}
            >
              🚚 Suivre ma livraison
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessCheckout;
