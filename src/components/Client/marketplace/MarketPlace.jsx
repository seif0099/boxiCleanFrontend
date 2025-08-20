import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Marketplace.css";
import DeliveryTracking from "./DeliveryTracking";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("en_ligne");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeliveryTracking, setShowDeliveryTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/all-products");
      setProducts(res.data);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/panier/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCartItems(res.data);
    } catch (err) {
      console.error("Erreur chargement panier:", err);
    }
  };

  const addToCart = async (produit_id) => {
    try {
      await axios.post(
        "http://localhost:5000/panier/cart",
        { produit_id, quantite: 1 },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Erreur ajout panier:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/panier/cart/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchCart();
    } catch (err) {
      console.error("Erreur suppression panier:", err);
    }
  };

  const getProductQuantity = (produit_id) => {
    const item = cartItems.find((el) => el.produit_id === produit_id);
    return item ? item.quantite : 0;
  };

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => {
      const price = item.Produit?.prix || 0;
      return sum + item.quantite * price;
    }, 0);

  const toggleCart = () => setIsCartOpen((v) => !v);
  const toggleMarketplace = () => setShowMarketplace((prev) => !prev);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("Votre panier est vide.");
    if (!deliveryAddress.trim())
      return alert("Veuillez entrer une adresse de livraison.");

    try {
      const res = await axios.post(
        "http://localhost:5000/commande/stripe-checkout",
        { method: paymentMethod, adresse_livraison: deliveryAddress.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data?.url && paymentMethod === "en_ligne") {
        window.location.href = res.data.url;
      } else {
        const confirmedCommande = res.data.commandes?.[0];
        if (confirmedCommande?.id) {
          alert(
            `✅ Commande confirmée ! Numéro de commande: ${confirmedCommande.id}`
          );
          window.open(
            `http://localhost:5000/commande/${confirmedCommande.id}/facture`,
            "_blank"
          );
        } else {
          alert("✅ Commande confirmée !");
        }
        setCartItems([]);
        setIsCartOpen(false);
        setShowMarketplace(false);
        setDeliveryAddress("");
      }
    } catch (err) {
      console.error("❌ Erreur lors du paiement:", err);
      alert(
        err.response?.data?.message
          ? `❌ Erreur: ${err.response.data.message}`
          : "❌ Une erreur est survenue pendant le paiement."
      );
    }
  };

  const handleTrackDelivery = () => {
    if (!trackingOrderId.trim())
      return alert("Veuillez entrer un numéro de commande.");
    setShowDeliveryTracking(true);
  };

  const closeDeliveryTracking = () => {
    setShowDeliveryTracking(false);
    setTrackingOrderId("");
  };

  // Pagination
  const itemsPerPage = 6;
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="marketplace-container">
      <div className="welcome-section">
        <h1 className="main-title">Bienvenue sur BoxiClean Marketplace</h1>
        <p className="subtitle">
          Découvrez nos produits et ajoutez-les à votre panier !
        </p>

        <div className="action-buttons">
          <button
            onClick={toggleMarketplace}
            className="toggle-marketplace-btn"
          >
            {showMarketplace
              ? "❌ Fermer la boutique"
              : "🛍️ Parcourir les produits"}
          </button>

          <button
            onClick={() => setShowDeliveryTracking(!showDeliveryTracking)}
            className="delivery-tracking-btn"
          >
            📦 Suivre ma livraison
          </button>
        </div>
      </div>

      {/* Delivery Tracking Section */}
      {showDeliveryTracking && (
        <div className="delivery-tracking-section">
          <div className="tracking-header">
            <h2>📦 Suivi de Livraison</h2>
            <button
              onClick={closeDeliveryTracking}
              className="close-tracking-btn"
            >
              ✖
            </button>
          </div>

          <div className="tracking-input-section">
            <label htmlFor="orderIdInput" className="tracking-label">
              Numéro de commande :
            </label>
            <div className="tracking-input-group">
              <input
                id="orderIdInput"
                type="text"
                placeholder="Entrez votre numéro de commande"
                value={trackingOrderId}
                onChange={(e) => setTrackingOrderId(e.target.value)}
                className="tracking-input"
              />
              <button onClick={handleTrackDelivery} className="track-btn">
                🔍 Suivre
              </button>
            </div>
          </div>

          {trackingOrderId && <DeliveryTracking commandeId={trackingOrderId} />}
        </div>
      )}

      {showMarketplace && (
        <div
          className={`marketplace-wrapper ${
            isCartOpen ? "blurred-background" : ""
          }`}
        >
          <button onClick={toggleCart} className="cart-toggle-btn">
            🛒 Voir le Panier ({cartItems.length})
          </button>

          <h2 className="products-title">Nos Produits</h2>

          <div className="products-grid">
            {currentProducts.map((product) => {
              const quantity = getProductQuantity(product.id);
              return (
                <div key={product.id} className="product-card">
                  <img
                    src={`http://localhost:5000${product.image_url}`}
                    alt={product.nom}
                    className="product-image"
                  />
                  <h3 className="product-name">{product.nom}</h3>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">{product.prix} TND</p>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="add-to-cart-btn"
                  >
                    Ajouter au panier {quantity > 0 && `(x${quantity})`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`pagination-btn ${
                  currentPage === i + 1 ? "active" : ""
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cart Drawer — keep mounted, toggle class for slide-in */}
      <aside
        className={`cart-drawer ${isCartOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
      >
        <div className="cart-header">
          <h2>🧺 Mon Panier</h2>
          <button onClick={toggleCart} className="close-btn">
            ✖
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Votre panier est vide.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-name-wrapper">
                  <span className="item-name">
                    {item.Produit?.nom || "Produit"}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
                <span className="item-quantity">x{item.quantite}</span>
                <span className="item-price">{item.Produit?.prix} TND</span>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="cart-total">Total : {calculateTotal()} TND</div>

            <div className="delivery-address-section">
              <label htmlFor="deliveryAddress" className="address-label">
                📍 Adresse de livraison :
              </label>
              <textarea
                id="deliveryAddress"
                placeholder="Entrez votre adresse complète de livraison..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="delivery-address-input"
                rows="3"
                required
              />
            </div>

            <div className="payment-method-section">
              <label htmlFor="paymentMethod" className="payment-label">
                Méthode de paiement :
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="payment-select"
              >
                <option value="en_ligne">💳 Paiement en ligne</option>
                <option value="a_la_livraison">
                  💵 Paiement à la livraison
                </option>
              </select>
            </div>

            <button
              onClick={handleCheckout}
              className="checkout-btn"
              disabled={!deliveryAddress.trim()}
            >
              ✅ Confirmer et Payer
            </button>
          </>
        )}
      </aside>

      {/* Backdrop */}
      {isCartOpen && <div className="cart-overlay" onClick={toggleCart} />}
    </div>
  );
};

export default Marketplace;
