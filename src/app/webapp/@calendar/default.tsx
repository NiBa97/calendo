"use client";
import { Box, Flex } from "@chakra-ui/react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { useTasks } from "~/app/_contexts/task-context";
import { type SyntheticEvent, useEffect, useState, useCallback } from "react";
import { type Task } from "@prisma/client";
import CustomMultiDayView from "~/app/_components/calendar/custom-view";
import CalendarPopup from "~/app/_components/calendar/popup";
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function Home() {
  const { tasks, updateTask, draggingTask, setDraggingTask } = useTasks();
  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);
  const [selectedEventPos, setSelectedEventPos] = useState({ inverted: false, top: 0, left: 0, width: 0 });
  const [view, setView] = useState<string>("customDayView");
  const [slotHeight, setSlotHeight] = useState<number>(40);

  const handleOnChangeView = (selectedView: string) => setView(selectedView);

  const [date, setDate] = useState(new Date());
  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      if (event.deltaY < 0) {
        setSlotHeight((prevHeight) => Math.min(prevHeight + 5, 100));
      } else {
        setSlotHeight((prevHeight) => Math.max(prevHeight - 5, 20));
      }
      event.preventDefault();
    }
  };

  useEffect(() => {
    const calendarElement = document.querySelector(".rbc-calendar");
    if (calendarElement) {
      calendarElement.addEventListener("wheel", handleWheel);
    }
    return () => {
      if (calendarElement) {
        calendarElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handleEventSelect = (event: object, e: SyntheticEvent<HTMLElement, Event>) => {
    if (selectedEvent?.id === (event as Task).id) return setSelectedEvent(null);

    const parentElement = (e.target as HTMLElement).parentNode as HTMLElement;
    const { top, left, width } = parentElement.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    const inverted = screenHeight - top < 200;
    setSelectedEventPos({ inverted, top, left, width });
    setSelectedEvent(event as Task);
  };

  type EventChangeArgs = {
    event: Task;
    start: Date;
    end: Date;
  };

  const onEventDropOrResize = ({ start, end, event }: { event: Task; start: Date; end: Date }) => {
    event.startDate = start;
    event.endDate = end;
    void updateTask(event.id, { startDate: start, endDate: end });
  };

  const numberOfDays = 3;
  const views = {
    day: true,
    customDayView: CustomMultiDayView,
    week: true,
    month: true,
  };

  const messages = {
    customDayView: numberOfDays + " Days",
  };

  const handleExternalDrop = (args: { start: string | number | Date; end: string | number | Date }) => {
    console.log("external drop", args);
    if (draggingTask) {
      const { start, end } = args;

      const startDate = new Date(start);
      let endDate = new Date(end);

      if (endDate.getTime() - startDate.getTime() < 1000 * 60 * 60) {
        endDate.setHours(startDate.getHours() + 1);
        endDate.setMinutes(startDate.getMinutes());
      }

      void updateTask(draggingTask.id, { startDate: startDate, endDate: endDate });
      setDraggingTask(null);
    }
  };
  return (
    <Flex maxHeight={"100%"} minHeight={"100%"} grow={"1"}>
      <style>{`
        .rbc-timeslot-group { min-height: ${slotHeight}px; max-height: ${slotHeight}px; }
      `}</style>
      <DnDCalendar
        view={view as View}
        date={date}
        views={views}
        numberOfDays={numberOfDays}
        selectable
        events={tasks}
        startAccessor={(event) => (event as Task).startDate ?? new Date()}
        messages={messages}
        endAccessor={(event) => (event as Task).endDate ?? new Date()}
        titleAccessor={(event) => (event as Task).name}
        resourceIdAccessor={(event) => (event as Task).id}
        allDayAccessor={(event) => (event as Task).isAllDay}
        showMultiDayTimes
        localizer={localizer}
        onNavigate={onNavigate}
        onView={handleOnChangeView}
        onEventDrop={(args) => onEventDropOrResize(args as EventChangeArgs)}
        onEventResize={(args) => onEventDropOrResize(args as EventChangeArgs)}
        onSelectEvent={handleEventSelect}
        onDropFromOutside={handleExternalDrop}
      />
      {selectedEvent && (
        <CalendarPopup
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
