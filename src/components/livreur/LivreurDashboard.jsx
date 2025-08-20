import React, { useEffect, useState } from "react";
import axios from "axios";
import "./livreurDashboard.css";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import ChatContainerLivreur from "../Chat/ChatContainerLivreur"; // Updated import

const LivreurDashboard = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filtre, setFiltre] = useState("toutes");
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatCustomerId, setChatCustomerId] = useState(null);
  const [chatCustomerName, setChatCustomerName] = useState("");
  const [chatLivraisonId, setChatLivraisonId] = useState(null);

  useEffect(() => {
    fetchLivraisons();
    fetchStats();
  }, []);

  const fetchLivraisons = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/livreur/mes-livraisons",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLivraisons(res.data);
    } catch (err) {
      console.error("Erreur chargement livraisons:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/livreur/statistiques",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStats(res.data);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/livreur/${id}/statut`,
        { statut: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchLivraisons();
      fetchStats();
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
    }
  };

  const openChat = (livraison) => {
    setChatCustomerId(livraison.commande.client.id);
    setChatCustomerName(livraison.commande.client.fullName);
    setChatLivraisonId(livraison.id);
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setChatCustomerId(null);
    setChatCustomerName("");
    setChatLivraisonId(null);
  };

  return (
    <div className="livreur-dashboard">
      <div className="top-bar">
        <button
          className="profile-button"
          onClick={() => navigate("/livreur-profile")}
        >
          <FaUserCircle size={24} style={{ marginRight: "0.5rem" }} />
          Mon Profil
        </button>
      </div>

      <h1>🚚 Tableau de Bord Livreur</h1>

      <div className="filtre-box">
        <label>Filtrer par statut :</label>
        <select value={filtre} onChange={(e) => setFiltre(e.target.value)}>
          <option value="toutes">Toutes</option>
          <option value="en_cours">En cours</option>
          <option value="livree">Livrées</option>
          <option value="annulee">Annulées</option>
        </select>
      </div>

      {stats && (
        <div className="stats-box">
          <div>
            📦 Total : <strong>{stats.total}</strong>
          </div>
          <div>
            ✅ Livrées : <strong>{stats.livrees}</strong>
          </div>
          <div>
            🗓️ Cette semaine : <strong>{stats.week}</strong>
          </div>
          <div>
            📅 Aujourd'hui : <strong>{stats.today}</strong>
          </div>
        </div>
      )}

      {loading ? (
        <p>Chargement des livraisons...</p>
      ) : livraisons.length === 0 ? (
        <p>Aucune livraison assignée pour le moment.</p>
      ) : (
        <div className="delivery-list">
          {livraisons
            .filter((liv) => filtre === "toutes" || liv.statut === filtre)
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((livraison) => (
              <div key={livraison.id} className="delivery-card">
                <h3>Commande #{livraison.commande_id}</h3>
                <p>
                  <strong>Client :</strong>{" "}
                  {livraison.commande?.client?.fullName}
                </p>
                <p>
                  <strong>Adresse :</strong> {livraison.adresse_livraison}
                </p>
                <p>
                  <strong>Statut :</strong> {livraison.statut}
                </p>

                <div className="actions">
                  <button
                    onClick={() => updateStatus(livraison.id, "en_cours")}
                  >
                    En cours
                  </button>
                  <button onClick={() => updateStatus(livraison.id, "livree")}>
                    Livrée
                  </button>
                  <button onClick={() => setSelectedLivraison(livraison)}>
                    Voir détails
                  </button>
                  <button
                    onClick={() => openChat(livraison)}
                    className="chat-button"
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedLivraison && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedLivraison(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Détails Livraison #{selectedLivraison.id}</h2>
            <p>
              <strong>Client :</strong>{" "}
              {selectedLivraison.commande?.client?.fullName}
            </p>
            <p>
              <strong>Email :</strong>{" "}
              {selectedLivraison.commande?.client?.email}
            </p>
            <p>
              <strong>Adresse :</strong> {selectedLivraison.adresse_livraison}
            </p>
            <p>
              <strong>Statut :</strong> {selectedLivraison.statut}
            </p>
            <p>
              <strong>Date :</strong>{" "}
              {new Date(selectedLivraison.createdAt).toLocaleString()}
            </p>
            <button onClick={() => setSelectedLivraison(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && chatCustomerId && (
        <div className="chat-modal-overlay" onClick={closeChat}>
          <div
            className="chat-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-header-modal">
              <h3>💬 Chat avec {chatCustomerName}</h3>
              <button className="close-chat" onClick={closeChat}>
                ×
              </button>
            </div>
            <ChatContainerLivreur
              customerId={chatCustomerId}
              customerName={chatCustomerName}
              livraisonId={chatLivraisonId}
            />
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        {Array.from({
          length: Math.ceil(
            livraisons.filter(
              (liv) => filtre === "toutes" || liv.statut === filtre
            ).length / itemsPerPage
          ),
        }).map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LivreurDashboard;
