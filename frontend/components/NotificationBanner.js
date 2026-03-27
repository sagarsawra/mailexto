// components/NotificationBanner.js
const ICONS = { warning: "⚠️", error: "🚨", success: "✅" };

const NotificationBanner = ({ message, type = "warning" }) => {
  return React.createElement(
    "div",
    { className: `notification-banner notification-banner--${type}` },
    React.createElement("span", { className: "notification-banner__icon" }, ICONS[type] || "ℹ️"),
    React.createElement("span", null, message)
  );
};
