import { Button, Menu, Portal, Text, Flex } from "@chakra-ui/react";
import { FaSort, FaSortAmountUp, FaSortAmountDown } from "react-icons/fa";
import { TaskSortField, SortDirection, getSortFieldLabel } from "../../../features/tasks/task-filter";

interface TaskSortMenuButtonProps {
  sortField: TaskSortField;
  sortDirection: SortDirection;
  onSortChange: (field: TaskSortField, direction: SortDirection) => void;
}

const SORT_FIELDS: TaskSortField[] = ["startDate", "endDate", "created", "title"];

export const TaskSortMenuButton: React.FC<TaskSortMenuButtonProps> = ({ sortField, sortDirection, onSortChange }) => {
  const getSortIcon = () => {
    if (sortDirection === "asc") return <FaSortAmountUp />;
    if (sortDirection === "desc") return <FaSortAmountDown />;
    return <FaSort />;
  };

  const currentLabel = getSortFieldLabel(sortField);

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">
          {getSortIcon()}
          <Text>Sort: {currentLabel}</Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup title="Sort by">
              {SORT_FIELDS.map((field) => (
                <Menu.CheckboxItem
                  key={field}
                  checked={sortField === field}
                  onClick={() => onSortChange(field, sortDirection)}
                  value={field}
                >
                  <Menu.ItemIndicator />
                  {getSortFieldLabel(field)}
                </Menu.CheckboxItem>
              ))}
            </Menu.ItemGroup>

            <Menu.Separator />

            <Menu.ItemGroup title="Order">
              <Menu.CheckboxItem
                checked={sortDirection === "asc"}
                onClick={() => onSortChange(sortField, "asc")}
                value="asc"
              >
                <Menu.ItemIndicator />
                <Flex align="center">
                  <FaSortAmountUp />
                  <Text ml={2}>Oldest</Text>
                </Flex>
              </Menu.CheckboxItem>
              <Menu.CheckboxItem
                checked={sortDirection === "desc"}
                onClick={() => onSortChange(sortField, "desc")}
                value="desc"
              >
                <Menu.ItemIndicator />
                <Flex align="center">
                  <FaSortAmountDown />
                  <Text ml={2}>Newest</Text>
                </Flex>
              </Menu.CheckboxItem>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
