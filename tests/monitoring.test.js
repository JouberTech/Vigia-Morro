import test from "node:test";
import assert from "node:assert/strict";
import { createMockEngine, demoRisk } from "../src/mocks/engine.js";
import { RISK_LEVELS } from "../src/utils/risk.js";

const baseline = {
  soilMoisture: 48,
  rain1h: 3,
  tilt: 0.6,
  movement: false,
  tractionWire: "NORMAL",
};

test("demonstração possui cinco áreas, conectividade coerente e todos os campos de telemetria", () => {
  const engine = createMockEngine();
  const data = engine.getSnapshot();
  assert.equal(data.slopes.length, 5);
  assert.equal(
    data.devices.length,
    data.dashboard.online + data.dashboard.offline + data.dashboard.unstable,
  );
  assert.equal(
    data.dashboard.activeAlerts,
    data.alerts.filter((a) => a.status === "Ativo").length,
  );
  for (const slope of data.slopes)
    for (const field of [
      "latitude",
      "longitude",
      "riskLevel",
      "soilMoisture",
      "rain1h",
      "rain24h",
      "tilt",
      "movement",
      "tractionWire",
      "updatedAt",
    ])
      assert.ok(field in slope, field);
});

test("controles demonstrativos permitem percorrer os cinco estágios", () => {
  const inputs = [
    baseline,
    { ...baseline, soilMoisture: 64 },
    { ...baseline, soilMoisture: 78 },
    { ...baseline, rain1h: 24 },
    { ...baseline, tilt: 6.2 },
  ];
  assert.deepEqual(inputs.map(demoRisk), RISK_LEVELS);
});

test("fluxo hackathon: cenário crítico atualiza indicadores, assinantes e histórico, gerando alerta sem duplicação", () => {
  let currentTime = Date.parse("2026-09-06T18:00:00Z");
  const engine = createMockEngine({ now: () => currentTime });
  let latest;
  let calls = 0;
  const unsubscribe = engine.subscribe((data) => {
    latest = data;
    calls++;
  });
  try {
    const initialAlerts = latest.alerts.length;
    currentTime += 1000;
    engine.simulate("jenipapo-01", {
      soilMoisture: 94,
      rain1h: 39,
      tilt: 6.2,
      movement: true,
      tractionWire: "NORMAL",
    });
    assert.equal(
      latest.slopes.find((s) => s.id === "jenipapo-01").riskLevel,
      "ALERTA_MAXIMO",
    );
    assert.equal(latest.dashboard.generalRisk, "ALERTA_MAXIMO");
    assert.equal(latest.dashboard.activeAlerts, 3);
    assert.equal(latest.dashboard.criticalSlopes, 2);
    assert.equal(latest.alerts.length, initialAlerts + 1);
    assert.equal(engine.telemetry("jenipapo-01", 1).at(-1).soilMoisture, 94);
    engine.simulate("jenipapo-01", {
      soilMoisture: 95,
      rain1h: 40,
      tilt: 6.3,
      movement: true,
      tractionWire: "NORMAL",
    });
    assert.equal(latest.alerts.length, initialAlerts + 1);
    assert.equal(calls, 3);
  } finally {
    unsubscribe();
  }
});

test("reconhecer e resolver altera status, preserva risco e rejeita transições inválidas", () => {
  const engine = createMockEngine();
  const id = "VM-AL-0042";
  assert.throws(() => engine.updateAlert(id, "Resolvido"), /Transição/);
  engine.updateAlert(id, "Reconhecido");
  assert.equal(engine.getSnapshot().dashboard.activeAlerts, 1);
  engine.updateAlert(id, "Resolvido");
  assert.equal(
    engine.getSnapshot().alerts.find((a) => a.id === id).status,
    "Resolvido",
  );
  assert.equal(engine.getSnapshot().slopes[0].riskLevel, "ALERTA");
  assert.throws(() => engine.updateAlert(id, "Ativo"), /Transição/);
});

test("reiniciar restaura dados; estados estáveis não resolvem alertas silenciosamente", () => {
  const engine = createMockEngine();
  engine.simulate("ibura-01", baseline);
  assert.equal(engine.getSnapshot().slopes[0].riskLevel, "NORMALIDADE");
  assert.equal(engine.getSnapshot().alerts[0].status, "Ativo");
  engine.reset();
  assert.equal(engine.getSnapshot().slopes[0].soilMoisture, 86);
  assert.equal(engine.getSnapshot().slopes[0].riskLevel, "ALERTA");
  assert.equal(engine.getSnapshot().alerts.length, 4);
});

test("históricos respeitam período, ordem cronológica, quatro séries e leitura mais recente", () => {
  const now = Date.parse("2026-09-06T18:00:00Z");
  const engine = createMockEngine({ now: () => now });
  for (const hours of [1, 6, 12, 24, 168]) {
    const points = engine.telemetry("ibura-01", hours);
    assert.ok(points.length >= 2 && points.length <= 101);
    assert.ok(
      new Date(points[0].timestamp).getTime() >= now - hours * 3600_000,
    );
    assert.equal(new Date(points.at(-1).timestamp).getTime(), now);
    assert.deepEqual(
      [...points].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      points,
    );
    assert.ok(
      points.every((p) =>
        ["soilMoisture", "rain1h", "tilt", "riskIndex"].every((key) =>
          Number.isFinite(p[key]),
        ),
      ),
    );
  }
});

test("cleanup remove assinante e leituras periódicas preservam contato de dispositivos offline", () => {
  let now = Date.now();
  const engine = createMockEngine({ now: () => now });
  let calls = 0;
  const initial = engine.getSnapshot();
  const unsubscribe = engine.subscribe(() => calls++);
  const offline = initial.devices.find((d) => d.status === "Offline");
  now += 8000;
  engine.tick();
  assert.equal(calls, 2);
  const current = engine.getSnapshot();
  assert.equal(
    current.devices.find((d) => d.id === offline.id).lastContact,
    offline.lastContact,
  );
  assert.equal(
    current.devices.find((d) => d.status === "Online").lastContact,
    new Date(now).toISOString(),
  );
  unsubscribe();
  engine.tick();
  assert.equal(calls, 2);
});

test("leituras inválidas e IDs inexistentes são rejeitados sem alterar o estado", () => {
  const engine = createMockEngine();
  const before = engine.getSnapshot();
  assert.throws(() =>
    engine.simulate("ibura-01", { ...baseline, soilMoisture: NaN }),
  );
  assert.throws(() => engine.simulate("ibura-01", { ...baseline, rain1h: -1 }));
  assert.throws(() => engine.simulate("nao-existe", baseline));
  assert.throws(() => engine.telemetry("nao-existe"));
  assert.deepEqual(engine.getSnapshot(), before);
});
