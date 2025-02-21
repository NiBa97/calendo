import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";
import Login from "./pages/login";
import { checkIfLoggedIn } from "./pocketbaseUtils";
import { TaskProvider } from "./contexts/task-context";
import TaskEditModal from "./components/task-modal";
import { NoteProvider } from "./contexts/note-context";
import { OperationStatusProvider } from "./contexts/operation-status-context";
import { Toaster } from "./components/ui/toaster";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  return checkIfLoggedIn() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthRoute>
      <OperationStatusProvider>
        <TaskProvider>
          <NoteProvider>
            <Toaster />
            <Router>
              <DashboardLayout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Tasks />}>
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="notes/:id" element={<Notes />} />
                    <Route index element={<Navigate to="/tasks" replace />} />
                  </Route>
                </Routes>
              </DashboardLayout>
            </Router>
            <TaskEditModal />
          </NoteProvider>
        </TaskProvider>
      </OperationStatusProvider>
    </AuthRoute>
  );
}

export default App;
