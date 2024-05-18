import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export const Loader = () => {
  return (
    <Box pt={5} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  );
};
