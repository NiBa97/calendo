import {
  Checkbox,
  HStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Badge,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import { useTasks } from "../contexts/task-context";
import { Link } from "@chakra-ui/next-js";
import { useEffect, useState } from "react";
import moment from "moment";
import { type Task } from "@prisma/client";
import { FaExpand } from "react-icons/fa6";

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
  return (
    <Box width={"100%"} height={"100%"} overflowY={"auto"}>
      <Accordion overflowX={"hidden"} maxHeight={"100%"} width={"100%"} allowMultiple defaultIndex={[0, 1, 2]}>
        <AccordionItem hidden={withoutAssignedDate.length === 0}>
          <AccordionButton width="100%" justifyContent={"space-between"}>
            <AccordionIcon />
            <Text>No Date Assigned</Text>
            <Badge colorScheme="red">{withoutAssignedDate.length}</Badge>
          </AccordionButton>
          <AccordionPanel width="100%">
            {withoutAssignedDate.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
              ></TaskItem>
            ))}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem hidden={overdueTasks.length === 0}>
          <AccordionButton width="100%" justifyContent={"space-between"}>
            <AccordionIcon />
            <Text>Overdue Tasks</Text>
            <Badge colorScheme="red">{overdueTasks.length}</Badge>
          </AccordionButton>
          <AccordionPanel width="100%">
            {overdueTasks.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
              ></TaskItem>
            ))}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton width="100%" justifyContent={"space-between"}>
            <AccordionIcon />
            <Text>Today Tasks</Text>
            <Badge colorScheme="green">{todayTasks.length}</Badge>
          </AccordionButton>
          <AccordionPanel width="100%" gap={4}>
            {todayTasks.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
              ></TaskItem>
            ))}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem hidden={completedToday.length === 0}>
          <AccordionButton width="100%" justifyContent={"space-between"}>
            <AccordionIcon />
            <Text>Completed Tasks</Text>
            <Badge colorScheme="gray">{completedToday.length}</Badge>
          </AccordionButton>
          <AccordionPanel width="100%">
            {completedToday.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                onDragStart={dragStart}
                onContextMenu={(task, event) => onContextMenu(task, event)}
              ></TaskItem>
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
export default ListTasks;
const TaskItem = ({
  task,
  onDragStart,
  onContextMenu,
}: {
  task: Task;
  onDragStart: (task: Task, event: React.DragEvent) => void;
  onContextMenu: (task: Task, event: React.MouseEvent) => void;
}) => {
  const { updateTask, setModalTask } = useTasks();
  return (
    <HStack
      width={"100%"}
      p={2}
      my={2}
      bg={"brand.3"}
      border={"none"}
      draggable
      onDragStart={(event) => onDragStart(task, event)}
      onContextMenu={(event) => onContextMenu(task, event)}
      _hover={{
        ".showFullscreenBox": {
          visibility: "visible",
          display: "block",
          opacity: 1,
        },
      }}
    >
      <Checkbox isChecked={task.status} onChange={() => void updateTask(task.id, { status: !task.status })}></Checkbox>
      <Link
        href={"/webapp/" + task.id}
        cursor="pointer"
        width={"100%"}
        _hover={{ cursor: "pointer" }}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Text fontSize="lg">{task.name}</Text>
        <HStack gap={1}>
          <Text fontSize="sm" color={"brand.4"}>
            {task.isAllDay
              ? "All Day"
              : task.startDate && task.endDate
              ? `${moment(task.startDate).format("HH:mm")} - ${moment(task.endDate).format("HH:mm")}`
              : "No Date Assigned"}
          </Text>{" "}
          <Box
            className="showFullscreenBox"
            display={"none"}
            transition="visibility 0s, display 0.2s linear"
            _hover={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "5px",
            }}
            p={"4px"}
            onClick={(e) => {
              setModalTask(task);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <FaExpand />
          </Box>
        </HStack>
      </Link>
    </HStack>
  );
};
