import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StockManager.css";

const ROWS_PER_PAGE = 6;

const StockManager = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products for the connected seller
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Erreur chargement stock produits:", err);
    }
  };

  // Update product stock
  const handleUpdateStock = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/seller/products/${productId}`,
        { stock: parseInt(newQuantity) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Quantité mise à jour !");
      setEditingId(null);
      setNewQuantity("");
      fetchProducts(); // refresh
    } catch (err) {
      console.error("Erreur mise à jour stock:", err);
      alert("Échec de la mise à jour.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(products.length / ROWS_PER_PAGE);
  const indexOfLastRow = currentPage * ROWS_PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - ROWS_PER_PAGE;
  const currentRows = products.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="stock-manager-container">
      <h2 className="stock-manager-title">Gestion des Stocks</h2>

      {products.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <>
          <table className="stock-manager-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Stock actuel</th>
                <th>Nouvelle quantité</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((prod) => (
                <tr key={prod.id}>
                  <td>{prod.nom}</td>
                  <td>{prod.stock}</td>
                  <td>
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        className="stock-manager-input"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {editingId === prod.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateStock(prod.id)}
                          className="stock-manager-btn"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setNewQuantity("");
                          }}
                          className="stock-manager-btn-cancel"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(prod.id);
                          setNewQuantity(prod.stock);
                        }}
                        className="stock-manager-btn"
                        style={{ background: "#f59e42" }}
                      >
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              className="stock-manager-btn"
              style={{ marginRight: "0.5rem" }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className="stock-manager-btn"
                style={{
                  margin: "0 0.2rem",
                  background: currentPage === i + 1 ? "#2563eb" : "#e5e7eb",
                  color: currentPage === i + 1 ? "#fff" : "#334155",
                }}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="stock-manager-btn"
              style={{ marginLeft: "0.5rem" }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StockManager;
