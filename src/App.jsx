import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import AuthPage from "./components/auth/AuthPage";
import RegisterPage from "./components/auth/RegisterPage";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/landing-page/LandingPage";
import ClientDashboard from "./components/Client/ClientDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import SearchService from "./components/Service/SearchService";
import ServiceDetails from "./components/Service/ServiceDetails";
import Success from "./components/Service/Success";
import FailPayment from "./components/Service/FailPayment";
import PrestataireDashboard from "./components/prestataire/PrestataireDashboard";
import Abonnement from "./components/prestataire/abonnement/Abonnement";
import SuccessPage from "./components/prestataire/SuccessPage";
import CancelPage from "./components/prestataire/CancelPage";
import SellerDashboard from "./components/Seller/SellerDashboard";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<SearchService />} />
        <Route path="/service/:id" element={<ServiceDetails />} />
        <Route path="/reservation-success" element={<Success />} />
        <Route path="/reservation-cancel" element={<FailPayment />} />

        <Route path="/abonnement-success" element={<SuccessPage />} />
        <Route path="/abonnement-cancel" element={<CancelPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/abonnement" element={<Abonnement />} />

        <Route
          path="/prestataire-dashboard"
          element={<PrestataireDashboard />}
        />
        <Route path="/vendeur-dashboard" element={<SellerDashboard />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>{" "}
    </div>
  );
}

export default App;
