import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  HStack,
  Icon,
  Switch,
  Flex,
  Grid,
  useDisclosure,
  useOutsideClick,
} from "@chakra-ui/react";
import { FaCalendar } from "react-icons/fa";
import { useTasks } from "../_contexts/task-context";
import { type Task } from "@prisma/client";
import moment from "moment";
import { FaClock } from "react-icons/fa";

const DateTimeRangeSelector = ({ task }: { task: Task }) => {
  const { updateTask } = useTasks();
  const [isAllDay, setIsAllDay] = useState(task.isAllDay);
  const [startDate, setStartDate] = useState(moment(task.startDate).format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState(task.startDate ? moment(task.startDate).format("HH:mm") : "00:00");
  const [endDate, setEndDate] = useState(moment(task.endDate).format("YYYY-MM-DD"));
  const [endTime, setEndTime] = useState(task.endDate ? moment(task.endDate).format("HH:mm") : "00:00");

  const isValidDate: boolean =
    startTime.includes(":") && endTime.includes(":") && !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate));
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

  //update all state variables when the task is updated
  useEffect(() => {
    if (task.startDate) {
      setStartDate(moment(task.startDate).format("YYYY-MM-DD"));
      setStartTime(moment(task.startDate).format("HH:mm"));
    }
    if (task.endDate) {
      setEndDate(moment(task.endDate).format("YYYY-MM-DD"));
      setEndTime(moment(task.endDate).format("HH:mm"));
    }
  }, [task]);

  useEffect(() => {
    // Check if the start and end date are valid dates
    if (
      isValidDate &&
      (isAllDay !== task.isAllDay ||
        returnCompleteStartDate().getTime() !== task.startDate?.getTime() ||
        returnCompleteEndDate().getTime() !== task.endDate?.getTime())
    ) {
      const timeoutId = setTimeout(
        () => alert("calling updateTask"),
        void updateTask(task.id, {
          startDate: returnCompleteStartDate(),
          endDate: returnCompleteEndDate(),
          isAllDay: isAllDay,
        }),
        1000
      );
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, startDate, endDate, isAllDay]);

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

  const handleIsAllDayChangeLocal = (value: boolean) => {
    setIsAllDay(value);
  };
  const { isOpen, onToggle, onClose } = useDisclosure();
  const popoverRef = useRef(null);
  useOutsideClick({
    ref: popoverRef,
    handler: onClose,
  });
  return (
    <Box ref={popoverRef}>
      <Popover autoFocus={false} placement="bottom" isOpen={isOpen}>
        <PopoverTrigger>
          <Button bg={"gray.800"} color={"white"} m={2} onClick={onToggle}>
            <HStack hidden={!isValidDate}>
              <Icon as={FaCalendar} /> <Text>{moment(startDate).format("DD. MMM")} </Text>
              <Icon as={FaClock} display={isAllDay ? "none" : "block"} />
              <Text display={isAllDay ? "none" : "block"}>
                {startTime} - {endTime}
              </Text>
            </HStack>
            <Box hidden={isValidDate}>
              <Text>Select date...</Text>
            </Box>
          </Button>
        </PopoverTrigger>

        <PopoverContent bg={"gray.600"} zIndex={99}>
          <PopoverBody>
            <Grid templateColumns={isAllDay ? "auto 2fr" : "auto 2fr auto"} gap={2} alignItems="center">
              <Text>Start</Text>
              <Input
                type="date"
                value={startDate}
                size="sm"
                textAlign={"center"}
                onChange={(e) => handleStartDateChangeLocal(e.target.value)}
              />
              <Input
                hidden={isAllDay}
                type="time"
                value={startTime}
                size="sm"
                pr={1}
                disabled={isAllDay}
                onChange={(e) => handleStartTimeChangeLocal(e.target.value)}
              />

              <Text>End</Text>
              <Input
                type="date"
                value={endDate}
                size="sm"
                textAlign={"center"}
                onChange={(e) => handleEndDateChangeLocal(e.target.value)}
              />
              <Input
                hidden={isAllDay}
                type="time"
                value={endTime}
                size="sm"
                pr={1}
                onChange={(e) => handleEndTimeChangeLocal(e.target.value)}
              />
            </Grid>
            <Flex pt={2} width={"100%"} justifyContent={"space-between"}>
              <Text>All Day</Text>
              <Switch isChecked={isAllDay} onChange={(e) => handleIsAllDayChangeLocal(e.target.checked)} />
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default DateTimeRangeSelector;
