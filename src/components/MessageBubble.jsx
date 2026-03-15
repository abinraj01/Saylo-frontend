import { Box, Typography, IconButton, useTheme, Popover, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";

export default function MessageBubble({ message, isHighlighted, onReply, onEdit, onDelete }) {
  const theme = useTheme(); 
  const isDark = theme.palette.mode === "dark";
  const [showActions, setShowActions] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);
  
  // Reaction Popover State
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEmojiSelect = (emojiObject) => {
    setReactions((prev) => {
      if (prev.includes(emojiObject.emoji)) {
        return prev.filter(e => e !== emojiObject.emoji);
      }
      return [...prev, emojiObject.emoji];
    });
    setEmojiAnchor(null);
    setShowActions(false);
  };

  const statusIcon = () => {
    if (!message.isOwn) return null;
    switch (message.status) {
      case "sent":
        return <DoneIcon sx={{ fontSize: 14, ml: 0.5 }} />;
      case "delivered":
        return <DoneAllIcon sx={{ fontSize: 14, ml: 0.5, color: "text.secondary" }} />;
      case "seen":
        return <DoneAllIcon sx={{ fontSize: 14, ml: 0.5, color: "#34B7F1" }} />;
      default:
        return null;
    }
  };

  return (
    <Box
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!emojiAnchor && !deleteDialogOpen) setShowActions(false);
      }}
      sx={{
        display: "flex",
        justifyContent: message.isOwn ? "flex-end" : "flex-start",
        mb: reactions.length > 0 ? 3 : 2,
        position: "relative",
      }}
    >
      {/* Hover Actions Menu */}
      {(showActions || emojiAnchor) && (
        <Box
          sx={{
            display: "flex",
            position: "absolute",
            top: -15,
            [message.isOwn ? "right" : "left"]: 0,
            bgcolor: "background.paper",
            borderRadius: 8,
            boxShadow: 3,
            zIndex: 10,
            px: 0.5,
            py: 0.2,
          }}
        >
          <IconButton size="small" onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={{ width: 26, height: 26 }}>
            <AddReactionIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={() => onReply(message)} sx={{ width: 26, height: 26 }}>
            <ReplyIcon sx={{ fontSize: 16 }} />
          </IconButton>
          {message.isOwn && (
            <IconButton size="small" onClick={() => onEdit(message)} sx={{ width: 26, height: 26 }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => setDeleteDialogOpen(true)} sx={{ width: 26, height: 26 }}>
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {/* Emoji Picker Popover for Reactions */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <EmojiPicker onEmojiClick={handleEmojiSelect} theme={theme.palette.mode} reactionsDefaultOpen={true} />
      </Popover>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, minWidth: { xs: 300, sm: 340 }, p: 0.5, boxShadow: 10 }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center", pb: 1, pt: 3 }}>
          Delete message?
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", p: 2, pt: 0, gap: 1, alignItems: "stretch", '& > *': { m: "0 !important" } }}>
          {message.isOwn && (
            <Button 
              disableElevation
              variant="contained"
              color="error" 
              onClick={() => { setDeleteDialogOpen(false); onDelete(message.id, "everyone"); }} 
              sx={{ borderRadius: 3, py: 1.2, textTransform: "none", fontWeight: 600, fontSize: "0.95rem" }}
            >
              Delete for everyone
            </Button>
          )}
          <Button 
            disableElevation
            variant={message.isOwn ? "outlined" : "contained"}
            color="error" 
            onClick={() => { setDeleteDialogOpen(false); onDelete(message.id, "me"); }} 
            sx={{ 
                borderRadius: 3, 
                py: 1.2, 
                textTransform: "none", 
                fontWeight: 600, 
                fontSize: "0.95rem",
                ...(message.isOwn && { borderColor: "divider", color: "error.main", '&:hover': { borderColor: "error.main", bgcolor: "error.lighter" } })
            }}
          >
            Delete for me
          </Button>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ borderRadius: 3, py: 1.2, color: "text.secondary", textTransform: "none", fontWeight: 600, fontSize: "0.95rem" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: "70%",
          padding: "8px 12px",
          position: "relative",
          borderRadius: message.isOwn ? "18px 18px 0 18px" : "18px 18px 18px 0",
          bgcolor: isHighlighted
            ? (theme.palette.mode === "dark" ? "rgba(255, 255, 0, 0.2)" : "rgba(255, 235, 59, 0.4)")
            : (message.isOwn ? theme.palette.primary.main : theme.palette.background.paper),
          color: isHighlighted
            ? theme.palette.text.primary
            : (message.isOwn ? "#fff" : theme.palette.text.primary),
          boxShadow: isDark ? "0 1px 2px rgba(0,0,0,0.5)" : "0 1px 2px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          border: isHighlighted ? `1px solid ${theme.palette.divider}` : "none",
        }}
      >
        {message.replyTo && (
           <Box sx={{ 
              mb: 0.5, 
              p: 1, 
              bgcolor: message.isOwn ? "rgba(0,0,0,0.1)" : theme.palette.action.hover, 
              borderRadius: 1,
              borderLeft: "3px solid",
              borderColor: message.isOwn ? "white" : theme.palette.primary.main
            }}>
             <Typography variant="caption" fontWeight="bold">
               {message.replyTo.sender}
             </Typography>
             <Typography variant="body2" sx={{ opacity: 0.8 }} noWrap>
               {message.replyTo.text}
             </Typography>
           </Box>
        )}

        <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
          {message.text}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", alignSelf: "flex-end", mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: message.isOwn && !isHighlighted ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
              fontSize: "0.65rem",
            }}
          >
            {message.timestamp} {message.isEdited && "(edited)"}
          </Typography>
          {statusIcon()}
        </Box>

        {/* Reactions Rendered Below Bubble */}
        {reactions.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: -16,
              [message.isOwn ? "right" : "left"]: 4,
              bgcolor: "background.paper",
              borderRadius: "12px",
              px: 1,
              py: 0.2,
              boxShadow: 1,
              display: "flex",
              gap: 0.5,
              border: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary
            }}
          >
            {reactions.map((react, i) => (
              <Typography key={i} variant="caption" sx={{ fontSize: "0.75rem", cursor: "pointer" }} onClick={() => handleEmojiSelect({emoji: react})}>
                {react}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
