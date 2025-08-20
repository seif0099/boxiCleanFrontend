import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ChatContainer.css";

const ChatContainer = ({ mode = "delivery" }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [livraison, setLivraison] = useState(null);
  const [hasDeliveryPerson, setHasDeliveryPerson] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");

  // Get current user ID from token or localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      setCurrentUserId(user.id);
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
      } catch (err) {
        console.error("Erreur décodage token", err);
      }
    }
  }, [token]);

  // Check if user has an assigned delivery person
  const checkDeliveryPerson = async () => {
    if (!token) {
      setError("Token manquant");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Checking for assigned delivery person...");
      const response = await axios.get(
        "http://localhost:5000/messages/my-delivery-person",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Delivery person check result:", response.data);

      if (response.data.hasDeliveryPerson) {
        setHasDeliveryPerson(true);
        setDeliveryPerson(response.data.deliveryPerson);
        setLivraison(response.data.livraison);
        setError("");
        // Load messages after confirming delivery person exists
        fetchDeliveryMessages();
      } else {
        setHasDeliveryPerson(false);
        setError("Aucune livraison active trouvée");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Error checking delivery person:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la vérification du livreur"
      );
      setLoading(false);
    }
  };

  // Fetch messages with assigned delivery person
  const fetchDeliveryMessages = async () => {
    if (!token) return;

    try {
      console.log("📨 Fetching delivery chat messages...");
      const response = await axios.get(
        "http://localhost:5000/messages/delivery-chat",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Messages fetched:", response.data.messages?.length || 0);

      setMessages(response.data.messages || []);

      // Update delivery person info if not already set
      if (!deliveryPerson && response.data.deliveryPerson) {
        setDeliveryPerson(response.data.deliveryPerson);
      }

      if (!livraison && response.data.livraison) {
        setLivraison(response.data.livraison);
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching delivery messages:", err);
      setError("Erreur lors du chargement des messages");
      setLoading(false);
    }
  };

  // Send message to assigned delivery person
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      console.log("📤 Sending message to delivery person...");
      const response = await axios.post(
        "http://localhost:5000/messages/to-delivery-person",
        { message: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Message sent successfully");

      // Add the sent message to the messages array
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      setError("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setError(
        err.response?.data?.message || "Erreur lors de l'envoi du message"
      );
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chat and set up polling
  useEffect(() => {
    if (currentUserId && token) {
      checkDeliveryPerson();

      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        if (hasDeliveryPerson) {
          fetchDeliveryMessages();
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentUserId, hasDeliveryPerson]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get status display text and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "en_attente":
        return { text: "En attente", color: "orange" };
      case "en_cours":
        return { text: "En cours", color: "blue" };
      case "livree":
        return { text: "Livrée", color: "green" };
      case "annulee":
        return { text: "Annulée", color: "red" };
      default:
        return { text: status || "Inconnu", color: "gray" };
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Chargement du chat...</p>
        </div>
      </div>
    );
  }

  if (!hasDeliveryPerson) {
    return (
      <div className="chat-container">
        <div className="chat-no-delivery">
          <div className="no-delivery-icon">🚚</div>
          <h3>Aucune livraison active</h3>
          <p>
            Vous pourrez discuter avec votre livreur une fois qu'une commande
            vous sera assignée.
          </p>
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={checkDeliveryPerson} className="retry-button">
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(livraison?.statut);

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="delivery-info">
          <h2 className="chat-title">💬 Chat avec votre livreur</h2>
          {deliveryPerson && (
            <p className="delivery-person-name">{deliveryPerson.fullName}</p>
          )}
        </div>

        {livraison && (
          <div className="delivery-status">
            <span className={`status-badge status-${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            <p className="order-id">Commande #{livraison.commande_id}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="chat-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💭</div>
            <p>Aucun message pour le moment</p>
            <p className="no-messages-subtitle">
              Commencez la conversation avec votre livreur!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser =
              String(msg.sender_id) === String(currentUserId);
            const isFromDeliveryPerson =
              String(msg.sender_id) === String(deliveryPerson?.id);

            return (
              <div
                key={msg.id || index}
                className={`chat-message ${
                  isCurrentUser ? "sent" : "received"
                }`}
              >
                <div className="message-header">
                  <span className="sender-name">
                    {isCurrentUser
                      ? "Vous"
                      : isFromDeliveryPerson
                      ? deliveryPerson?.fullName || "Livreur"
                      : msg.sender?.fullName || "Utilisateur"}
                  </span>
                  <span className="message-role">
                    {isCurrentUser ? "👤" : "🚚"}
                  </span>
                </div>
                <div className="message-content">{msg.message}</div>
                <div className="timestamp">
                  {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input-section">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Écrivez à ${
            deliveryPerson?.fullName || "votre livreur"
          }...`}
          className="chat-input"
          disabled={!hasDeliveryPerson}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || !hasDeliveryPerson}
          className="send-button"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
