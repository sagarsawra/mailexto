import React from "react";

const formatEventTime = (datetime) => {
  if (!datetime) return "No time set";
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return "No time set";
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PRIORITY_LABELS = { high: "High", medium: "Medium", low: "Low" };

const EventItem = ({ title, time, priority }) => {
  const dotClass = priority
    ? `event-item__dot event-item__dot--${priority}`
    : "event-item__dot";

  const tagClass = priority
    ? `event-item__priority-tag event-item__priority-tag--${priority}`
    : null;

  return React.createElement(
    "div",
    { className: "event-item" },
    React.createElement("span", { className: dotClass }),
    React.createElement(
      "div",
      { className: "event-item__info" },
      React.createElement("span", { className: "event-item__title" }, title),
      React.createElement("span", { className: "event-item__time" }, time)
    ),
    tagClass && React.createElement("span", { className: tagClass }, PRIORITY_LABELS[priority] || priority)
  );
};

const EventList = ({ loading, error, data }) => {
  const renderContent = () => {
    if (loading)
      return [1, 2].map((i) =>
        React.createElement("div", { className: "skeleton", key: `skeleton-event-${i}` })
      );

    if (error)
      return React.createElement(
        "div",
        { className: "error-state" },
        React.createElement("span", { className: "error-state__icon" }, "⚠️"),
        React.createElement("span", { className: "error-state__message" }, "Failed to load events"),
        React.createElement("span", { className: "error-state__detail" }, `(${error})`)
      );

    if (!data || data.length === 0)
      return React.createElement(
        "div",
        { className: "empty-state" },
        React.createElement("span", { className: "empty-state__icon" }, "📅"),
        React.createElement("span", { className: "empty-state__title" }, "No upcoming events"),
        React.createElement("span", { className: "empty-state__subtitle" }, "Relax, nothing scheduled")
      );

    return data.map((event) =>
      React.createElement(EventItem, {
        key: event._id,
        title: event.title,
        time: formatEventTime(event.datetime),
        priority: event.priority,
      })
    );
  };

  return React.createElement(
    "div",
    { className: "section" },
    React.createElement("p", { className: "section__title" }, "Upcoming Events"),
    renderContent()
  );
};

export default EventList;
