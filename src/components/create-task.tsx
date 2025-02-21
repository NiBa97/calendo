import { useState } from "react";
import { Box, Button, Field, HStack, Input } from "@chakra-ui/react";
// import { useToast } from "@chakra-ui/toast";
import { FaPlus } from "react-icons/fa6";

import { useTasks } from "../contexts/task-context";
import { InputGroup } from "./ui/input-group";
import { toaster } from "./ui/toaster";

const CreateTask = () => {
  const [taskName, setTaskName] = useState("");
  const { createTask } = useTasks();
  // const toast = useToast();

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toaster.create({
        title: "Error",
        description: "Task name cannot be empty",
        type: "error",
      });
      return;
    }

    createTask({ name: taskName.trim() })
      .then(() => {
        setTaskName("");
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
    <Box width={"100%"} p={4} mt={"2px"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTask();
        }}
      >
        <HStack>
          <Field.Root id="taskName">
            <InputGroup startElement={<FaPlus />} w={"full"}>
              <Input
                placeholder="Add new unscheduled task"
                bg="brand.2"
                border="none"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </InputGroup>
          </Field.Root>
          <Button onClick={handleCreateTask}>Create</Button>
        </HStack>
      </form>
    </Box>
  );
};

export default CreateTask;
