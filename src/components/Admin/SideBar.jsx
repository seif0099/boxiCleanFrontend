import React from "react";
import "./sidebar.css";

const Sidebar = ({ onSelect, activeTab }) => {
  const items = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "users", label: "👥 Utilisateurs" },
    { key: "activities", label: "📅 Prestations & Paiements" },
    { key: "plans", label: "💼 Abonnements SaaS" },
    { key: "validation", label: "✅ Validation Prestataires" },
    { key: "stats", label: "📈 Statistiques & Rapports" },
    { key: "rankings", label: "🏆 Rankings Sociétés" },
  ];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">🛠️ Admin</h2>
      <ul className="sidebar-menu">
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`sidebar-item ${activeTab === item.key ? "active" : ""}`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
