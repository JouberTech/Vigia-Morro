import { createContext, useCallback, useEffect, useState } from "react";
import { subscribeMonitoring } from "../services/sensorApi";

export const MonitoringContext = createContext(null);
export function MonitoringProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    setError(null);
    return subscribeMonitoring((value) => {
      setData(value);
      setError(null);
    }, setError);
  }, [attempt]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return (
    <MonitoringContext.Provider
      value={{ data, error, online, retry, loading: !data && !error }}
    >
      {children}
    </MonitoringContext.Provider>
  );
}
