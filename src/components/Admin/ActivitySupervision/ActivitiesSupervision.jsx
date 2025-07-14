import React, { useEffect, useState } from "react";
import axios from "axios";
import "./activities.css";

const ActivitiesSupervision = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 10;

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/reservations");
        setReservations(res.data);
        setFilteredReservations(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Apply filter
  useEffect(() => {
    if (paymentFilter === "all") {
      setFilteredReservations(reservations);
    } else {
      const filtered = reservations.filter(
        (r) => r.mode_paiement === paymentFilter
      );
      setFilteredReservations(filtered);
    }
    setCurrentPage(1); // reset to first page when filter changes
  }, [paymentFilter, reservations]);

  const getPaymentMethods = () => {
    return [
      ...new Set(reservations.map((r) => r.mode_paiement).filter(Boolean)),
    ];
  };

  // Pagination logic
  const indexOfLast = currentPage * reservationsPerPage;
  const indexOfFirst = indexOfLast - reservationsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredReservations.length / reservationsPerPage
  );

  return (
    <div className="activities-container">
      <h2>📅 Supervision des Prestations & Paiements</h2>

      <div className="filter-section">
        <label htmlFor="payment-filter">🏦 Filtrer par mode de paiement:</label>
        <select
          id="payment-filter"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="payment-filter"
        >
          <option value="all">Tous les modes de paiement</option>
          {getPaymentMethods().map((method, idx) => (
            <option key={idx} value={method}>
              {method}
            </option>
          ))}
        </select>
        <span className="filter-count">
          ({filteredReservations.length} résultat
          {filteredReservations.length !== 1 ? "s" : ""})
        </span>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <table className="activities-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Client</th>
                <th>Prestataire</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Mode Paiement</th>
                <th>Prix (TND)</th>
              </tr>
            </thead>
            <tbody>
              {currentReservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    Aucune réservation trouvée pour ce filtre
                  </td>
                </tr>
              ) : (
                currentReservations.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.Service?.nom_service || "N/A"}</td>
                    <td>{r.Client?.fullName || "N/A"}</td>
                    <td>{r.PrestataireUser?.fullName || "N/A"}</td>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td className={`statut ${r.statut}`}>{r.statut}</td>
                    <td>{r.mode_paiement || "N/A"}</td>
                    <td>{r.Service?.prix_base || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="activities-pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-btn ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivitiesSupervision;
