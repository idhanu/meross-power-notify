import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

import { useQuery } from "react-query";
import { request } from "../helpers/api";
import { ChargeMonitorLastUpdateOvo } from "../../../server/src/models/chargeMonitor";

const EvInfoCard = ({
  value,
  label,
  xs,
}: {
  value: React.ReactNode;
  label: string;
  xs?: number;
}) => (
  <Grid item xs={xs || 6} sm={xs || 4} lg={xs || 3}>
    <Typography
      variant="body2"
      component="div"
      bgcolor="divider"
      padding={1}
      borderRadius={1}
    >
      <Stack sx={{ fontWeight: "bold" }}>{label}</Stack>
      <Stack>{value}</Stack>
    </Typography>
  </Grid>
);

const getPriceColor = (price: number) => {
  if (price > 35) return "red";
  if (price > 20) return "orange";
  return "green";
};

export const EvDataCardOvo: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery(
    "ev_last_update_ovo",
    () =>
      request<{ result: ChargeMonitorLastUpdateOvo }>("/api/ev/last_update"),
    {
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 0,
      refetchInterval: 15000,
    }
  );

  const result = data?.result;

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" pb={1}>
          EV Charging Data (Ovo)
        </Typography>
        <Typography variant="body2" component="div">
          {isError && (
            <Alert variant="outlined" severity="error">
              Failed to load data{" "}
              {error instanceof Error ? `: ${error.message}` : ""}
            </Alert>
          )}
          {isLoading && (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          )}
        </Typography>
        {result && (
          <Grid container spacing={1}>
            <EvInfoCard
              label="Plugged In"
              value={
                result.isPluggedIn ? (
                  <Box color="green">Yes</Box>
                ) : (
                  <Box color="red">No</Box>
                )
              }
            />
            <EvInfoCard
              label="Current Price"
              value={
                <Box color={getPriceColor(result.currentPrice)}>
                  {result.currentPrice.toFixed(2)} ¢/kWh
                </Box>
              }
            />
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};