import { useEffect, useState } from "react";
import { getSlopeTelemetry } from "../services/sensorApi";
export function useTelemetry(id, hours, updatedAt) {
  const [result, setResult] = useState({
    points: [],
    loading: true,
    error: null,
  });
  useEffect(() => {
    let active = true;
    getSlopeTelemetry(id, hours)
      .then((points) => {
        if (active) setResult({ points, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setResult({ points: [], loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [id, hours, updatedAt]);
  return result;
}
