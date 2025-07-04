import { Box, Flex, Text } from "@chakra-ui/react";
import {
  Calendar,
  type EventPropGetter,
  type EventProps,
  Messages,
  type SlotInfo,
  ToolbarProps,
  type View,
  momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTasks } from "../../features/tasks/contexts/task-context";
import CustomMultiDayView from "./custom-view";
import CalendarPopup from "./popup";
import { Task } from "../../features/tasks/types/task.types";
import { getLocalStorage, setLocalStorage } from "../../utils/storage";
import { getContrastColor } from "../../utils/colors";
import CustomToolbar from "./custom-toolbar";
import EditTask from "../task-edit";
import { FaUsers } from "react-icons/fa6";
import { useTags } from "../../contexts/tag-context";
import { Badge } from "@chakra-ui/react";
import { useIsMobile } from "../../utils/responsive";

// Set moment locale to start week on Monday
moment.locale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
  }
});

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const defaultViewOptions: Record<string, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  customDayView: "3 Days",
};

// Define the structure for the views prop expected by react-big-calendar
type CalendarViews = {
  [key: string]: boolean | React.ComponentType<any>;
};

const EventComponent = ({ event }: { event: Task }) => {
  const isOverdue = moment(event.endDate).isBefore(moment().startOf("day")) && !event.status;
  const { setContextInformation } = useTasks();
  const { tags } = useTags();

  const durationMinutes =
    event.startDate && event.endDate ? moment(event.endDate).diff(moment(event.startDate), "minutes") : 0;

  const eventTags = tags.filter((tag) => event.tags?.includes(tag.id));

  let backgroundColor = "transparent";
  let textColor = "brand.4";

  if (eventTags.length === 1) {
    backgroundColor = eventTags[0].color;
    textColor = getContrastColor(eventTags[0].color);
  }

  const isVerySmallEvent = durationMinutes <= 15;
  const isSmallEvent = durationMinutes <= 30;
  const isMediumEvent = durationMinutes <= 60;

  const shouldShowTags = !isSmallEvent && eventTags.length > 0;
  const shouldShowTime = !isVerySmallEvent && !event.isAllDay;

  const getDisplayTitle = () => {
    const name = event.title;

    if (isVerySmallEvent && name.length > 12) {
      return name.substring(0, 10) + "...";
    }

    if (isSmallEvent && name.length > 20) {
      return name.substring(0, 18) + "...";
    }

    return name;
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextInformation({ x: e.clientX, y: e.clientY, task: event });
  };

  if (isVerySmallEvent) {
    return (
      <Flex
        width="100%"
        height="100%"
        color={textColor}
        p={1}
        bg={backgroundColor}
        borderLeft={isOverdue ? "4px solid red" : ""}
        onContextMenu={onContextMenu}
        alignItems="center"
        title={event.title}
      >
        <Text fontWeight={600} textDecoration={event.status ? "line-through" : "none"} fontSize="sm" lineHeight="1">
          {event.user && event.user.length > 1 && (
            <FaUsers size="0.7em" style={{ display: "inline", marginRight: "2px" }} />
          )}
          {getDisplayTitle()}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      width="100%"
      height="100%"
      color={textColor}
      p={isSmallEvent ? 1 : 2}
      bg={backgroundColor}
      borderLeft={isOverdue ? "4px solid red" : ""}
      onContextMenu={onContextMenu}
      flexDirection="column"
      justifyContent="space-between"
      title={event.title}
    >
      <Flex justifyContent="space-between" alignItems="center" width="100%" gap={1}>
        <Text
          fontWeight={600}
          textDecoration={event.status ? "line-through" : "none"}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          display="flex"
          alignItems="center"
          gap={1}
          maxWidth={shouldShowTime ? "70%" : "100%"}
          fontSize={"sm"}
          lineHeight={isSmallEvent ? "1.1" : "normal"}
        >
          {event.user && event.user.length > 1 && (
            <FaUsers size={isSmallEvent ? "0.7em" : "0.8em"} style={{ flexShrink: 0 }} />
          )}
          {getDisplayTitle()}
        </Text>

        {shouldShowTime && (
          <Text fontSize={isSmallEvent ? "2xs" : "xs"} opacity={0.9} flexShrink={0} lineHeight="1">
            {moment(event.startDate).format("HH:mm")}
            {!isSmallEvent && ` - ${moment(event.endDate).format("HH:mm")}`}
          </Text>
        )}
      </Flex>

      {shouldShowTags && (
        <Flex mt={isSmallEvent ? 0.5 : 1} flexWrap="wrap" gap={isSmallEvent ? 0.5 : 1}>
          {eventTags.slice(0, isMediumEvent ? 2 : 3).map((tag) => (
            <Badge
              key={tag.id}
              borderRadius="full"
              px={1}
              py={0}
              fontSize={isSmallEvent ? "0.5em" : "0.6em"}
              bg={backgroundColor === tag.color ? "whiteAlpha.300" : tag.color}
              color={backgroundColor === tag.color ? textColor : getContrastColor(tag.color)}
            >
              {isSmallEvent && tag.name.length > 5 ? tag.name.substring(0, 3) + "..." : tag.name}
            </Badge>
          ))}
          {eventTags.length > (isMediumEvent ? 2 : 3) && (
            <Badge borderRadius="full" px={1} py={0} fontSize={isSmallEvent ? "0.5em" : "0.6em"} bg="blackAlpha.200">
              +{eventTags.length - (isMediumEvent ? 2 : 3)}
            </Badge>
          )}
        </Flex>
      )}
    </Flex>
  );
};

const eventPropGetter = (event: Task) => {
  const style: React.CSSProperties = {
    borderRadius: "3px",
  };

  if (event.status) {
    return { className: "completed-task", style };
  }

  return { className: "uncompleted-task", style };
};

export default function MainCalendar({
  isTaskListOpen,
  toggleTasklist,
  availableViews,
}: {
  isTaskListOpen: boolean;
  toggleTasklist: () => void;
  availableViews?: Record<string, string>;
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
  const isMobile = useIsMobile();
  const calendarRef = useRef<HTMLDivElement>(null);

  const effectiveViewOptions = useMemo(() => availableViews || defaultViewOptions, [availableViews]);
  const viewKeys = useMemo(() => Object.keys(effectiveViewOptions), [effectiveViewOptions]);
  const isSingleViewForced = useMemo(() => viewKeys.length === 1, [viewKeys]);
  const initialViewKey = useMemo(() => {
    if (isSingleViewForced) {
      return viewKeys[0]; // Use the only available view
    }
    const storedView = getLocalStorage("calendar-view", viewKeys[0]) as string; // Default to first available if not found
    // Validate stored view against current options
    return viewKeys.includes(storedView) ? storedView : viewKeys[0];
  }, [isSingleViewForced, viewKeys]);

  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);
  const [selectedEventPos, setSelectedEventPos] = useState({ inverted: false, top: 0, left: 0, width: 0 });
  const [view, setView] = useState<View>(initialViewKey as View);
  const [slotHeight, setSlotHeight] = useState<number>(isMobile ? 300 : 100);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (isMobile) setSlotHeight(300)
    else setSlotHeight(100)
  }, [isMobile])

  const handleOnChangeView = (selectedViewKey: string) => {
    setView(selectedViewKey as View);
    // Only update local storage if the view wasn't automatically forced
    if (!isSingleViewForced) {
      setLocalStorage("calendar-view", selectedViewKey);
    }
  };

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

  // Auto-scroll to current hour on mobile
  useEffect(() => {
    if (isMobile && calendarRef.current) {
      const scrollToCurrentHour = () => {
        const currentHour = moment().hour();
        const calendarContainer = calendarRef.current?.querySelector('.rbc-time-content');

        if (calendarContainer) {
          // Each hour slot is approximately 60px high in react-big-calendar
          const hourHeight = 60;
          const scrollPosition = currentHour * hourHeight;

          // Scroll to current hour with some offset to center it better
          calendarContainer.scrollTop = Math.max(0, scrollPosition - 120);
        }
      };

      // Delay the scroll to ensure the calendar is fully rendered
      const timeoutId = setTimeout(scrollToCurrentHour, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isMobile, view, date]);

  const handleEventSelect = (event: object, e: SyntheticEvent<HTMLElement, Event>) => {
    if (selectedEvent?.id === (event as Task).id) {
      setTemporaryTask(null);
      return setSelectedEvent(null);
    }

    if (isMobile) {
      // On mobile, use modal instead of popup
      setModalTask(event as Task);
      setSelectedEvent(null);
      return;
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


  const messages = {
    customDayView: numberOfDays + " Days",
  } as Partial<Messages>;

  const handleExternalDrop = (args: { start: string | number | Date; end: string | number | Date }) => {
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
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const { start, end, bounds } = slotInfo;
    setTemporaryTask(null);

    if (!bounds) return; // exit if bounds are not available

    // Create a partial Task object for temporary task
    const event: Partial<Task> = {
      title: "",
      startDate: start,
      endDate: end,
      isAllDay: false,
      status: false,
    };

    if (isMobile) {
      // On mobile, use modal instead of popup
      setTemporaryTask(event as Task);
      setModalTask(event as Task);
      setSelectedEvent(null);
      return;
    }

    const el = document.getElementsByClassName(start.toISOString());
    if (el.length == 0 || el[0] == undefined) {
      return;
    }
    const { top, left, width } = el.length == 1 ? el[0].getBoundingClientRect() : el[1]!.getBoundingClientRect();
    setTemporaryTask(event as Task);

    handlePopupPlacement(top, left, width);
    setSelectedEvent(event as Task);
  };
  const handleDoubleClickEvent = (event: object) => {
    setSelectedEvent(null);
    setModalTask(event as Task);
  };

  // Reintroduce dynamic generation of calendarViews
  const calendarViews = useMemo((): CalendarViews => {
    return viewKeys.reduce((acc, key) => {
      if (key === "customDayView") {
        acc[key] = CustomMultiDayView; // Use the imported component
      } else if (defaultViewOptions.hasOwnProperty(key)) { // Check if it's a standard view
        acc[key] = true; // Standard views
      }
      // Ignore keys not in defaultViewOptions if they aren't customDayView
      return acc;
    }, {} as CalendarViews);
  }, [viewKeys]);

  return (
    <Box h="full" pl={isMobile ? 0 : 2} w="full" overflow={isMobile ? "auto" : "hidden"} ref={calendarRef}>
      <style>{`
          .rbc-day-slot, .rbc-time-gutter { max-height: ${slotHeight}%!important; min-height: ${slotHeight}%!important; }
          .rbc-timeslot-group { min-height: 20px!important; }
        `}</style>
      <DnDCalendar
        view={view}
        date={date}
        views={calendarViews}
        selectable
        events={[...tasks.filter((task) => task.startDate && task.endDate), ...(temporaryTask ? [temporaryTask] : [])]}
        startAccessor={(event) => (event as Task).startDate ?? new Date()}
        messages={messages}
        endAccessor={(event) => (event as Task).endDate ?? new Date()}
        titleAccessor={(event) => (event as Task).title}
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
              view={view as View}
              onView={handleOnChangeView}
              viewOptions={effectiveViewOptions}
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
        min={isMobile ? moment("00:00", "HH:mm").toDate() : timeRange.start.toDate()}
        max={isMobile ? moment("23:59", "HH:mm").toDate() : timeRange.end.toDate()}
      />
      {selectedEvent && !isMobile && (
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
