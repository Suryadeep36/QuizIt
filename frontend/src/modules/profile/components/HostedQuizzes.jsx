import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// State Management
import useAuth from "../../../stores/store";

// MUI Components
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  CircularProgress,
  Chip,
  Avatar,
  Tooltip
} from "@mui/material";

// Icons
import { 
  LayoutDashboard, 
  RefreshCw, 
  Calendar, 
  ChevronRight,
  Users,
  AlertCircle,
  Settings,
  CheckCircle2
} from "lucide-react";
import { getQuizsByHostId } from "../../../services/AuthService";

export default function HostedQuizzes() {
  const user = useAuth((s) => s.user);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const cyanMain = "#0891b2";
  const cyanLight = "#ecfeff";

  const fetchHostedQuizzes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await getQuizsByHostId(user.id);
      console.log("hosted", response)
      // Filter for ENDED status as per your requirement
      const endedQuizzes = response?response.filter(q => q.status === "ENDED"):[];
      setQuizzes(endedQuizzes);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch hosted quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostedQuizzes();
  }, [user?.id]);

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box 
            sx={{ 
                p: 1.5, 
                borderRadius: "12px", 
                bgcolor: "white", 
                color: cyanMain,
                boxShadow: "0 4px 12px rgba(8, 145, 178, 0.1)"
            }}
          >
             <LayoutDashboard size={24} strokeWidth={2.5} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
              Hosted Quizzes
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Manage and analyze your completed sessions
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={fetchHostedQuizzes}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit"/> : <RefreshCw size={16} />}
          variant="text"
          size="small"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            color: "text.secondary",
            fontWeight: 600,
            "&:hover": { color: cyanMain, bgcolor: cyanLight }
          }}
        >
          {loading ? "Updating..." : "Refresh"}
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
         <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'grey.300', borderRadius: 4, bgcolor: 'grey.50' }}>
            <CircularProgress size={28} sx={{ color: cyanMain, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading hosted sessions...</Typography>
         </Paper>
      )}

      {/* Empty State */}
      {!loading && quizzes.length === 0 && (
         <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '1px solid', borderColor: 'grey.200', borderRadius: 4, bgcolor: 'white' }}>
            <Box sx={{ color: 'grey.300', mb: 2 }}><AlertCircle size={56} /></Box>
            <Typography variant="h6" color="text.secondary" fontWeight={700} gutterBottom>No completed quizzes</Typography>
            <Typography variant="body2" color="text.secondary">
                Quizzes you host will appear here once the session has ended.
            </Typography>
         </Paper>
      )}

      {/* List of Hosted Quiz Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {quizzes.map((quiz) => (
         
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.200",
                transition: "all 0.3s ease",
                bgcolor: "white",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
                  borderColor: cyanMain,
                }
              }}
            >
              {/* Status Indicator */}
              <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", bgcolor: cyanMain }} />

              <Grid container alignItems="center" spacing={3}>
                <Grid item xs={12} sm="auto">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: cyanLight, color: cyanMain, borderRadius: 3 }}>
                     <CheckCircle2 size={26} />
                  </Avatar>
                </Grid>

                <Grid item xs={12} sm>
                   <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Typography variant="h6" fontWeight={800} color="text.primary">
                          {quiz.quizName}
                      </Typography>
                      <Chip 
                          label="Ended" 
                          size="small" 
                          sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, bgcolor: "grey.100", color: "grey.700" }} 
                      />
                   </Box>
                   
                   <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 1, sm: 3 }, color: "text.secondary" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                         <Calendar size={15} />
                         <Typography variant="body2" fontWeight={500}>
                            {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "Recently"}
                         </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                         <Settings size={15} />
                         <Typography variant="body2" fontWeight={500}>Mode: {quiz.mode}</Typography>
                      </Box>
                   </Box>
                </Grid>

                {/* Quick Stats Section */}
                <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">GUESTS</Typography>
                            <Typography variant="h6" fontWeight={800} color={cyanMain}>{quiz.allowGuest ? "Yes" : "No"}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', color: cyanMain }}>
                       <Link 
            key={quiz.quizId} 
            to={`/quiz/leaderboard/${quiz.quizId}`}
            style={{ textDecoration: 'none' }}
          >
                  <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>View Results</Typography>
          </Link>
                            <ChevronRight size={18} />
                        </Box>
                    </Box>
                </Grid>
              </Grid>
            </Paper>
          
        ))}
      </Box>
    </Box>
  );
}