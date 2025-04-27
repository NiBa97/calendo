import { useEffect, useRef, useState } from "react";
import { Box, Input, Text, HStack, Icon, Flex, Grid, useDisclosure, PopoverRoot } from "@chakra-ui/react";
import { Switch } from "./switch";
import { FaCalendar } from "react-icons/fa";
import moment from "moment";
import { FaClock } from "react-icons/fa";
import { Task } from "../../types";
import { PopoverBody, PopoverContent, PopoverTrigger } from "./popover";

interface DateTimeRangeSelectorProps {
  task: Task;
  onChange?: (changes: { startDate: Date; endDate: Date; isAllDay: boolean }) => void;
}

const DateTimeRangeSelector = ({ task, onChange }: DateTimeRangeSelectorProps) => {
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
    if (isValidDate) {
      const completeStartDate = returnCompleteStartDate();
      const completeEndDate = returnCompleteEndDate();

      // Check if the current state differs from the original task prop values OR the derived values
      const startDateFromProp = task.startDate ? moment(task.startDate).format("YYYY-MM-DD") : "";
      const startTimeFromProp = task.startDate ? moment(task.startDate).format("HH:mm") : "";
      const endDateFromProp = task.endDate ? moment(task.endDate).format("YYYY-MM-DD") : "";
      const endTimeFromProp = task.endDate ? moment(task.endDate).format("HH:mm") : "";

      const hasChangedFromProps = 
          startDate !== startDateFromProp || 
          startTime !== startTimeFromProp || 
          endDate !== endDateFromProp || 
          endTime !== endTimeFromProp || 
          isAllDay !== task.isAllDay;

      // Only call onChange if the values are valid and have actually changed from the initial/last reported state
      if (hasChangedFromProps) {
         // Adjust end date if start date is after it
         let adjustedEndDate = completeEndDate;
         if (completeStartDate > completeEndDate) {
           // Simple adjustment: make end date same as start date
           adjustedEndDate = new Date(completeStartDate.getTime());
         }
        
        onChange?.({
          startDate: completeStartDate,
          endDate: adjustedEndDate, // Pass the potentially adjusted end date
          isAllDay: isAllDay,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, startDate, endDate, isAllDay, task.startDate, task.endDate, task.isAllDay, onChange]); // Add onChange and task props to dependencies

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
  const { open, onToggle } = useDisclosure();
  const popoverRef = useRef(null);
  // useOutsideClick({
  //   ref: popoverRef,
  //   handler: onClose,
  // });
  return (
    <Box ref={popoverRef} bg={"brand.2"} p={2} borderRadius={"md"}>
      <PopoverRoot autoFocus={false} open={open}>
        <PopoverTrigger asChild>
          <Box onClick={onToggle}>
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
          </Box>
        </PopoverTrigger>

        <PopoverContent bg={"brand.1"} borderColor={"brand.2"}>
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
              <Switch checked={isAllDay} onCheckedChange={(e) => handleIsAllDayChangeLocal(e.checked)} />
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
    </Box>
  );
};

export default DateTimeRangeSelector;
