"use client";
import { Box } from "@chakra-ui/react";
import { Calendar, Messages, SlotInfo, View, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { useTasks } from "~/contexts/task-context";
import { type SyntheticEvent, useEffect, useState, useCallback } from "react";
import { type Task } from "@prisma/client";
import CustomMultiDayView from "~/components/calendar/custom-view";
import CalendarPopup from "~/components/calendar/popup";
import TempTask from "~/components/edit-task";
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const EventComponent = ({ event }: { event: Task }) => {
  const isOverdue = moment(event.endDate).isBefore(moment().startOf("day")) && !event.status;
  const { setContextInformation } = useTasks();
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextInformation({ x: e.clientX, y: e.clientY, task: event });
  };

  return (
    <Box
      width="100%"
      height="100%"
      color="white"
      p={2}
      borderLeft={isOverdue ? "4px solid red" : ""}
      onContextMenu={onContextMenu}
    >
      {event.name}
    </Box>
  );
};

const EventPropGetter = (event: Task, start: Date, end: Date, isSelected: boolean) => ({
  ...(event.status && {
    className: "completed-task",
  }),
  ...(!event.status && {
    className: "uncompleted-task",
  }),
});

export default function Home() {
  const { tasks, updateTask, draggingTask, setDraggingTask, temporaryTask, setTemporaryTask } = useTasks();
  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);
  const [selectedEventPos, setSelectedEventPos] = useState({ inverted: false, top: 0, left: 0, width: 0 });
  const [view, setView] = useState<string>("customDayView");
  const [slotHeight, setSlotHeight] = useState<number>(0);
  const handleOnChangeView = (selectedView: string) => setView(selectedView);

  const [date, setDate] = useState(new Date());
  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      if (event.deltaY < 0) {
        setSlotHeight((prevHeight) => Math.min(prevHeight + 3, 100));
      } else {
        setSlotHeight((prevHeight) => Math.max(prevHeight - 3, 20));
      }
      event.preventDefault();
    }
  };

  useEffect(() => {
    const calendarElement = document.querySelector(".rbc-calendar");
    if (calendarElement) {
      (calendarElement as HTMLElement).addEventListener("wheel", handleWheel);
    }
    const element = document.querySelector(`.rbc-timeslot-group`);
    if (element) {
      console.log("element", element.clientHeight);
      setSlotHeight(element.clientHeight);
    }
    return () => {
      if (calendarElement) {
        (calendarElement as HTMLElement).removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handleEventSelect = (event: object, e: SyntheticEvent<HTMLElement, Event>) => {
    if (selectedEvent?.id === (event as Task).id) {
      setTemporaryTask(null);
      return setSelectedEvent(null);
    }
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
  } as Partial<Messages>;

  const handleExternalDrop = (args: { start: string | number | Date; end: string | number | Date }) => {
    console.log("external drop", args);
    if (draggingTask) {
      const { start, end } = args;

      const startDate = new Date(start);
      // eslint-disable-next-line prefer-const
      let endDate = new Date(end);

      if (endDate.getTime() - startDate.getTime() < 1000 * 60 * 60) {
        endDate.setHours(startDate.getHours() + 1);
        endDate.setMinutes(startDate.getMinutes());
      }

      void updateTask(draggingTask.id, { startDate: startDate, endDate: endDate });
      setDraggingTask(null);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const { start, end, bounds } = slotInfo;
    setTemporaryTask(null);

    if (!bounds) return; // exit if bounds are not available

    // Create a partial Task object for temporary task
    const event: Partial<Task> = {
      name: "",
      startDate: start,
      endDate: end,
      isAllDay: false,
      status: false,
    };
    const el = document.getElementsByClassName(start.toISOString());
    if (el.length == 0 || el[0] == undefined) {
      return;
    }
    const { top, left, width } = el.length == 1 ? el[0].getBoundingClientRect() : el[1]!.getBoundingClientRect();
    setTemporaryTask(event as Task);

    const screenHeight = window.innerHeight;
    const inverted = screenHeight - bounds.top < 200;
    setSelectedEventPos({ inverted: inverted, top: top, left: left, width: width });

    // Set selected event position and

    setSelectedEvent(event as Task);
  };
  return (
    <Box height={"100vh"} maxHeight={"100vh"}>
      {slotHeight > 0 && (
        <style>{`
          .rbc-timeslot-group { min-height: ${slotHeight}px; max-height: ${slotHeight}px; }
        `}</style>
      )}

      <DnDCalendar
        view={view as View}
        date={date}
        views={views}
        selectable
        //only display events that have a start and end data
        events={[...tasks.filter((task) => task.startDate && task.endDate), ...(temporaryTask ? [temporaryTask] : [])]}
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
        onSelectSlot={handleSelectSlot}
        onDropFromOutside={handleExternalDrop}
        components={{ event: EventComponent }} // https://jquense.github.io/react-big-calendar/examples/index.html?path=/docs/props--components
        eventPropGetter={EventPropGetter}
        slotPropGetter={(date) => ({ className: date.toISOString() })}
        formats={{ timeGutterFormat: "HH:mm" }}
      />
      {selectedEvent && (
        <CalendarPopup
          onClose={() => setSelectedEvent(null)}
          position={{
            top: selectedEventPos.inverted ? selectedEventPos.top - 185 : selectedEventPos.top,
            left: selectedEventPos.left + selectedEventPos.width,
          }}
        >
          <TempTask task={selectedEvent} height={400} width={400} onSave={() => setSelectedEvent(null)}></TempTask>
        </CalendarPopup>
      )}
    </Box>
  );
}
