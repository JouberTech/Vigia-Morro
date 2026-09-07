import { createSeed, createHistory } from "./data.js";
import { RISK_LEVELS, byRisk, riskInfo } from "../utils/risk.js";

// Exclusivamente demonstrativo: este cálculo não é um modelo geotécnico.
// O backend real deverá fornecer riskLevel. A interface apenas o apresenta.
export function demoRisk(values) {
  const index = Math.max(
    values.soilMoisture >= 92
      ? 4
      : values.soilMoisture >= 82
        ? 3
        : values.soilMoisture >= 72
          ? 2
          : values.soilMoisture >= 60
            ? 1
            : 0,
    values.rain1h >= 35
      ? 4
      : values.rain1h >= 20
        ? 3
        : values.rain1h >= 12
          ? 2
          : values.rain1h >= 7
            ? 1
            : 0,
    values.tilt >= 5
      ? 4
      : values.tilt >= 3.5
        ? 3
        : values.tilt >= 2
          ? 2
          : values.tilt >= 1
            ? 1
            : 0,
    values.tractionWire === "ROMPIDO" ? 4 : values.movement ? 3 : 0,
  );
  return RISK_LEVELS[index];
}

export function summarize(state) {
  return {
    generalRisk: [...state.slopes].sort(byRisk)[0]?.riskLevel ?? "NORMALIDADE",
    slopesCount: state.slopes.length,
    online: state.devices.filter((d) => d.status === "Online").length,
    unstable: state.devices.filter((d) => d.status === "Instável").length,
    offline: state.devices.filter((d) => d.status === "Offline").length,
    activeAlerts: state.alerts.filter((a) => a.status === "Ativo").length,
    criticalSlopes: state.slopes.filter((s) => riskInfo(s.riskLevel).rank >= 3)
      .length,
    maxRain24h: Math.max(0, ...state.slopes.map((s) => s.rain24h)),
    maxSoilMoisture: Math.max(0, ...state.slopes.map((s) => s.soilMoisture)),
    updatedAt: state.updatedAt,
  };
}

export function createMockEngine({ now = () => Date.now() } = {}) {
  let state = createSeed(now());
  let history = Object.fromEntries(
    state.slopes.map((s) => [s.id, createHistory(s, now())]),
  );
  let sequence = 42;
  let timer;
  const listeners = new Set();
  const snapshot = () => ({ ...state, dashboard: summarize(state) });
  const emit = () => {
    const data = snapshot();
    for (const listener of listeners) listener(data);
  };
  const addEvent = (text, slopeId, type = "reading") => {
    state = {
      ...state,
      events: [
        {
          id: `ev-${now()}-${++sequence}`,
          type,
          text,
          slopeId,
          createdAt: new Date(now()).toISOString(),
        },
        ...state.events,
      ].slice(0, 50),
    };
  };
  function record(slope) {
    history[slope.id] = [
      ...history[slope.id],
      {
        timestamp: slope.updatedAt,
        soilMoisture: slope.soilMoisture,
        rain1h: slope.rain1h,
        tilt: slope.tilt,
        riskIndex: riskInfo(slope.riskLevel).rank * 20 + 10,
      },
    ].filter(
      (p) => new Date(p.timestamp).getTime() >= now() - 7 * 24 * 3600_000,
    );
  }
  function tick() {
    const stamp = new Date(now()).toISOString();
    state = {
      ...state,
      updatedAt: stamp,
      slopes: state.slopes.map((s) => ({ ...s, updatedAt: stamp })),
      devices: state.devices.map((d) =>
        d.status === "Offline" ? d : { ...d, lastContact: stamp },
      ),
    };
    state.slopes.forEach(record);
    emit();
  }
  return {
    getSnapshot: snapshot,
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      if (!timer) timer = setInterval(tick, 8000);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    telemetry(id, hours = 24) {
      if (!history[id]) throw new Error("Encosta não encontrada.");
      const points = history[id].filter(
        (p) => new Date(p.timestamp).getTime() >= now() - hours * 3600_000,
      );
      const stride = Math.max(1, Math.ceil(points.length / 100));
      return points.filter(
        (_, index) => index % stride === 0 || index === points.length - 1,
      );
    },
    simulate(id, values) {
      const previous = state.slopes.find((s) => s.id === id);
      if (!previous) throw new Error("Encosta não encontrada.");
      const ranges = { soilMoisture: [0, 100], rain1h: [0, 60], tilt: [0, 10] };
      for (const [key, [min, max]] of Object.entries(ranges))
        if (
          !Number.isFinite(values[key]) ||
          values[key] < min ||
          values[key] > max
        )
          throw new Error("Leitura simulada fora do intervalo permitido.");
      const stamp = new Date(now()).toISOString();
      const slope = {
        ...previous,
        soilMoisture: values.soilMoisture,
        rain1h: values.rain1h,
        tilt: values.tilt,
        movement: Boolean(values.movement),
        tractionWire: values.tractionWire === "ROMPIDO" ? "ROMPIDO" : "NORMAL",
        rain24h: +Math.max(
          values.rain1h,
          previous.rain24h + values.rain1h - previous.rain1h,
        ).toFixed(1),
        updatedAt: stamp,
      };
      slope.riskLevel = demoRisk(slope);
      state = {
        ...state,
        slopes: state.slopes.map((s) => (s.id === id ? slope : s)),
        updatedAt: stamp,
      };
      record(slope);
      if (
        riskInfo(slope.riskLevel).rank >= 2 &&
        !state.alerts.some(
          (a) =>
            a.slopeId === id &&
            a.riskLevel === slope.riskLevel &&
            a.status !== "Resolvido",
        )
      ) {
        const sensors = state.devices.filter(
          (d) => d.slopeId === id && d.status !== "Offline",
        );
        const alert = {
          id: `VM-AL-${String(++sequence).padStart(4, "0")}`,
          slopeId: id,
          slopeName: slope.name,
          neighborhood: slope.neighborhood,
          riskLevel: slope.riskLevel,
          description:
            "Cenário simulado: alteração da umidade, chuva ou inclinação. Indicadores demonstrativos para apresentação.",
          sensors: sensors.slice(0, 3).map((d) => d.id),
          status: "Ativo",
          createdAt: stamp,
          updatedAt: stamp,
        };
        state = { ...state, alerts: [alert, ...state.alerts] };
      }
      addEvent(
        `Simulação aplicada em ${slope.neighborhood}: ${riskInfo(slope.riskLevel).label}`,
        id,
        "simulation",
      );
      emit();
      return slope;
    },
    updateAlert(id, status) {
      const alert = state.alerts.find((a) => a.id === id);
      if (!alert) throw new Error("Alerta não encontrado.");
      if (
        !(alert.status === "Ativo" && status === "Reconhecido") &&
        !(alert.status === "Reconhecido" && status === "Resolvido")
      )
        throw new Error("Transição de status inválida.");
      state = {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === id
            ? { ...a, status, updatedAt: new Date(now()).toISOString() }
            : a,
        ),
      };
      addEvent(`Alerta ${id}: ${status.toLowerCase()}`, alert.slopeId, "alert");
      emit();
    },
    reset() {
      state = createSeed(now());
      history = Object.fromEntries(
        state.slopes.map((s) => [s.id, createHistory(s, now())]),
      );
      sequence = 42;
      emit();
    },
    tick,
  };
}
