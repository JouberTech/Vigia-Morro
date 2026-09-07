import { useContext } from "react";
import { MonitoringContext } from "../context/MonitoringContext";
export function useMonitoring() {
  const value = useContext(MonitoringContext);
  if (!value) throw new Error("useMonitoring requer MonitoringProvider.");
  return value;
}
