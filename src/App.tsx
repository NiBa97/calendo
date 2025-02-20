import { Flex } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";
import Login from "./pages/login";
import { checkIfLoggedIn } from "./pocketbaseUtils";
import { TaskProvider } from "./contexts/task-context";
import TaskEditModal from "./components/task-modal";
import { NoteProvider } from "./contexts/note-context";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
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
                <TaskProvider>
                  <NoteProvider>
                    <TaskEditModal />
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
                        path="/notes/:id"
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
                            <Tasks />
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
                  </NoteProvider>
                </TaskProvider>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </Flex>
  );
}
