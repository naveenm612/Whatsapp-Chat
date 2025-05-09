import React, { useState, useEffect, useRef } from "react";
import io  from "socket.io-client";
import "./Style.css";

const socket = io("http://localhost:5000");

const ChatApp: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ type: string; content: string }[]>([]);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket.on("receive_message", (newMessage: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "received", content: newMessage },
      ]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "sent", content: message },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>ChatFlow</h1>
      </div>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.type === "sent" ? "sent" : "received"}`}
          >
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
