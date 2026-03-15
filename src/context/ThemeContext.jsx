import { createContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: {
                  main: "#007AFF", // Modern iOS-like blue
                },
                background: {
                  default: "#f0f2f5", // WhatsApp web like background
                  paper: "#ffffff",
                },
                text: {
                  primary: "#111b21",
                  secondary: "#667781",
                },
              }
            : {
                primary: {
                  main: "#0a84ff",
                },
                background: {
                  default: "#111b21", // WhatsApp web dark
                  paper: "#202c33",
                },
                text: {
                  primary: "#e9edef",
                  secondary: "#8696a0",
                },
              }),
        },
        typography: {
          fontFamily: `"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif`,
          button: {
            textTransform: "none",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: "8px",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: "12px",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
