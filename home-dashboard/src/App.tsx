import {
  Box,
  Container,
  Grid,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { NavBar } from "./components/NavBar";
import { LogsCard } from "./components/LogsCard";
import { EvSettingsCard } from "./components/EvSettingsCard";
import { EvDataCard } from "./components/EvDataCard";
import React from "react";

export function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <Box bgcolor="background.default" minHeight="100vh">
        <NavBar />
        <Container maxWidth="lg">
          <Box pt={3} pb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <EvDataCard />
              </Grid>
              <Grid item xs={12}>
                <LogsCard />
              </Grid>
              <Grid item xs={12}>
                <EvSettingsCard />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
