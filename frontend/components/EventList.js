// components/EventList.js
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
        key: event.id,
        title: event.title,
        time: event.time,
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
