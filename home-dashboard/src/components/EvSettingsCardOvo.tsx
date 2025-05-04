import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";

import { useMutation, useQuery, useQueryClient } from "react-query";
import { request } from "../helpers/api";
import SaveIcon from "@mui/icons-material/Save";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useEffect, useState } from "react";
import { Switch } from "@mui/material";

interface FromValues {
  force: boolean;
  forceOffPeak: boolean;
}

export const EvSettingsCardOvo: React.FC = () => {
  const [values, setValues] = useState<FromValues>({
    force: false,
    forceOffPeak: false,
  });

  const queryClient = useQueryClient();

  const update = <T extends keyof FromValues>(k: T, v: FromValues[T]) =>
    setValues({ ...values, [k]: v });

  const mutation = useMutation({
    mutationFn: (values: FromValues) =>
      request("/api/ev/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2 seconds
      await queryClient.invalidateQueries({
        queryKey: ["ev_settings", "ev_last_update"],
      });
    },
  });

  const { data, isLoading } = useQuery("ev_settings", () =>
    request<{ result: FromValues }>("/api/ev/settings")
  );

  useEffect(() => {
    if (data) {
      setValues(data.result);
    }
  }, [data]);

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" pb={1}>
          EV Settings Ovo
        </Typography>
        {isLoading && (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        )}

        {!isLoading && (
          <Stack spacing={2}>
            <Stack spacing={2} direction="row" alignItems="center">
              <PushPinIcon />
              <Typography>Force</Typography>
              <Switch
                size="medium"
                checked={values.force}
                onChange={(_e, v) => update("force", v)}
              />
            </Stack>
            <Stack spacing={2} direction="row" alignItems="center">
              <PushPinIcon />
              <Typography>Force off-peak</Typography>
              <Switch
                size="medium"
                checked={values.forceOffPeak}
                onChange={(_e, v) => update("forceOffPeak", v)}
              />
            </Stack>
          </Stack>
        )}
      </CardContent>
      <CardActions>
        <Button
          onClick={() => mutation.mutate(values)}
          startIcon={<SaveIcon />}
          disabled={mutation.isLoading}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
