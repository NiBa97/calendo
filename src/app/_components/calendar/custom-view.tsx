import React, { useMemo } from "react";
import PropTypes from "prop-types";
import * as dates from "date-arithmetic";
import { Navigate, DateLocalizer } from "react-big-calendar";
import TimeGrid from "react-big-calendar/lib/TimeGrid";

function CustomMultiDayView({
  date,
  localizer,
  max = localizer.endOf(new Date(), "day"),
  min = localizer.startOf(new Date(), "day"),
  scrollToTime = localizer.startOf(new Date(), "day"),
  ...props
}) {
  const numberOfDays = props.numberOfDays || 3;
  const currRange = useMemo(
    () => CustomMultiDayView.range(date, localizer, numberOfDays),
    [date, localizer, numberOfDays]
  );

  return (
    <TimeGrid
      date={date}
      eventOffset={15}
      localizer={localizer}
      max={max}
      min={min}
      range={currRange}
      scrollToTime={scrollToTime}
      {...props}
    />
  );
}

CustomMultiDayView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  localizer: PropTypes.object,
  max: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  scrollToTime: PropTypes.instanceOf(Date),
};

CustomMultiDayView.range = (date, localizer, numberOfDays) => {
  const start = date;
  const end = dates.add(start, numberOfDays - 1, "day");

  let current = start;
  const range = [];

  while (localizer.lte(current, end, "day")) {
    range.push(current);
    current = dates.add(current, 1, "day");
  }

  return range;
};

CustomMultiDayView.navigate = (date, action, { localizer }) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return dates.add(date, -3, "day");
    case Navigate.NEXT:
      return dates.add(date, 3, "day");
    default:
      return date;
  }
};

CustomMultiDayView.title = (date, { localizer }) => {
  const start = localizer.format(dates.startOf(date, "day"), "DD MMM");
  const end = localizer.format(dates.endOf(dates.add(date, 2, "day"), "day"), "DD MMM");
  return `${start} - ${end}`;
};

export default CustomMultiDayView;
