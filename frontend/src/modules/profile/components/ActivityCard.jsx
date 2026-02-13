import { Box, Paper, Typography, Grid, LinearProgress } from "@mui/material";
import { Trophy, Target } from "lucide-react";

export default function ActivityCard({ item }) {
  const cyanMain = "#0891b2";
  const orangeMain = "#ea580c";
  const isHosted = item.type === "HOSTED";

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: "1px solid", borderColor: "grey.200" }}>
      <Grid container alignItems="center" spacing={2}>
        {/* Icon */}
        <Grid item xs={3} sm={1}>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: isHosted ? "#fff7ed" : "#ecfeff", color: isHosted ? orangeMain : cyanMain, display: "flex", alignItems: "center", justifyContent: "center" }}>
             {isHosted ? <Trophy size={20} /> : <Target size={20} />}
          </Box>
        </Grid>

        {/* Content */}
        <Grid item xs={9} sm={7}>
           <Typography variant="caption" fontWeight={700} sx={{ color: isHosted ? orangeMain : cyanMain }}>{item.type} • {item.date}</Typography>
           <Typography variant="subtitle1" fontWeight={700} noWrap>{item.title}</Typography>
           <Typography variant="caption" color="text.secondary">Status: <b>{item.status}</b></Typography>
        </Grid>

        {/* Stats Section */}
        <Grid item xs={12} sm={4}>
           {!isHosted ? (
              <Box sx={{ mt: { xs: 1, sm: 0 } }}>
                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                   <Typography variant="caption" fontWeight={600}>Score</Typography>
                   <Typography variant="caption" fontWeight={700}>{item.score}/{item.total}</Typography>
                 </Box>
                 <LinearProgress variant="determinate" value={(item.score / item.total) * 100} sx={{ height: 6, borderRadius: 3, bgcolor: "grey.100", "& .MuiLinearProgress-bar": { bgcolor: cyanMain } }} />
              </Box>
           ) : (
              <Box sx={{ textAlign: { xs: "left", sm: "right" }, pl: { xs: 6, sm: 0 } }}>
                 <Typography variant="h6" fontWeight={800} color={orangeMain} sx={{ lineHeight: 1 }}>{item.participants}</Typography>
                 <Typography variant="caption" color="text.secondary">PARTICIPANTS</Typography>
              </Box>
           )}
        </Grid>
      </Grid>
    </Paper>
  );
}