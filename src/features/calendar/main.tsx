import { Box } from "@chakra-ui/react";
import {
  Calendar,
  type EventPropGetter,
  type EventProps,
  momentLocalizer,
  View,
} from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { useEffect, useState } from "react";
import { useTasks } from "../tasks/useTasks";
import Event from "./event";
import { Task } from "../tasks/type";
// @ts-ignore
import Toolbar from "react-big-calendar/lib/Toolbar";
import { DEFAULT_TASK_FILTER } from "../tasks/task-filter";

// Set moment locale to start week on Monday and configure timezone
moment.locale("en", {
  week: {
    dow: 1, // Monday is the first day of the week
  },
});

// The calendar does not provide any way to receive the range of dates that
// are visible except when they change. This is the cleanest way I could find
// to extend it to provide the _initial_ range (`onView` calls `onRangeChange`).
const InitialRangeChangeToolbar = (props: {
  onView: (view: View) => void;
  view: View;
}) => {
  useEffect(() => {
    props.onView(props.view);
  }, []);
  return <Toolbar {...props} />;
};

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const eventPropGetter = (event: Task) => {
  const style: React.CSSProperties = {
    borderRadius: "3px",
  };

  if (event.status) {
    return { className: "completed-task", style };
  }

  return { className: "uncompleted-task", style };
};

export default function MainCalendar() {
  const [visibleDateRange, setVisibleDateRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: undefined,
    end: undefined,
  });
  const {
    tasks,
    updateTask,
    refetch: refetchTasks,
  } = useTasks(
    { ...DEFAULT_TASK_FILTER, status: undefined },
    visibleDateRange.start,
    visibleDateRange.end
  );
  const [slotHeight, setSlotHeight] = useState<number>(100);
  const [date, setDate] = useState(new Date());

  const onNavigate = (newDate: Date) => {
    setDate(newDate);
  };

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
        (calendarElement as HTMLElement).removeEventListener(
          "wheel",
          handleWheel
        );
      }
    };
  }, []);

  type EventChangeArgs = {
    event: Task;
    start: Date;
    end: Date;
  };

  const onEventDropOrResize = ({
    start,
    end,
    event,
  }: {
    event: Task;
    start: Date;
    end: Date;
  }) => {
    event.startDate = start;
    event.endDate = end;
    void updateTask(event.id, { startDate: start, endDate: end });
  };

  // const handleSelectSlot = (slotInfo: SlotInfo) => {
  //     // const { start, end, bounds } = slotInfo;
  //     // setTemporaryTask(null);

  //     if (!bounds) return; // exit if bounds are not available

  //     // Create a partial Task object for temporary task
  //     // const event: Partial<Task> = {
  //     //     title: "",
  //     //     startDate: start,
  //     //     endDate: end,
  //     //     isAllDay: false,
  //     //     status: false,
  //     // };

  //     // if (isMobile) {
  //     //     // On mobile, use modal instead of popup
  //     //     setTemporaryTask(event as Task);
  //     //     setModalTask(event as Task);
  //     //     setSelectedEvent(null);
  //     //     return;
  //     // }

  //     const el = document.getElementsByClassName(start.toISOString());
  //     if (el.length == 0 || el[0] == undefined) {
  //         return;
  //     }
  //     // const { top, left, width } = el.length == 1 ? el[0].getBoundingClientRect() : el[1]!.getBoundingClientRect();
  //     // setTemporaryTask(event as Task);

  //     // handlePopupPlacement(top, left, width);
  //     // setSelectedEvent(event as Task);
  // };
  const onRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    let start: Date;
    let end: Date;
    // log the first and last date of the range
    if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else {
      start = range.start;
      end = range.end;
    }
    console.log("Visible date range changed:", start, end);
    refetchTasks({ ...DEFAULT_TASK_FILTER, status: undefined }, start, end);

    setVisibleDateRange({ start, end });
  };
  return (
    <Box h="full" w="full" overflow={"hidden"}>
      <style>{`
          .rbc-day-slot, .rbc-time-gutter { max-height: ${slotHeight}%!important; min-height: ${slotHeight}%!important; }
          .rbc-timeslot-group { min-height: 20px!important; }
        `}</style>

      {visibleDateRange.start && visibleDateRange.end && (
        <div className="visible-date-range">
          Visible Date Range:{" "}
          {moment(visibleDateRange.start).format("YYYY-MM-DD HH:mm")} -{" "}
          {moment(visibleDateRange.end).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      )}
      <DnDCalendar
        defaultView="week"
        // view={"week"}
        components={{
          toolbar: InitialRangeChangeToolbar,
          event: Event as React.ComponentType<EventProps<object>>,
        }}
        date={date}
        selectable
        events={[...tasks.filter((task) => task.startDate && task.endDate)]}
        startAccessor={(event) => (event as Task).startDate ?? new Date()}
        endAccessor={(event) => (event as Task).endDate ?? new Date()}
        titleAccessor={(event) => (event as Task).title}
        resourceIdAccessor={(event) => (event as Task).id}
        allDayAccessor={(event) => (event as Task).isAllDay}
        showMultiDayTimes
        localizer={localizer}
        onNavigate={onNavigate}
        onView={(view) => console.log("View changed to:", view)}
        onRangeChange={(range) => onRangeChange(range)}
        // onView={handleOnChangeView}
        onEventDrop={(args) => onEventDropOrResize(args as EventChangeArgs)}
        onEventResize={(args) => onEventDropOrResize(args as EventChangeArgs)}
        // onSelectEvent={handleEventSelect}
        // onSelectSlot={handleSelectSlot}
        dayLayoutAlgorithm={"no-overlap"}
        // onDoubleClickEvent={handleDoubleClickEvent}
        // onDropFromOutside={handleExternalDrop}
        step={15}
        timeslots={4}
        eventPropGetter={eventPropGetter as EventPropGetter<object>}
        slotPropGetter={(date) => ({ className: date.toISOString() })}
        formats={{ timeGutterFormat: "HH:mm" }}
        // min={timeRange.start.toDate()}
        // max={timeRange.end.toDate()}
      />
    </Box>
  );
}
