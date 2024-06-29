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

const ListTasks: React.FC = () => {
  const { tasks, setDraggingTask, setContextInformation } = useTasks();
  const [stateTasks, setStateTasks] = useState(tasks);
  useEffect(() => {
    setStateTasks(tasks);
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
    <Box width={"100%"} height={"100%"}>
      <Accordion
        overflowY={"auto"}
        overflowX={"hidden"}
        maxHeight={"100%"}
        width={"100%"}
        allowMultiple
        defaultIndex={[0, 1, 2]}
      >
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
          <AccordionPanel width="100%">
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

const TaskItem = ({
  task,
  onDragStart,
  onContextMenu,
}: {
  task: Task;
  onDragStart: (task: Task, event: React.DragEvent) => void;
  onContextMenu: (task: Task, event: React.MouseEvent) => void;
}) => {
  const { updateTask } = useTasks();

  return (
    <HStack
      width={"100%"}
      p={2}
      bg={"blue.400"}
      draggable
      onDragStart={(event) => onDragStart(task, event)}
      onContextMenu={(event) => onContextMenu(task, event)}
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
        <Text fontSize="sm" color={"gray.300"}>
          {task.isAllDay
            ? "All Day"
            : task.startDate && task.endDate
            ? `${moment(task.startDate).format("HH:mm")} - ${moment(task.endDate).format("HH:mm")}`
            : "No Date Assigned"}
        </Text>
      </Link>
    </HStack>
  );
};

export default ListTasks;
