import React, { useState } from "react";
import Sidebar from "./SideBar";
import AdminHome from "./AdminHome";
import UserManagement from "./UserManagement/UserManagement";
import ActivitiesSupervision from "./ActivitySupervision/ActivitiesSupervision";
import AbonnementManagement from "./Abonnement/AbonnementManagement";
import StatsReports from "./AdminStats/StatsReport";
import PrestataireValidation from "./PrestataireValidation/PrestataireValidation";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminHome onSelect={setActiveTab} />;
      case "users":
        return <UserManagement />; // ✅ now this works!
      case "activities":
        return <ActivitiesSupervision />;
      case "plans":
        return <AbonnementManagement />;
      case "validation":
        return <PrestataireValidation />;
      case "stats":
        return <StatsReports />;
      case "rankings":
        return <div>🏆 Rankings Coming Soon</div>;
      default:
        return <div>Welcome, Admin!</div>;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar onSelect={setActiveTab} activeTab={activeTab} />
      <div style={{ flex: 1, padding: "2rem", background: "#f5f6fa" }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
