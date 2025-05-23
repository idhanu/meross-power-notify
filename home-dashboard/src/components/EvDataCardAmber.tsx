import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessTimeFilled from "@mui/icons-material/AccessTimeFilled";

import { useQuery } from "react-query";
import { request } from "../helpers/api";
import { ReactNode } from "react";
import { ChargeMonitorLastUpdateAmber } from "../../../server/src/models/chargeMonitor";

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

const toPrice = (price: number | null) =>
  price ? price.toFixed(2) + " ¢/kWh" : "N/A";

// const toDate = (date: string | number) =>
//   new Date(date).toLocaleString("en-GB", {
//     month: "2-digit",
//     day: "2-digit",
//     minute: "2-digit",
//     hour: "2-digit",
//   });

const toTime = (date: string | number) =>
  new Date(date).toLocaleString("en-GB", {
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

export const EvDataCardAmber: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery(
    "ev_last_update",
    () =>
      request<{ result: ChargeMonitorLastUpdateAmber }>("/api/ev/last_update"),
    {
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 0,
      refetchInterval: 15000,
    }
  );

  const tomorrowMidnight = new Date();
  tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
  tomorrowMidnight.setHours(0, 0, 0, 0);

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
                result.isPluggedIn ? (
                  <Box color="green">Yes</Box>
                ) : (
                  <Box color="red">No</Box>
                )
              }
            />
            <EvInfoCard
              label="Should Charge"
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
              label="Prices:"
              xs={12}
              value={
                <Grid container spacing={1}>
                  {result.prices.map((price) => (
                    <Grid item xs={2} key={price.endTime} sm={1}>
                      <Typography
                        variant="body2"
                        component="div"
                        color={
                          result.lowestPrices.find(
                            (a) => price.startTime === a.startTime
                          )
                            ? "green"
                            : undefined
                        }
                      >
                        <Stack>
                          <div>
                            {price.startTimestamp >
                            tomorrowMidnight.getTime() ? (
                              <AccessTimeFilled fontSize="small" />
                            ) : (
                              <AccessTimeIcon fontSize="small" />
                            )}
                          </div>
                          <div>{price.perKwh.toFixed(1) + "¢"}</div>
                          <div>{toTime(price.startTimestamp)}</div>
                        </Stack>
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              }
            />
            {result.chargingTimes?.length > 0 && (
              <EvInfoCard
                label="Charging Times"
                xs={12}
                value={
                  <Grid container spacing={1}>
                    {result.chargingTimes
                      .slice(Math.min(result.chargingTimes.length, 0))
                      .map((record) => (
                        <Grid item xs={2} key={record.time} sm={1}>
                          <Typography variant="body2" component="div">
                            <Stack>
                              <div>{record.price.toFixed(1) + "¢"}</div>
                              <div>{toTime(record.time)}</div>
                            </Stack>
                          </Typography>
                        </Grid>
                      ))}
                  </Grid>
                }
              />
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
