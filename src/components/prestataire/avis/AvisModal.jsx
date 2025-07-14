import React from "react";
import "./avisModal.css"; // Make sure this CSS exists

const AvisModal = ({ show, onClose, avis }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2>📝 Avis et commentaires des clients</h2>
        <button className="close-btn" onClick={onClose}>
          Fermer
        </button>
        {avis.length > 0 ? (
          <ul className="avis-list">
            {avis.map((a) => (
              <li key={a.id} className="avis-item">
                <div className="avis-header">
                  <strong>{a.clientAvis?.fullName || "Client anonyme"}</strong>
                  <span className="note">⭐ {a.note}/5</span>
                </div>
                <p className="commentaire">"{a.commentaire}"</p>
                <small>
                  {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun avis pour l’instant.</p>
        )}
      </div>
    </div>
  );
};

export default AvisModal;
