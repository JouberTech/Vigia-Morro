import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ArrowUpRight,
  FlaskConical,
  LocateFixed,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import RecifeMap from "../components/RecifeMap";
import RiskBadge from "../components/RiskBadge";
import { Empty } from "../components/States";
import { RISK_LEVELS, riskInfo, byRisk } from "../utils/risk";
import { number, time } from "../utils/format";

export default function MapPage() {
  const { data } = useMonitoring();
  const { openSimulation } = useOutletContext();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("all");
  const [selected, setSelected] = useState(null);
  const [resetView, setResetView] = useState(0);
  const slopes = [...data.slopes]
    .sort(byRisk)
    .filter(
      (s) =>
        `${s.name} ${s.neighborhood}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")) &&
        (risk === "all" || s.riskLevel === risk),
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CADA PONTO, UMA COMUNIDADE</span>
          <h1>Mapa de encostas</h1>
          <p>Explore o território e acompanhe as condições de cada área.</p>
        </div>
        <button className="button primary" onClick={openSimulation}>
          <FlaskConical size={17} />
          Simular cenário
        </button>
      </div>
      <div className="map-workspace">
        <aside className="panel area-list-panel">
          <div className="area-list-filters">
            <label className="search-field">
              <Search size={17} />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(null);
                }}
                placeholder="Buscar bairro ou encosta"
                aria-label="Buscar bairro ou encosta"
              />
            </label>
            <label className="select-field">
              <SlidersHorizontal size={16} />
              <select
                aria-label="Filtrar áreas por estágio"
                value={risk}
                onChange={(event) => {
                  setRisk(event.target.value);
                  setSelected(null);
                }}
              >
                <option value="all">Todos os estágios</option>
                {RISK_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {riskInfo(level).label}
                  </option>
                ))}
              </select>
            </label>
            <div className="list-caption">
              <span>{slopes.length} áreas encontradas</span>
              <button
                className="text-button"
                onClick={() => {
                  setSelected(null);
                  setResetView((value) => value + 1);
                }}
              >
                <LocateFixed size={14} />
                Visão geral
              </button>
            </div>
          </div>
          <div className="area-list">
            {slopes.length ? (
              slopes.map((s) => (
                <article
                  className={`area-list-item ${selected === s.id ? "selected" : ""}`}
                  key={s.id}
                >
                  <button
                    className="area-select"
                    onClick={() => setSelected(s.id)}
                    aria-pressed={selected === s.id}
                  >
                    <div>
                      <MapPin size={17} />
                      <RiskBadge level={s.riskLevel} />
                    </div>
                    <h2>{s.name}</h2>
                    <p>{s.neighborhood} · Recife</p>
                    <div className="area-mini-stats">
                      <span>{number(s.soilMoisture)}% umidade</span>
                      <span>{number(s.rain24h, 1)} mm / 24h</span>
                    </div>
                  </button>
                  <div className="area-list-bottom">
                    <small>Leitura às {time(s.updatedAt)}</small>
                    <Link to={`/encostas/${s.id}`}>
                      Ver detalhes <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <Empty />
            )}
          </div>
        </aside>
        <section className="panel map-full-panel" aria-label="Mapa de Recife">
          <RecifeMap
            slopes={slopes}
            selectedId={selected}
            resetView={resetView}
          />
          <div className="map-explanation">
            <MapPin size={15} />
            <span>
              Pontos e leituras simulados. Selecione uma área na lista ou um
              marcador para consultar os detalhes.
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
