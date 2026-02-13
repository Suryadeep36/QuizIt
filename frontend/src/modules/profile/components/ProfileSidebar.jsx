import {
  Box, Paper, Typography, Avatar, Button, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Use Grid2 for the size prop
import { Edit, MapPin, Link as LinkIcon, Calendar, Target, Zap, Camera, X, Lock, User, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

import useAuth from "../../../stores/store";

export default function ProfileSidebar({ userProfile }) {
  // console.log(userProfile)
  const [open, setOpen] = useState(false);
  const updateUser = useAuth(state => state.updateUser)
  const [editData, setEditData] = useState({
    username: userProfile.name,
    password: "",
    confirmPassword: "", // Added confirmPassword state
    image: userProfile.image,
    file: null
  });

  const cyanMain = "#0891b2";
  const orangeMain = "#ea580c";

  // --- Handlers ---
  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    // Reset passwords on close
    setEditData(prev => ({ ...prev, password: "", confirmPassword: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditData((prev) => ({
        ...prev,
        image: previewUrl,
        file: file
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // 1. Logic check: If password is being changed, ensure they match
    if (editData.password && editData.password !== editData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    var newUserProfile =  {
        id:userProfile.id,
        username: editData.username,
        image: editData.image
      }
    if(editData.password.length != 0){
       newUserProfile = {...newUserProfile,password:editData.password}
    }
    try {
      const response = await updateUser(newUserProfile)
      handleClose();
        console.log(response);
    } catch (err) {
       toast.error(
        err.response?.data?.message ||
        err.message ||
        "Profile not updated!"
      );
    } 


    toast.success("Profile updated successfully!");
    handleClose();
  };

  return (
    <Box sx={{ position: { md: "sticky" }, top: { md: 24 }, width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          textAlign: "center",
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          mb: 3
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
          <Avatar
            src={userProfile.image || undefined}
            sx={{
              width: { xs: 100, md: 120 },
              height: { xs: 100, md: 120 },
              mx: "auto",
              bgcolor: cyanMain,
              fontSize: 40,
              boxShadow: "0 8px 24px rgba(8, 145, 178, 0.25)"
            }}
          >
            {userProfile.name?.charAt(0)}
          </Avatar>
          <Box sx={{ position: "absolute", bottom: 5, right: 5, width: 20, height: 20, bgcolor: "#22c55e", borderRadius: "50%", border: "3px solid white" }} />
        </Box>

        <Typography variant="h5" fontWeight={800}>{userProfile.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{userProfile.role}</Typography>

        <Button
          fullWidth
          variant="contained"
          startIcon={<Edit size={16} />}
          onClick={handleOpen}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "text.primary",
            py: 1.2,
            "&:hover": { bgcolor: "black" }
          }}
        >
          Edit Profile
        </Button>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 2 }}>
          <InfoItem icon={<MapPin size={18} />} text={userProfile.location} />
          <InfoItem icon={<LinkIcon size={18} />} text={userProfile.website} highlight />
          <InfoItem icon={<Calendar size={18} />} text={`Joined ${userProfile.joined}`} />
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={6}>
          <StatBox label="Accuracy" value={`${userProfile.stats.accuracy}%`} color={cyanMain} icon={<Target size={20} />} />
        </Grid>
        <Grid size={6}>
          <StatBox label="Streak" value={`${userProfile.stats.streak} Days`} color={orangeMain} icon={<Zap size={20} />} />
        </Grid>
      </Grid>

      {/* --- EDIT PROFILE MODAL --- */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
          Edit Profile
          <IconButton onClick={handleClose} size="small"><X size={20} /></IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

            {/* Image Upload Preview */}
            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <Avatar
                src={editData.image || undefined}
                sx={{ width: 100, height: 100, bgcolor: cyanMain }}
              >
                {editData.username?.charAt(0)}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: 'absolute', bottom: 0, right: '35%',
                  bgcolor: 'white', border: '1px solid', borderColor: 'grey.300',
                  '&:hover': { bgcolor: 'grey.100' },
                  boxShadow: 2
                }}
              >
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                <Camera size={16} color={cyanMain} />
              </IconButton>
            </Box>

            <TextField
              label="Username"
              name="username"
              value={editData.username}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              InputProps={{ startAdornment: <User size={18} style={{ marginRight: 8, color: '#666' }} /> }}
            />

            <TextField
              label="New Password"
              name="password"
              type="password"
              value={editData.password}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="Leave blank to keep current"
              InputProps={{ startAdornment: <Lock size={18} style={{ marginRight: 8, color: '#666' }} /> }}
            />

            {/* Added Confirm Password Input Box */}
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={editData.confirmPassword}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              error={editData.password !== editData.confirmPassword && editData.confirmPassword !== ""}
              helperText={editData.password !== editData.confirmPassword && editData.confirmPassword !== "" ? "Passwords do not match" : ""}
              InputProps={{ startAdornment: <ShieldCheck size={18} style={{ marginRight: 8, color: '#666' }} /> }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: cyanMain, borderRadius: 2, textTransform: 'none', px: 4, '&:hover': { bgcolor: '#0e7490' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function InfoItem({ icon, text, highlight = false }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: highlight ? "#0891b2" : "text.secondary" }}>
      {icon}
      <Typography variant="body2" fontWeight={highlight ? 600 : 400} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {text}
      </Typography>
    </Box>
  );
}

function StatBox({ label, value, color, icon }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "white", border: "1px solid", borderColor: "grey.200", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Box sx={{ color: color }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={800}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
    </Paper>
  );
}