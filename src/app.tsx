import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/dashboardLayout";
import Calendar from "./pages/calendar/calendar";
import List from "./pages/list/list";
import Login from "./pages/login";
import { checkIfLoggedIn } from "./pocketbaseUtils";
import { TaskProvider } from "./contexts/task-context";
import TaskEditModal from "./components/task/task-modal";
import { NoteProvider } from "./contexts/note-context";
import { OperationStatusProvider } from "./contexts/operation-status-context";
import { TagProvider } from "./contexts/tag-context";
import { Toaster } from "./components/ui/toaster";
import NoteEditModal from "./components/note/note-modal";
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
                <Route path="tasks" element={<Calendar />} />
                <Route path="tasks/:id" element={<Calendar />} />
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
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={checkIfLoggedIn() ? <ProtectedApp /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
