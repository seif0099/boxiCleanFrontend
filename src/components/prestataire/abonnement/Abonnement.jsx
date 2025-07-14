import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./abonnement.css";
import { handleStripePaymentAbonnement } from "../StripeCheckoutAbonnement";

const Abonnement = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const token = localStorage.getItem("token");

  const abonnementOptions = [
    {
      type: "mensuel",
      price: 19.99,
      label: "19.99 TND / mois",
      features: ["✔ Visibilité limitée", "✔ 5 prestations max / mois"],
    },
    {
      type: "annuel",
      price: 499.99,
      label: "499.99 TND / an",
      features: [
        "✔ Visibilité complète",
        "✔ Prestations illimitées",
        "✔ Support premium",
        "✔ Économisez 2 mois !",
      ],
    },

    {
      type: "premium",
      price: 49.99,
      label: "49.99 TND / mois",
      features: [
        "✔ Visibilité complète",
        "✔ Prestations illimitées",
        "✔ Support prioritaire",
      ],
    },
  ];

  // Check current subscription on component mount
  useEffect(() => {
    if (token) {
      checkCurrentSubscription();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const checkCurrentSubscription = async () => {
    try {
      setCheckingSubscription(true);
      setMessage(""); // Clear any previous messages

      const response = await fetch("http://localhost:5000/abonnements/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const subscription = await response.json();
        setCurrentSubscription(subscription);

        // If user has active subscription, redirect to dashboard
        if (subscription && subscription.statut === "actif") {
          navigate("/prestataire-dashboard");
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          errorData.message || "Erreur lors de la vérification de l'abonnement"
        );
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setMessage("Erreur de connexion lors de la vérification de l'abonnement");
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selected) {
      setMessage("Veuillez sélectionner un type d'abonnement");
      return;
    }

    const selectedOption = abonnementOptions.find(
      (opt) => opt.type === selected
    );

    if (!selectedOption) {
      setMessage("Type d'abonnement non trouvé");
      return;
    }

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    if (selectedOption.type === "annuel") {
      nextMonth.setFullYear(today.getFullYear() + 1);
    } else {
      nextMonth.setMonth(today.getMonth() + 1);
    }

    const payload = {
      type_abonnement: selectedOption.type.toLowerCase(),
      montant: selectedOption.price,
      date_fin: nextMonth.toISOString().split("T")[0],
    };

    setLoading(true);
    setMessage("");

    await handleStripePaymentAbonnement({
      endpoint: "/payments-abonnement/create-checkout-session",
      payload,
    });

    setLoading(false);
  };

  // Show loading while checking subscription
  if (checkingSubscription) {
    return (
      <div className="abonnement-page">
        <div className="loading">
          <h2>Vérification de votre abonnement...</h2>
        </div>
      </div>
    );
  }

  // Show loading or current subscription info
  if (currentSubscription && currentSubscription.statut === "actif") {
    return (
      <div className="abonnement-page">
        <h1>✅ Abonnement Actif</h1>
        <p>
          Vous avez déjà un abonnement actif. Redirection vers le dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="abonnement-page">
      <h1>💼 Choisissez votre abonnement</h1>
      <p>
        Pour accéder à toutes les fonctionnalités, veuillez activer un
        abonnement.
      </p>

      <div className="abonnement-options">
        {abonnementOptions.map((option) => (
          <div
            key={option.type}
            className={`option-card ${
              selected === option.type ? "selected" : ""
            }`}
            onClick={() => setSelected(option.type)}
          >
            <h3>{option.type}</h3>
            <p>{option.label}</p>
            <ul>
              {option.features.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        className="subscribe-btn"
        onClick={handleSubscribe}
        disabled={loading || !selected}
      >
        {loading ? "Redirection vers le paiement..." : "Souscrire maintenant"}
      </button>

      {message && (
        <p
          className={`message ${
            message.includes("Erreur") ? "error" : "success"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Abonnement;
