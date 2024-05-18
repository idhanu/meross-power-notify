import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";

import { useQuery } from "react-query";
import { useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { request } from "../helpers/api";

export const LogsCard: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery("logs", () =>
    request<{ result: string[] }>("/api/logs")
  );
  const [more, setMore] = useState(false);

  const shownLogs = more ? data?.result : data?.result.slice(-5);

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
            <Box
              key={i}
              pb={1}
              whiteSpace="break-spaces"
              m={0}
              sx={{ overflowX: "auto" }}
            >
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
