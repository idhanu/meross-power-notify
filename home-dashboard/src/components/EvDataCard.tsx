import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Stack,
  Grid,
  Box,
} from "@mui/material";
import { useQuery } from "react-query";
import { request } from "../helpers/api";
import { ReactNode } from "react";

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
  expireAt?: number;
}

const EvInfoCard = ({ value, label }: { value: ReactNode; label: string }) => (
  <Grid item xs={3}>
    <Stack>{label}</Stack>
    <Stack>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  </Grid>
);

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
          <Grid container spacing={1}>
            <EvInfoCard
              label="Charging"
              value={
                result.charge ? (
                  <Box color="green">Yes</Box>
                ) : (
                  <Box color="red">No</Box>
                )
              }
            />
            <EvInfoCard
              label="Average"
              value={result.averagePrice.toFixed(2) + " kwh"}
            />
            <EvInfoCard
              label="Current"
              value={result.currentPrice.perKwh.toFixed(2) + " kwh"}
            />
            <EvInfoCard
              label="Cutoff"
              value={new Date(result.cutoff).toLocaleString()}
            />
            <EvInfoCard
              label="Expiry"
              value={
                result.settings.expireAt
                  ? new Date(result.settings.expireAt).toLocaleString()
                  : "No expiry"
              }
            />
            <Grid item xs={12}>
              <div>Lowest Prices:</div>
              <Grid container spacing={1}>
                {result.lowestPrices.map((price) => (
                  <Grid item xs={2}>
                    <Typography variant="body2">{price.toFixed(1)}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
