import { Text, HStack, IconButton, VStack, Heading, Checkbox, Spinner, Box } from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import { Task } from "../../../features/tasks/type";

export const TaskList = ({ tasks, loading }: { tasks: Task[]; loading?: boolean }) => {
  console.log("TaskList tasks:", tasks);
  return (
    <Box>
      <VStack gap={2} align="stretch">
        {loading ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" />
          </Box>
        ) : tasks.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            No tasks found.
          </Text>
        ) : (
          tasks.map((task) => (
            <HStack borderRadius={"md"} key={task.id} p={3} bg={"white"}>
              <Checkbox.Root defaultChecked checked={task.status}>
                <Checkbox.Control />
              </Checkbox.Root>
              <VStack flex={1} align="start">
                <Heading size="md" maxLines={1}>
                  {task.title}
                </Heading>

                {task.tags.map((tag) => (
                  <Text fontSize="sm" color="gray.500">
                    {tag.name}
                  </Text>
                ))}
              </VStack>
              <IconButton size="sm" variant="ghost" colorScheme="red" aria-label="Delete task">
                <FaTrashAlt />
              </IconButton>
            </HStack>
          ))
        )}
      </VStack>
    </Box>
  );
};
