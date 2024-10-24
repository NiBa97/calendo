import { Button, Flex, Icon } from "@chakra-ui/react";
import React from "react";
import CalendarPopup from "./calendar/popup";
import { useTasks } from "~/contexts/task-context";
import { FaCopy, FaStop, FaTrash } from "react-icons/fa6";

const TaskMenu = () => {
  const { createTask, deleteTask, updateTask, contextInformation, setContextInformation } = useTasks();
  if (!contextInformation) return null;

  const handleDelete = () => {
    void deleteTask(contextInformation.task.id);
    setContextInformation(undefined);
  };

  const handleDuplicate = () => {
    void createTask({
      name: contextInformation.task.name,
      description: contextInformation.task.description ?? undefined,
      startDate: contextInformation.task.startDate ?? undefined,
      endDate: contextInformation.task.endDate ?? undefined,
      isAllDay: contextInformation.task.isAllDay,
      status: contextInformation.task.status,
      groupId: contextInformation.task.groupId ?? undefined,
    });
    setContextInformation(undefined);
  };

  const handleUnschedule = () => {
    void updateTask(contextInformation.task.id, { startDate: null, endDate: null });
    setContextInformation(undefined);
  };
  return (
    contextInformation && (
      <CalendarPopup
        onClose={() => setContextInformation(undefined)}
        position={{ top: contextInformation.y, left: contextInformation.x }}
      >
        <Flex direction={"column"} bg={"brand.1"} borderRadius={"md"} border={"none"} zIndex={999}>
          <Button leftIcon={<Icon as={FaCopy} />} onClick={handleDuplicate} justifyContent="flex-start">
            Duplicate
          </Button>
          <Button
            leftIcon={<Icon as={FaStop} />}
            justifyContent="flex-start"
            onClick={handleUnschedule}
            borderRadius={"none"}
          >
            Unschedule
          </Button>
          <Button
            leftIcon={<Icon as={FaTrash} />}
            justifyContent="flex-start"
            onClick={handleDelete}
            borderRadius={"none"}
          >
            Delete
          </Button>
        </Flex>
      </CalendarPopup>
    )
  );
};
export default TaskMenu;
