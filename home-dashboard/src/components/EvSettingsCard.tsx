import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";

import { useMutation, useQuery, useQueryClient } from "react-query";
import { request } from "../helpers/api";
import SaveIcon from "@mui/icons-material/Save";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import Battery0BarIcon from "@mui/icons-material/Battery0Bar";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import PriceChangeIcon from "@mui/icons-material/MonetizationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useEffect, useState } from "react";

interface FromValues {
  cutoffHour: number;
  stateOfCharge: number;
  maxPrice: number;
}

export const EvSettingsCard: React.FC = () => {
  const [values, setValues] = useState<FromValues>({
    cutoffHour: 15,
    stateOfCharge: 90,
    maxPrice: 30,
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
    onSettled: () => {
      queryClient.invalidateQueries({
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
          EV Settings
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
              <AccessTimeIcon />
              <Slider
                aria-label="Time"
                value={values.cutoffHour}
                onChange={(_e, v) => update("cutoffHour", v as number)}
                min={0}
                max={24}
                valueLabelFormat={(value) =>
                  String(value).padStart(2, "0") + ":00"
                }
                valueLabelDisplay="auto"
                marks
              />
              <Typography variant="body2">{values.cutoffHour}:00</Typography>
              <AccessTimeFilledIcon />
            </Stack>
            <Stack spacing={2} direction="row" alignItems="center">
              <div
                onClick={() =>
                  update("stateOfCharge", values.stateOfCharge - 1)
                }
              >
                <Battery0BarIcon />
              </div>
              <Slider
                aria-label="Battery"
                value={values.stateOfCharge}
                onChange={(_e, v) => update("stateOfCharge", v as number)}
                min={0}
                max={100}
                step={1}
                valueLabelFormat={(value) => value + "%"}
                valueLabelDisplay="auto"
                marks
              />
              <Typography variant="body2">{values.stateOfCharge}%</Typography>
              <div
                onClick={() =>
                  update("stateOfCharge", values.stateOfCharge + 1)
                }
              >
                <BatteryFullIcon />
              </div>
            </Stack>
            <Stack spacing={2} direction="row" alignItems="center">
              <AttachMoneyIcon />
              <Slider
                aria-label="Battery"
                value={values.maxPrice}
                onChange={(_e, v) => update("maxPrice", v as number)}
                min={0}
                max={100}
                step={1}
                valueLabelFormat={(value) => "¢" + value}
                valueLabelDisplay="auto"
                marks
              />
              <PriceChangeIcon />
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
