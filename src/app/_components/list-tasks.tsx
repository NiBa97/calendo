import { Box, Checkbox, HStack, Text, VStack } from "@chakra-ui/react";
import { useTasks } from "../_contexts/task-context";
import { type Task } from "@prisma/client";

import { Link } from "@chakra-ui/next-js";
import { useEffect, useState } from "react";

const ListTasks: React.FC = () => {
  const { tasks, updateTask } = useTasks();
  const [stateTasks, setStateTasks] = useState(tasks);

  useEffect(() => {
    console.log("tasks update");
    console.log(tasks);
    setStateTasks(tasks);
  }, [tasks]);

  return (
    <VStack width={"100%"}>
      {stateTasks.map((task) => (
        <HStack width={"100%"} p={2} bg={"gray.400"}>
          <Checkbox isChecked={task.status} onChange={(e) => updateTask(task.id, { status: !task.status })}></Checkbox>

          <Link
            key={task.id}
            href={"/webapp/id/" + task.id}
            cursor="pointer"
            width={"100%"}
            _hover={{ cursor: "pointer" }}
          >
            {/* <Box
            key={task.id}
            w={"100%"}
            onClick={() => handleTaskClick(task)}
            cursor="pointer"
            bg="gray.400" // Base color
            _hover={{ bg: "gray.300" }} // Color on hover
            transition="background-color 0.3s ease" // Smooth transition
          > */}

            <Text fontSize="lg">{task.name}</Text>
            {/* </Box> */}
          </Link>
        </HStack>
      ))}
    </VStack>
  );
};

export default ListTasks;
