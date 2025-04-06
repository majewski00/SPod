import React from "react";
import { Box, Fade, useTheme } from "@mui/material";

const HelloUser = ({ userAttributesReady, getUserFullName }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        textAlign: "center",
        height: "60px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Fade
        in={userAttributesReady}
        timeout={{
          appear: 800,
          enter: 800,
          exit: 500,
        }}
        style={{
          transitionDelay: userAttributesReady ? "300ms" : "0ms",
          transformOrigin: "center",
        }}
      >
        <Box
          component="h1"
          sx={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            color: theme.palette.text.primary,
            position: "relative",
            opacity: userAttributesReady ? 1 : 0,
            transform: userAttributesReady
              ? "translateY(0)"
              : "translateY(20px)",
            transition: theme.transitions.create(["opacity", "transform"], {
              duration: "0.5s",
              easing: theme.transitions.easing.easeOut,
            }),
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              width: "0%",
              height: "2px",
              backgroundColor: theme.palette.primary.main,
              transition: "all 0.8s ease-out",
              transform: "translateX(-50%)",
              opacity: 0,
            },
            "&.loaded::after": {
              width: "40%",
              opacity: 0.7,
            },
          }}
          className={userAttributesReady ? "loaded" : ""}
        >
          Welcome back, {userAttributesReady ? getUserFullName() : ""}!
        </Box>
      </Fade>
    </Box>
  );
};

export default HelloUser;
