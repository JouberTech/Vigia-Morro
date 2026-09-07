import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  ZoomControl,
  GeoJSON,
  useMap,
} from "react-leaflet";
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import RiskBadge from "./RiskBadge";
import { RISK_LEVELS, riskInfo } from "../utils/risk";
import { number, time } from "../utils/format";
import "leaflet/dist/leaflet.css";

function FocusArea({ selectedId, slopes, resetView }) {
  const map = useMap();
  const visibleIds = slopes.map((slope) => slope.id).join("|");
  useEffect(() => {
    const slope = slopes.find((s) => s.id === selectedId);
    if (slope)
      map.flyTo([slope.latitude, slope.longitude], 14, { duration: 0.7 });
    else if (slopes.length)
      map.fitBounds(
        slopes.map((s) => [s.latitude, s.longitude]),
        { padding: [48, 48], maxZoom: 12 },
      );
    else map.setView([-8.052, -34.928], 11);
  }, [selectedId, map, visibleIds, resetView]); // Atualizar leituras não deve reposicionar o mapa.
  useEffect(() => {
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(map.getContainer());
    return () => resize.disconnect();
  }, [map]);
  return null;
}

export default function RecifeMap({
  slopes,
  selectedId,
  resetView = 0,
  className = "",
  legend = true,
}) {
  const [tileError, setTileError] = useState(false);
  const [geojson, setGeojson] = useState(null);
  const [geoError, setGeoError] = useState(false);
  useEffect(() => {
    const url = import.meta.env.VITE_RISK_GEOJSON_URL;
    if (!url) return;
    const abort = new AbortController();
    fetch(url, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Falha no GeoJSON");
        return response.json();
      })
      .then((data) => {
        if (data.type !== "FeatureCollection" || !Array.isArray(data.features))
          throw new Error("GeoJSON inválido");
        setGeojson(data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setGeoError(true);
      });
    return () => abort.abort();
  }, []);
  return (
    <div className={`recife-map ${className}`}>
      <div className="map-canvas">
        <MapContainer
          center={[-8.052, -34.928]}
          zoom={11}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl={true}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            eventHandlers={{ tileerror: () => setTileError(true) }}
          />
          <FocusArea
            selectedId={selectedId}
            slopes={slopes}
            resetView={resetView}
          />
          <ZoomControl position="bottomright" />
          {geojson && (
            <GeoJSON
              data={geojson}
              style={{ color: "#5d8070", weight: 1, fillOpacity: 0.12 }}
            />
          )}
          {slopes.map((slope) => (
            <CircleMarker
              key={slope.id}
              center={[slope.latitude, slope.longitude]}
              radius={selectedId === slope.id ? 13 : 10}
              pathOptions={{
                color: "#fff",
                weight: 3,
                fillColor: riskInfo(slope.riskLevel).color,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                {slope.neighborhood} · {riskInfo(slope.riskLevel).label}
              </Tooltip>
              <Popup>
                <div className="map-popup">
                  <RiskBadge level={slope.riskLevel} />
                  <h3>{slope.name}</h3>
                  <p>{slope.neighborhood} · Recife</p>
                  <dl>
                    <div>
                      <dt>Umidade</dt>
                      <dd>{number(slope.soilMoisture)}%</dd>
                    </div>
                    <div>
                      <dt>Chuva / 24h</dt>
                      <dd>{number(slope.rain24h, 1)} mm</dd>
                    </div>
                    <div>
                      <dt>Movimentação</dt>
                      <dd>{slope.movement ? "Detectada" : "Estável"}</dd>
                    </div>
                    <div>
                      <dt>Atualização</dt>
                      <dd>{time(slope.updatedAt)}</dd>
                    </div>
                  </dl>
                  <Link to={`/encostas/${slope.id}`} className="button primary">
                    Ver detalhes <ArrowUpRight size={15} />
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        <div className="map-location">
          <MapPin size={16} />
          <div>
            <strong>Recife, Pernambuco</strong>
            <small>{slopes.length} áreas monitoradas · pontos simulados</small>
          </div>
        </div>
        {(tileError || geoError) && (
          <div className="map-error" role="status">
            {tileError
              ? "Mapa base indisponível. Consulte as áreas na lista."
              : "Camada oficial indisponível; exibindo pontos simulados."}
          </div>
        )}
      </div>
      {legend && (
        <div className="map-legend">
          {RISK_LEVELS.map((level) => (
            <span key={level}>
              <i style={{ backgroundColor: riskInfo(level).color }} />
              {riskInfo(level).label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
