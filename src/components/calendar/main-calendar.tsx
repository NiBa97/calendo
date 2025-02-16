import { Box, Flex, Text } from "@chakra-ui/react";
import {
  Calendar,
  type EventPropGetter,
  type EventProps,
  type Messages,
  type SlotInfo,
  ToolbarProps,
  type View,
  momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { type SyntheticEvent, useEffect, useState } from "react";
import { useTasks } from "../../contexts/task-context";
import CustomMultiDayView from "./custom-view";
import CalendarPopup from "./popup";
import { Task } from "../../types";
import { getLocalStorage, setLocalStorage } from "../../utils/storage";
import CustomToolbar from "./custom-toolbar";
import EditTask from "../task-edit";

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
    <Flex
      width="100%"
      height="100%"
      color="brand.4"
      p={2}
      borderLeft={isOverdue ? "4px solid red" : ""}
      onContextMenu={onContextMenu}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Text>{event.name}</Text>
    </Flex>
  );
};

const eventPropGetter = (event: Task, start: Date, end: Date, isSelected: boolean) => ({
  ...(event.status && {
    className: "completed-task",
  }),
  ...(!event.status && {
    className: "uncompleted-task",
  }),
});

export default function MainCalendar({
  isTaskListOpen,
  toggleTasklist,
}: {
  isTaskListOpen: boolean;
  toggleTasklist: () => void;
}) {
  const {
    tasks,
    updateTask,
    draggingTask,
    setDraggingTask,
    temporaryTask,
    setTemporaryTask,
    setModalTask,
    loadTasksForRange,
  } = useTasks();
  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);
  const [selectedEventPos, setSelectedEventPos] = useState({ inverted: false, top: 0, left: 0, width: 0 });
  const [view, setView] = useState<string>("customDayView");
  const [slotHeight, setSlotHeight] = useState<number>(100);
  const handleOnChangeView = (selectedView: string) => setView(selectedView);

  const [date, setDate] = useState(new Date());

  const onNavigate = (newDate: Date) => {
    void loadTasksForRange(newDate);
    setDate(newDate);
  };

  const popupHeight = 400;
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      if (event.deltaY < 0) {
        setSlotHeight((prevHeight) => Math.min(prevHeight + 10, 200));
      } else {
        setSlotHeight((prevHeight) => Math.max(prevHeight - 10, 10));
      }
      event.preventDefault();
    }
  };

  useEffect(() => {
    const calendarElement = document.querySelector(".rbc-calendar");
    if (calendarElement) {
      (calendarElement as HTMLElement).addEventListener("wheel", handleWheel);
    }

    return () => {
      if (calendarElement) {
        (calendarElement as HTMLElement).removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handlePopupPlacement = (top: number, left: number, width: number) => {
    const screenHeight = window.innerHeight;
    const inverted = screenHeight - top < 200;
    const new_width = Math.max(width, 400);
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const left_new = left + width + new_width > windowWidth ? left - new_width - 2 : left + width + 1;

    const top_new = Math.min(top, windowHeight - popupHeight);
    setSelectedEventPos({ inverted: inverted, top: top_new, left: left_new, width: new_width });
  };

  const [timeRange, setTimeRange] = useState({
    start: moment(getLocalStorage("calendar-time-range-start", "09:00"), "HH:mm"),
    end: moment(getLocalStorage("calendar-time-range-end", "17:00"), "HH:mm"),
  });
  useEffect(() => {
    setLocalStorage("calendar-time-range-start", timeRange.start.format("HH:mm"));
    setLocalStorage("calendar-time-range-end", timeRange.end.format("HH:mm"));
  }, [timeRange]);

  const handleEventSelect = (event: object, e: SyntheticEvent<HTMLElement, Event>) => {
    if (selectedEvent?.id === (event as Task).id) {
      setTemporaryTask(null);
      return setSelectedEvent(null);
    }
    const parentElement = (e.target as HTMLElement).parentNode as HTMLElement;
    const { top, left, width } = parentElement.getBoundingClientRect();
    handlePopupPlacement(top, left, width);
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

    handlePopupPlacement(top, left, width);
    // Set selected event position and

    setSelectedEvent(event as Task);
  };
  const handleDoubleClickEvent = (event: object, _e: SyntheticEvent<HTMLElement, Event>) => {
    setSelectedEvent(null);
    setModalTask(event as Task);
  };

  return (
    <Box h="full">
      <style>{`
          .rbc-day-slot, .rbc-time-gutter { max-height: ${slotHeight}%!important; min-height: ${slotHeight}%!important; }
          .rbc-timeslot-group { min-height:20px!important; }
        `}</style>

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
        dayLayoutAlgorithm={"no-overlap"}
        onDoubleClickEvent={handleDoubleClickEvent}
        onDropFromOutside={handleExternalDrop}
        step={15}
        timeslots={4}
        components={{
          event: EventComponent as React.ComponentType<EventProps<object>>,
          toolbar: (props: ToolbarProps) => (
            <CustomToolbar
              {...props}
              setTimeRange={setTimeRange}
              timeRange={timeRange}
              isTaskListOpen={isTaskListOpen}
              toggleTasklist={toggleTasklist}
            />
          ),
        }}
        eventPropGetter={eventPropGetter as EventPropGetter<object>}
        slotPropGetter={(date) => ({ className: date.toISOString() })}
        formats={{ timeGutterFormat: "HH:mm" }}
        min={timeRange.start.toDate()}
        max={timeRange.end.toDate()}
      />
      {selectedEvent && (
        <CalendarPopup
          onClose={() => setSelectedEvent(null)}
          position={{
            top: selectedEventPos.top,
            left: selectedEventPos.left,
          }}
        >
          <EditTask
            task={selectedEvent}
            height={popupHeight}
            width={selectedEventPos.width}
            showCloseButton={false}
            showToolbar={false}
            onComplete={() => setSelectedEvent(null)}
          ></EditTask>
        </CalendarPopup>
      )}
    </Box>
  );
}
