import React, { useEffect, useState } from "react";
import "./ProductList.css";

const ROWS_PER_PAGE = 6;

const ProductList = ({ refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/seller/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error("Erreur chargement produits:", res.status);
        }
      } catch (err) {
        console.error("Erreur chargement produits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshTrigger]);

  const closeModal = () => setSelectedProduct(null);

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.style.display = "none";
    const fallbackDiv = e.target.nextElementSibling;
    if (fallbackDiv) fallbackDiv.style.display = "block";
  };

  const getImageUrl = (product) => {
    if (product.image_url) {
      if (
        product.image_url.startsWith("http://") ||
        product.image_url.startsWith("https://") ||
        product.image_url.startsWith("data:image")
      ) {
        return product.image_url;
      }
      return `http://localhost:5000${product.image_url}`;
    }
    return null;
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / ROWS_PER_PAGE);
  const indexOfLastRow = currentPage * ROWS_PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - ROWS_PER_PAGE;
  const currentRows = products.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="product-list-container">
      <h2>Mes Produits</h2>

      {loading ? (
        <p className="product-list-message">Chargement...</p>
      ) : products.length === 0 ? (
        <p className="product-list-message">Aucun produit ajouté.</p>
      ) : (
        <>
          <table className="product-list-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prix (€)</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((prod) => (
                <tr key={prod.id}>
                  <td className="font-medium">{prod.nom}</td>
                  <td>{prod.prix}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.categorie || "N/A"}</td>
                  <td>
                    <button onClick={() => setSelectedProduct(prod)}>
                      Voir plus
                    </button>
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

      {selectedProduct && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <button onClick={closeModal} className="product-modal-close">
              ✕
            </button>
            <h3>{selectedProduct.nom}</h3>

            {getImageUrl(selectedProduct) ? (
              <div className="product-modal-image-wrapper">
                <img
                  src={getImageUrl(selectedProduct)}
                  alt="Product"
                  onError={handleImageError}
                  data-original-url={selectedProduct.image_url}
                />
                <div className="image-fallback">Image non disponible</div>
              </div>
            ) : (
              <div className="product-modal-image-wrapper">
                <span className="image-fallback">Aucune image</span>
              </div>
            )}

            <div className="product-modal-info">
              <p>
                <strong>Description:</strong> {selectedProduct.description}
              </p>
              <p>
                <strong>Prix:</strong> {selectedProduct.prix} €
              </p>
              <p>
                <strong>Stock:</strong> {selectedProduct.stock}
              </p>
              <p>
                <strong>Catégorie:</strong> {selectedProduct.categorie || "N/A"}
              </p>
              <p>
                <strong>Code-barres:</strong>{" "}
                {selectedProduct.code_barres || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
