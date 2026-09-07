export const RISK_LEVELS = [
  "NORMALIDADE",
  "MOBILIZACAO",
  "ATENCAO",
  "ALERTA",
  "ALERTA_MAXIMO",
];
export const RISK = {
  NORMALIDADE: {
    label: "Normalidade",
    color: "#25866d",
    background: "#e9f5ef",
    icon: "check",
    rank: 0,
  },
  MOBILIZACAO: {
    label: "Mobilização",
    color: "#2c78a6",
    background: "#eaf3fa",
    icon: "activity",
    rank: 1,
  },
  ATENCAO: {
    label: "Atenção",
    color: "#9b6a0d",
    background: "#fff6dd",
    icon: "eye",
    rank: 2,
  },
  ALERTA: {
    label: "Alerta",
    color: "#c55a25",
    background: "#fff0e6",
    icon: "triangle",
    rank: 3,
  },
  ALERTA_MAXIMO: {
    label: "Alerta máximo",
    color: "#bd3547",
    background: "#ffedf0",
    icon: "octagon",
    rank: 4,
  },
};
export const riskInfo = (level) =>
  RISK[level] ?? {
    label: "Sem informação",
    color: "#667085",
    background: "#eef1f4",
    icon: "eye",
    rank: -1,
  };
export const byRisk = (a, b) =>
  riskInfo(b.riskLevel).rank - riskInfo(a.riskLevel).rank;
