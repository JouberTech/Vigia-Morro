const minute = 60_000;
export function createSeed(now = Date.now()) {
  const areas = [
    {
      id: "ibura-01",
      name: "Encosta Ibura 01",
      neighborhood: "Ibura",
      location: "Setor de monitoramento • Zona Sul",
      latitude: -8.1163,
      longitude: -34.9492,
      riskLevel: "ALERTA",
      soilMoisture: 86,
      rain1h: 21.5,
      rain24h: 87.2,
      tilt: 3.7,
      movement: false,
      tractionWire: "NORMAL",
    },
    {
      id: "dois-unidos-01",
      name: "Encosta Dois Unidos",
      neighborhood: "Dois Unidos",
      location: "Setor de monitoramento • Zona Norte",
      latitude: -8.0058,
      longitude: -34.9227,
      riskLevel: "ATENCAO",
      soilMoisture: 78,
      rain1h: 14.2,
      rain24h: 62.4,
      tilt: 2.3,
      movement: false,
      tractionWire: "NORMAL",
    },
    {
      id: "brejo-01",
      name: "Encosta Brejo da Guabiraba",
      neighborhood: "Brejo da Guabiraba",
      location: "Setor de monitoramento • Zona Norte",
      latitude: -7.9895,
      longitude: -34.9355,
      riskLevel: "MOBILIZACAO",
      soilMoisture: 64,
      rain1h: 8.6,
      rain24h: 38.1,
      tilt: 1.2,
      movement: false,
      tractionWire: "NORMAL",
    },
    {
      id: "linha-do-tiro-01",
      name: "Encosta Linha do Tiro",
      neighborhood: "Linha do Tiro",
      location: "Setor de monitoramento • Zona Norte",
      latitude: -8.0163,
      longitude: -34.91,
      riskLevel: "NORMALIDADE",
      soilMoisture: 48,
      rain1h: 3.2,
      rain24h: 18.5,
      tilt: 0.6,
      movement: false,
      tractionWire: "NORMAL",
    },
    {
      id: "jenipapo-01",
      name: "Encosta Córrego do Jenipapo",
      neighborhood: "Córrego do Jenipapo",
      location: "Setor de monitoramento • Zona Norte",
      latitude: -8.0117,
      longitude: -34.9372,
      riskLevel: "NORMALIDADE",
      soilMoisture: 52,
      rain1h: 4.8,
      rain24h: 22.7,
      tilt: 0.8,
      movement: false,
      tractionWire: "NORMAL",
    },
  ].map((area) => ({
    ...area,
    sensorCount: 4,
    updatedAt: new Date(now).toISOString(),
  }));
  const devices = areas.flatMap((slope, i) =>
    Array.from({ length: 4 }, (_, j) => {
      const offline = (i === 1 && j === 3) || (i === 4 && j === 3);
      return {
        id: `VM-${String(i + 1).padStart(2, "0")}${String(j + 1).padStart(2, "0")}`,
        slopeId: slope.id,
        location: slope.name,
        neighborhood: slope.neighborhood,
        status: offline
          ? "Offline"
          : i === 2 && j === 2
            ? "Instável"
            : "Online",
        lastContact: new Date(now - (offline ? 43 : 0) * minute).toISOString(),
        battery: offline ? 12 : 94 - i * 5 - j * 6,
        signal: -48 - i * 5 - j * 4,
        firmware: "1.2.0",
        sensors: ["Umidade do solo", "ADXL345", "Pluviômetro", "Fio de tração"],
      };
    }),
  );
  const alerts = [
    {
      id: "VM-AL-0042",
      slopeId: areas[0].id,
      slopeName: areas[0].name,
      neighborhood: "Ibura",
      riskLevel: "ALERTA",
      description:
        "Umidade elevada associada ao aumento da chuva e à alteração de inclinação.",
      sensors: [
        "VM-0101 · Umidade",
        "VM-0102 · Pluviômetro",
        "VM-0103 · ADXL345",
      ],
      status: "Ativo",
      createdAt: new Date(now - 12 * minute).toISOString(),
      updatedAt: new Date(now - 12 * minute).toISOString(),
    },
    {
      id: "VM-AL-0041",
      slopeId: areas[1].id,
      slopeName: areas[1].name,
      neighborhood: "Dois Unidos",
      riskLevel: "ATENCAO",
      description:
        "Aumento da umidade do solo e da precipitação na última hora.",
      sensors: ["VM-0201 · Umidade", "VM-0202 · Pluviômetro"],
      status: "Ativo",
      createdAt: new Date(now - 28 * minute).toISOString(),
      updatedAt: new Date(now - 28 * minute).toISOString(),
    },
    {
      id: "VM-AL-0040",
      slopeId: areas[2].id,
      slopeName: areas[2].name,
      neighborhood: areas[2].neighborhood,
      riskLevel: "MOBILIZACAO",
      description: "Variação das condições de chuva em acompanhamento.",
      sensors: ["VM-0302 · Pluviômetro"],
      status: "Reconhecido",
      createdAt: new Date(now - 54 * minute).toISOString(),
      updatedAt: new Date(now - 40 * minute).toISOString(),
    },
    {
      id: "VM-AL-0039",
      slopeId: areas[3].id,
      slopeName: areas[3].name,
      neighborhood: areas[3].neighborhood,
      riskLevel: "ATENCAO",
      description:
        "Evento demonstrativo encerrado após estabilização das leituras.",
      sensors: ["VM-0401 · Umidade"],
      status: "Resolvido",
      createdAt: new Date(now - 180 * minute).toISOString(),
      updatedAt: new Date(now - 130 * minute).toISOString(),
    },
  ];
  const events = [
    {
      id: "ev-1",
      type: "alert",
      text: "Indicadores elevados em Ibura",
      slopeId: areas[0].id,
      createdAt: alerts[0].createdAt,
    },
    {
      id: "ev-2",
      type: "reading",
      text: "Novas leituras de Dois Unidos",
      slopeId: areas[1].id,
      createdAt: new Date(now - 2 * minute).toISOString(),
    },
    {
      id: "ev-3",
      type: "device",
      text: "VM-0504 sem comunicação",
      slopeId: areas[4].id,
      createdAt: new Date(now - 43 * minute).toISOString(),
    },
  ];
  return {
    slopes: areas,
    devices,
    alerts,
    events,
    updatedAt: new Date(now).toISOString(),
    isMock: true,
  };
}

export function createHistory(slope, now = Date.now()) {
  return Array.from({ length: 2017 }, (_, i) => {
    const fraction = i / 2016;
    const wave = Math.sin(i * 0.11) * 2;
    return {
      timestamp: new Date(now - (2016 - i) * 5 * minute).toISOString(),
      soilMoisture: +(
        slope.soilMoisture * (0.64 + fraction * 0.36) +
        wave * (1 - fraction)
      ).toFixed(1),
      rain1h: +Math.max(
        0,
        slope.rain1h * (0.35 + fraction * 0.65) + wave * (1 - fraction),
      ).toFixed(1),
      tilt: +Math.max(
        0,
        slope.tilt * (0.5 + fraction * 0.5) + wave * 0.05 * (1 - fraction),
      ).toFixed(2),
      riskIndex: Math.round(
        Math.min(
          100,
          Math.max(
            0,
            ([
              "NORMALIDADE",
              "MOBILIZACAO",
              "ATENCAO",
              "ALERTA",
              "ALERTA_MAXIMO",
            ].indexOf(slope.riskLevel) *
              20 +
              10) *
              (0.6 + fraction * 0.4),
          ),
        ),
      ),
    };
  });
}
