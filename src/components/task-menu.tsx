import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { Task } from "@prisma/client";
import React from "react";
import CalendarPopup from "./calendar/popup";
import { useTasks } from "~/contexts/task-context";
import { FaCopy, FaStop, FaTrash } from "react-icons/fa6";

const TaskMenu = ({ task, x, y, onClose }: { task: Task; x: number; y: number; onClose: () => void }) => {
  const { createTask, deleteTask, updateTask } = useTasks();

  const handleDelete = () => {
    void deleteTask(task.id);
    onClose();
  };

  const handleDuplicate = () => {
    void createTask({
      name: task.name,
      description: task.description ?? undefined,
      startDate: task.startDate ?? undefined,
      endDate: task.endDate ?? undefined,
      isAllDay: task.isAllDay,
      status: task.status,
      groupId: task.groupId ?? undefined,
    });
    onClose();
  };

  const handleUnschedule = () => {
    void updateTask(task.id, { startDate: null, endDate: null });
    onClose();
  };
  return (
    <CalendarPopup onClose={onClose} position={{ top: y, left: x }}>
      <Flex direction={"column"} bg={"gray.800"} borderRadius={"md"} border={"none"} zIndex={999}>
        <Button
          leftIcon={<Icon as={FaCopy} />}
          bg={"gray.800"}
          color={"white"}
          onClick={handleDuplicate}
          justifyContent="flex-start"
        >
          Duplicate
        </Button>
        <Button
          leftIcon={<Icon as={FaStop} />}
          bg={"gray.800"}
          color={"white"}
          justifyContent="flex-start"
          onClick={handleUnschedule}
          borderRadius={"none"}
        >
          Unschedule
        </Button>
        <Button
          leftIcon={<Icon as={FaTrash} />}
          bg={"gray.800"}
          color={"white"}
          justifyContent="flex-start"
          onClick={handleDelete}
          borderRadius={"none"}
        >
          Delete
        </Button>
      </Flex>
    </CalendarPopup>
  );
};
export default TaskMenu;
