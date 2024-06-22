import { Checkbox, HStack, Text, VStack } from "@chakra-ui/react";
import { useTasks } from "../_contexts/task-context";

import { Link } from "@chakra-ui/next-js";
import { useEffect, useState } from "react";

const ListTasks: React.FC = () => {
  const { tasks, updateTask } = useTasks();
  const [stateTasks, setStateTasks] = useState(tasks);

  useEffect(() => {
    setStateTasks(tasks);
  }, [tasks]);

  return (
    <VStack width={"100%"} overflowY={"scroll"}>
      {stateTasks.map((task) => (
        <HStack width={"100%"} p={2} bg={"gray.400"} key={task.id}>
          <Checkbox isChecked={task.status} onChange={(_e) => updateTask(task.id, { status: !task.status })}></Checkbox>

          <Link href={"/webapp/" + task.id} cursor="pointer" width={"100%"} _hover={{ cursor: "pointer" }}>
            <Text fontSize="lg">{task.name}</Text>
          </Link>
        </HStack>
      ))}
    </VStack>
  );
};

export default ListTasks;
