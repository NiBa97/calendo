import { useState } from "react";
import { Box, Button, FormControl, HStack, Input, InputGroup, InputLeftElement, useToast } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa6";

import { useTasks } from "../contexts/task-context";
const AddTask = () => {
  const [taskName, setTaskName] = useState("");
  const { createTask } = useTasks();
  const toast = useToast();

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      throw new Error("Task name cannot be empty");
    }

    createTask({ name: taskName.trim() })
      .then(() => {
        setTaskName("");
        toast({
          title: "Task created",
          description: "A new task has been created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "An error occurred while creating the task.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Box width={"100%"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTask();
        }}
      >
        <HStack p={4}>
          <FormControl id="taskName">
            <InputGroup size="md">
              <InputLeftElement bg={"brand.2"}>
                <FaPlus />
              </InputLeftElement>
              <Input
                placeholder="Add new unscheduled task"
                bg={"brand.2"}
                border={"none"}
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <Button onClick={handleCreateTask}>Create</Button>
        </HStack>
      </form>
    </Box>
  );
};

export default AddTask;
