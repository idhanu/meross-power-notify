import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

import { NavBar } from "./components/NavBar";
import { LogsCard } from "./components/LogsCard";
import { EvSettingsCardOvo } from "./components/EvSettingsCardOvo";
import React from "react";
import { EvDataCardOvo } from "./components/EvDataCardOvo";

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
                <EvDataCardOvo />
              </Grid>
              <Grid item xs={12}>
                <EvSettingsCardOvo />
              </Grid>
              <Grid item xs={12}>
                <LogsCard />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
