import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ServiceDetails.css";
import { handleStripePayment } from "./StripeCheckout";

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [loading, setLoading] = useState(false);
  const [modePaiement, setModePaiement] = useState("à_la_livraison");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`http://localhost:5000/services/${id}`);
        if (!res.ok) {
          throw new Error("Service not found");
        }
        const data = await res.json();
        setService(data);
      } catch (error) {
        console.error("Erreur chargement service", error);
        alert("Erreur lors du chargement du service");
      }
    };

    fetchService();
  }, [id]);

  const validateInputs = () => {
    if (!date) {
      alert("Veuillez sélectionner une date");
      return false;
    }
    if (!heure) {
      alert("Veuillez sélectionner une heure");
      return false;
    }

    // Check if date is in the future
    const selectedDate = new Date(date + "T" + heure);
    const now = new Date();
    if (selectedDate <= now) {
      alert("La date et l'heure doivent être dans le futur");
      return false;
    }

    return true;
  };

  const handleReservation = async () => {
    if (!token) {
      alert("Vous devez être connecté pour faire une réservation");
      return navigate("/auth");
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      if (modePaiement === "en_ligne") {
        // Handle Stripe payment
        await handleStripePayment({ service, date, heure });
      } else {
        // Handle classic reservation for "à_la_livraison"
        const res = await fetch("http://localhost:5000/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service_id: id,
            date,
            heure,
            mode_paiement: modePaiement,
            prestataire_id: service.prestataire_id

          }),
        });

        const data = await res.json();

        if (res.status === 201) {
          alert("✅ Réservation effectuée avec succès !");
          navigate("/client-dashboard");
        } else {
          alert(data.message || "❌ Erreur lors de la réservation");
        }
      }
    } catch (err) {
      console.error("Erreur réservation:", err);
      alert("Erreur lors de la réservation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!service) return <p className="loading-message">Chargement...</p>;

return (
  <div className="service-details-page">
    {/* Left: Service image */}
    <div className="service-image-container">
      <img
        src="/bx.png"
        alt={service.nom_service}
        className="service-image"
      />
    </div>

    {/* Right: Form */}
    <div className="service-details-container">
      <h2 className="service-title">{service.nom_service}</h2>
      <p className="service-description">{service.description}</p>
      <p className="service-price">💰 Prix : {service.prix_base} TND</p>
      <p className="service-duration">
        ⏱️ Durée estimée : {service.durée_estimée} minutes
      </p>

      <div className="form-group">
        <label>Date :</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="form-group">
        <label>Heure :</label>
        <input
          type="time"
          value={heure}
          onChange={(e) => setHeure(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Mode de paiement :</label>
        <select
          value={modePaiement}
          onChange={(e) => setModePaiement(e.target.value)}
          className="payment-select"
        >
          <option value="à_la_livraison">À la livraison</option>
          <option value="en_ligne">En ligne (Stripe)</option>
        </select>
      </div>

      <button
        onClick={handleReservation}
        className="reserve-button"
        disabled={loading}
      >
        {loading ? "⏳ Traitement..." : "✅ Réserver ce service"}
      </button>
    </div>
  </div>
);

};

export default ServiceDetails;
