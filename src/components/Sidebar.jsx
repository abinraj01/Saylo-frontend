import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Badge,
  InputBase,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useContext, useState } from "react";
import { ColorModeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ conversations, selectedChatId, onSelectChat, refreshChats }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  
  const { logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // New Chat Modal States
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleOpenNewChat = async () => {
    handleMenuClose();
    setUsersModalOpen(true);
    setLoadingUsers(true);
    try {
      const res = await fetch("http://localhost:4000/api/users/available", { credentials: "include" });
      const data = await res.json();
      if (data.status === 1) setAvailableUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const res = await fetch("http://localhost:4000/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId })
      });
      const data = await res.json();
      if (data.status === 1) {
        setUsersModalOpen(false);
        refreshChats(); // Triggers the parent Chat.js to physically re-fetch the DB list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 350 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: theme.palette.background.default,
        }}
      >
        {/* <Typography variant="h6" fontWeight="bold"> */}
        {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img 
            src="/logo.svg" 
            alt="Saylo Logo" 
            style={{ width: 36, height: 36, objectFit: "contain" }} 
          />
          <Typography variant="h6" fontWeight="900" sx={{
            background: theme.palette.mode === "dark" 
              ? "-webkit-linear-gradient(45deg, #a8c0ff 30%, #3f2b96 90%)"
              : "-webkit-linear-gradient(45deg, #4A00E0 30%, #8E2DE2 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Saylo Connect
          </Typography>
        </Box> */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img src="/logo.svg" alt="Saylo Logo" style={{ width: 40, height: 40, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} />
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: "-0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Saylo.
            </Typography>
          </Box>
        <Box>
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleOpenNewChat}>New chat</MenuItem>
            <MenuItem onClick={handleMenuClose}>Starred messages</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>Log out</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: theme.palette.background.default,
            borderRadius: "8px",
            px: 2,
            py: 0.5,
          }}
        >
          <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <InputBase
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ ml: 1, flex: 1, fontSize: "0.95rem" }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Conversation List */}
      <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {filteredConversations.map((chat) => (
          <ListItem
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            sx={{
              cursor: "pointer",
              "&:hover": {
                bgcolor: theme.palette.action.hover,
              },
              ...(selectedChatId === chat.id && {
                bgcolor: theme.palette.action.selected,
              }),
            }}
          >
            <ListItemAvatar>
              <Badge
                color="success"
                variant="dot"
                invisible={!chat.online}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                overlap="circular"
              >
                <Avatar src={chat.avatar} alt={chat.name} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" fontWeight="500" noWrap>
                    {chat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chat.timestamp}
                  </Typography>
                </Box>
              }
              secondary={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={0.5}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: "200px" }}
                  >
                    {chat.lastMessage}
                  </Typography>
                  {chat.unread > 0 && (
                    <Badge badgeContent={chat.unread} color="primary" />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Modern Dialog to start a new chat organically */}
      <Dialog 
        open={usersModalOpen} 
        onClose={() => setUsersModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight="800">Start new chat</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {availableUsers.map((u) => (
                <ListItem 
                  key={u.id} 
                  button 
                  onClick={() => handleStartChat(u.id)}
                  sx={{ py: 1.5, '&:hover': { bgcolor: theme.palette.action.hover } }}
                >
                  <ListItemAvatar>
                    <Avatar src={u.profile_pic || ""} alt={u.name} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography fontWeight="600">{u.name}</Typography>} 
                    secondary={u.email} 
                  />
                  <PersonAddIcon sx={{ color: "primary.main", mr: 1, opacity: 0.8 }} />
                </ListItem>
              ))}
              {availableUsers.length === 0 && (
                 <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No other users found on the network.</Typography>
                 </Box>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
