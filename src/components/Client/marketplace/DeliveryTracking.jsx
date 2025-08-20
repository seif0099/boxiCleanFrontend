import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./deliveryTracking.css"; // Ensure you have this CSS file for styling
const DeliveryTracking = ({ commandeId: propCommandeId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [livraison, setLivraison] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get commandeId from multiple sources with fallback
  const getCommandeId = () => {
    // Priority: prop > location state > localStorage
    if (propCommandeId && propCommandeId !== undefined) {
      return propCommandeId;
    }
    if (location.state?.commandeId) {
      return location.state.commandeId;
    }
    const storedId = localStorage.getItem("lastCommandeId");
    return storedId;
  };

  const commandeId = getCommandeId();

  const fetchLivraison = async () => {
    // Validate commandeId before making request
    if (!commandeId || commandeId === "undefined" || commandeId === undefined) {
      setError("ID de commande manquant");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/livraison/track/${commandeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLivraison(res.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 404 && attempts < 10) {
        // Retry silently for 404 errors (livraison might not be created yet)
        setAttempts((prev) => prev + 1);
        // Don't set loading to false here, keep trying
      } else {
        console.error("Erreur récupération livraison:", err);
        setError(
          err.response?.data?.message ||
            "Erreur lors de la récupération de la livraison"
        );
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!commandeId) {
      setError("ID de commande manquant");
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchLivraison();

    // Set up interval for polling
    const interval = setInterval(fetchLivraison, 5000);
    return () => clearInterval(interval);
  }, [commandeId, attempts]);

  // Show error state
  if (error) {
    return (
      <div
        className="tracking-container"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <h3>❌ Erreur</h3>
        <p>{error}</p>
        <button
          onClick={() => navigate("/client-dashboard")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div
        className="tracking-container"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <p>⏳ En attente de livraison... (Tentative {attempts + 1}/10)</p>
      </div>
    );
  }

  // Show tracking information
  return (
    <div className="tracking-container" style={{ padding: "2rem" }}>
      <h3>🚚 Suivi de Livraison</h3>
      <div style={{ marginTop: "1rem" }}>
        <p>
          <strong>Commande ID:</strong> {commandeId}
        </p>
        <p>
          <strong>Statut:</strong> {livraison.statut}
        </p>
        <p>
          <strong>Date estimée:</strong>{" "}
          {livraison.date_estimee
            ? new Date(livraison.date_estimee).toLocaleDateString("fr-FR")
            : "Non définie"}
        </p>
        <p>
          <strong>Coordonnées:</strong> {livraison.coordonnees_client}
        </p>
        {livraison.date_livraison_effective && (
          <p>
            <strong>Date de livraison:</strong>{" "}
            {new Date(livraison.date_livraison_effective).toLocaleDateString(
              "fr-FR"
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
