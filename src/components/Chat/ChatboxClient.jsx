import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./chatbox.css";

const ChatboxClient = ({ livreurId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [clientId, setClientId] = useState(null);
  const chatEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // Safely extract client ID from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setClientId(parsedUser?.id || null);
      }
    } catch (e) {
      console.error("❌ Failed to load clientId from localStorage:", e);
    }
  }, []);

  // Fetch messages every 5 seconds
  useEffect(() => {
    if (!livreurId || !clientId || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/messages/${livreurId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Erreur chargement messages :", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [livreurId, clientId, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !livreurId) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/messages",
        {
          receiver_id: livreurId,
          message: messageInput.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessageInput("");
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("❌ Erreur envoi message :", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbox w-full max-w-lg mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-4">
      <h4 className="text-xl font-bold mb-2">💬 Chat avec votre livreur</h4>

      <div className="messages h-80 overflow-y-auto p-2 bg-gray-50 rounded">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            Aucun message pour le moment...
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSentByClient =
              String(msg.sender_id).trim() === String(clientId).trim();

            return (
              <div
                key={msg.id || idx}
                className={`message mb-2 p-2 max-w-[75%] rounded-lg ${
                  isSentByClient
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-300 text-black"
                }`}
              >
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {isSentByClient ? "Vous" : msg.sender?.fullName || "Livreur"}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-section mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Votre message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          disabled={!messageInput.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatboxClient;
