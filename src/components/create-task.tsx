import { useState } from "react";
import { Box, Field, HStack } from "@chakra-ui/react";
import { BrandInput } from "./ui/brand-input";
import { BrandButton } from "./ui/brand-button";
// import { useToast } from "@chakra-ui/toast";
import { FaPlus } from "react-icons/fa6";

import { useTasks } from "../features/tasks/contexts/task-context";
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
            <BrandInput
              placeholder="Add new unscheduled task"
              border="none"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              size="md"
              borderRadius="md"
              _placeholder={{
                color: "white",
                opacity: 0.5,
              }}
            />
          </Field.Root>
          <BrandButton
            onClick={handleCreateTask}
            variant="primary"
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Create
          </BrandButton>
        </HStack>
      </form>
    </Box>
  );
};

export default CreateTask;
