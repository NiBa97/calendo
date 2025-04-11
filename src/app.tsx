import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";
import List from "./pages/list";
import CombinedListPage from "./pages/combined-list";
import Login from "./pages/login";
import { checkIfLoggedIn } from "./pocketbaseUtils";
import { TaskProvider } from "./contexts/task-context";
import TaskEditModal from "./components/task-modal";
import { NoteProvider } from "./contexts/note-context";
import { OperationStatusProvider } from "./contexts/operation-status-context";
import { TagProvider } from "./contexts/tag-context";
import { Toaster } from "./components/ui/toaster";
import NoteEditModal from "./components/note-modal";

const ProtectedApp = () => {
  return (
    <OperationStatusProvider>
      <TaskProvider>
        <NoteProvider>
          <TagProvider>
            <Toaster />
            <DashboardLayout>
              <Routes>
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:id" element={<Tasks />} />
                <Route path="notes" element={<Notes />} />
                <Route path="notes/:id" element={<Notes />} />
                <Route path="list" element={<List />} />
                <Route path="combined" element={<CombinedListPage />} />
                <Route path="*" element={<Navigate to="/tasks" replace />} />
              </Routes>
            </DashboardLayout>
            <TaskEditModal />
            <NoteEditModal />
          </TagProvider>
        </NoteProvider>
      </TaskProvider>
    </OperationStatusProvider>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={checkIfLoggedIn() ? <ProtectedApp /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
