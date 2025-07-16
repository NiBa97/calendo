import { Button, HStack, Input } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa6";
import { TaskFilter } from "../../../features/tasks/task-filter";

export const TaskTitleFilter = ({
  filter,
  setFilter,
}: {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
}) => {
  return (
    <HStack gap={4}>
      <Input
        placeholder="Search tasks"
        value={filter.search || ""}
        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        size="xl"
      />
      <Button size="xl">
        <FaPlus /> Create Task
      </Button>
    </HStack>
  );
};
