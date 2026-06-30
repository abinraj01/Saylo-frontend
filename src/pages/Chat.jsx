import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Box, Typography, useMediaQuery, useTheme, Avatar, Divider, Button, Slide } from "@mui/material";

const socket = io("http://localhost:4000", {
  autoConnect: false // Connect only when component mounts
});
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { useAuth } from "../context/AuthContext";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";

export default function Chat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { authUser } = useAuth();
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null);

  // Right sidebar drawer state
  const [profileOpen, setProfileOpen] = useState(false);

  // Safely persist selected chat ID natively for the Socket listener without triggering effect spam
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Fetch all conversations strictly from MySQL
  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/conversations", { credentials: "include" });
      const data = await res.json();
      
      if (data.status === 1) {
        // Format raw SQL rows safely into the frontend's expected prop shapes to protect child views!
        const activeChats = data.data.map(c => ({
           id: c.conversation_id, // Map the actual foreign key
           name: c.participant_name,
           avatar: c.participant_avatar || "https://mighty.tools/mockmind-api/content/human/5.jpg",
           lastMessage: c.last_message || "Say hi!",
           timestamp: c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
           online: c.participant_status === 1,
           unread: 0,
        }));
        setConversations(activeChats);
      }
    } catch (err) {
      console.error("Failed to fetch conversations from DB:", err);
    }
  };

  useEffect(() => {
    if (authUser) fetchConversations();
  }, [authUser]);

  // Fetch individual chat history bubbles immediately when clicking a specific chat thread
  useEffect(() => {
    setIsTyping(false); // Wipe any hanging states safely when jumping threads

    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/conversations/${selectedChat.id}/messages`, { credentials: "include" });
          const data = await res.json();
          if (data.status === 1) {
            const mappedHistory = data.data.map(m => ({
               id: m.id,
               text: m.text,
               sender: m.sender_id === authUser.id ? "Me" : "Them",
               time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               isOwn: m.sender_id === authUser.id,
               status: m.status
            }));
            setMessages(mappedHistory);
          }
        } catch (err) {
          console.error("Error fetching message history:", err);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat, authUser]);

  // Master Socket Engine mapping all Real-Time network activity globally
  useEffect(() => {
    if (!authUser) return;

    socket.connect();

    const handleIncomingMessage = (messageData) => {
      // 1. Instantly inject message bubbles into current UI if the user is literally looking at the sender 
      if (
        selectedChatRef.current && 
        messageData.conversation_id === selectedChatRef.current.id && 
        messageData.sender_id !== authUser.id
      ) {
        setMessages((prev) => [...prev, {
            id: messageData.id,
            text: messageData.text,
            sender: "Them",
            time: new Date(messageData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
            status: messageData.status
        }]);
      }

      // 2. Universally bind the background Sidebar stream
      setConversations((prev) => {
        const chatExists = prev.find(c => c.id === messageData.conversation_id);
        
        if (chatExists) {
          const updatedChats = prev.map(c => {
             if (c.id === messageData.conversation_id) {
                // Determine if we are just passively observing else where
                const isPassive = !selectedChatRef.current || selectedChatRef.current.id !== messageData.conversation_id;
                
                return {
                   ...c,
                   lastMessage: messageData.text,
                   timestamp: new Date(messageData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                   // Bump up the unread notifications automatically safely
                   unread: (isPassive && messageData.sender_id !== authUser.id) ? (c.unread || 0) + 1 : c.unread
                };
             }
             return c;
          });
          
          // Radically yank the active channel completely to the top of the chat stack
          const target = updatedChats.find(c => c.id === messageData.conversation_id);
          const others = updatedChats.filter(c => c.id !== messageData.conversation_id);
          return [target, ...others];
        } else {
           // We violently received a Socket burst from an absolutely brand new foreign ID. Rehydrate universal UI!
           fetchConversations();
           return prev;
        }
      });
    };

    socket.on("receive_message", handleIncomingMessage);

    socket.on("typing_start", (data) => {
       if (selectedChatRef.current && data.conversation_id === selectedChatRef.current.id && data.sender_id !== authUser.id) {
          setIsTyping(true);
       }
    });

    socket.on("typing_stop", (data) => {
       if (selectedChatRef.current && data.conversation_id === selectedChatRef.current.id && data.sender_id !== authUser.id) {
          setIsTyping(false);
       }
    });

    return () => {
      socket.off("receive_message", handleIncomingMessage);
      socket.off("typing_start");
      socket.off("typing_stop");
      socket.disconnect();
    };
  }, [authUser]);

  const typingTimeoutRef = useRef(null);
  const handleTypingActivity = () => {
    if (!selectedChatRef.current) return;
    
    socket.emit("typing_start", {
      conversation_id: selectedChatRef.current.id,
      sender_id: authUser.id
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Auto-disable typing indicator network blast if user is idle for exactly 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        conversation_id: selectedChatRef.current.id,
        sender_id: authUser.id
      });
    }, 2000);
  };

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

    const payload = {
      conversation_id: selectedChat.id,
      sender_id: authUser.id,
      text: text
    };

    const tempMessage = {
      id: Date.now(), // Temporary ID for instant UI hydration
      text: text,
      sender: "Me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      status: "sent",
    };
    
    // Add to local UI instantly without waiting for network bounce
    setMessages((prev) => [...prev, tempMessage]);
    setReplyingMessage(null);

    // Blast payload entirely up to backend via Socket.io
    socket.emit("send_message", payload);
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
          refreshChats={fetchConversations}
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
                isTyping={isTyping}
              />
              <MessageInput 
                onSendMessage={handleSendMessage} 
                editingMessage={editingMessage}
                replyingMessage={replyingMessage}
                onCancelAction={() => { setEditingMessage(null); setReplyingMessage(null); }}
                onTyping={handleTypingActivity}
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