import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Radio,
  Wifi,
  WifiOff,
  Signal,
  BatteryMedium,
  Search,
  ChevronDown,
  CircleCheck,
  TriangleAlert,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import { Empty } from "../components/States";
import { dateTime, elapsed } from "../utils/format";

export default function Devices() {
  const { data } = useMonitoring();
  const [params, setParams] = useSearchParams();
  const area = params.get("encosta") || "all";
  const [status, setStatus] = useState("Todos");
  const [query, setQuery] = useState("");
  const filtered = data.devices.filter(
    (d) =>
      (status === "Todos" || d.status === status) &&
      (area === "all" || d.slopeId === area) &&
      `${d.id} ${d.location}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OS OLHOS DA NOSSA REDE</span>
          <h1>Dispositivos</h1>
          <p>Conectividade, energia e integridade das estações ESP32.</p>
        </div>
        <span className="page-count">
          <Radio size={18} />
          {data.devices.length} dispositivos cadastrados
        </span>
      </div>
      <div className="device-summary-grid">
        {[
          { status: "Online", label: "Operando normalmente", icon: Wifi },
          {
            status: "Instável",
            label: "Comunicação intermitente",
            icon: Signal,
          },
          {
            status: "Offline",
            label: "Sem comunicação recente",
            icon: WifiOff,
          },
        ].map(({ status: s, label, icon: Icon }) => (
          <button
            key={s}
            className={`panel summary-filter ${status === s ? "selected" : ""}`}
            onClick={() => setStatus(s)}
          >
            <span className={`summary-icon device-${s.toLowerCase()}`}>
              <Icon size={22} />
            </span>
            <div>
              <strong>
                {data.devices.filter((d) => d.status === s).length}
                <small>{s}</small>
              </strong>
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>
      <section className="panel devices-panel">
        <div className="filters-bar">
          <div className="filter-tabs" aria-label="Status de dispositivos">
            {["Todos", "Online", "Instável", "Offline"].map((s) => (
              <button
                key={s}
                aria-pressed={status === s}
                className={status === s ? "selected" : ""}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="filter-inputs">
            <label className="search-field">
              <Search size={16} />
              <input
                type="search"
                aria-label="Buscar dispositivo ou encosta"
                placeholder="Buscar dispositivo"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              aria-label="Filtrar dispositivos por encosta"
              value={area}
              onChange={(event) =>
                setParams(
                  event.target.value === "all"
                    ? {}
                    : { encosta: event.target.value },
                )
              }
            >
              <option value="all">Todas as encostas</option>
              {data.slopes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.neighborhood}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Device ID / sensores</th>
                  <th>Localização</th>
                  <th>Status</th>
                  <th>Último contato</th>
                  <th>Bateria</th>
                  <th>Sinal</th>
                  <th>Firmware</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <details className="device-details">
                        <summary>
                          <Radio size={17} />
                          <strong>{device.id}</strong>
                          <ChevronDown size={13} />
                        </summary>
                        <ul>
                          {device.sensors.map((sensor) => (
                            <li key={sensor}>{sensor}</li>
                          ))}
                        </ul>
                      </details>
                    </td>
                    <td>
                      <Link
                        className="table-location"
                        to={`/encostas/${device.slopeId}`}
                      >
                        {device.neighborhood}
                        <small>{device.location}</small>
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`device-status device-${device.status.toLowerCase()}`}
                      >
                        {device.status === "Online" ? (
                          <CircleCheck size={13} />
                        ) : device.status === "Offline" ? (
                          <WifiOff size={13} />
                        ) : (
                          <TriangleAlert size={13} />
                        )}
                        {device.status}
                      </span>
                    </td>
                    <td>
                      <span>{elapsed(device.lastContact)}</span>
                      <small>{dateTime(device.lastContact)}</small>
                    </td>
                    <td>
                      <span
                        className={`table-battery ${device.battery < 20 ? "low-battery" : ""}`}
                      >
                        <BatteryMedium size={20} />
                        {device.battery}%
                      </span>
                      {device.status === "Offline" && (
                        <small>Último registro</small>
                      )}
                    </td>
                    <td>
                      <span className="signal-value">
                        <Signal size={17} />
                        {device.signal} dBm
                      </span>
                      {device.status === "Offline" && (
                        <small>Último registro</small>
                      )}
                    </td>
                    <td>
                      <code>v{device.firmware}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <div className="table-footer">
          {filtered.length} de {data.devices.length} dispositivos · Abra o
          Device ID para consultar os sensores conectados.
        </div>
      </section>
    </>
  );
}
