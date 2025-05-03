import { Button, Flex } from "@chakra-ui/react";
import CalendarPopup from "./calendar/popup";
import { FaCopy, FaStop, FaTrash } from "react-icons/fa6";
import { useTasks } from "../contexts/task-context";

const TaskContextMenu = () => {
  const { createTask, deleteTask, updateTask, contextInformation, setContextInformation } = useTasks();
  if (!contextInformation) return null;

  const handleDelete = () => {
    void deleteTask(contextInformation.task.id);
    setContextInformation(undefined);
  };

  const handleDuplicate = () => {
    void createTask({
      title: contextInformation.task.title,
      description: contextInformation.task.description ?? undefined,
      startDate: contextInformation.task.startDate ?? undefined,
      endDate: contextInformation.task.endDate ?? undefined,
      isAllDay: contextInformation.task.isAllDay,
      status: contextInformation.task.status,
    });
    setContextInformation(undefined);
  };

  const handleUnschedule = () => {
    void updateTask(contextInformation.task.id, { startDate: undefined, endDate: undefined });
    setContextInformation(undefined);
  };
  return (
    contextInformation && (
      <CalendarPopup
        onClose={() => setContextInformation(undefined)}
        position={{ top: contextInformation.y, left: contextInformation.x }}
      >
        <Flex direction={"column"} bg={"brand.1"} borderRadius={"md"} border={"none"} zIndex={999}>
          <Button onClick={handleDuplicate} justifyContent="flex-start">
            <FaCopy />
            Duplicate
          </Button>
          <Button justifyContent="flex-start" onClick={handleUnschedule} borderRadius={"none"}>
            <FaStop />
            Unschedule
          </Button>
          <Button justifyContent="flex-start" onClick={handleDelete} borderRadius={"none"}>
            <FaTrash />
            Delete
          </Button>
        </Flex>
      </CalendarPopup>
    )
  );
};
export default TaskContextMenu;
