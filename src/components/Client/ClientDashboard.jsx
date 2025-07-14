import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./ClientDashboard.css";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReservationForReview, setSelectedReservationForReview] =
    useState(null);
  const token = localStorage.getItem("token");
  const [showModal, setShowModal] = useState(false);


  let client_id = "";

  if (token) {
    const decoded = jwtDecode(token);
    client_id = decoded.id;
  }

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    fetchReservations();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchReservations = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Données non valides");

      // Check review status for each reservation
      const reservationsWithReviewStatus = await Promise.all(
        data.map(async (reservation) => {
          if (reservation.statut === "terminée") {
            try {
              const reviewRes = await fetch(
                `http://localhost:5000/avis/reservation/${reservation.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const hasReview = reviewRes.status === 200;
              return { ...reservation, has_review: hasReview };
            } catch (err) {
              return { ...reservation, has_review: false };
            }
          }
          return { ...reservation, has_review: false };
        })
      );

      setReservations(reservationsWithReviewStatus);
    } catch (err) {
      alert("Erreur lors du chargement des données");
    }
  };

  // Get all reservations eligible for review
  const getEligibleReservations = (reservations) => {
    return reservations
      .filter(
        (reservation) =>
          reservation.statut === "terminée" && !reservation.has_review
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const latest = reservations.length > 0 ? reservations[0] : null;
  const eligibleForReview = getEligibleReservations(reservations);
  const total = reservations.length;
  const totalPaid = reservations.reduce(
    (sum, r) => sum + (r.Service?.prix_base || 0),
    0
  );

  const handleReservationSelect = (reservation) => {
    setSelectedReservationForReview(reservation);
    setNote("");
    setCommentaire("");
  };

  const handleCancelReview = () => {
    setSelectedReservationForReview(null);
    setNote("");
    setCommentaire("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vous devez être connecté pour laisser un avis");
        return;
      }

      // Validation
      if (!note || !commentaire.trim()) {
        alert("Veuillez remplir tous les champs");
        return;
      }

      if (parseInt(note) < 1 || parseInt(note) > 5) {
        alert("La note doit être entre 1 et 5");
        return;
      }

      // Check if we have a valid reservation for review
      if (!selectedReservationForReview || !selectedReservationForReview.id) {
        alert("Aucune réservation sélectionnée pour un avis");
        return;
      }

      // Double-check that this reservation doesn't already have a review
      try {
        const reviewCheckRes = await fetch(
          `http://localhost:5000/avis/reservation/${selectedReservationForReview.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (reviewCheckRes.status === 200) {
          alert(
            "Cette réservation a déjà un avis. Rechargement des données..."
          );
          window.location.reload();
          return;
        }
      } catch (err) {
        // Continue with submission if check fails
      }

      // Get prestataire_id from reservation or service
      let prestataire_id = selectedReservationForReview.prestataire_id;

      if (
        !prestataire_id &&
        selectedReservationForReview.Service &&
        selectedReservationForReview.Service.prestataire_id
      ) {
        prestataire_id = selectedReservationForReview.Service.prestataire_id;
      }

      if (!prestataire_id) {
        alert("Impossible de trouver le prestataire pour cette réservation");
        return;
      }

      const reviewData = {
        prestataire_id: prestataire_id,
        reservation_id: selectedReservationForReview.id,
        commentaire: commentaire.trim(),
        note: parseInt(note),
      };

      const res = await fetch("http://localhost:5000/avis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Avis soumis avec succès !");
        setNote("");
        setCommentaire("");
        setSelectedReservationForReview(null);

        // Update the reservations state to mark this reservation as having a review
        const updatedReservations = reservations.map((reservation) => {
          if (reservation.id === selectedReservationForReview.id) {
            return { ...reservation, has_review: true };
          }
          return reservation;
        });

        setReservations(updatedReservations);
      } else {
        if (data.message) {
          alert(`❌ Erreur: ${data.message}`);

          if (data.message.includes("Un avis existe déjà")) {
            window.location.reload();
          }
        } else {
          alert(`❌ Erreur: ${res.status} ${res.statusText}`);
        }
      }
    } catch (err) {
      alert("❌ Erreur de connexion: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-dashboard">
      <header className="client-header">
        <h1>👋 Bienvenue, cher(e) client(e) !</h1>
        <p>Gérez vos prestations depuis cet espace.</p>
        <button className="logout-btn" onClick={handleLogout}>
          Se déconnecter
        </button>
      </header>

      <section className="client-summary">
        <div className="card clickable" onClick={() => setShowModal(true)}>
          <h3>📦 Commandes totales</h3>
          <p>{total}</p>
        </div>

        <div className="card">
          <h3>🧼 Dernière prestation</h3>
          <p>
            {latest?.Service ? (
              <>
                {latest.Service.nom_service} ({latest.Service.description}) –{" "}
                {new Date(latest.date).toLocaleDateString()}
                <br />
                <span
                  className={`status-tag ${latest.statut}`}
                  style={{ textTransform: "capitalize" }}
                >
                  {latest.statut}
                </span>
                {new Date(latest.date) > new Date() && (
                  <span className="badge-upcoming">À venir</span>
                )}
              </>
            ) : (
              "Aucune réservation"
            )}
          </p>
        </div>

        <div className="card">
          <h3>💬 Dernier commentaire</h3>
          <p>{latest?.commentaires || "Aucun commentaire"}</p>
        </div>

        <div className="card">
          <h3>💸 Total dépensé</h3>
          <p>{totalPaid.toFixed(2)} TND</p>
        </div>
      </section>

      <button className="go-services-btn" onClick={() => navigate("/services")}>
        🔍 Explorer les services
      </button>

      {/* Review Section - moved here */}
      <section className="review-section">
        <h3>📝 Laissez un avis</h3>

        {eligibleForReview.length > 0 ? (
          <>
            {!selectedReservationForReview ? (
              <div className="reservation-selection">
                <p>
                  Sélectionnez une réservation pour laquelle vous souhaitez
                  laisser un avis :
                </p>
                <div className="reservation-list">
                  {eligibleForReview.map((reservation) => (
                    <div key={reservation.id} className="reservation-item">
                      <div className="reservation-info">
                        <strong>{reservation.Service?.nom_service}</strong>
                        <span className="reservation-date">
                          {new Date(reservation.date).toLocaleDateString()}
                        </span>
                        <span className="reservation-description">
                          {reservation.Service?.description}
                        </span>
                      </div>
                      <button
                        className="select-reservation-btn"
                        onClick={() => handleReservationSelect(reservation)}
                      >
                        Laisser un avis
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="review-form-container">
                <div className="selected-reservation-info">
                  <p>
                    <strong>Avis pour :</strong>{" "}
                    {selectedReservationForReview.Service?.nom_service}
                  </p>
                  <p>
                    <strong>Date :</strong>{" "}
                    {new Date(
                      selectedReservationForReview.date
                    ).toLocaleDateString()}
                  </p>
                  <button
                    className="cancel-review-btn"
                    onClick={handleCancelReview}
                  >
                    Annuler
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                  <label>Note (1 à 5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <label>Commentaire:</label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Partagez votre expérience..."
                  />
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Soumettre l'avis"}
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <p style={{ fontStyle: "italic", color: "#666" }}>
            Aucune réservation terminée en attente d'avis
          </p>
        )}
      </section>

      <section className="recent-reservations">
        <h3>🕓 Vos 3 dernières prestations</h3>
        <ul>
          {reservations.slice(0, 3).map((r) => (
            <li key={r.id}>
              <strong>{r.Service?.nom_service}</strong> —{" "}
              {new Date(r.date).toLocaleDateString()} –{" "}
              <span className={`status-tag ${r.statut}`}>{r.statut}</span>
              {r.has_review && (
                <span className="badge-reviewed"> ✅ Avis donné</span>
              )}
            </li>
          ))}
        </ul>
      </section>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📜 Historique des commandes</h3>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ❌ Fermer
            </button>
            <ul className="modal-list">
              {reservations.map((r) => (
                <li key={r.id}>
                  <strong>{r.Service?.nom_service}</strong> —{" "}
                  {new Date(r.date).toLocaleDateString()} —{" "}
                  <span className={`status-tag ${r.statut}`}>{r.statut}</span>
                  {r.has_review && (
                    <span className="badge-reviewed"> ✅ Avis donné</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
