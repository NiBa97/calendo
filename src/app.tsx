import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "./layouts/dashboardLayout";
import Notes from "./pages/notes";
import Tasks from "./pages/tasks";
import List from "./pages/list";
import Login from "./pages/login";
import { checkIfLoggedIn, getPb } from "./pocketbaseUtils";
import { TaskProvider } from "./contexts/task-context";
import TaskEditModal from "./components/task-modal";
import { NoteProvider } from "./contexts/note-context";
import { OperationStatusProvider } from "./contexts/operation-status-context";
import { TagProvider } from "./contexts/tag-context";
import { Toaster } from "./components/ui/toaster";
import NoteEditModal from "./components/note-modal";
import GlobalSearch from "./components/ui/GlobalSearch";

const ProtectedApp = () => {

  return (
    <OperationStatusProvider>
      <TaskProvider>
        <NoteProvider>
          <TagProvider>
            <Toaster />
            <DashboardLayout>
              <GlobalSearch />
              <Routes>
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:id" element={<Tasks />} />
                <Route path="notes" element={<Notes />} />
                <Route path="notes/:id" element={<Notes />} />
                <Route path="list" element={<List />} />
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
  const [isLoggedIn, setIsLoggedIn] = useState(checkIfLoggedIn());

  useEffect(() => {
    const pb = getPb();
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });

    return unsubscribe;
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={isLoggedIn ? <ProtectedApp /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
