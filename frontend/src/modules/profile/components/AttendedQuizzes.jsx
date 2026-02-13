import React, { useEffect } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";

// State Management
import useAuth from "../../../stores/store";
import useHistoryStore from "../../../stores/historyStore";

// MUI Components
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  LinearProgress,
  CircularProgress,
  Chip,
  Avatar
} from "@mui/material";

// Icons
import { 
  History, 
  RefreshCw, 
  Calendar, 
  ChevronRight,
  Trophy,
  AlertCircle
} from "lucide-react";
import { getQuizsByHostId } from "../../../services/AuthService";

export default function AttendedQuizzes() {
  const user = useAuth((s) => s.user);
  const attendedQuizzes = useHistoryStore((s) => s.history);
  const loading = useHistoryStore((s) => s.loading);
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);
 console.log("hwllo" , getQuizsByHostId(user.id)); //test
  // --- Logic Preserved ---
  useEffect(() => {
    if (!user?.id) return;
    fetchHistory(user.id); 
  }, [user?.id, fetchHistory]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    try {
      await fetchHistory(user.id, { force: true });
      toast.success("History refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh history.");
    }
  };

  // --- Helper for Score Color ---
  const getScoreColor = (score, total) => {
    if (!total) return "#9ca3af"; // Gray
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "#22c55e"; // Green
    if (percentage >= 50) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  const getStatusLabel = (score, total) => {
      if (!total) return "Completed";
      const percentage = (score / total) * 100;
      return percentage >= 50 ? "Passed" : "Needs Improvement";
  };

  // --- Colors ---
  const cyanMain = "#0891b2";
  const cyanLight = "#ecfeff";

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
             <History size={24} strokeWidth={2.5} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
              Participation History
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Track your progress over time
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={handleRefresh}
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
          {loading ? "Refreshing..." : "Refresh List"}
        </Button>
      </Box>

      {/* Loading State */}
      {loading && attendedQuizzes.length === 0 && (
         <Paper 
            elevation={0} 
            sx={{ 
                p: 6, 
                textAlign: 'center', 
                border: '1px dashed', 
                borderColor: 'grey.300', 
                borderRadius: 4, 
                bgcolor: 'grey.50' 
            }}
         >
            <CircularProgress size={28} sx={{ color: cyanMain, mb: 2 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Loading your quiz history...</Typography>
         </Paper>
      )}

      {/* Empty State */}
      {!loading && attendedQuizzes.length === 0 && (
         <Paper 
            elevation={0} 
            sx={{ 
                p: 8, 
                textAlign: 'center', 
                border: '1px solid', 
                borderColor: 'grey.200', 
                borderRadius: 4,
                bgcolor: 'white'
            }}
         >
            <Box sx={{ color: 'grey.300', mb: 2 }}><AlertCircle size={56} /></Box>
            <Typography variant="h6" color="text.secondary" fontWeight={700} gutterBottom>No history found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: "auto" }}>
                You haven't participated in any quizzes yet. Join a quiz to see your results here!
            </Typography>
         </Paper>
      )}

      {/* List of Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {attendedQuizzes.map((item) => {
          const scoreColor = getScoreColor(item.score, item.totalQuestions);
          const percentage = item.totalQuestions > 0 ? (item.score / item.totalQuestions) * 100 : 0;
          const statusLabel = getStatusLabel(item.score, item.totalQuestions);

          return (
            <Link 
              key={item.id} 
              to={`/quizAnalytics/${item.quizId}/participant/${item.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "grey.200",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  bgcolor: "white",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
                    borderColor: cyanMain,
                    "& .action-text": { opacity: 1, transform: "translateX(0)" }
                  }
                }}
              >
                {/* Visual Status Indicator Strip on Left */}
                <Box 
                    sx={{ 
                        position: "absolute", 
                        left: 0, 
                        top: 0, 
                        bottom: 0, 
                        width: "6px", 
                        bgcolor: scoreColor 
                    }} 
                />

                <Grid container alignItems="center" spacing={3}>
                  
                  {/* Icon / Avatar */}
                  <Grid item xs={12} sm="auto">
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: cyanLight,
                        color: cyanMain,
                        borderRadius: 3
                      }}
                    >
                       <Trophy size={26} strokeWidth={2} />
                    </Avatar>
                  </Grid>

                  {/* Main Info */}
                  <Grid item xs={12} sm>
                     <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ fontSize: "1.1rem" }}>
                            {item.quizName}
                        </Typography>
                        <Chip 
                            label={statusLabel} 
                            size="small" 
                            sx={{ 
                                height: 22, 
                                fontSize: "0.7rem", 
                                fontWeight: 700, 
                                bgcolor: percentage >= 50 ? "#f0fdf4" : "#fef2f2", 
                                color: percentage >= 50 ? "#166534" : "#991b1b",
                                border: "1px solid",
                                borderColor: percentage >= 50 ? "#bbf7d0" : "#fecaca"
                            }} 
                        />
                     </Box>
                     
                     <Box sx={{ display: "flex", alignItems: "center", gap: 3, color: "text.secondary" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                           <Calendar size={15} />
                           <Typography variant="body2" fontWeight={500}>
                              {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Date N/A"}
                           </Typography>
                        </Box>
                        <Typography variant="body2" color="grey.400">•</Typography>
                        <Typography variant="body2" fontWeight={500}>
                           Hosted by {item.hostName || "QuizIt Host"}
                        </Typography>
                     </Box>
                  </Grid>

                  {/* Score Section */}
                  <Grid item xs={12} sm={5} md={4}>
                      <Box sx={{ pl: { sm: 2 }, borderLeft: { sm: "1px solid #f3f4f6" } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Result
                          </Typography>
                          <Typography variant="h6" fontWeight={800} sx={{ color: scoreColor }}>
                            {item.score || 9}<span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 600 }}>/{item.totalQuestions || 10}</span>
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5, 
                            bgcolor: "grey.100", 
                            mb: 1.5,
                            "& .MuiLinearProgress-bar": { bgcolor: scoreColor, borderRadius: 5 } 
                          }}
                        />
                        
                        <Box 
                            className="action-text"
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end', 
                                color: cyanMain, 
                                fontWeight: 700, 
                                fontSize: "0.85rem",
                                opacity: 0.8,
                                transform: "translateX(-5px)",
                                transition: "all 0.3s ease"
                            }}
                        >
                           View Analytics <ChevronRight size={16} />
                        </Box>
                      </Box>
                  </Grid>

                </Grid>
              </Paper>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}