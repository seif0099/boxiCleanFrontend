import React, { useEffect, useState } from "react";
import "./abonnementmanagement.css";

const AbonnementManagement = () => {
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const abonnementsPerPage = 10;

  useEffect(() => {
    fetch("http://localhost:5000/admin/abonnements")
      .then((res) => res.json())
      .then((data) => {
        setAbonnements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement abonnements:", err);
        setLoading(false);
      });
  }, []);

  // Filtered abonnements
  const filteredAbonnements =
    filter === "all"
      ? abonnements
      : abonnements.filter((a) => a.type_abonnement === filter);

  const totalPages = Math.ceil(filteredAbonnements.length / abonnementsPerPage);
  const indexOfLast = currentPage * abonnementsPerPage;
  const indexOfFirst = indexOfLast - abonnementsPerPage;
  const currentAbonnements = filteredAbonnements.slice(
    indexOfFirst,
    indexOfLast
  );

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  useEffect(() => {
    setCurrentPage(1); // reset to first page when filter changes
  }, [filter]);

  return (
    <div className="abonnement-mgmt-container">
      <h2>💼 Gestion des Abonnements SaaS</h2>

      <div className="abonnement-mgmt-filter">
        <label htmlFor="type-filter">Filtrer par formule :</label>
        <select
          id="type-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Toutes</option>
          <option value="mensuel">Mensuel</option>
          <option value="annuel">Annuel</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredAbonnements.length === 0 ? (
        <p>Aucun abonnement trouvé.</p>
      ) : (
        <>
          <table className="abonnement-mgmt-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Formule</th>
                <th>Montant</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {currentAbonnements.map((a) => (
                <tr key={a.id}>
                  <td>{a.utilisateur?.fullName || "—"}</td>
                  <td>{a.utilisateur?.email || "—"}</td>
                  <td>{a.type_abonnement}</td>
                  <td>{a.montant} TND</td>
                  <td>{a.date_debut}</td>
                  <td>{a.date_fin}</td>
                  <td>{a.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="abonnement-mgmt-pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-btn ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(i + 1)}
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

export default AbonnementManagement;
