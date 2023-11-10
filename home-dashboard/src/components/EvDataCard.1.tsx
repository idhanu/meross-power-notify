import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Skeleton,
  Alert,
  Box,
} from "@mui/material";
import { useQuery } from "react-query";
import { request } from "../helpers/api";
import { useState } from "react";

export const EvDataCard: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery("amber_rates", () =>
    request<{ logs: string[] }>("/amber/rate")
  );

  const [more, setMore] = useState(false);

  const shownLogs = more ? data?.logs : data?.logs.slice(-5);

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
          {shownLogs?.map((log: string, i) => (
            <Box key={i} pb={1}>
              {log}
            </Box>
          ))}
        </Typography>
      </CardContent>
      {shownLogs && (
        <CardActions>
          <Button
            size="small"
            onClick={() => setMore(!more)}
            startIcon={more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {more ? "Show less" : "Show more"}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
