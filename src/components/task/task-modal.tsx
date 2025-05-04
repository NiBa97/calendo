import { Dialog } from "@chakra-ui/react";
import { useTasks } from "../../contexts/task-context";
import EditTask from "./task-edit";
import { useRef } from "react";
export default function TaskEditModal() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { modalTask, setModalTask } = useTasks();
  const onClose = () => {
    void setModalTask(null);
  };
  return (
    <Dialog.Root
      open={modalTask !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          bg={"transparent"}
          color={"brand.4"}
          height={"90vh"}
          width={"90vw"}
          maxH={"90vh"}
          maxW={"90vw"}
          ref={contentRef}
        >
          <Dialog.Body height={"90vh"} width={"90vw"} p={0}>
            {/* <Box bg={"black"} color={"brand.4"} height={"90vh"} width={"90vw"}> */}
            {modalTask && (
              <EditTask
                contentDialogRef={contentRef}
                task={modalTask}
                height={undefined}
                width={undefined}
                onComplete={onClose}
              ></EditTask>
            )}
            {/* </Box> */}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
