import React, { useEffect, useState } from "react";
import "./adminHome.css";

const AdminHome = ({ onSelect }) => {
  const [stats, setStats] = useState({
    users: 0,
    reservations: 0,
    payments: 0,
    abonnements: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement statistiques:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="admin-home-container">
        <div className="admin-header">
          <h2 className="admin-welcome">👋 Bienvenue sur BoxiClean Admin</h2>
          <p className="admin-subtext">
            Gérez les utilisateurs, prestations et abonnements depuis ce panneau
            moderne et intuitif.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              Chargement...
            </p>
          </div>
        ) : (
          <div className="admin-kpis">
            <div className="kpi-card">
              <span className="kpi-icon">🧍</span>
              <h3>Utilisateurs</h3>
              <p>{stats.users}</p>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon">📦</span>
              <h3>Réservations</h3>
              <p>{stats.reservations}</p>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon">💳</span>
              <h3>Paiements</h3>
              <p>{stats.payments} TND</p>
            </div>
            <div className="kpi-card">
              <span className="kpi-icon">🏷️</span>
              <h3>Abonnements</h3>
              <p>{stats.abonnements} actifs</p>
            </div>
          </div>
        )}

        <div className="admin-actions">
          <button className="admin-btn" onClick={() => onSelect("users")}>
            👥 Gérer Utilisateurs
          </button>
          <button className="admin-btn" onClick={() => onSelect("activities")}>
            📋 Voir Prestations
          </button>
          <button className="admin-btn" onClick={() => onSelect("plans")}>
            💼 Gérer Abonnements
          </button>
        </div>
      </div>
    </>
  );
};
export default AdminHome;