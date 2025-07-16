import { Box, Button, Text, Skeleton } from "@chakra-ui/react";
import { TaskList } from "./components/list";
import { Pagination } from "../../components/pagination";
import { useSearchParams } from "react-router-dom";
import { TaskTitleFilter } from "./components/filter";
import { useState } from "react";
import { FaFilterCircleXmark } from "react-icons/fa6";

import {
  DEFAULT_TASK_FILTER,
  TaskFilter,
  taskFilterFromUrlParams,
  taskFilterToUrlParams,
} from "../../features/tasks/task-filter";
import { useTaskCount } from "../../features/tasks/useTaskCount";
import { TagMenuButton } from "../../components/tag-menu-button";
import { TaskSortMenuButton } from "./components/TaskSortMenuButton";
import { useTasks } from "../../features/tasks/useTasks";

const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(() => taskFilterFromUrlParams(searchParams));
  const { tasks, loading, refetch: refechTasks } = useTasks(filter);

  const handleFilterChange = (filter: TaskFilter) => {
    setFilter(filter);
    setSearchParams(taskFilterToUrlParams(filter));
    refechTasks(filter);
    refetchClosedCount({ ...filter, status: true });
    refetchOpenCount({ ...filter, status: false });
  };

  const {
    taskCount: openCount,
    loading: openLoading,
    refetch: refetchOpenCount,
  } = useTaskCount({ ...filter, status: false });
  const {
    taskCount: closedCount,
    loading: closedLoading,
    refetch: refetchClosedCount,
  } = useTaskCount({ ...filter, status: true });

  const maxPages = filter.status ? Math.ceil(closedCount / 25) : Math.ceil(openCount / 25);
  return (
    <Box>
      <TaskTitleFilter
        filter={filter}
        setFilter={(filter) => {
          handleFilterChange(filter);
        }}
      />
      <Button
        size="xl"
        variant={filter.status ? "solid" : "outline"}
        onClick={() => handleFilterChange({ ...filter, status: false })}
      >
        Open{" "}
        <Skeleton loading={openLoading} display="inline">
          <Text>{openCount}</Text>
        </Skeleton>
      </Button>
      <Button
        size="xl"
        variant={!filter.status ? "solid" : "outline"}
        onClick={() => handleFilterChange({ ...filter, status: true })}
      >
        Closed{" "}
        <Skeleton loading={closedLoading} display="inline">
          <Text>{closedCount}</Text>
        </Skeleton>
      </Button>
      <TagMenuButton
        selectedTagIds={filter.tags}
        onTagToggle={(tag) => {
          const newTags = filter.tags.includes(tag) ? filter.tags.filter((t) => t !== tag) : [...filter.tags, tag];
          handleFilterChange({ ...filter, tags: newTags });
        }}
      />
      <TaskSortMenuButton
        sortField={filter.sortField}
        sortDirection={filter.sortDirection}
        onSortChange={(field, direction) =>
          handleFilterChange({ ...filter, sortField: field, sortDirection: direction })
        }
      />
      <Button
        size="sm"
        onClick={() => {
          handleFilterChange(DEFAULT_TASK_FILTER);
        }}
      >
        <FaFilterCircleXmark />
        <Text>Reset</Text>
      </Button>
      <TaskList tasks={tasks} loading={loading} />
      <Pagination
        page={filter.page}
        maxPages={maxPages}
        onPageUpdate={(page) => handleFilterChange({ ...filter, page })}
      />
    </Box>
  );
};
export default TasksPage;
