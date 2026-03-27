// components/EventList.js
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

const EventItem = ({ title, time }) =>
  React.createElement(
    "div",
    { className: "event-item" },
    React.createElement("span", { className: "event-item__dot" }),
    React.createElement(
      "div",
      { className: "event-item__info" },
      React.createElement("span", { className: "event-item__title" }, title),
      React.createElement("span", { className: "event-item__time" }, time)
    )
  );

const EventList = ({ loading, error, data }) => {
  const renderContent = () => {
    if (loading)
      return [1, 2].map((i) =>
        React.createElement("div", { className: "skeleton", key: i })
      );
    if (error)
      return React.createElement("p", { className: "state-row" }, "Failed to load events.");
    if (!data || data.length === 0)
      return React.createElement("p", { className: "state-row" }, "No upcoming events.");
    return data.map((event) =>
      React.createElement(EventItem, {
        key: event._id,
        title: event.title,
        time: formatEventTime(event.datetime),
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
