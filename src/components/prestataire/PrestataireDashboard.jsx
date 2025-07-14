import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import ServiceModal from "./service/ServiceModal";
import ReservationModal from "./reservation/ReservationModal";
import PlageHoraireModal from "./plageHoraire/PlageHoraireModal";
import CalendarView from "./calendrier/CalendarView";
import AvisModal from "./avis/AvisModal";
import ClassementPrestataires from "./classment/ClassementPrestataire";

const PrestataireDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [abonnement, setAbonnement] = useState(null);
  const [services, setServices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPlageModal, setShowPlageModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [showAvisModal, setShowAvisModal] = useState(false);
  const [avis, setAvis] = useState([]);

  const token = localStorage.getItem("token");

  // Helper function to parse JWT token
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  // Function to get payment mode display
  // Function to get payment mode display
  const getPaymentModeDisplay = (paiement) => {
    const mode = paiement.mode_paiement || paiement.payment_mode;
    switch (mode) {
      case "stripe":
      case "online":
      case "en_ligne": // ✅ Add this case
        return { text: "En ligne (Stripe)", icon: "💳", class: "online" };
      case "cash":
      case "especes":
      case "a_la_livraison": // ✅ Add this case if you use it
        return { text: "À la livraison", icon: "🚚", class: "cash" };
      case "bank_transfer":
      case "virement":
        return { text: "Virement", icon: "🏦", class: "transfer" };
      default:
        return { text: "Non spécifié", icon: "❓", class: "unknown" };
    }
  };
  // Function to get status display
  const getStatusDisplay = (statut) => {
    switch (statut) {
      case "completed":
      case "complete":
      case "payé":
        return { text: "Payé", class: "completed" };
      case "pending":
      case "en_attente":
        return { text: "En attente", class: "pending" };
      case "failed":
      case "echoue":
        return { text: "Échec", class: "failed" };
      case "cancelled":
      case "annule":
        return { text: "Annulé", class: "cancelled" };
      default:
        return { text: statut, class: "unknown" };
    }
  };
  const downloadPdfReport = async (type) => {
    try {
      const userId = parseJwt(token).id;
      console.log("🔍 ID used for export:", parseJwt(token).id);

      const url = `http://localhost:5000/prestataires/prestataire/${userId}/export-pdf?type=${type}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Échec du téléchargement");

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `rapport-${type}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur export PDF:", err);
      alert("Impossible de générer le rapport PDF.");
    }
  };

  const fetchAvis = async () => {
    try {
      const response = await fetch("http://localhost:5000/avis/prestataire", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAvis(data);
        setShowAvisModal(true);
      } else {
        console.error("Erreur chargement des avis");
      }
    } catch (err) {
      console.error("Erreur réseau", err);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // Abonnement
      const abonnementResponse = await fetch(
        "http://localhost:5000/abonnements/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (abonnementResponse.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const abonnementData = await abonnementResponse.json();
      setAbonnement(abonnementData);

      if (!abonnementData || abonnementData.statut !== "actif") {
        navigate("/abonnement");
        return;
      }

      // Services: Fetch all, then filter by prestataire_id
      const servicesResponse = await fetch("http://localhost:5000/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const userId = parseJwt(token).id;
        const myServices = servicesData.filter(
          (s) => s.prestataire_id === userId
        );
        setServices(myServices);
      }

      // Reservations
      const reservationsResponse = await fetch(
        "http://localhost:5000/reservations/prestataire",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);

        // Derive payments from reservations
        const paiementsFromReservations = reservationsData
          .filter((r) => r.statut === "confirmée")
          .map((reservation) => ({
            id: reservation.id,
            date: reservation.date,
            montant: reservation.Service ? reservation.Service.prix_base : 0,
            client_nom: reservation.Client
              ? reservation.Client.fullName
              : "Client inconnu",
            reservation_id: reservation.id,
            mode_paiement: reservation.mode_paiement || null, // ✅ Get real value
            payment_mode:
              reservation.payment_mode || reservation.mode_paiement || null, // ✅ Get fallback
            statut: "payé",
          }));

        setPaiements(paiementsFromReservations);
      }

      // Remove the separate paiements fetch completely
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Update reservation status
  const updateReservationStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/reservations/${id}/statut`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statut: newStatus }),
        }
      );

      if (response.ok) {
        fetchUserData(); // refresh
      } else {
        console.error("Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal for creation
  const handleAddService = () => {
    setEditingService(null);
    setShowModal(true);
  };

  // Open modal for edit
  const handleEditService = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  // Save service logic
  const handleSaveService = async (formData, id) => {
    const url = id
      ? `http://localhost:5000/services/${id}`
      : "http://localhost:5000/services";
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        fetchUserData(); // refresh dashboard
      } else {
        alert(data.message || "Erreur");
      }
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement?"))
      return;

    try {
      const response = await fetch("http://localhost:5000/abonnements/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Abonnement annulé avec succès");
        navigate("/abonnement");
      } else {
        const data = await response.json();
        alert(data.message || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Erreur lors de l'annulation");
    }
  };

  // Effect hook
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <h2>Chargement de votre dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchUserData}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🏢 Bienvenue sur votre espace prestataire</h1>
        <div className="user-info">
          <span>Connecté</span>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Déconnexion
          </button>
        </div>
        <button className="avis-btn" onClick={fetchAvis}>
          📝 Voir les avis clients
        </button>
      </header>

      <div className="dashboard-content">
        {/* Abonnement */}
        <section className="subscription-section">
          <h3>💳 Votre abonnement</h3>
          {abonnement ? (
            <div className="subscription-card">
              <div className="subscription-info">
                <p>
                  <strong>Type:</strong> {abonnement.type_abonnement}
                </p>
                <p>
                  <strong>Statut:</strong>{" "}
                  <span className={`status ${abonnement.statut}`}>
                    {abonnement.statut === "actif"
                      ? "✅ Actif"
                      : abonnement.statut}
                  </span>
                </p>
                <p>
                  <strong>Expire le:</strong> {formatDate(abonnement.date_fin)}
                </p>
                <p>
                  <strong>Montant:</strong> {abonnement.montant} TND
                </p>
              </div>
              <button
                className="cancel-subscription-btn"
                onClick={handleCancelSubscription}
              >
                Annuler l'abonnement
              </button>
            </div>
          ) : (
            <p>Aucun abonnement actif</p>
          )}
        </section>
        <ClassementPrestataires />

        {/* Services */}
        <section className="services-section">
          <div className="section-header">
            <h3>📦 Vos services</h3>
            <button className="add-btn" onClick={handleAddService}>
              ➕ Ajouter un service
            </button>
          </div>

          {services.length > 0 ? (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card">
                  <h4>{service.nom_service}</h4>
                  <p className="price">{service.prix_base} TND</p>
                  <p className="description">{service.description}</p>
                  <div className="service-actions">
                    <button onClick={() => handleEditService(service)}>
                      ✏️ Modifier
                    </button>
                    <button
                      style={{ marginTop: "0.5rem" }}
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setShowPlageModal(true);
                      }}
                    >
                      📅 Plages horaires
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Vous n'avez pas encore créé de services</p>
              <button
                className="create-first-service-btn"
                onClick={handleAddService}
              >
                Créer votre premier service
              </button>
            </div>
          )}
        </section>

        {/* Prestations */}
        <section className="dash-resv-section">
          <h3>📅 Vos prochaines prestations</h3>

          {reservations.length > 0 ? (
            <div className="dash-resv-list">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="dash-resv-card">
                  <div className="dash-resv-date">
                    <strong>{formatDate(reservation.date)}</strong>
                  </div>
                  <div className="dash-resv-info">
                    <p>
                      <strong>Service:</strong>{" "}
                      {reservation.Service?.nom_service || "Service inconnu"}
                    </p>
                    <p>
                      <strong>Client:</strong>{" "}
                      {reservation.Client?.fullName || "Client inconnu"}
                    </p>
                    <p>
                      <strong>Mode de paiement:</strong>{" "}
                      {reservation.mode_paiement}
                    </p>
                    <p>
                      <strong>Statut:</strong>
                      <span
                        className={`dash-resv-status ${reservation.statut}`}
                      >
                        {reservation.statut}
                      </span>
                    </p>
                  </div>
                  <div className="dash-resv-actions">
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowReservationModal(true);
                      }}
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-resv-empty">
              <p>Aucune prestation prévue</p>
            </div>
          )}
        </section>

        {/* Calendar */}
        <section className="calendar-section">
          <h3>🗓️ Calendrier des prestations</h3>
          <CalendarView reservations={reservations} />
        </section>

        {/* Paiements */}
        <section className="paiements-section">
          <h3>💰 Suivi des paiements</h3>
          {paiements.length > 0 ? (
            <div className="paiements-container">
              <table className="paiements-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Client</th>
                    <th>Réservation</th>
                    <th>Mode de paiement</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map((p) => {
                    const paymentMode = getPaymentModeDisplay(p);
                    const status = getStatusDisplay(p.statut);

                    return (
                      <tr key={p.id}>
                        <td>{formatDate(p.date)}</td>
                        <td className="montant">{p.montant} TND</td>
                        <td>{p.client_nom || "Client inconnu"}</td>
                        <td>#{p.reservation_id}</td>
                        <td>
                          <span className={`payment-mode ${paymentMode.class}`}>
                            {paymentMode.icon} {paymentMode.text}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary section */}
              <div className="paiements-summary">
                {/* Summary section */}
                <div className="paiements-summary">
                  {/* Summary section */}
                  <div className="paiements-summary">
                    <div className="summary-card">
                      <h4>Résumé des paiements</h4>
                      <div className="summary-stats">
                        <div className="stat">
                          <span className="stat-label">
                            Total des paiements:
                          </span>
                          <span className="stat-value">
                            {paiements.reduce(
                              (sum, p) => sum + (p.montant || 0),
                              0
                            )}{" "}
                            TND
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">
                            Paiements en ligne:
                          </span>
                          <span className="stat-value">
                            {
                              paiements.filter((p) =>
                                ["stripe", "online", "en_ligne"].includes(
                                  p.mode_paiement || p.payment_mode
                                )
                              ).length
                            }
                            (
                            {paiements
                              .filter((p) =>
                                ["stripe", "online", "en_ligne"].includes(
                                  p.mode_paiement || p.payment_mode
                                )
                              )
                              .reduce(
                                (sum, p) => sum + (p.montant || 0),
                                0
                              )}{" "}
                            TND)
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">
                            Paiements à la livraison:
                          </span>
                          <span className="stat-value">
                            {
                              paiements.filter((p) =>
                                ["cash", "especes", "a_la_livraison"].includes(
                                  p.mode_paiement || p.payment_mode
                                )
                              ).length
                            }
                            (
                            {paiements
                              .filter((p) =>
                                ["cash", "especes", "a_la_livraison"].includes(
                                  p.mode_paiement || p.payment_mode
                                )
                              )
                              .reduce(
                                (sum, p) => sum + (p.montant || 0),
                                0
                              )}{" "}
                            TND)
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Paiements réussis:</span>
                          <span className="stat-value">
                            {
                              paiements.filter((p) =>
                                [
                                  "completed",
                                  "complete",
                                  "payé",
                                  "confirmée",
                                ].includes(p.statut)
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Aucun paiement trouvé</p>
          )}
        </section>
        <section className="pdf-export-section">
          <h3>📄 Exporter les rapports PDF</h3>
          <div className="pdf-buttons">
            <button onClick={() => downloadPdfReport("reservations")}>
              📋 Réservations
            </button>
            <button onClick={() => downloadPdfReport("earnings")}>
              💰 Revenus
            </button>
            <button onClick={() => downloadPdfReport("reviews")}>
              ⭐ Avis
            </button>
          </div>
        </section>

        {/* Statistiques */}
        <section className="stats-section">
          <h3>📊 Statistiques rapides</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Services créés</h4>
              <p className="stat-number">{services.length}</p>
            </div>
            <div className="stat-card">
              <h4>Prestations à venir</h4>
              <p className="stat-number">{reservations.length}</p>
            </div>
            <div className="stat-card">
              <h4>Abonnement</h4>
              <p className="stat-number">
                {abonnement?.type_abonnement || "Aucun"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <ServiceModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveService}
        serviceToEdit={editingService}
      />

      <ReservationModal
        show={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        reservation={selectedReservation}
        onMarkComplete={updateReservationStatus}
      />

      <PlageHoraireModal
        show={showPlageModal}
        onClose={() => setShowPlageModal(false)}
        serviceId={selectedServiceId}
        token={token}
      />
      <AvisModal
        show={showAvisModal}
        onClose={() => setShowAvisModal(false)}
        avis={avis}
      />
     
    </div>
  );
};

export default PrestataireDashboard;
