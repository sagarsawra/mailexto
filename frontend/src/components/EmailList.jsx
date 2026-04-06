import React from "react";

const EmailItem = ({ subject, sender, important }) =>
  React.createElement(
    "div",
    { className: `email-item${important ? " email-item--important" : ""}` },
    React.createElement(
      "div",
      { className: "email-item__header" },
      React.createElement("span", { className: "email-item__subject" }, subject),
      important && React.createElement("span", { className: "email-item__badge" }, "Important")
    ),
    React.createElement("span", { className: "email-item__sender" }, sender)
  );

const EmailList = ({ loading, error, data }) => {
  const renderContent = () => {
    if (loading)
      return [1, 2, 3].map((i) =>
        React.createElement("div", { className: "skeleton", key: `skeleton-email-${i}` })
      );

    if (error)
      return React.createElement(
        "div",
        { className: "error-state" },
        React.createElement("span", { className: "error-state__icon" }, "⚠️"),
        React.createElement("span", { className: "error-state__message" }, "Failed to load emails"),
        React.createElement("span", { className: "error-state__detail" }, `(${error})`)
      );

    if (!data || data.length === 0)
      return React.createElement(
        "div",
        { className: "empty-state" },
        React.createElement("span", { className: "empty-state__icon" }, "📭"),
        React.createElement("span", { className: "empty-state__title" }, "No important emails"),
        React.createElement("span", { className: "empty-state__subtitle" }, "You're all caught up!")
      );

    return data
      .slice(0, 5)
      .map((email) =>
        React.createElement(EmailItem, {
          key: email._id,
          subject: email.subject,
          sender: email.sender,
          important: email.important,
        })
      );
  };

  return React.createElement(
    "div",
    { className: "section" },
    React.createElement("p", { className: "section__title" }, "Important Emails"),
    renderContent()
  );
};

export default EmailList;
