import { Flex } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";
import Login from "./pages/login";
import { checkIfLoggedIn } from "./pocketbaseUtils";
import {} from "react-router-dom";
import { TaskProvider } from "./contexts/task-context";

const AuthRoute = ({ children }) => {
  return checkIfLoggedIn() ? children : <Navigate to="/login" />;
};

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
                  <Route
                    path="/notes"
                    element={
                      <AuthRoute>
                        <Notes />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <AuthRoute>
                        <TaskProvider>
                          <Tasks />
                        </TaskProvider>
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <AuthRoute>
                        <TaskProvider>
                          <Tasks />
                        </TaskProvider>
                      </AuthRoute>
                    }
                  />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </Flex>
  );
}
