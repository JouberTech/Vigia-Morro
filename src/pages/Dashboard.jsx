import { Link, useOutletContext } from "react-router-dom";
import {
  Mountain,
  Radio,
  Bell,
  CloudRain,
  Droplets,
  ArrowRight,
  ArrowUpRight,
  FlaskConical,
  TriangleAlert,
  Clock3,
  Activity,
  WifiOff,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import { useTelemetry } from "../hooks/useTelemetry";
import MetricCard from "../components/MetricCard";
import RiskBadge from "../components/RiskBadge";
import SlopeCard from "../components/SlopeCard";
import RecifeMap from "../components/RecifeMap";
import HistoryChart from "../components/HistoryChart";
import { byRisk, riskInfo } from "../utils/risk";
import { number, time } from "../utils/format";

export default function Dashboard() {
  const { data } = useMonitoring();
  const { openSimulation } = useOutletContext();
  const { dashboard: stats, slopes, alerts } = data;
  const ordered = [...slopes].sort(byRisk);
  const attention = ordered
    .filter((s) => riskInfo(s.riskLevel).rank >= 1)
    .slice(0, 3);
  const recent = alerts.filter((a) => a.status !== "Resolvido").slice(0, 3);
  const { points } = useTelemetry(ordered[0].id, 24, data.updatedAt);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CUIDAR COMEÇA POR OBSERVAR</span>
          <h1>Visão geral</h1>
          <p>Acompanhe as condições das encostas do Recife.</p>
        </div>
        <div className="page-actions">
          <span className="live-label">
            <i className="status-dot" />
            Simulação em tempo real
          </span>
          <button className="button primary" onClick={openSimulation}>
            <FlaskConical size={17} />
            Simular cenário
          </button>
        </div>
      </div>
      <div
        className="stage-banner"
        style={{
          "--stage-bg": riskInfo(stats.generalRisk).background,
          "--stage-color": riskInfo(stats.generalRisk).color,
        }}
      >
        <span className="stage-icon">
          <TriangleAlert size={23} />
        </span>
        <div>
          <strong>
            {stats.criticalSlopes
              ? `${stats.criticalSlopes} ${stats.criticalSlopes === 1 ? "encosta exige" : "encostas exigem"} acompanhamento prioritário`
              : "Encostas em acompanhamento"}
          </strong>
          <p>
            Estágio geral com base nos indicadores simulados. Acompanhe as áreas
            e os alertas.
          </p>
        </div>
        <RiskBadge level={stats.generalRisk} />
        <Link to="/alertas" aria-label="Ver alertas ativos">
          <ArrowUpRight size={21} />
        </Link>
      </div>
      <section
        className="metrics-grid"
        aria-label="Indicadores de monitoramento"
      >
        <MetricCard
          icon={Mountain}
          label="Encostas monitoradas"
          value={String(stats.slopesCount).padStart(2, "0")}
          detail="Em 5 bairros do Recife"
        />
        <MetricCard
          icon={Radio}
          label="Sensores ativos"
          value={stats.online}
          unit={`/ ${data.devices.length}`}
          detail={
            <>
              <i className="tiny-dot" />
              {stats.offline} offline · {stats.unstable} instável
            </>
          }
        />
        <MetricCard
          icon={Bell}
          label="Alertas ativos"
          value={String(stats.activeAlerts).padStart(2, "0")}
          tone="orange"
          detail={`${stats.criticalSlopes} ${stats.criticalSlopes === 1 ? "ocorrência crítica" : "ocorrências críticas"}`}
        />
        <MetricCard
          icon={CloudRain}
          label="Chuva acumulada"
          value={number(stats.maxRain24h, 1)}
          unit="mm"
          tone="blue"
          detail="Maior registro nas últimas 24h"
        />
        <MetricCard
          icon={Droplets}
          label="Maior umidade"
          value={number(stats.maxSoilMoisture)}
          unit="%"
          tone="teal"
          detail={
            slopes.find((s) => s.soilMoisture === stats.maxSoilMoisture)
              ?.neighborhood
          }
        />
      </section>
      <div className="dashboard-main-grid">
        <section className="panel dashboard-map-panel">
          <div className="panel-heading">
            <div>
              <h2>Território monitorado</h2>
              <p>Uma visão conectada das nossas encostas</p>
            </div>
            <Link className="text-link" to="/mapa">
              Explorar mapa <ArrowUpRight size={16} />
            </Link>
          </div>
          <RecifeMap slopes={slopes} />
        </section>
        <section className="panel recent-alerts">
          <div className="panel-heading">
            <div>
              <h2>
                Alertas recentes{" "}
                <span className="count-badge">{stats.activeAlerts}</span>
              </h2>
              <p>Ocorrências em acompanhamento</p>
            </div>
            <Bell size={18} className="muted" />
          </div>
          <div className="recent-alert-list">
            {recent.map((alert) => (
              <Link className="recent-alert" to="/alertas" key={alert.id}>
                <div>
                  <RiskBadge level={alert.riskLevel} />
                  <span>
                    <Clock3 size={12} />
                    {time(alert.createdAt)}
                  </span>
                </div>
                <h3>{alert.slopeName}</h3>
                <p>{alert.description}</p>
                <small>
                  {alert.status} <ArrowUpRight size={13} />
                </small>
              </Link>
            ))}
          </div>
          <Link className="panel-bottom-link" to="/alertas">
            Ver todos os alertas <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <div className="section-heading">
        <div>
          <h2>Áreas que exigem atenção</h2>
          <p>Prioridade para quem mais precisa de acompanhamento.</p>
        </div>
        <Link className="text-link" to="/mapa">
          Todas as encostas <ArrowRight size={16} />
        </Link>
      </div>
      <section className="slope-grid" aria-label="Encostas prioritárias">
        {attention.length ? (
          attention.map((slope) => <SlopeCard key={slope.id} slope={slope} />)
        ) : (
          <div className="empty-state">
            Nenhuma área em mobilização ou estágio superior.
          </div>
        )}
      </section>
      <div className="dashboard-bottom-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Umidade ao longo do dia</h2>
              <p>{ordered[0].neighborhood} · últimas 24 horas</p>
            </div>
            <span className="chart-key">
              <i />
              Umidade do solo
            </span>
          </div>
          <HistoryChart points={points} />
          <div className="chart-footnote">
            Histórico demonstrativo · Valores não representam critérios
            geotécnicos.
          </div>
        </section>
        <section className="panel network-panel">
          <div className="panel-heading">
            <div>
              <h2>Rede de sensores</h2>
              <p>Conectividade dos dispositivos</p>
            </div>
            <Activity size={18} className="muted" />
          </div>
          <div className="network-total">
            <strong>
              {stats.online}
              <small>/{data.devices.length}</small>
            </strong>
            <span>dispositivos online</span>
          </div>
          <div
            className="network-bars"
            aria-label={`${stats.online} online, ${stats.unstable} instável e ${stats.offline} offline`}
          >
            {data.devices.map((device) => (
              <i
                key={device.id}
                className={device.status.toLowerCase()}
                title={`${device.id}: ${device.status}`}
              />
            ))}
          </div>
          <div className="network-summary">
            <span>
              <i className="status-dot" />
              {stats.online} online
            </span>
            <span>
              <i className="tiny-dot" />
              {stats.unstable} instável
            </span>
            <span>
              <WifiOff size={13} />
              {stats.offline} offline
            </span>
          </div>
          <Link className="panel-bottom-link" to="/dispositivos">
            Gerenciar dispositivos <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
