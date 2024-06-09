import { Box, Text, VStack } from "@chakra-ui/react";
import { useTasks } from "../_contexts/task-context";
import { type Task } from "@prisma/client";

type TaskListProps = {
  onTaskClick: (task: Task) => void;
};
const ListTasks: React.FC<TaskListProps> = ({ onTaskClick }) => {
  const { tasks } = useTasks();

  const handleTaskClick = (task: Task) => {
    onTaskClick(task);
  };

  return (
    <VStack w={"100%"}>
      {tasks.map((task) => (
        <Box
          key={task.id}
          w={"100%"}
          onClick={() => handleTaskClick(task)}
          cursor="pointer"
          bg="gray.200" // Base color
          _hover={{ bg: "gray.300" }} // Color on hover
          transition="background-color 0.3s ease" // Smooth transition
          //bg={"yellow"}
        >
          <Text fontSize="lg">{task.name}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default ListTasks;
