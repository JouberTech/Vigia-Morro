import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Maximize2,
  Minimize2,
  Monitor,
  Bell,
  WifiOff,
  Clock3,
  ArrowUpRight,
  TriangleAlert,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import RecifeMap from "../components/RecifeMap";
import RiskBadge from "../components/RiskBadge";
import { Empty } from "../components/States";
import { byRisk, riskInfo } from "../utils/risk";
import { time, number } from "../utils/format";

export default function MonitoringCenter() {
  const { data } = useMonitoring();
  const root = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  useEffect(() => {
    const change = () => setExpanded(Boolean(document.fullscreenElement));
    const escape = (event) => {
      if (event.key === "Escape" && !document.fullscreenElement)
        setExpanded(false);
    };
    document.addEventListener("fullscreenchange", change);
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  async function toggle() {
    if (expanded) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setExpanded(false);
      return;
    }
    try {
      if (!root.current.requestFullscreen) throw new Error();
      await root.current.requestFullscreen();
      setExpanded(true);
    } catch {
      setExpanded(true);
      setFullscreenError("Modo expandido ativado. Pressione Esc para sair.");
    }
  }
  const critical = [...data.slopes]
    .filter((s) => riskInfo(s.riskLevel).rank >= 3)
    .sort(byRisk);
  const active = data.alerts.filter((a) => a.status === "Ativo");
  const offline = data.devices.filter((d) => d.status === "Offline");
  return (
    <div
      ref={root}
      className={`operations-center ${expanded ? "expanded" : ""}`}
    >
      <div className="operations-heading">
        <div>
          <span className="eyebrow">
            <Monitor size={13} /> VIGIAMORRO · RECIFE
          </span>
          <h1>Central de Monitoramento</h1>
          <p>Visão integrada do território e das ocorrências.</p>
        </div>
        <div>
          <span className="operations-live">
            <i className="status-dot" />
            Dados simulados · {time(data.updatedAt)}
          </span>
          <button className="button secondary" onClick={toggle}>
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {expanded ? "Sair da tela cheia" : "Tela cheia"}
          </button>
        </div>
      </div>
      {fullscreenError && expanded && (
        <p className="fullscreen-note" role="status">
          {fullscreenError}
        </p>
      )}
      <div className="operations-stats">
        <div>
          <span>Estágio geral</span>
          <RiskBadge level={data.dashboard.generalRisk} />
        </div>
        <div>
          <span>Encostas críticas</span>
          <strong>{critical.length}</strong>
        </div>
        <div>
          <span>Alertas ativos</span>
          <strong>{active.length}</strong>
        </div>
        <div>
          <span>Dispositivos offline</span>
          <strong>{offline.length}</strong>
        </div>
        <div>
          <span>Áreas monitoradas</span>
          <strong>{data.slopes.length}</strong>
        </div>
      </div>
      <div className="operations-grid">
        <section className="panel operations-map">
          <div className="panel-heading">
            <h2>Território monitorado</h2>
            <span className="muted">Recife, PE</span>
          </div>
          <RecifeMap slopes={data.slopes} />
        </section>
        <section className="panel operations-alerts">
          <div className="panel-heading">
            <h2>
              <Bell size={17} />
              Alertas ativos
            </h2>
            <span className="count-badge">{active.length}</span>
          </div>
          {active.length ? (
            active.map((alert) => (
              <Link
                to={`/encostas/${alert.slopeId}`}
                className="operation-alert"
                key={alert.id}
              >
                <div>
                  <RiskBadge level={alert.riskLevel} />
                  <small>{time(alert.createdAt)}</small>
                </div>
                <h3>{alert.slopeName}</h3>
                <p>{alert.description}</p>
              </Link>
            ))
          ) : (
            <Empty text="Nenhum alerta ativo nesta demonstração." />
          )}
        </section>
      </div>
      <div className="operations-bottom">
        <section className="panel">
          <div className="panel-heading">
            <h2>
              <TriangleAlert size={17} />
              Encostas críticas
            </h2>
          </div>
          {critical.length ? (
            critical.map((s) => (
              <Link
                className="operation-row"
                to={`/encostas/${s.id}`}
                key={s.id}
              >
                <div>
                  <strong>{s.neighborhood}</strong>
                  <small>
                    {number(s.soilMoisture)}% umidade · {number(s.rain24h, 1)}{" "}
                    mm / 24h
                  </small>
                </div>
                <RiskBadge level={s.riskLevel} />
              </Link>
            ))
          ) : (
            <Empty text="Nenhuma encosta em alerta ou alerta máximo." />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>
              <WifiOff size={17} />
              Sensores offline
            </h2>
          </div>
          {offline.length ? (
            offline.map((d) => (
              <Link
                className="operation-row"
                to={`/dispositivos?encosta=${d.slopeId}`}
                key={d.id}
              >
                <div>
                  <strong>{d.id}</strong>
                  <small>
                    {d.neighborhood} · contato às {time(d.lastContact)}
                  </small>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            ))
          ) : (
            <Empty text="Todos os dispositivos estão comunicando." />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>
              <Clock3 size={17} />
              Eventos recentes
            </h2>
          </div>
          {[...data.events]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((event) => (
              <Link
                to={`/encostas/${event.slopeId}`}
                className="operation-event"
                key={event.id}
              >
                <i className="status-dot" />
                <span>{event.text}</span>
                <small>{time(event.createdAt)}</small>
              </Link>
            ))}
        </section>
      </div>
    </div>
  );
}
