import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Badge, 
  useMediaQuery, 
  useTheme,
  Menu,
  MenuItem,
  InputBase,
  Divider
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

export default function ChatHeader({ chat, onBack, onToggleProfile, isSearching, setIsSearching, searchQuery, setSearchQuery }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (!chat) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        bgcolor: "background.paper",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        height: 72,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isMobile && (
          <IconButton onClick={onBack} edge="start" sx={{ mr: 1, color: "text.secondary" }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box onClick={onToggleProfile} sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Badge
            color="success"
            variant="dot"
            invisible={!chat.online}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            overlap="circular"
          >
            <Avatar src={chat.avatar} alt={chat.name} />
          </Badge>
          <Box sx={{ ml: 1 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {chat.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {chat.online ? "Online" : "Last seen recently"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, color: "text.secondary", alignItems: "center" }}>
        {isSearching ? (
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "background.default", borderRadius: 2, px: 2, py: 0.5, mr: 1 }}>
            <InputBase 
              autoFocus
              placeholder="Search in chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: 100, sm: 200 } }}
            />
            <IconButton size="small" onClick={() => { setIsSearching(false); setSearchQuery(""); }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <IconButton color="inherit" onClick={() => setIsSearching(true)}>
            <SearchIcon />
          </IconButton>
        )}
        
        <IconButton color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
          <CallIcon />
        </IconButton>
        <IconButton color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
          <VideocamIcon />
        </IconButton>
        <IconButton color="inherit" onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => { handleMenuClose(); onToggleProfile(); }}>Contact info</MenuItem>
          <MenuItem onClick={handleMenuClose}>Select messages</MenuItem>
          <MenuItem onClick={handleMenuClose}>Mute notifications</MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>Clear chat</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>Delete chat</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
