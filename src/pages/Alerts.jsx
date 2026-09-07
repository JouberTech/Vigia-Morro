import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CircleCheck,
  Search,
  ArrowUpRight,
  Radio,
  Clock3,
  MapPin,
  CircleDot,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import { updateAlertStatus } from "../services/sensorApi";
import RiskBadge from "../components/RiskBadge";
import { Empty } from "../components/States";
import { dateTime } from "../utils/format";
import { RISK_LEVELS, riskInfo } from "../utils/risk";

export default function Alerts() {
  const { data } = useMonitoring();
  const [status, setStatus] = useState("Todos");
  const [risk, setRisk] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState("");
  const statuses = ["Todos", "Ativo", "Reconhecido", "Resolvido"];
  const alerts = data.alerts.filter(
    (a) =>
      (status === "Todos" || a.status === status) &&
      (risk === "all" || a.riskLevel === risk) &&
      `${a.id} ${a.slopeName} ${a.neighborhood}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const update = async (id, next) => {
    setBusy(id);
    try {
      await updateAlertStatus(id, next);
      setMessage(`Alerta ${id} ${next.toLowerCase()} nesta demonstração.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">INFORMAÇÃO PARA AGIR COM CUIDADO</span>
          <h1>Alertas</h1>
          <p>Acompanhe, reconheça e encerre as ocorrências simuladas.</p>
        </div>
        <span className="page-count">
          <Bell size={17} />
          {data.dashboard.activeAlerts} alertas ativos
        </span>
      </div>
      <div className="alert-summary">
        {[
          { status: "Ativo", label: "Aguardando acompanhamento", icon: Bell },
          {
            status: "Reconhecido",
            label: "Em acompanhamento",
            icon: CheckCheck,
          },
          {
            status: "Resolvido",
            label: "Ocorrências encerradas",
            icon: CircleCheck,
          },
        ].map(({ status: s, label, icon: Icon }) => (
          <button
            className={`panel summary-filter ${status === s ? "selected" : ""}`}
            key={s}
            onClick={() => setStatus(s)}
          >
            <span className={`summary-icon status-${s.toLowerCase()}`}>
              <Icon size={21} />
            </span>
            <div>
              <strong>
                {data.alerts.filter((a) => a.status === s).length}
              </strong>
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>
      <section className="panel alerts-panel">
        <div className="filters-bar">
          <div className="filter-tabs" aria-label="Status dos alertas">
            {statuses.map((s) => (
              <button
                key={s}
                aria-pressed={status === s}
                className={status === s ? "selected" : ""}
                onClick={() => setStatus(s)}
              >
                {s === "Todos" ? "Todos" : s === "Ativo" ? "Ativos" : `${s}s`}
                <span>
                  {s === "Todos"
                    ? data.alerts.length
                    : data.alerts.filter((a) => a.status === s).length}
                </span>
              </button>
            ))}
          </div>
          <div className="filter-inputs">
            <label className="search-field">
              <Search size={16} />
              <input
                type="search"
                placeholder="Buscar alerta ou bairro"
                aria-label="Buscar alerta ou bairro"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              aria-label="Filtrar nível de alerta"
              value={risk}
              onChange={(event) => setRisk(event.target.value)}
            >
              <option value="all">Todos os níveis</option>
              {RISK_LEVELS.map((level) => (
                <option value={level} key={level}>
                  {riskInfo(level).label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {message && (
          <div className="inline-feedback" role="status">
            {message}
          </div>
        )}
        <div className="alerts-list">
          {alerts.length ? (
            alerts.map((alert) => (
              <article className="alert-item" key={alert.id}>
                <div className="alert-item-leading">
                  <span
                    className={`alert-type-icon status-${alert.status.toLowerCase()}`}
                  >
                    <Bell size={21} />
                  </span>
                </div>
                <div className="alert-item-main">
                  <div className="alert-meta">
                    <RiskBadge level={alert.riskLevel} />
                    <code>{alert.id}</code>
                    <span
                      className={`status-label status-${alert.status.toLowerCase()}`}
                    >
                      <CircleDot size={12} />
                      {alert.status}
                    </span>
                  </div>
                  <Link
                    className="alert-area-link"
                    to={`/encostas/${alert.slopeId}`}
                  >
                    <h2>{alert.slopeName}</h2>
                    <ArrowUpRight size={15} />
                  </Link>
                  <div className="alert-place">
                    <span>
                      <MapPin size={12} />
                      {alert.neighborhood}
                    </span>
                    <span>
                      <Clock3 size={12} />
                      {dateTime(alert.createdAt)}
                    </span>
                  </div>
                  <p>{alert.description}</p>
                  <div className="alert-sensors">
                    <Radio size={13} />
                    <span>Sensores: {alert.sensors.join(" · ")}</span>
                  </div>
                  <small className="muted">
                    Atualizado em {dateTime(alert.updatedAt)}
                  </small>
                </div>
                <div className="alert-item-action">
                  {alert.status === "Ativo" ? (
                    <button
                      className="button secondary"
                      disabled={busy === alert.id}
                      onClick={() => update(alert.id, "Reconhecido")}
                    >
                      <CheckCheck size={15} />
                      Reconhecer
                    </button>
                  ) : alert.status === "Reconhecido" ? (
                    <button
                      className="button secondary"
                      disabled={busy === alert.id}
                      onClick={() => update(alert.id, "Resolvido")}
                    >
                      <CircleCheck size={15} />
                      Resolver
                    </button>
                  ) : (
                    <span className="resolved-label">
                      <CircleCheck size={16} />
                      Resolvido
                    </span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <Empty />
          )}
        </div>
        <div className="table-footer">
          {alerts.length} {alerts.length === 1 ? "ocorrência" : "ocorrências"} ·
          Ações válidas apenas nesta demonstração. O reconhecimento não altera o
          estágio da encosta.
        </div>
      </section>
    </>
  );
}
