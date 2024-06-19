import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaCalendar } from "react-icons/fa";
import { useTasks } from "../_contexts/task-context";
import { type Task } from "@prisma/client";
import moment from "moment";
import { FaClock } from "react-icons/fa";

const DateTimeRangeSelector = ({ task }: { task: Task }) => {
  const { updateTask } = useTasks();
  const [startDate, setStartDate] = useState(moment(task.startDate).format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState(moment(task.startDate).format("HH:mm"));
  const [endDate, setEndDate] = useState(moment(task.endDate).format("YYYY-MM-DD"));
  const [endTime, setEndTime] = useState(moment(task.endDate).format("HH:mm"));

  const returnCompleteStartDate = () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const newDate = new Date(startDate);
    newDate.setHours(hours!);
    newDate.setMinutes(minutes!);
    return newDate;
  };

  const returnCompleteEndDate = () => {
    const [hours, minutes] = endTime.split(":").map(Number);
    const newDate = new Date(endDate);
    newDate.setHours(hours!);
    newDate.setMinutes(minutes!);
    return newDate;
  };

  useEffect(() => {
    const timeoutId = setTimeout(
      () => void updateTask(task.id, { startDate: returnCompleteStartDate(), endDate: returnCompleteEndDate() }),
      1000
    );
    return () => clearTimeout(timeoutId);
  }, [startTime, endTime, startDate, endDate]);

  const handleStartDateChangeLocal = (value: string) => {
    setStartDate(value);
  };

  const handleStartTimeChangeLocal = (value: string) => {
    setStartTime(value);
  };

  const handleEndDateChangeLocal = (value: string) => {
    setEndDate(value);
  };

  const handleEndTimeChangeLocal = (value: string) => {
    setEndTime(value);
  };

  return (
    <Box>
      <Popover>
        <PopoverTrigger>
          <Button bg={"gray.800"} color={"white"} m={2}>
            <HStack>
              <Icon as={FaCalendar} /> <Text>{moment(startDate).format("DD. MMM")} </Text>
              <Icon as={FaClock} />
              <Text>
                {startTime} - {endTime}
              </Text>
            </HStack>
          </Button>
        </PopoverTrigger>
        <PopoverContent bg={"gray.600"}>
          <PopoverArrow />
          <PopoverCloseButton size={"md"} />
          <PopoverHeader>Edit scheduling</PopoverHeader>
          <PopoverBody>
            <VStack spacing={4}>
              <HStack px={4} pt={2}>
                <Text width={"50px"} textAlign={"center"}>
                  Start
                </Text>
                <Box width="150px">
                  <Input
                    type="date"
                    value={startDate}
                    size="md"
                    onChange={(e) => handleStartDateChangeLocal(e.target.value)}
                  />
                </Box>
                <Box width="100px">
                  <Input
                    type="time"
                    value={startTime}
                    size="md"
                    pr={1}
                    onChange={(e) => handleStartTimeChangeLocal(e.target.value)}
                  />
                </Box>
              </HStack>

              <HStack px={4} pt={2}>
                <Text width={"50px"} textAlign={"center"}>
                  End
                </Text>
                <Box width="150px">
                  <Input
                    type="date"
                    value={endDate}
                    size="md"
                    onChange={(e) => handleEndDateChangeLocal(e.target.value)}
                  />
                </Box>
                <Box width="100px">
                  <Input
                    type="time"
                    value={endTime}
                    size="md"
                    pr={1}
                    onChange={(e) => handleEndTimeChangeLocal(e.target.value)}
                  />
                </Box>
              </HStack>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default DateTimeRangeSelector;
