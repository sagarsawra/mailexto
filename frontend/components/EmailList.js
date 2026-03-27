// components/EmailList.js
const EmailItem = ({ subject, sender }) =>
  React.createElement(
    "div",
    { className: "email-item" },
    React.createElement("span", { className: "email-item__subject" }, subject),
    React.createElement("span", { className: "email-item__sender" }, sender)
  );

const EmailList = ({ loading, error, data }) => {
  const renderContent = () => {
    if (loading)
      return [1, 2, 3].map((i) =>
        React.createElement("div", { className: "skeleton", key: i })
      );
    if (error)
      return React.createElement("p", { className: "state-row" }, "Failed to load emails.");
    if (!data || data.length === 0)
      return React.createElement("p", { className: "state-row" }, "No important emails.");
    return data
      .slice(0, 5)
      .map((email) =>
        React.createElement(EmailItem, {
          key: email._id,
          subject: email.subject,
          sender: email.sender,
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
