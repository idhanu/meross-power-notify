import { Card, CardContent, Typography, Skeleton, Alert } from "@mui/material";
import { useQuery } from "react-query";
import { request } from "../helpers/api";

export const EvDataCard: React.FC = () => {
  const {
    isLoading,
    isError,
    data: _data,
    error,
  } = useQuery("amber_rates", () =>
    request<{ rates: { name: string } }>("/amber/rate")
  );

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" pb={1}>
          Logs
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
      </CardContent>
    </Card>
  );
};
