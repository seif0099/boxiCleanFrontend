import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderList.css";

const ROWS_PER_PAGE = 6;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Erreur chargement commandes vendeur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalPages = Math.ceil(orders.length / ROWS_PER_PAGE);
  const indexOfLastRow = currentPage * ROWS_PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - ROWS_PER_PAGE;
  const currentRows = orders.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="order-list-container">
      <h2 className="order-list-title">Commandes Reçues</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : orders.length === 0 ? (
        <p>Aucune commande pour l’instant.</p>
      ) : (
        <>
          <table className="order-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Total (TND)</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.client?.fullName}</td>
                  <td>
                    {order.total
                      ? order.total.toFixed(2)
                      : order.items
                          ?.reduce(
                            (sum, item) =>
                              sum + item.produit.prix * item.quantite,
                            0
                          )
                          .toFixed(2)}
                  </td>
                  <td>{order.statut}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="order-pagination">
            <button
              className={`${
                currentPage === 1 ? "disabled-page" : "inactive-page"
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={
                  currentPage === i + 1 ? "active-page" : "inactive-page"
                }
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className={`${
                currentPage === totalPages ? "disabled-page" : "inactive-page"
              }`}
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

export default OrderList;
