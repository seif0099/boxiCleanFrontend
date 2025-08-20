import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ChatContainer.css"; // You can reuse the same CSS

const ChatContainerLivreur = ({ customerId, customerName, livraisonId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");

  // Get current delivery person ID from localStorage
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

  // Fetch messages between delivery person and specific customer
  const fetchMessages = async () => {
    if (!token || !livraisonId) return;

    try {
      console.log("📨 Fetching messages for livraison:", livraisonId);
      const response = await axios.get(
        `http://localhost:5000/messages/livraison/${livraisonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Messages fetched:", response.data.messages?.length || 0);
      setMessages(response.data.messages || []);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setError("Erreur lors du chargement des messages");
      setLoading(false);
    }
  };

  // Send message to customer
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      console.log("📤 Sending message to customer...");
      const response = await axios.post(
        "http://localhost:5000/messages/to-customer",
        {
          message: newMessage.trim(),
          customerId: customerId,
          livraisonId: livraisonId,
        },
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
    if (currentUserId && token && livraisonId) {
      fetchMessages();

      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentUserId, livraisonId, token]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="delivery-info">
          <h2 className="chat-title">💬 Chat avec {customerName}</h2>
          <p className="delivery-person-name">Vous êtes le livreur</p>
        </div>
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
              Commencez la conversation avec votre client!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser =
              String(msg.sender_id) === String(currentUserId);
            const isFromCustomer = String(msg.sender_id) === String(customerId);

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
                      : isFromCustomer
                      ? customerName || "Client"
                      : msg.sender?.fullName || "Utilisateur"}
                  </span>
                  <span className="message-role">
                    {isCurrentUser ? "🚚" : "👤"}
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
          placeholder={`Écrivez à ${customerName || "votre client"}...`}
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="send-button"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatContainerLivreur;
