import { Box, CircularProgress } from "@mui/material";

export const Loader = () => {
  return (
    <Box pt={5} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  );
};
