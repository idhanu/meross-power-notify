import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Stack,
  Grid,
} from "@mui/material";
import { useQuery } from "react-query";
import { request } from "../helpers/api";

export interface ElectricityPrices {
  result: Result;
}
export interface Result {
  lowestPrices: number[];
  averagePrice: number;
  currentPrice: CurrentPrice;
  cutoff: number;
  settings: Settings;
  charge: boolean;
}
export interface CurrentPrice {
  type: string;
  date: string;
  duration: number;
  startTime: string;
  endTime: string;
  nemTime: string;
  perKwh: number;
  renewables: number;
  spotPerKwh: number;
  channelType: string;
  spikeStatus: string;
  descriptor: string;
  estimate: boolean;
  startTimestamp: number;
  endTimestamp: number;
}
export interface Settings {
  cutoffHour: number;
  maxPrice: number;
  stateOfCharge: number;
  preferredPrice: number;
}

export const EvDataCard: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery("amber_rates", () =>
    request<ElectricityPrices>("/api/ev/last_update")
  );

  const result = data?.result;
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" pb={1}>
          EV Charging Data
        </Typography>
        <Typography variant="body2" component="div">
          {isError && (
            <Alert variant="outlined" severity="error">
              Failed to load logs{" "}
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
          <Stack spacing={2}>
            <Grid container spacing={1}>
              <Grid item xs={3}>
                <Stack>Average</Stack>
                <Stack>
                  <Typography variant="body2">
                    {result.averagePrice.toFixed(2)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={3}>
                <Stack>Charging</Stack>
                <Stack>
                  <Typography variant="body2">
                    {result.charge ? "Yes" : "No"}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
            <div>Lowest Prices:</div>
            <Typography variant="body2" component="div">
              <Grid container spacing={1}>
                {result.lowestPrices.map((price) => (
                  <Grid item xs={2}>
                    <Typography variant="body2">{price.toFixed(1)}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
