import React, { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";

import { useUserAttributes } from "../../hooks/useUserAttributes";

const Header = ({ isDrawerOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  const { getUserFullName, getNameInitial, attributesReady } =
    useUserAttributes();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle navigation"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          {isDrawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            display: { xs: "none", sm: "block" },
            fontWeight: "bold",
            color: (theme) => theme.palette.primary.main,
            marginLeft: (theme) => theme.spacing(2),
            position: "relative",
            overflow: "hidden",
            padding: "4px 0",
            cursor: "pointer",

            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "-100%",
              width: "100%",
              height: "3px",
              backgroundColor: (theme) => theme.palette.primary.main,
              opacity: 0,
              transition: "opacity 0.1s ease",
            },

            "&:hover::after": {
              opacity: 1,
              animation: "highlightMove 0.8s ease-in-out",
            },

            "@keyframes highlightMove": {
              "0%": {
                left: "-100%",
              },
              "100%": {
                left: "100%",
              },
            },
          }}
        >
          SPod
        </Typography>

        <Box
          sx={{
            position: "relative",
            borderRadius: (theme) => theme.shape.borderRadius,
            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.05),
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.common.black, 0.1),
            },
            marginLeft: "auto",
            marginRight: (theme) => theme.spacing(2),
            width: "auto",
            flex: 1,
            maxWidth: 500,
          }}
        >
          <Box
            sx={{
              padding: (theme) => theme.spacing(0, 2),
              height: "100%",
              position: "absolute",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search files and folders..."
            sx={{
              color: "inherit",
              padding: (theme) => theme.spacing(1, 1, 1, 0),
              paddingLeft: (theme) => `calc(1em + ${theme.spacing(4)})`,
              transition: (theme) => theme.transitions.create("width"),
              width: "100%",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", ml: "auto" }}>
          <Tooltip title={getUserFullName() || "User"}>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              color="inherit"
            >
              {getNameInitial() ? (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: (theme) => theme.palette.primary.main,
                  }}
                >
                  {getNameInitial()}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleProfileMenuClose}
        MenuListProps={{
          "aria-labelledby": "profile-button",
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountCircle sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={signOut}>
          <Logout sx={{ mr: 1 }} /> Sign Out
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
