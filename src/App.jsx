import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import { NotFound, Loading } from "./components/States";
const MapPage = lazy(() => import("./pages/MapPage"));
const SlopeDetails = lazy(() => import("./pages/SlopeDetails"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Devices = lazy(() => import("./pages/Devices"));
const MonitoringCenter = lazy(() => import("./pages/MonitoringCenter"));
const ResidentView = lazy(() => import("./pages/ResidentView"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/area/:id" element={<ResidentView />} />
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/encostas/:id" element={<SlopeDetails />} />
          <Route path="/alertas" element={<Alerts />} />
          <Route path="/dispositivos" element={<Devices />} />
          <Route path="/central" element={<MonitoringCenter />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
