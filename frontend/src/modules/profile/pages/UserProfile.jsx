import { Box, Container, Grid } from "@mui/material";
import ProfileSidebar from "../components/ProfileSidebar";
import ActivityFeed from "../components/ActivityFeed";
import useAuth from "../../../stores/store";
import { useEffect } from "react";
import toast from "react-hot-toast";
export default function UserProfile() {
  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);
  const bgGradient = "linear-gradient(180deg, #f0f9ff 0%, #fff7ed 100%)";
  useEffect(() => {
    checkLogin();
  }, [checkLogin]);
// console.log(user)
  const handleEditProfile = () => {
    // This is now workable - you can trigger a modal or navigation here
    toast.success("Opening profile editor...");
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: "#0891b2" }} />
      </Box>
    );
  }

  // Map the real user data from your JSON object
  const mappedUser = {
    id:user.id,
    name: user.username || "Anonymous User",
    role: user.roles?.length > 0 ? user.roles[0] : "Quiz Enthusiast",
    location: "India", // Default or you can add to user model
    website: user.email, 
    joined: new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'year' === 'year' ? 'numeric' : 'numeric' }),
    stats: { 
        accuracy: 82, // These could be fetched from a separate stats endpoint
        streak: 5 
    }
  };

  const activities = [
    { id: 1, type: "PARTICIPATED", title: "Java Masterclass Quiz", date: "2 hours ago", score: 92, total: 100, status: "Passed" },
    { id: 2, type: "HOSTED", title: "React Hooks Challenge", date: "Yesterday", participants: 156, avgScore: 68, status: "Completed" }
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: bgGradient, py: { xs: 3, md: 6 }, px: { xs: 1, md: 2 } }}>
      <Container maxWidth={false} sx={{ maxWidth: '1600px', mx: 'auto' }}>
        <Grid container spacing={{ xs: 3, md: 4, lg: 6 }}> 
          <Grid item xs={12} md={5} lg={4}>
            <Box sx={{ width: '100%' }}>
               <ProfileSidebar userProfile={mappedUser} />
            </Box>
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <ActivityFeed activities={activities} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}