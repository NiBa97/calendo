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
} from "@chakra-ui/react";
import { useTasks } from "../_contexts/task-context";
import { Link } from "@chakra-ui/next-js";
import { useEffect, useState } from "react";
import moment from "moment";

const ListTasks: React.FC = () => {
  const { tasks, updateTask } = useTasks();
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

  return (
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
            <HStack width={"100%"} p={2} bg={"blue.400"} key={task.id}>
              <Checkbox
                isChecked={task.status}
                onChange={() => void updateTask(task.id, { status: !task.status })}
              ></Checkbox>

              <Link href={"/webapp/" + task.id} cursor="pointer" width={"100%"} _hover={{ cursor: "pointer" }}>
                <Text fontSize="lg">{task.name}</Text>
              </Link>
            </HStack>
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
            <HStack width={"100%"} p={2} bg={"gray.400"} key={task.id}>
              <Checkbox
                isChecked={task.status}
                onChange={() => void updateTask(task.id, { status: !task.status })}
              ></Checkbox>

              <Link href={"/webapp/" + task.id} cursor="pointer" width={"100%"} _hover={{ cursor: "pointer" }}>
                <Text fontSize="lg">{task.name}</Text>
              </Link>
            </HStack>
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
            <HStack width={"100%"} p={2} bg={"gray.400"} key={task.id}>
              <Checkbox
                isChecked={task.status}
                onChange={() => void updateTask(task.id, { status: !task.status })}
              ></Checkbox>

              <Link href={"/webapp/" + task.id} cursor="pointer" width={"100%"} _hover={{ cursor: "pointer" }}>
                <Text fontSize="lg">{task.name}</Text>
              </Link>
            </HStack>
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
            <HStack width={"100%"} p={2} bg={"green.400"} key={task.id}>
              <Checkbox
                isChecked={task.status}
                onChange={() => void updateTask(task.id, { status: !task.status })}
              ></Checkbox>

              <Link href={"/webapp/" + task.id} cursor="pointer" width={"100%"} _hover={{ cursor: "pointer" }}>
                <Text fontSize="lg">{task.name}</Text>
              </Link>
            </HStack>
          ))}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default ListTasks;
