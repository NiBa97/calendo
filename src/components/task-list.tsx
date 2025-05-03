import { HStack, Text, Badge, Box } from "@chakra-ui/react";
import { useTasks } from "../contexts/task-context";
import { useEffect, useState } from "react";
import moment from "moment";
import { FaExpand } from "react-icons/fa6";
import { Task } from "../types";
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from "./ui/accordion";
import TitlePreview from "./ui/title-preview";
import TaskCheckbox from "./ui/task-checkbox";

const ListTasks: React.FC = () => {
  const { tasks, setDraggingTask, setContextInformation } = useTasks();
  const [stateTasks, setStateTasks] = useState(tasks);
  useEffect(() => {
    const sortedTasks = [...tasks].sort((a, b) => {
      // If either date is null, put it at the end
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;

      // Compare valid dates
      return a.startDate.getTime() - b.startDate.getTime();
    });
    setStateTasks(sortedTasks);
  }, [tasks]);

  const today = moment().startOf("day");

  const overdueTasks = stateTasks.filter((task) => {
    const taskDate = task.endDate ? moment(task.endDate) : null;
    return taskDate?.isBefore(today) && !task.status;
  });

  const todayTasks = stateTasks.filter((task) => {
    const taskStartDate = task.startDate ? moment(task.startDate) : null;
    const taskEndDate = task.endDate ? moment(task.endDate) : null;
    return (
      taskStartDate &&
      taskEndDate &&
      (taskStartDate.isSame(today, "day") || taskEndDate.isSame(today, "day")) &&
      !task.status
    );
  });

  const completedToday = stateTasks.filter((task) => {
    const taskStartDate = task.startDate ? moment(task.startDate) : null;
    const taskEndDate = task.endDate ? moment(task.endDate) : null;
    return (
      taskStartDate &&
      taskEndDate &&
      (taskStartDate.isSame(today, "day") || taskEndDate.isSame(today, "day")) &&
      task.status
    );
  });

  const withoutAssignedDate = stateTasks.filter((task) => (!task.startDate || !task.endDate) && !task.status);

  const dragStart = (task: Task, event: React.DragEvent) => {
    event.dataTransfer.setData("task", JSON.stringify(task));
    event.dataTransfer.effectAllowed = "move";
    setDraggingTask(task);
  };
  const onContextMenu = (task: Task, event: React.MouseEvent) => {
    event.preventDefault();
    setContextInformation({ x: event.clientX, y: event.clientY, task: task });
  };
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "without-date",
    "overdue-tasks",
    "todo-today",
    "completed-today",
  ]);
  const toggleAccordion = (value: string) => {
    if (accordionValue.includes(value)) {
      setAccordionValue(accordionValue.filter((v) => v !== value));
    } else {
      setAccordionValue([...accordionValue, value]);
    }
  };
  return (
    <Box width={"100%"} height={"100%"} overflowY={"auto"}>
      <AccordionRoot overflowX={"hidden"} maxHeight={"100%"} width={"100%"} multiple value={accordionValue}>
        <AccordionItem
          hidden={withoutAssignedDate.length === 0}
          value="without-date"
          borderBottom="none"
          mb={2}
          onClick={() => toggleAccordion("without-date")}
        >
          <AccordionItemTrigger width="100%" justifyContent={"space-between"}>
            <Text fontWeight="600">No Date Assigned</Text>
            <Badge colorScheme="red" borderRadius="full" px={2}>
              {withoutAssignedDate.length}
            </Badge>
          </AccordionItemTrigger>
          <AccordionItemContent width="100%" p={2}>
            {withoutAssignedDate.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
                showDate={false}
              ></TaskItem>
            ))}
          </AccordionItemContent>
        </AccordionItem>
        <AccordionItem
          hidden={overdueTasks.length === 0}
          value="overdue-tasks"
          borderBottom="none"
          mb={2}
          onClick={() => toggleAccordion("overdue-tasks")}
        >
          <AccordionItemTrigger width="100%" justifyContent={"space-between"}>
            <Text fontWeight="600">Overdue Tasks</Text>
            <Badge colorScheme="red" borderRadius="full" px={2}>
              {overdueTasks.length}
            </Badge>
          </AccordionItemTrigger>
          <AccordionItemContent width="100%" p={2}>
            {overdueTasks.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
                showDate={true}
              ></TaskItem>
            ))}
          </AccordionItemContent>
        </AccordionItem>
        <AccordionItem
          hidden={todayTasks.length === 0}
          value="todo-today"
          borderBottom="none"
          mb={2}
          onClick={() => toggleAccordion("todo-today")}
        >
          <AccordionItemTrigger width="100%" justifyContent={"space-between"}>
            <Text fontWeight="600">Today Tasks</Text>
            <Badge colorScheme="green" borderRadius="full" px={2}>
              {todayTasks.length}
            </Badge>
          </AccordionItemTrigger>
          <AccordionItemContent width="100%" p={2} outline="none">
            {todayTasks.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
                showDate={false}
              ></TaskItem>
            ))}
          </AccordionItemContent>
        </AccordionItem>
        <AccordionItem
          hidden={completedToday.length === 0}
          value="completed-today"
          borderBottom="none"
          mb={2}
          onClick={() => toggleAccordion("completed-today")}
        >
          <AccordionItemTrigger width="100%" justifyContent={"space-between"}>
            <Text fontWeight="600">Completed Tasks</Text>
            <Badge colorScheme="gray" borderRadius="full" px={2}>
              {completedToday.length}
            </Badge>
          </AccordionItemTrigger>
          <AccordionItemContent width="100%" p={2}>
            {completedToday.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
                showDate={false}
              ></TaskItem>
            ))}
          </AccordionItemContent>
        </AccordionItem>
      </AccordionRoot>
    </Box>
  );
};
export default ListTasks;
const TaskItem = ({
  task,
  onDragStart,
  onContextMenu,
  showDate,
}: {
  task: Task;
  onDragStart: (task: Task, event: React.DragEvent) => void;
  onContextMenu: (task: Task, event: React.MouseEvent) => void;
  showDate: boolean;
}) => {
  const { updateTask, setModalTask } = useTasks();
  return (
    <HStack
      width={"100%"}
      p={3}
      my={2}
      bg={"brand.3"}
      borderRadius={"8px"}
      boxShadow={"md"}
      className="task-item"
      draggable
      onDragStart={(event) => onDragStart(task, event)}
      onContextMenu={(event) => onContextMenu(task, event)}
      transition="all 0.2s ease-in-out"
      position="relative"
      _hover={{
        "& .fullscreen-icon": {
          opacity: 1,
        },
      }}
    >
      <TaskCheckbox checked={task.status} onChange={() => void updateTask(task.id, { status: !task.status })} />
      <Box
        cursor="pointer"
        width={"100%"}
        _hover={{ textDecoration: "none" }}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        position="relative"
      >
        <TitlePreview title={task.title} lineThrough={task.status} />
        <HStack gap={2} alignItems="center">
          {showDate && (
            <Text fontSize="xs" color={"brand.4"} opacity={task.status ? 0.7 : 1}>
              {task.startDate && task.endDate ? `${moment(task.startDate).format("DD/MM/YYYY")}` : "No Date Assigned"}
            </Text>
          )}
          <Text fontSize="md" color={"brand.4"} opacity={task.status ? 0.7 : 1} fontWeight="medium">
            {task.isAllDay
              ? "All Day"
              : task.startDate && task.endDate
              ? `${moment(task.startDate).format("HH:mm")} - ${moment(task.endDate).format("HH:mm")}`
              : "No Date Assigned"}
          </Text>
        </HStack>
      </Box>

      {/* Fullscreen icon that only appears on hover */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        opacity="0"
        className="fullscreen-icon"
        zIndex="1"
      >
        <Box
          bg="rgba(0, 0, 0, 0.5)"
          w="100%"
          h="100%"
          p="2"
          onClick={(e) => {
            setModalTask(task);
            e.stopPropagation();
            e.preventDefault();
          }}
          _hover={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
          cursor="pointer"
          alignItems="center"
          justifyContent="center"
          display="flex"
          zIndex="99"
        >
          <FaExpand color="white" cursor="pointer" />
        </Box>
      </Box>
    </HStack>
  );
};
