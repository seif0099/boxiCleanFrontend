import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './sucesspage.css'
const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState(
    "Activation de votre abonnement en cours..."
  );
  const [attemptCount, setAttemptCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (sessionId) {
      // Add a small delay to allow webhook to process first
      setTimeout(() => {
        activateSubscription(sessionId);
      }, 2000);
    } else {
      setStatus("error");
      setMessage("Session invalide. Veuillez réessayer.");
    }
  }, [sessionId, token, navigate]);

  const activateSubscription = async (sessionId) => {
    try {
      setStatus("processing");
      setMessage("Vérification du paiement en cours...");

      const verifyResponse = await fetch(
        "http://localhost:5000/payments-abonnement/verify-abonnement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.success) {
        setStatus("success");
        setMessage("🎉 Abonnement activé avec succès!");

        // Redirect after showing success message
        setTimeout(() => {
          navigate("/prestataire-dashboard");
        }, 2000);
      } else {
        // If verification failed, show retry option
        setStatus("error");
        setMessage(
          verifyData.message ||
            "Problème lors de l'activation. Cela peut prendre quelques instants."
        );

        // Auto-retry up to 3 times with increasing delays
        const currentAttempt = attemptCount + 1;
        setAttemptCount(currentAttempt);

        if (currentAttempt < 3) {
          setMessage(
            `Tentative ${currentAttempt}/3 - Nouvelle vérification dans quelques secondes...`
          );
          setTimeout(() => {
            setStatus("processing");
            activateSubscription(sessionId);
          }, 5000 * currentAttempt); // Increasing delay: 5s, 10s, 15s
        }
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      setStatus("error");
      setMessage(
        "Erreur de connexion. Veuillez vérifier votre connexion internet ou contacter le support."
      );
    }
  };

  const handleManualRetry = () => {
    setAttemptCount(0);
    activateSubscription(sessionId);
  };

  const handleReturnToDashboard = () => {
    navigate("/prestataire-dashboard");
  };

  return (
    <div className="success-page">
      <div className="success-container">
        {status === "processing" && (
          <div className="processing">
            <div className="spinner"></div>
            <h2>Traitement en cours...</h2>
            <p>{message}</p>
            <p className="info-text">
              Cela peut prendre quelques instants. Veuillez ne pas fermer cette
              page.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="success">
            <div className="success-icon">✅</div>
            <h2>Paiement réussi!</h2>
            <p>{message}</p>
            <p className="redirect-info">
              Redirection automatique vers votre dashboard...
            </p>
            <button
              onClick={() => navigate("/prestataire-dashboard")}
              className="dashboard-btn"
            >
              Accéder au dashboard
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="error">
            <div className="error-icon">❌</div>
            <h2>Problème d'activation</h2>
            <p>{message}</p>

            {attemptCount < 3 && sessionId && (
              <p className="retry-info">
                Le paiement a été effectué, mais l'activation prend plus de
                temps que prévu.
              </p>
            )}

            <div className="error-actions">
              {attemptCount < 3 && sessionId && (
                <button onClick={handleManualRetry} className="retry-btn">
                  Réessayer l'activation
                </button>
              )}

              <button
                onClick={handleReturnToDashboard}
                className="dashboard-btn"
              >
                Retour au dashboard
              </button>

              <button
                onClick={() => navigate("/abonnement")}
                className="retry-btn"
              >
                Nouvelle souscription
              </button>
            </div>

            {attemptCount >= 3 && (
              <div className="support-info">
                <p>
                  <strong>Besoin d'aide ?</strong>
                  <br />
                  Votre paiement a été traité avec succès. Si l'activation ne
                  fonctionne pas, contactez notre support avec votre ID de
                  session: <code>{sessionId}</code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
