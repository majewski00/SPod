import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  styled,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export const drawerWidthCollapsed = 65;
export const drawerWidthExpanded = 240;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidthExpanded : drawerWidthCollapsed,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidthExpanded : drawerWidthCollapsed,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: "hidden",
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const GroupTitle = styled(Box)(({ theme, open }) => ({
  padding: theme.spacing(open ? 2 : 2, 2),
  maxHeight: open ? theme.spacing(5) : 0,
  overflow: "hidden",
  opacity: open ? 1 : 0,
  transform: open ? "translateY(0)" : "translateY(-10px)",
  transition: theme.transitions.create(
    ["max-height", "opacity", "transform", "padding"],
    {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }
  ),
  ...(open ? {} : { margin: 0, padding: 0 }),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, open }) => ({
  minHeight: 52,
  justifyContent: open ? "initial" : "center",
  padding: theme.spacing(1.5, 3.5),
  transition: theme.transitions.create(["padding", "margin"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme, open }) => ({
  minWidth: 0,
  marginRight: open ? theme.spacing(3) : "auto",
  justifyContent: "center",
  transition: theme.transitions.create(["margin-right"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
}));

const StyledListItemText = styled(ListItemText)(({ theme, open }) => ({
  opacity: open ? 1 : 0,
  transform: open ? "translateX(0)" : "translateX(-10px)",
  transition: theme.transitions.create(["opacity", "transform"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
    delay: open ? "60ms" : "0ms",
  }),
  whiteSpace: "nowrap",
  overflow: "hidden",
  maxWidth: open ? "100%" : 0,
}));

const NavigationGroup = ({ title, items, open }) => {
  const location = useLocation();

  return (
    <>
      <GroupTitle open={open}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: "bold", textTransform: "uppercase" }}
        >
          {title}
        </Typography>
      </GroupTitle>

      <List sx={{ padding: 0 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <StyledListItemButton
                open={open}
                component={Link}
                to={item.link}
                selected={isActive}
                sx={{
                  backgroundColor: isActive
                    ? "rgba(0, 0, 0, 0.08)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "rgba(0, 0, 0, 0.12)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <StyledListItemIcon open={open}>{item.icon}</StyledListItemIcon>
                <StyledListItemText primary={item.text} open={open} />
              </StyledListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
    </>
  );
};

export const Navigation = ({ isDrawerOpen }) => {
  const theme = useTheme();

  const navigationGroups = [
    {
      title: "Main",
      items: [{ text: "Home", icon: <HomeIcon />, link: "" }],
    },
    {
      title: "Files",
      items: [
        { text: "All Files", icon: <InsertDriveFileIcon />, link: "" },
        { text: "Folders", icon: <FolderIcon />, link: "" },
      ],
    },
    {
      title: "System",
      items: [{ text: "Trash", icon: <DeleteOutlineIcon />, link: "" }],
    },
  ];

  return (
    <StyledDrawer variant="permanent" open={isDrawerOpen}>
      <Box
        sx={{
          ...{ minHeight: 64 },
          width: isDrawerOpen ? drawerWidthExpanded : drawerWidthCollapsed,
        }}
      />
      {navigationGroups.map((group, index) => (
        <NavigationGroup
          key={index}
          title={group.title}
          items={group.items}
          open={isDrawerOpen}
        />
      ))}
    </StyledDrawer>
  );
};
