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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import "./Style.css";

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

    fetchUsers();
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
      {/* Sidebar with user list */}
      <Box className="sidebar">
        <Box className="sidebar-header">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: "#4f46e5", mr: 1 }}>
              {currentUser?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{currentUser?.name}</Typography>
          </Box>
           <Tooltip title="Sign Out">
        <IconButton onClick={handleOpenDialog} color="error">
          <LogoutIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Sign Out</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button
            onClick={() => {
              handleLogout();
              handleCloseDialog();
            }}
            color="error"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

        </Box>
        
        <Typography variant="subtitle2" sx={{ p: 2, color: "#6b7280" }}>
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
                <Avatar sx={{ bgcolor: "#4f46e5", mr: 2 }}>
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

      {/* Main chat area */}
      <Box className="chat-area">
        {selectedUser ? (
          <>
            <Box className="chat-header">
              <Avatar sx={{ bgcolor: "#4f46e5", mr: 1 }}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{selectedUser.name}</Typography>
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
                      <Typography variant="caption" className="timestamp">
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
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box className="no-chat-selected">
            <Typography variant="h6" color="textSecondary">
              Select a user to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chats;
