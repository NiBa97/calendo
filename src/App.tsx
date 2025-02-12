import { Flex } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";
import Login from "./pages/login";

export default function App() {
  return (
    <Flex h="100vh" w="100vw">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <DashboardLayout>
                <Routes>
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/" element={<Tasks />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </Flex>
  );
}
