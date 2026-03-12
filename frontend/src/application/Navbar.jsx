import { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate, useLocation } from "react-router";
import useAuth from "../stores/store";
import toast from "react-hot-toast";

// MUI Components
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// Icons
import {
  Menu as MenuIcon,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Brain,
  LogOut,
  LogIn,
  Rocket,
} from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const { user, logout, checkLogin } = useAuth();
  const role = user?.roles?.[0];
  const dashboardRoute =
    role === "ROLE_ADMIN"
      ? "/admin"
      : role === "ROLE_USER"
        ? "/student/dashboard"
        : "/dashboard"; // teacher default

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  // --- Handlers ---
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const isActive = (path) => location.pathname === path;

  // --- Theme Colors ---
  const colors = {
    cyanText: "#0e7490",
    cyanBg: "#ecfeff",
    orangeText: "#c2410c",
    orangeBg: "#fff7ed",
    orangeMain: "#f97316",
  };

  // --- Mobile Drawer Content ---
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box
        sx={{
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            background: "linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Q
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(to right, #0e7490, #0d9488)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          QuizIt
        </Typography>
      </Box>
      <Divider />

      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard"
                selected={isActive("/dashboard")}
              >
                <ListItemIcon>
                  <LayoutDashboard
                    size={20}
                    color={isActive("/dashboard") ? colors.cyanText : "#666"}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  sx={{
                    color: isActive("/dashboard")
                      ? colors.cyanText
                      : "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/createQuiz"
                selected={isActive("/createQuiz")}
              >
                <ListItemIcon>
                  <PlusCircle
                    size={20}
                    color={isActive("/createQuiz") ? colors.orangeText : "#666"}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Create Quiz"
                  sx={{
                    color: isActive("/createQuiz")
                      ? colors.orangeText
                      : "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogOut size={20} color="#ef4444" />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: "#ef4444" }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/auth">
                <ListItemIcon>
                  <LogIn size={20} />
                </ListItemIcon>
                <ListItemText primary="Log In" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/auth"
                sx={{ bgcolor: colors.orangeBg }}
              >
                <ListItemIcon>
                  <Rocket size={20} color={colors.orangeMain} />
                </ListItemIcon>
                <ListItemText
                  primary="Get Started"
                  sx={{ color: colors.orangeMain, fontWeight: "bold" }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "grey.200",
        color: "text.primary",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* --- LOGO (Desktop) --- */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: "linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)",
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(6, 182, 212, 0.3)",
              }}
            >
              Q
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 4,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                letterSpacing: ".05rem",
                background: "linear-gradient(to right, #0e7490, #0d9488)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QuizIt
            </Typography>
          </Link>

          {/* --- MOBILE HAMBURGER --- */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* --- LOGO (Mobile Center) --- */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                background: "linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Q
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                background: "linear-gradient(to right, #0e7490, #0d9488)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QuizIt
            </Typography>
          </Box>

          {/* --- DESKTOP NAV ITEMS --- */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              gap: 2,
              alignItems: "center",
            }}
          >
            {user && (
              <>
                <Button
                  component={Link}
                  to={dashboardRoute}
                  startIcon={<LayoutDashboard size={18} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 2,
                    color: isActive(dashboardRoute)
                      ? colors.cyanText
                      : "text.secondary",
                    bgcolor: isActive(dashboardRoute)
                      ? colors.cyanBg
                      : "transparent",
                    "&:hover": {
                      bgcolor: colors.cyanBg,
                      color: colors.cyanText,
                    },
                  }}
                >
                  Dashboard
                </Button>
              </>
            )}
            {user && role === "ROLE_TEACHER" && (
              <>
                <Button
                  component={Link}
                  to="/createQuiz"
                  startIcon={<PlusCircle size={18} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 2,
                    color: isActive("/createQuiz")
                      ? colors.orangeText
                      : "text.secondary",
                    bgcolor: isActive("/createQuiz")
                      ? colors.orangeBg
                      : "transparent",
                    "&:hover": {
                      bgcolor: colors.orangeBg,
                      color: colors.orangeText,
                    },
                  }}
                >
                  Create Quiz
                </Button>
              </>
            )}
          </Box>

          {/* --- RIGHT SIDE (Profile / Auth) --- */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: 0,
                      ml: 2,
                      border: "2px solid white",
                      boxShadow: "0 0 0 2px #ecfeff",
                    }}
                  >
                    <Avatar
                      alt={user.username}
                      src={"/static/images/avatar/2.jpg"}
                      sx={{ bgcolor: colors.cyanText }}
                    >
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 3, minWidth: 200, mt: 1 },
                  }}
                >
                  {/* Clickable Username Header */}
                  <Box
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate(`/profile/${user.username}`);
                    }}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: colors.cyanText,
                        display: "block",
                      }}
                    >
                      {user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      View Profile
                    </Typography>
                  </Box>

                  <Divider />

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate(dashboardRoute);
                    }}
                  >
                    <ListItemIcon>
                      <LayoutDashboard size={16} />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>

                  {/* Added explicit Profile Link for better UX */}
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate(`/profile/${user.username}`);
                    }}
                  >
                    <ListItemIcon>
                      <PlusCircle
                        size={16}
                        style={{ transform: "rotate(45deg)" }}
                      />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>

                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                      <LogOut size={16} color="#ef4444" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  component={Link}
                  to="/auth"
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  Log In
                </Button>
                <Button
                  component={Link}
                  to="/auth"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    bgcolor: colors.orangeMain,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: colors.orangeText,
                      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)",
                    },
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
