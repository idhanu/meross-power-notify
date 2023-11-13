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
  priceMax: number;
  currentPrice: CurrentPrice;
  cutoff: number;
  settings: Settings;
  charge: boolean;
  predictedStateOfCharge: number;
  predictedAveragePrice: number;
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

const EvInfoCard = ({
  value,
  label,
  xs,
}: {
  value: ReactNode;
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

const toPrice = (price: number) => price.toFixed(2) + " ¢/kWh";
const toDate = (date: string | number) =>
  new Date(date).toLocaleString("en-GB", {
    month: "2-digit",
    day: "2-digit",
    minute: "2-digit",
    hour: "2-digit",
  });

const calculateDaysSince = (targetDate: string): number => {
  const targetDateTime = new Date(targetDate);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - targetDateTime.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return daysDifference;
};

export const EvDataCard: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery("ev_last_update", () =>
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
            <EvInfoCard label="Max Price" value={toPrice(result.priceMax)} />
            <EvInfoCard
              label="Current Price"
              value={toPrice(result.currentPrice.perKwh)}
            />
            <EvInfoCard label="Cutoff Time" value={toDate(result.cutoff)} />
            <EvInfoCard
              label="Settings Expiry"
              value={
                result.settings.expireAt
                  ? toDate(result.settings.expireAt)
                  : "No expiry"
              }
            />
            <EvInfoCard
              label="Predicted Charge"
              value={result.predictedStateOfCharge + "%"}
            />
            <EvInfoCard
              label="Predicted Average"
              value={toPrice(result.predictedAveragePrice)}
            />
            <EvInfoCard
              label="Target KMs"
              value={calculateDaysSince("2023-10-19T00:00:00") * 55 + " km"}
            />
            <EvInfoCard
              label="Lowest Prices:"
              xs={12}
              value={
                <Grid container spacing={1}>
                  {result.lowestPrices.map((price, i) => (
                    <Grid item xs={2} key={i} sm={1}>
                      <Typography variant="body2">
                        {price.toFixed(1)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              }
            />
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
