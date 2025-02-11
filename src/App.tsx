import { Flex } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";

export default function App() {
  return (
    <Flex h="100vh" w="100vw">
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/" element={<Tasks />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </Flex>
  );
}
