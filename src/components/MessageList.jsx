import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, searchQuery, onReply, onEdit, onDelete }) {
  const messagesEndRef = useRef(null);

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
      <div ref={messagesEndRef} />
    </Box>
  );
}
