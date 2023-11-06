import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Alert,
  Box,
} from "@mui/material";
import { useQuery } from "react-query";
import { Loader } from "./Loader";
import { useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const basePath = window.location.host.includes("localhost")
  ? "http://localhost:22000"
  : "";
const fetchLogs = async () => {
  const response = await fetch(`${basePath}/api/logs`);
  return (await response.json()) as { logs: string[] };
};

export const LogsCard: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery("logs", fetchLogs);
  const [more, setMore] = useState(false);

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load logs {error instanceof Error ? `: ${error.message}` : ""}
      </Alert>
    );
  }

  const shownLogs = more ? data?.logs : data?.logs.slice(-5);

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" pb={1}>
          Logs
        </Typography>
        <Typography variant="body2">
          {isLoading ? (
            <Loader />
          ) : (
            shownLogs?.map((log: string) => <Box pb={1}>{log}</Box>)
          )}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => setMore(!more)}
          startIcon={more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {more ? "Show less" : "Show more"}
        </Button>
      </CardActions>
    </Card>
  );
};
