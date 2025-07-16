import React, { useEffect, useState } from "react";
import axios from "axios";
import "./prestataireValidation.css";

const PrestataireValidation = () => {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Load unvalidated prestataires
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/prestataires/unvalidated")
      .then((res) => {
        setPrestataires(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement prestataires:", err);
        setLoading(false);
      });
  }, []);

  // Handle validation
  const handleValidate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/admin/users/${id}/validate`);
      setPrestataires((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erreur lors de la validation :", err);
      alert("Erreur lors de la validation. Veuillez réessayer.");
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = prestataires.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(prestataires.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="prestataire-validation-container">
      <h2>Validation des Prestataires</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : prestataires.length === 0 ? (
        <p>Aucun prestataire en attente de validation.</p>
      ) : (
        <>
          <table className="prestataire-validation-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((p) => (
                <tr key={p.id}>
                  <td>{p.fullName}</td>
                  <td>{p.email}</td>
                  <td>
                    <button
                      className="validate-btn"
                      onClick={() => handleValidate(p.id)}
                    >
                      Valider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="activities-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${
                  page === currentPage ? "active" : ""
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PrestataireValidation;
