import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Box, Typography, useMediaQuery, useTheme, Avatar, Divider, Button, Slide } from "@mui/material";

const socket = io("http://localhost:4000", {
  autoConnect: false // Connect only when component mounts
});
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { conversations as initialConversations, messagesData } from "../utils/mockData";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";

export default function Chat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState(messagesData);
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null);

  // Right sidebar drawer state
  const [profileOpen, setProfileOpen] = useState(false);

  // Initialize Socket.io Connection
  useEffect(() => {
    socket.connect();

    socket.on("receive_message", (messageData) => {
      // If we are the sender, we already added it locally, skip it to avoid duplicates mock logic
      if (messageData.sender !== "Me") {
        setMessages((prev) => [...prev, messageData]);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, []);

  const handleDeleteMessage = (id, type) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setReplyingMessage(null);
  };

  const handleReplyMessage = (msg) => {
    setReplyingMessage(msg);
    setEditingMessage(null);
  };

  const handleSendMessage = (text) => {
    if (editingMessage) {
      setMessages((prev) => prev.map((m) => m.id === editingMessage.id ? { ...m, text, isEdited: true } : m));
      
      if (selectedChat) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id ? { ...c, lastMessage: text, timestamp: "Just now" } : c
          )
        );
      }
      setEditingMessage(null);
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "Me",
      text,
      replyTo: replyingMessage ? replyingMessage : undefined,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
    };
    
    // Add to local UI instantly
    setMessages((prev) => [...prev, newMessage]);
    setReplyingMessage(null);

    // Send to backend via Socket.io
    socket.emit("send_message", { ...newMessage, isOwn: false, sender: "Alice Smith" });

    // Update last message in conversation list
    if (selectedChat) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id
            ? { ...c, lastMessage: text, timestamp: "Just now" }
            : c
        )
      );
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (chat && chat.unread > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
      );
    }
  };

  const showSidebar = !isMobile || (isMobile && !selectedChat);
  const showChatArea = !isMobile || (isMobile && selectedChat);

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {showSidebar && (
        <Sidebar
          conversations={conversations}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
        />
      )}

      {showChatArea && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
          {selectedChat ? (
            <>
              <ChatHeader 
                chat={selectedChat} 
                onBack={() => setSelectedChat(null)} 
                onToggleProfile={() => setProfileOpen(!profileOpen)}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <MessageList 
                messages={messages} 
                searchQuery={searchQuery} 
                onReply={handleReplyMessage}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
              <MessageInput 
                onSendMessage={handleSendMessage} 
                editingMessage={editingMessage}
                replyingMessage={replyingMessage}
                onCancelAction={() => { setEditingMessage(null); setReplyingMessage(null); }}
              />
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
              }}
            >
              <Box
                component="img"
                src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
                alt="Messaging App"
                sx={{
                  width: 150,
                  height: 150,
                  opacity: 0.5,
                  mb: 4,
                  filter: theme.palette.mode === "dark" ? "invert(0.8) sepia(1)" : "none",
                }}
              />
              <Typography variant="h5" color="text.secondary" fontWeight="medium">
                Select a chat to start messaging
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Send and receive messages without keeping your phone online.
              </Typography>
            </Box>
          )}

          {/* User Profile Panel */}
          <Slide direction="left" in={profileOpen && Boolean(selectedChat)} mountOnEnter unmountOnExit>
            <Box
              sx={{
                width: { xs: "100%", sm: 350 },
                height: "100%",
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: theme.zIndex.drawer + 2,
                bgcolor: "background.paper",
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                boxShadow: "-8px 0 24px rgba(0,0,0,0.15)", // Door shadow effect
              }}
            >
              <Box sx={{ p: 2, display: "flex", alignItems: "center", borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={() => setProfileOpen(false)} startIcon={<CloseIcon />} sx={{ color: "text.primary" }}>
                    Close
                </Button>
              </Box>
              <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "background.default" }}>
                <Avatar src={selectedChat?.avatar} sx={{ width: 150, height: 150, mb: 2 }} />
                <Typography variant="h5" fontWeight="bold">
                  {selectedChat?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedChat?.online ? "Online" : "Last seen recently"}
                </Typography>
              </Box>
              <Divider />

              <Box sx={{ p: 2 }}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" mb={1} px={1}>
                  Media, Links and Docs
                </Typography>
                <Box sx={{ display: "flex", gap: 1, px: 1, mb: 2 }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: theme.palette.mode === 'dark' ? '#2e303a' : '#e5e4e7', borderRadius: 2 }}></Box>
                    <Box sx={{ width: 80, height: 80, bgcolor: theme.palette.mode === 'dark' ? '#2e303a' : '#e5e4e7', borderRadius: 2 }}></Box>
                    <Box sx={{ width: 80, height: 80, bgcolor: theme.palette.mode === 'dark' ? '#2e303a' : '#e5e4e7', borderRadius: 2 }}></Box>
                </Box>
                <Button fullWidth startIcon={<StarIcon />} sx={{ justifyContent: "flex-start", py: 1.5, color: "text.primary" }}>
                  Starred messages
                </Button>
              </Box>
              
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button fullWidth startIcon={<NotificationsIcon />} sx={{ justifyContent: "flex-start", py: 1.5, color: "text.primary" }}>
                  Mute notifications
                </Button>
                <Button fullWidth startIcon={<BlockIcon />} sx={{ justifyContent: "flex-start", py: 1.5, color: "error.main" }}>
                  Block {selectedChat?.name}
                </Button>
                <Button fullWidth startIcon={<DeleteIcon />} sx={{ justifyContent: "flex-start", py: 1.5, color: "error.main" }}>
                  Report {selectedChat?.name}
                </Button>
              </Box>
            </Box>
          </Slide>

        </Box>
      )}
    </Box>
  );
}