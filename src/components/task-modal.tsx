import { Box } from "@chakra-ui/react";
import { useTasks } from "../contexts/task-context";
import EditTask from "./task-edit";
import { DialogBody, DialogContent, DialogRoot } from "./ui/dialog";
export default function TaskEditModal() {
  const { modalTask, setModalTask } = useTasks();
  const onClose = () => {
    void setModalTask(null);
  };
  return (
    <DialogRoot
      open={modalTask !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <DialogContent bg={"transparent"} color={"brand.4"} height={"90vh"} width={"90vw"} maxH={"90vh"} maxW={"90vw"}>
        <DialogBody height={"90vh"} width={"90vw"} p={0}>
          <Box bg={"black"} color={"brand.4"} height={"90vh"} width={"90vw"}>
            {modalTask && (
              <EditTask task={modalTask} height={undefined} width={undefined} onComplete={onClose}></EditTask>
            )}
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
