// Pontos de extensão para a fase PWA. Não registrar automaticamente nesta etapa.
// Nunca solicitar Notification.requestPermission sem ação explícita do usuário.
// Cache offline de telemetria requer identificação de dados antigos e validade.
export const pwaCapabilities = () => ({
  serviceWorker: "serviceWorker" in navigator,
  push: "PushManager" in window,
  notifications: "Notification" in window,
});

export async function registerOfflineShell() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js");
}
