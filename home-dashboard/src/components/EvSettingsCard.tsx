import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Stack,
  Slider,
} from "@mui/material";
import { useMutation } from "react-query";
import { request } from "../helpers/api";
import SaveIcon from "@mui/icons-material/Save";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import Battery0BarIcon from "@mui/icons-material/Battery0Bar";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import { useState } from "react";

interface FromValues {
  time: number;
}

export const EvSettingsCard: React.FC = () => {
  const [values, setValues] = useState<FromValues>({
    time: 0,
  });

  const update = <T extends keyof FromValues>(k: T, v: FromValues[T]) =>
    setValues({ ...values, [k]: v });

  const mutation = useMutation({
    mutationFn: () =>
      request("api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    // onSuccess: () => {
    //   // Invalidate and refetch
    //   queryClient.invalidateQueries({ queryKey: ['todos'] })
    // },
  });

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" pb={1}>
          EV Settings
        </Typography>
        <Stack spacing={2}>
          <Stack spacing={2} direction="row" alignItems="center">
            <AccessTimeIcon />
            <Slider
              aria-label="Time"
              value={values.time}
              onChange={(_e, v) => update("time", v as number)}
              min={0}
              max={24}
              valueLabelFormat={(value) =>
                String(value).padStart(2, "0") + ":00"
              }
              valueLabelDisplay="auto"
              marks
            />
            <AccessTimeFilledIcon />
          </Stack>
          <Stack spacing={2} direction="row" alignItems="center">
            <Battery0BarIcon />
            <Slider
              aria-label="Battery"
              value={values.time}
              onChange={(_e, v) => update("time", v as number)}
              min={0}
              max={100}
              step={1}
              valueLabelFormat={(value) => value + "%"}
              valueLabelDisplay="auto"
              marks
            />
            <BatteryFullIcon />
          </Stack>
        </Stack>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => mutation.mutate()}
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
