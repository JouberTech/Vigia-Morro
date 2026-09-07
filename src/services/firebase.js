// Preparado para a próxima etapa. Nenhuma conexão é aberta pelo modo MOCK.
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

export function getFirebaseDb() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId || !config.appId)
    throw new Error(
      "Configure o projeto Firebase antes de ativar a integração.",
    );
  const app =
    getApps().find((app) => app.name === "vigiamorro") ??
    initializeApp(config, "vigiamorro");
  return getFirestore(app);
}

export function subscribeCollection(path, onData, onError) {
  // Consumir somente após implementar autenticação e regras de leitura autorizada.
  return onSnapshot(
    collection(getFirebaseDb(), path),
    (snapshot) =>
      onData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
    onError,
  );
}
