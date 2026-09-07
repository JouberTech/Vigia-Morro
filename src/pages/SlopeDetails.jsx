import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FlaskConical,
  MapPin,
  Radio,
  Clock3,
  Droplets,
  CloudRain,
  MoveUpRight,
  Activity,
  Cable,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import { useTelemetry } from "../hooks/useTelemetry";
import RiskBadge from "../components/RiskBadge";
import MetricCard from "../components/MetricCard";
import HistoryChart from "../components/HistoryChart";
import { NotFound } from "../components/States";
import { number, dateTime } from "../utils/format";

const periods = [
  { label: "1h", value: 1 },
  { label: "6h", value: 6 },
  { label: "12h", value: 12 },
  { label: "24h", value: 24 },
  { label: "7 dias", value: 168 },
];
function DetailContent({ slope }) {
  const { data } = useMonitoring();
  const { openSimulation } = useOutletContext();
  const [hours, setHours] = useState(24);
  const { points, loading, error } = useTelemetry(
    slope.id,
    hours,
    slope.updatedAt,
  );
  const devices = data.devices.filter((d) => d.slopeId === slope.id);
  const charts = [
    {
      key: "soilMoisture",
      title: "Umidade do solo",
      unit: "%",
      color: "#378974",
      icon: Droplets,
    },
    {
      key: "rain1h",
      title: "Chuva por hora",
      unit: "mm",
      color: "#4e8eb8",
      icon: CloudRain,
    },
    {
      key: "tilt",
      title: "Inclinação",
      unit: "°",
      color: "#94875c",
      icon: MoveUpRight,
    },
    {
      key: "riskIndex",
      title: "Índice de risco demonstrativo",
      unit: "/ 100",
      color: "#ca8857",
      icon: Activity,
    },
  ];
  return (
    <>
      <Link className="back-link" to="/mapa">
        <ArrowLeft size={15} />
        Voltar para o mapa
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <span className="eyebrow">ENCOSTA MONITORADA</span>
          <h1>{slope.name}</h1>
          <p>
            <MapPin size={14} />
            {slope.neighborhood} · Recife, Pernambuco
          </p>
        </div>
        <div className="page-actions">
          <Link className="button secondary" to={`/area/${slope.id}`}>
            <Users size={16} />
            Visão do morador
          </Link>
          <button className="button primary" onClick={openSimulation}>
            <FlaskConical size={16} />
            Simular cenário
          </button>
        </div>
      </div>
      <section className="panel slope-overview">
        <div>
          <span className="field-caption">ESTÁGIO ATUAL</span>
          <RiskBadge level={slope.riskLevel} className="large-badge" />
        </div>
        <div>
          <span className="field-caption">LOCALIZAÇÃO</span>
          <strong>{slope.location}</strong>
          <small>
            {slope.latitude.toFixed(4)}, {slope.longitude.toFixed(4)} ·
            coordenadas simuladas
          </small>
        </div>
        <div>
          <span className="field-caption">DISPOSITIVOS</span>
          <strong>
            <Radio size={15} />
            {slope.sensorCount} dispositivos
          </strong>
          <small>
            {devices.filter((d) => d.status === "Online").length} online nesta
            área
          </small>
        </div>
        <div>
          <span className="field-caption">ÚLTIMA ATUALIZAÇÃO</span>
          <strong>
            <Clock3 size={15} />
            {dateTime(slope.updatedAt)}
          </strong>
          <small>Leitura simulada a cada 8 segundos</small>
        </div>
      </section>
      <section
        className="metrics-grid detail-metrics"
        aria-label="Indicadores da encosta"
      >
        <MetricCard
          icon={Droplets}
          label="Umidade do solo"
          value={number(slope.soilMoisture)}
          unit="%"
          detail="Sensor capacitivo"
        />
        <MetricCard
          icon={CloudRain}
          label="Chuva na última hora"
          value={number(slope.rain1h, 1)}
          unit="mm"
          tone="blue"
          detail={`${number(slope.rain24h, 1)} mm nas últimas 24h`}
        />
        <MetricCard
          icon={MoveUpRight}
          label="Inclinação"
          value={number(slope.tilt, 1)}
          unit="°"
          detail="Acelerômetro ADXL345"
        />
        <MetricCard
          icon={Activity}
          label="Movimentação"
          value={slope.movement ? "Detectada" : "Estável"}
          tone={slope.movement ? "orange" : "green"}
          detail={
            slope.movement
              ? "Alteração simulada identificada"
              : "Sem alteração nesta leitura"
          }
        />
        <MetricCard
          icon={Cable}
          label="Fio de tração"
          value={slope.tractionWire === "ROMPIDO" ? "Rompido" : "Normal"}
          tone={slope.tractionWire === "ROMPIDO" ? "orange" : "green"}
          detail="Monitoramento físico"
        />
      </section>
      <div className="section-heading">
        <div>
          <h2>Histórico dos sensores</h2>
          <p>Leituras simuladas para acompanhar a evolução dos indicadores.</p>
        </div>
        <div className="period-picker" aria-label="Período dos gráficos">
          {periods.map((period) => (
            <button
              key={period.value}
              aria-pressed={hours === period.value}
              className={hours === period.value ? "selected" : ""}
              onClick={() => setHours(period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <div className="offline-banner" role="alert">
          Não foi possível carregar o histórico. Selecione outro período para
          tentar novamente.
        </div>
      ) : loading ? (
        <div className="empty-state" role="status">
          Carregando histórico…
        </div>
      ) : (
        <section className="charts-grid">
          {charts.map(({ key, title, unit, color, icon: Icon }) => (
            <article className="panel" key={key}>
              <div className="panel-heading">
                <div>
                  <h2>
                    <Icon size={16} style={{ color }} />
                    {title}
                  </h2>
                  <p>
                    {hours === 168
                      ? "Últimos 7 dias"
                      : `Últimas ${hours} horas`}
                  </p>
                </div>
                <strong className="chart-current" style={{ color }}>
                  {number(points.at(-1)?.[key], 1)}
                  <small>{unit}</small>
                </strong>
              </div>
              <HistoryChart
                points={points}
                dataKey={key}
                label={title}
                unit={unit}
                color={color}
                hours={hours}
              />
            </article>
          ))}
        </section>
      )}
      <div className="info-note">
        <TriangleAlert size={15} /> Os limites e o índice de risco são
        exclusivamente demonstrativos. Em operação real, o estágio será
        informado pelo backend, conforme avaliação técnica validada.
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Dispositivos desta encosta</h2>
            <p>Conectividade e última comunicação</p>
          </div>
          <Link className="text-link" to={`/dispositivos?encosta=${slope.id}`}>
            Ver dispositivos
          </Link>
        </div>
        <div className="slope-device-list">
          {devices.map((device) => (
            <div key={device.id}>
              <Radio size={18} />
              <strong>{device.id}</strong>
              <span>
                {device.status === "Online" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <TriangleAlert size={14} />
                )}
                {device.status}
              </span>
              <small>{dateTime(device.lastContact)}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
export default function SlopeDetails() {
  const { id } = useParams();
  const { data } = useMonitoring();
  const slope = data.slopes.find((s) => s.id === id);
  return slope ? <DetailContent key={id} slope={slope} /> : <NotFound area />;
}
