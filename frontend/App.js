// App.js — Root component
const BASE_URL = "http://localhost:8000";

const useFetch = (url) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => { if (!cancelled) { setData(json); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
};

const App = () => {
  const emails = useFetch(`${BASE_URL}/api/emails`);
  const events = useFetch(`${BASE_URL}/api/events`);
  const [syncState, setSyncState] = React.useState("idle"); // idle | syncing | done | error

  const handleSync = React.useCallback(() => {
    setSyncState("syncing");
    fetch(`${BASE_URL}/api/sync`, { method: "POST" })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(() => {
        setSyncState("done");
        setTimeout(() => setSyncState("idle"), 2500);
      })
      .catch(() => {
        setSyncState("error");
        setTimeout(() => setSyncState("idle"), 2500);
      });
  }, []);

  const importantCount = emails.data ? emails.data.filter((e) => e.important).length : 0;

  const bannerProps = React.useMemo(() => {
    if (syncState === "done")
      return { type: "success", message: "Sync complete! Data is up to date." };
    if (syncState === "error")
      return { type: "error", message: "Sync failed. Please try again." };
    if (importantCount > 0)
      return { type: "warning", message: `${importantCount} important email${importantCount > 1 ? "s" : ""} need attention` };
    return null;
  }, [syncState, importantCount]);

  return React.createElement(
    "div",
    { className: "app" },
    React.createElement(Header, { onSync: handleSync, syncing: syncState === "syncing" }),
    bannerProps && React.createElement(NotificationBanner, bannerProps),
    React.createElement(EmailList, { loading: emails.loading, error: emails.error, data: emails.data }),
    React.createElement(EventList, { loading: events.loading, error: events.error, data: events.data })
  );
};
