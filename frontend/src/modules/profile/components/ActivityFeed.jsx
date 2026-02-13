import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";

// Components
import AttendedQuizzes from "./AttendedQuizzes";
import HostedQuizzes from "./HostedQuizzes"; // The new component we created

/**
 * ActivityFeed Component
 * * Handles the high-level state for switching between 
 * Quizzes the user has joined (Participated) and 
 * Quizzes the user has created (Hosted).
 */
export default function ActivityFeed() {
  const [filter, setFilter] = useState("HOSTED"); 
  const cyanMain = "#0891b2";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      
      {/* --- Header & Navigation Section --- */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" }, 
          gap: 2, 
          mb: 4 
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Your recent quiz history and management sessions
          </Typography>
        </Box>

        {/* --- Toggle Switch (Hosted vs Participated) --- */}
        <Box 
          sx={{ 
            bgcolor: "white", 
            p: 0.6, 
            borderRadius: 3, 
            border: "1px solid", 
            borderColor: "grey.200", 
            display: "flex", 
            width: { xs: '100%', sm: 'auto' },
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
          }}
        >
          {["HOSTED", "PARTICIPATED"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              fullWidth
              sx={{
                borderRadius: 2.5,
                textTransform: "capitalize",
                fontSize: "0.9rem",
                fontWeight: 700,
                px: { xs: 2, sm: 3 },
                py: 1,
                transition: "all 0.2s ease",
                bgcolor: filter === f ? cyanMain : "transparent",
                color: filter === f ? "white" : "text.secondary",
                "&:hover": { 
                  bgcolor: filter === f ? cyanMain : "grey.100",
                  color: filter === f ? "white" : cyanMain 
                }
              }}
            >
              {f.toLowerCase()}
            </Button>
          ))}
        </Box>
      </Box>

      {/* --- Main Content Area --- */}
      <Box sx={{ minHeight: "400px" }}>
        {filter === "PARTICIPATED" ? (
          <AttendedQuizzes />
        ) : (
          <HostedQuizzes />
        )}
      </Box>

      {/* --- Footer Note (Optional) --- */}
      <Box sx={{ mt: 6, textAlign: "center", opacity: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Showing data from the last 30 days • Updated in real-time
        </Typography>
      </Box>

    </Box>
  );
}