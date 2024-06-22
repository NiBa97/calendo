"use client";
import { Box, Flex, useToast } from "@chakra-ui/react";
import { Calendar, View, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { useTasks } from "~/app/_contexts/task-context";
import { type SyntheticEvent, useEffect, useRef, useState, useCallback } from "react";
import { type Task } from "@prisma/client";
import TempTask from "~/app/_components/edit-task";
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function Home() {
  const { tasks, updateTask } = useTasks();
  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);
  const [selectedEventPos, setSelectedEventPos] = useState({ inverted: false, top: 0, left: 0, width: 0 });
  const toast = useToast();
  const [view, setView] = useState<View>(Views.WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const [date, setDate] = useState(new Date());
  const onNavigate = useCallback(
    (newDate: Date) => {
      return setDate(newDate);
    },
    [setDate]
  );
  // const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
  //   const title = window.prompt("New Event name");
  // };
  const handleEventSelect = (event: object, e: SyntheticEvent<HTMLElement, Event>) => {
    if (selectedEvent?.id === (event as Task).id) return setSelectedEvent(null);

    const parentElement = (e.target as HTMLElement).parentNode as HTMLElement;
    const { top, left, width } = parentElement.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    const inverted = screenHeight - top < 200;
    setSelectedEventPos({ inverted, top, left, width });
    setSelectedEvent(event as Task);
    console.log(selectedEventPos);
  };

  type EventChangeArgs = {
    event: Task; // Assuming event is of type Task
    start: Date;
    end: Date;
  };
  // const onEventDropOrResize = (start: Date, end: Date, event: Task) => {
  // Assuming withDragAndDropProps is defined somewhere and it has the type for onEventDrop and onEventResize
  const onEventDropOrResize = ({
    start,
    end,
    event,
  }: {
    event: Task; // Assuming event is of type Task
    start: Date;
    end: Date;
  }) => {
    event.startDate = start;
    event.endDate = end;
    updateTask(event.id, { startDate: start, endDate: end })
      .then(() => {
        toast({
          title: "Task updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "An error occurred while updating the task.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Flex maxHeight={"100%"} minHeight={"100%"} grow={"1"}>
      <DnDCalendar
        view={view}
        date={date}
        views={["month", "day", "week"]}
        selectable
        events={tasks}
        startAccessor={(event) => {
          return (event as Task).startDate!;
        }}
        endAccessor={(event) => {
          return (event as Task).endDate!;
        }}
        titleAccessor={(event) => {
          return (event as Task).name;
        }}
        resourceIdAccessor={(event) => {
          return (event as Task).id;
        }}
        allDayAccessor={(event) => {
          return (event as Task).isAllDay;
        }}
        showMultiDayTimes
        localizer={localizer}
        onNavigate={onNavigate}
        onView={handleOnChangeView}
        onEventDrop={(args) => onEventDropOrResize(args as EventChangeArgs)}
        onEventResize={(args) => onEventDropOrResize(args as EventChangeArgs)}
        onSelectEvent={handleEventSelect}
        // onSelectSlot={handleSelectSlot}
      />
      {selectedEvent && (
        <CustomPopup
          onClose={() => setSelectedEvent(null)}
          position={{
            top: selectedEventPos.inverted ? selectedEventPos.top - 185 : selectedEventPos.top,
            left: selectedEventPos.left + selectedEventPos.width,
          }}
          task={selectedEvent}
        />
      )}
    </Flex>
  );
}

function CustomPopup({
  onClose,
  position,
  task,
}: {
  onClose: () => void;
  position: { top: number; left: number };
  task: Task;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close the popup if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box
      ref={ref}
      position="absolute"
      top={position.top}
      left={position.left}
      bg="white"
      boxShadow="md"
      zIndex={1}
      border="1px solid gray"
      borderRadius="md"
      width={400}
      height={400}
    >
      <TempTask task={task}></TempTask>
    </Box>
  );
}
