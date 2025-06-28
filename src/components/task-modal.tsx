import { useTasks } from "../contexts/task-context";
import EditTask from "./task-edit";
import { useRef } from "react";
import { AppModal } from "./ui/app-modal";
export default function TaskEditModal() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { modalTask, setModalTask } = useTasks();
  const onClose = () => {
    void setModalTask(null);
  };
  return (
    <AppModal
      isOpen={modalTask !== null}
      onClose={onClose}
      contentRef={contentRef}
      size="lg"
    >
      {modalTask && (
        <EditTask
          contentDialogRef={contentRef}
          task={modalTask}
          height={undefined}
          width={undefined}
          onComplete={onClose}
        />
      )}
    </AppModal>
  );
}
