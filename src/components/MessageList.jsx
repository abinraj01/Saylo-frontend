import { Box, Typography, keyframes, useTheme } from "@mui/material";
import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

export default function MessageList({ messages, searchQuery, onReply, onEdit, onDelete, isTyping }) {
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkHighlight = (text, query) => {
    if (!query) return false;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        p: 3,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        backgroundImage: (theme) =>
          theme.palette.mode === "light"
            ? `radial-gradient(#d1cfcb 1px, transparent 1px)`
            : `radial-gradient(#1e2428 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      {messages.map((msg) => (
        <MessageBubble 
          key={msg.id} 
          message={msg} 
          isHighlighted={checkHighlight(msg.text, searchQuery)} 
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      
      {/* Animated Typing Indicator */}
      {isTyping && (
        <Box sx={{ display: "flex", mt: 1, mb: 2, alignItems: "center" }}>
           <Box 
             sx={{ 
               p: 2, 
               bgcolor: theme.palette.mode === "dark" ? "#2a3942" : "#fff", 
               borderRadius: 2, 
               borderTopLeftRadius: 0,
               boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
               display: "flex",
               gap: 0.5,
               alignItems: "center"
             }}
           >
             <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontStyle: "italic", fontSize: "0.75rem", transform: "translateY(0.5px)" }}>
                Typing
             </Typography>
             <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.secondary", animation: `${bounce} 1.4s infinite ease-in-out`, animationDelay: "-0.32s" }} />
             <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.secondary", animation: `${bounce} 1.4s infinite ease-in-out`, animationDelay: "-0.16s" }} />
             <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.secondary", animation: `${bounce} 1.4s infinite ease-in-out` }} />
           </Box>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </Box>
  );
}
