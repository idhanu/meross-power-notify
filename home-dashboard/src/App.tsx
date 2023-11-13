import { Box, Container, Grid } from "@mui/material";
import { NavBar } from "./components/NavBar";
import { LogsCard } from "./components/LogsCard";
import { EvSettingsCard } from "./components/EvSettingsCard";
import { EvDataCard } from "./components/EvDataCard";

export function App() {
  return (
    <div className="App">
      <NavBar />
      <Container maxWidth="lg">
        <Box pt={3} />
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
      </Container>
    </div>
  );
}
