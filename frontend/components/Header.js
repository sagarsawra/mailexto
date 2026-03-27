// components/Header.js
const SyncIcon = ({ spinning }) =>
  React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: spinning ? { animation: "spin 0.9s linear infinite" } : {},
    },
    React.createElement("polyline", { points: "23 4 23 10 17 10" }),
    React.createElement("polyline", { points: "1 20 1 14 7 14" }),
    React.createElement("path", {
      d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
    })
  );

const Header = ({ onSync, syncing }) =>
  React.createElement(
    "header",
    { className: "header" },
    React.createElement(
      "span",
      { className: "header__title" },
      "Inbox ",
      React.createElement("span", null, "Intelligence")
    ),
    React.createElement(
      "button",
      {
        className: `sync-btn${syncing ? " syncing" : ""}`,
        onClick: onSync,
        disabled: syncing,
        title: "Sync emails and events",
      },
      React.createElement(SyncIcon, { spinning: syncing }),
      syncing ? "Syncing…" : "Sync"
    )
  );
