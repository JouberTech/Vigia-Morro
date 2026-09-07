export const number = (value, digits = 0) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      }).format(value)
    : "—";
export const time = (value) =>
  value
    ? new Date(value).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Recife",
      })
    : "—";
export const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Recife",
      })
    : "—";
export const elapsed = (value, now = Date.now()) => {
  if (!value) return "Sem leitura";
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(value).getTime()) / 60000),
  );
  return minutes < 1
    ? "Agora"
    : minutes < 60
      ? `Há ${minutes} min`
      : `Há ${Math.floor(minutes / 60)} h`;
};
