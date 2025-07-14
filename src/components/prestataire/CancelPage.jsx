import React from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="cancel-page">
      <div className="cancel-container">
        <div className="cancel-icon">❌</div>
        <h2>Paiement annulé</h2>
        <p>Vous avez annulé votre paiement. Aucun montant n'a été débité.</p>

        <div className="cancel-actions">
          <button onClick={() => navigate("/abonnement")} className="retry-btn">
            Réessayer le paiement
          </button>
          <button
            onClick={() => navigate("/prestataire-dashboard")}
            className="dashboard-btn"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
