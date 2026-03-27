// popup.js — React root mount
const { createRoot } = ReactDOM;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(React.createElement(App));
});
