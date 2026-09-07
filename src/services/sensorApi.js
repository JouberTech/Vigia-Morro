import { createMockEngine } from "../mocks/engine.js";

// Única fronteira de dados da interface. Troque este adaptador ao conectar a API.
// O ESP32 nunca se conecta diretamente ao navegador.
const mock = createMockEngine();
export const getDashboard = async () => mock.getSnapshot().dashboard;
export const getSlopes = async () => mock.getSnapshot().slopes;
export const getSlope = async (id) =>
  mock.getSnapshot().slopes.find((s) => s.id === id) ?? null;
export const getSlopeTelemetry = async (id, hours = 24) =>
  mock.telemetry(id, hours);
export const getAlerts = async () => mock.getSnapshot().alerts;
export const getDevices = async () => mock.getSnapshot().devices;
export const subscribeMonitoring = (onData, onError) => {
  try {
    return mock.subscribe(onData);
  } catch (error) {
    onError?.(error);
    return () => {};
  }
};
export const simulateReadings = async (id, values) => mock.simulate(id, values);
export const updateAlertStatus = async (id, status) =>
  mock.updateAlert(id, status);
export const resetDemo = async () => mock.reset();
