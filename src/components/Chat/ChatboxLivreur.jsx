import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ImprovedChatbox = ({ receiverId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [actualCurrentUserId, setActualCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);

  // Get current user ID from localStorage or props
  useEffect(() => {
    let userId = currentUserId;

    // If currentUserId prop is not provided, get it from localStorage
    if (!userId) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        userId = user?.id;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    // If still no userId, try to extract from JWT token
    if (!userId) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id || payload.userId || payload.user_id;
        }
      } catch (error) {
        console.error("Error parsing JWT token:", error);
      }
    }

    setActualCurrentUserId(userId);
    setIsLoading(false);
  }, [currentUserId]);

  const fetchMessages = async () => {
    if (!receiverId || !actualCurrentUserId) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/messages/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Sort messages by creation date to ensure proper order
      const sortedMessages = res.data.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages(sortedMessages);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !receiverId) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/messages",
        {
          receiver_id: receiverId,
          message: newMsg.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNewMsg("");

      // Wait a bit before fetching to ensure the message is saved
      setTimeout(() => {
        fetchMessages();
      }, 200);
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    if (!receiverId || !actualCurrentUserId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverId, actualCurrentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading state
  if (isLoading || !actualCurrentUserId) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-center mb-4">
        💬 Chat avec votre livreur
      </h2>

      <div className="h-80 overflow-y-auto p-3 bg-gray-50 rounded border space-y-3">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>Aucun message pour le moment...</p>
            <p className="text-sm mt-1">Commencez la conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isFromCurrentUser = msg.sender_id === actualCurrentUserId;

            return (
              <div
                key={msg.id || index}
                className={`flex ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                    isFromCurrentUser
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <div className="text-sm leading-relaxed break-words">
                    {msg.message}
                  </div>

                  <div
                    className={`text-xs mt-2 flex items-center justify-between ${
                      isFromCurrentUser ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span>
                      {isFromCurrentUser
                        ? "Vous"
                        : msg.sender?.fullName || "Livreur"}
                    </span>
                    <span className="ml-2">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "now"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={sendMessage}
          disabled={!newMsg.trim() || !receiverId}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <span>Envoyer</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImprovedChatbox;
