import { useState } from "react";
import { Box, Button, Field, HStack, Input } from "@chakra-ui/react";
// import { useToast } from "@chakra-ui/toast";
import { FaPlus } from "react-icons/fa6";

import { useTasks } from "../contexts/task-context";
import { toaster } from "./ui/toaster";

const CreateTask = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const { createTask } = useTasks();
  // const toast = useToast();

  const handleCreateTask = () => {
    if (!taskTitle.trim()) {
      toaster.create({
        title: "Error",
        description: "Task title cannot be empty",
        type: "error",
      });
      return;
    }

    createTask({ title: taskTitle.trim() })
      .then(() => {
        setTaskTitle("");
        toaster.create({
          title: "Success",
          description: "A new task has been created successfully.",
          type: "success",
        });
      })
      .catch((error: Error) => {
        toaster.create({
          title: "Error",
          description: error.message || "An error occurred while creating the task.",
          type: "error",
        });
      });
  };

  return (
    <Box width={"100%"} my={"3"} borderColor="brand.2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTask();
        }}
      >
        <HStack gap={3}>
          <Field.Root id="taskName" width="full">
            <Input
              placeholder="Add new unscheduled task"
              bg="brand.2"
              border="none"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              size="md"
              borderRadius="md"
              color="white"
              _placeholder={{
                color: "white",
                opacity: 0.5,
              }}
              _focus={{
                boxShadow: "0 0 0 1px #00ADB5",
              }}
            />
          </Field.Root>
          <Button
            onClick={handleCreateTask}
            bg="brand.3"
            color="brand.4"
            _hover={{
              bg: "teal.500",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
            _active={{
              bg: "teal.600",
              transform: "translateY(0)",
            }}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Create
          </Button>
        </HStack>
      </form>
    </Box>
  );
};

export default CreateTask;
