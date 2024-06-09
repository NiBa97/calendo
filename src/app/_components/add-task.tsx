import { useState } from "react";
import { Button, FormControl, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useTasks } from "../_contexts/task-context";
const AddTask = () => {
  const [taskName, setTaskName] = useState("");
  const { createTask } = useTasks();
  const toast = useToast();

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      throw new Error("Task name cannot be empty");
    }

    await createTask({ name: taskName.trim() })
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
    <Stack spacing={4}>
      <FormControl id="taskName">
        <FormLabel>Task Name</FormLabel>
        <Input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
      </FormControl>
      <Button onClick={handleCreateTask} colorScheme="blue">
        Create Task
      </Button>
    </Stack>
  );
};

export default AddTask;
