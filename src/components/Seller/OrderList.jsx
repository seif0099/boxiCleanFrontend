import React, { useEffect, useState } from "react";
import axios from "axios";

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

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ROWS_PER_PAGE);
  const indexOfLastRow = currentPage * ROWS_PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - ROWS_PER_PAGE;
  const currentRows = orders.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Commandes Reçues</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : orders.length === 0 ? (
        <p>Aucune commande pour l’instant.</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2">Commande</th>
                <th className="p-2">Client</th>
                <th className="p-2">Total (€)</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-2 font-medium">#{order.id}</td>
                  <td className="p-2">{order.client?.fullName}</td>
                  <td className="p-2">
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
                  <td className="p-2">{order.statut}</td>
                  <td className="p-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              className="px-3 py-1 rounded bg-blue-500 text-white mr-2"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded mx-1 ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={`px-3 py-1 rounded mx-1 border shadow ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
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
