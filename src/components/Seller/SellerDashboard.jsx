import React from "react";
import AddProductForm from "./AddProductForm";
import ProductList from "./ProductList";
import OrderList from "./OrderList";
import StockManager from "./StockManager";
import "./sellerdashboard.css"; // Assuming you have some styles for the dashboard
const SellerDashboard = () => {
  return (
    <div className="seller-dashboard p-6 max-w-6xl mx-auto">

    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Espace Vendeur - BoxiClean Marketplace
      </h1>

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
