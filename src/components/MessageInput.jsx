import { Box, InputBase, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Popover, useTheme, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import DescriptionIcon from "@mui/icons-material/Description";
import VideocamIcon from "@mui/icons-material/Videocam";
import CloseIcon from "@mui/icons-material/Close";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ onSendMessage, editingMessage, replyingMessage, onCancelAction }) {
  const theme = useTheme();
  const [text, setText] = useState("");
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [attachAnchor, setAttachAnchor] = useState(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    } else {
      setText("");
    }
  }, [editingMessage]);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText("");
      setEmojiAnchor(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      
      {/* Action Banner (Reply/Edit) */}
      {(editingMessage || replyingMessage) && (
        <Box sx={{ 
          p: 1.5, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          borderTop: `1px solid ${theme.palette.divider}`, 
          bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)" 
        }}>
          <Box sx={{ display: "flex", flexDirection: "column", borderLeft: "3px solid", borderColor: "primary.main", pl: 1.5 }}>
             <Typography variant="body2" color="primary" fontWeight="bold">
               {editingMessage ? "Edit Message" : `Replying to ${replyingMessage.sender}`}
             </Typography>
             <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: "80vw" }}>
               {editingMessage ? editingMessage.text : replyingMessage.text}
             </Typography>
          </Box>
          <IconButton size="small" onClick={onCancelAction}>
             <CloseIcon />
          </IconButton>
        </Box>
      )}

      {/* Main Input Area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          p: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, pb: 0.5, color: "text.secondary" }}>
          {/* Emoji Button & Picker popover */}
          <IconButton color="inherit" size="small" onClick={(e) => setEmojiAnchor(e.currentTarget)}>
            <EmojiEmotionsIcon />
          </IconButton>
          <Popover
            open={Boolean(emojiAnchor)}
            anchorEl={emojiAnchor}
            onClose={() => setEmojiAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <EmojiPicker 
              onEmojiClick={handleEmojiSelect}
              theme={theme.palette.mode} 
            />
          </Popover>

          {/* Attach Menu */}
          <IconButton color="inherit" size="small" onClick={(e) => setAttachAnchor(e.currentTarget)}>
            <AttachFileIcon />
          </IconButton>
          <Menu
            anchorEl={attachAnchor}
            open={Boolean(attachAnchor)}
            onClose={() => setAttachAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <MenuItem onClick={() => setAttachAnchor(null)}>
              <ListItemIcon><InsertPhotoIcon fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText>Image</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setAttachAnchor(null)}>
              <ListItemIcon><VideocamIcon fontSize="small" color="secondary" /></ListItemIcon>
              <ListItemText>Video</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setAttachAnchor(null)}>
              <ListItemIcon><DescriptionIcon fontSize="small" sx={{ color: "#795548" }} /></ListItemIcon>
              <ListItemText>Document</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Input Textfield */}
        <InputBase
          multiline
          maxRows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          sx={{
            flex: 1,
            bgcolor: "background.default",
            borderRadius: 4,
            px: 2,
            py: 1.5,
            fontSize: "0.95rem",
          }}
        />

        <Box sx={{ display: "flex", gap: 1, pb: 0.5 }}>
          {text.trim() ? (
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          ) : (
            <IconButton color="inherit" sx={{ color: "text.secondary" }}>
              <MicIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}
