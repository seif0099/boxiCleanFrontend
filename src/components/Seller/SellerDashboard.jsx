import React from "react";
import AddProductForm from "./AddProductForm";
import ProductList from "./ProductList";
import OrderList from "./OrderList";
import StockManager from "./StockManager";
import { useNavigate } from "react-router-dom";
import "./sellerdashboard.css";

const SellerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        localStorage.removeItem("token");
        navigate("/"); // Or "/login"
      } else {
        console.error("Erreur lors de la déconnexion");
      }
    } catch (err) {
      console.error("Erreur réseau lors de la déconnexion", err);
    }
  };

  return (
    <div className="seller-dashboard p-6 max-w-6xl mx-auto">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">
            Espace Vendeur - BoxiClean Marketplace
          </h1>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Déconnexion
          </button>
        </div>

        <section className="mb-10">
          <AddProductForm />
        </section>

        <section className="mb-10">
          <ProductList />
        </section>

        <section className="mb-10">
          <StockManager />
        </section>

        <section className="mb-10">
          <OrderList />
        </section>
      </div>
    </div>
  );
};

export default SellerDashboard;
