import * as React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import HistoryIcon from "@mui/icons-material/History";
import ReportIcon from "@mui/icons-material/Report";
import Home from "./screens/CallingScreen"; // Calling screen
import CallLogs from "./screens/CallLogs"; // Call history
import FraudNews from "./screens/FraudNews"; // Fraud-related news

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the selected tab based on the current URL
  const getTabIndex = () => {
    if (location.pathname === "/") return 0;
    if (location.pathname === "/call-logs") return 1;
    if (location.pathname === "/fraud-news") return 2;
    return 0;
  };

  return (
    <BottomNavigation
      showLabels
      value={getTabIndex()}
      onChange={(event, newValue) => {
        if (newValue === 0) navigate("/");
        if (newValue === 1) navigate("/call-logs");
        if (newValue === 2) navigate("/fraud-news");
      }}
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "#333",
        color: "white",
      }}
    >
      <BottomNavigationAction label="Call" icon={<CallIcon />} value={0} />
      <BottomNavigationAction label="Logs" icon={<HistoryIcon />} value={1} />
      <BottomNavigationAction label="Fraud News" icon={<ReportIcon />} value={2} />
    </BottomNavigation>
  );
}

export default function App() {
  return (
    <Router>
      <div style={{ paddingBottom: "60px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/call-logs" element={<CallLogs />} />
          <Route path="/fraud-news" element={<FraudNews />} />
        </Routes>
      </div>
      <Navigation />
    </Router>
  );
}
