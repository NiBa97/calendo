import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import { Box, IconButton, useBreakpointValue } from "@chakra-ui/react";
import Sidebar from "./components/sidebar";
import LoginPopup from "./components/login-popup";
import { FaChevronRight } from "react-icons/fa";
import Dashboard from "./pages/dashboard";
import NotesPage from "./pages/notes";
import CalendarPage from "./pages/calendar/main";
import { checkIfLoggedIn } from "./pocketbaseUtils";
import TasksPage from "./pages/tasks/main";

const ProtectedApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const variant = useBreakpointValue({ base: "drawer", md: "sidebar" }) as
    | "drawer"
    | "sidebar";

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Box minH="100vh">
      <Sidebar
        isOpen={isSidebarOpen}
        variant={variant || "sidebar"}
        onClose={closeSidebar}
      />

      {/* Mobile Header */}
      {variant === "drawer" && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          p="sm"
          zIndex={10}
        >
          <IconButton aria-label="Open menu" onClick={openSidebar} size="sm">
            <FaChevronRight />
          </IconButton>
        </Box>
      )}

      <Box
        ml={variant === "sidebar" ? "200px" : "0"}
        p="md"
        bg="backgroundPrimary"
        minH={"100dvh"}
      >
        <Routes>
          <Route path="" element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TasksPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/:id" element={<NotesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(checkIfLoggedIn());

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Box>
      <Router>
        {!isLoggedIn && <LoginPopup onLoginSuccess={handleLoginSuccess} />}
        <Routes>
          <Route
            path="/*"
            element={isLoggedIn ? <ProtectedApp /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </Box>
  );
}

export default App;
