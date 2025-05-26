import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import {
  Avatar,
  Typography,
  Box,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./Style.css";
import DialogBox from "../dialogBox";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Message {
  sender: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (!userInfo) {
      navigate("/");
      return;
    }

    const user = JSON.parse(userInfo);
    setCurrentUser(user);

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    newSocket.emit("user_connected", user);

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/chat/users");
        setUsers(response.data.filter((user: User) => user._id !== currentUser?._id));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Handle window resize to toggle sidebar on large/small screens
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowSidebar(true);
      } else if (!selectedUser) {
        setShowSidebar(true); // If no chat selected, show sidebar on small screen
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedUser]);

  const fetchChatHistory = async (userId: string, recipientId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/history/${userId}/${recipientId}`
      );
      const formattedMessages = response.data.map((msg: any) => ({
        sender: msg.sender.name,
        senderId: msg.sender._id,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socket && currentUser && selectedUser) {
      const newMessage = {
        sender: currentUser.name,
        senderId: currentUser._id,
        content: message,
        timestamp: new Date(),
      };

      socket.emit("send_message", { message: newMessage, recipient: selectedUser._id });
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    fetchChatHistory(currentUser!._id, user._id);
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Box className="chat-app-container">
      <Box className={`sidebar ${showSidebar ? "show" : ""}`}>
        <Box className="sidebar-header">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: "#1976d2", mr: 1 }}>
              {currentUser?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{currentUser?.name}</Typography>
          </Box>
          <Tooltip title="Sign Out">
            <IconButton onClick={handleOpenDialog} color="error">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          <DialogBox
            open={openDialog}
            onClose={handleCloseDialog}
            onConfirm={() => {
              handleLogout();
              handleCloseDialog();
            }}
          />
        </Box>
        <Typography variant="subtitle2" sx={{ p: 2, color: "#ffffff" }}>
          Active Users
        </Typography>

        <Box className="user-list">
          {users.length > 0 ? (
            users.map((user) => (
              <Box
                key={user._id}
                className={`user-item ${selectedUser?._id === user._id ? "selected" : ""}`}
                onClick={() => selectUser(user)}
              >
                <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography>{user.name}</Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ p: 2, color: "#6b7280", fontSize: "0.9rem" }}>
              No users online at the moment.
            </Typography>
          )}
        </Box>
      </Box>

      <Box className={`chat-area ${showSidebar ? "hide" : ""}`}>
        <Box className="chat-header">
          <IconButton onClick={() => setShowSidebar(true)} sx={{ display: { xs: "inline-flex", md: "none" } }}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "#1976d2", mr: 1 }}>
            {selectedUser?.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6">{selectedUser?.name}</Typography>
        </Box>

        <Box className="chat-messages" ref={chatWindowRef}>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <Box
                key={index}
                className={`message ${msg.senderId === currentUser?._id ? "sent" : "received"}`}
              >
                <Box className="message-content">
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" 
                  // className="timestamp"
                   className={`timestamp ${msg.senderId === currentUser?._id ? "sent-time" : "received-time"}`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Box className="empty-chat">
              <Typography variant="body2" color="textSecondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          )}
        </Box>

        <Box className="chat-input">
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={!message.trim()}
          >
            <SendIcon sx={{ color: "#1976d2" }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Chats;
