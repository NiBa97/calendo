import React from "react";
import * as dates from "date-arithmetic";
import { type DateLocalizer, Navigate, type NavigateAction } from "react-big-calendar";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import TimeGrid from "react-big-calendar/lib/TimeGrid";

interface CustomMultiDayViewProps {
  date: Date;
  localizer: DateLocalizer;
}

class CustomMultiDayView extends React.Component<CustomMultiDayViewProps> {
  static range: (date: Date, localizer: DateLocalizer, numberOfDays: number) => Date[];
  static navigate: (date: Date, action: NavigateAction) => Date;
  static title: (date: Date) => string;
  render() {
    console.log("props", this.props);
    const numberOfDays = 3;
    const { date, localizer, ...props } = this.props;
    const start = localizer.startOf(date, "day");
    const end = localizer.endOf(dates.add(start, numberOfDays - 1, "day"), "day");

    let current = start;
    const range = [];

    while (current.getTime() <= end.getTime()) {
      range.push(new Date(current.getTime()));
      current = dates.add(current, 1, "day");
    }
    console.log(range);

    const max = localizer.endOf(new Date(), "day");
    const min = localizer.startOf(new Date(), "day");
    return <TimeGrid localizer={localizer} range={range} min={min} max={max} {...props} />;
  }
}

CustomMultiDayView.range = (date: Date, localizer: DateLocalizer, numberOfDays: number) => {
  const start = localizer.startOf(date, "day");
  const end = localizer.endOf(dates.add(start, numberOfDays - 1, "day"), "day");

  let current = start;
  const range = [];

  while (localizer.lte(current, end, "day")) {
    range.push(current);
    current = dates.add(current, 1, "day");
  }
  return range;
};
CustomMultiDayView.navigate = (date: Date, action: NavigateAction) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return dates.add(date, -1, "day");
    case Navigate.NEXT:
      return dates.add(date, 1, "day");
    default:
      return date;
  }
};

CustomMultiDayView.title = (date: Date) => {
  return `Test ${date.toDateString()}`;
};

export default CustomMultiDayView;
