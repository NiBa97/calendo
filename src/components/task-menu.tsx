import { Button, Flex, Text } from "@chakra-ui/react";
import { Task } from "@prisma/client";
import React from "react";
import CalendarPopup from "./calendar/popup";

const TaskMenu = ({ task, x, y, onClose }: { task: Task; x: number; y: number; onClose: () => void }) => {
  return (
    <CalendarPopup onClose={onClose} position={{ top: y, left: x }}>
      <Flex direction={"column"} p={2}>
        <Text>{task.name}</Text>
        <Button borderRadius={"none"} bg={"gray.800"} color={"white"} textAlign={"left"}>
          Edit
        </Button>

        <Button borderRadius={"none"} bg={"gray.800"} color={"white"} textAlign={"left"}>
          Delete
        </Button>
      </Flex>
    </CalendarPopup>
  );
};
export default TaskMenu;
