import React from "react";
import "./reservationModal.css";

const ReservationModal = ({ show, onClose, reservation, onMarkComplete }) => {
  if (!show || !reservation) return null;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("fr-FR");

  // Helper function to check if reservation can be marked as complete
  const canMarkComplete = (status) => {
    if (!status) return false;

    const normalizedStatus = status.trim().toLowerCase();
    return (
      normalizedStatus === "confirmée" ||
      normalizedStatus === "confirmee" ||
      normalizedStatus === "confirmed" ||
      normalizedStatus === "confirmé"||
       normalizedStatus === "en_attente" ||  // Ajout de ce statut
    normalizedStatus === "en attente" 
    );
  };

  return (
    <div className="cmd-modal-overlay" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Détails de la prestation</h2>
        <div className="cmd-full-width">
          <p>
            <strong>Date:</strong> {formatDate(reservation.date)}
          </p>
          <p>
            <strong>Service:</strong>{" "}
            {reservation.Service?.nom_service || "Non défini"}
          </p>
          <p>
            <strong>Client:</strong>{" "}
            {reservation.Client?.fullName || "Non défini"}
          </p>
          <p>
            <strong>Email:</strong> {reservation.Client?.email || "Non défini"}
          </p>
          <p>
            <strong>Statut:</strong>{" "}
            <span className={`cmd-status ${reservation.statut}`}>
              {reservation.statut}
            </span>
          </p>
          <p>
            <strong>Adresse:</strong>{" "}
            {reservation?.Service?.ville || "Non définie"}
          </p>
        </div>

        <div className="cmd-modal-footer">
          <button className="cmd-close-btn" onClick={onClose}>
            Fermer
          </button>

          {canMarkComplete(reservation.statut) && (
            <button
              className="cmd-complete-btn"
              onClick={() => {
                onMarkComplete(reservation.id, "terminee");
                onClose();
              }}
            >
              ✅ Marquer comme terminée
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
