import {
  ArrowUpRight,
  Droplets,
  CloudRain,
  MoveUpRight,
  MapPin,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";
import RiskBadge from "./RiskBadge";
import { number, elapsed } from "../utils/format";
import { riskInfo } from "../utils/risk";
export default function SlopeCard({ slope }) {
  return (
    <Link
      className="slope-card"
      to={`/encostas/${slope.id}`}
      style={{ "--area-color": riskInfo(slope.riskLevel).color }}
    >
      <div className="slope-card-head">
        <span className="area-symbol">
          <MapPin size={20} />
        </span>
        <RiskBadge level={slope.riskLevel} />
      </div>
      <h3>{slope.name}</h3>
      <p className="muted">{slope.neighborhood} · Recife, PE</p>
      <div className="slope-readings">
        <div>
          <span>
            <Droplets size={14} />
            Umidade
          </span>
          <strong>
            {number(slope.soilMoisture)}
            <small>%</small>
          </strong>
        </div>
        <div>
          <span>
            <CloudRain size={14} />
            Chuva / 24h
          </span>
          <strong>
            {number(slope.rain24h, 1)}
            <small>mm</small>
          </strong>
        </div>
        <div>
          <span>
            <MoveUpRight size={14} />
            Inclinação
          </span>
          <strong>
            {number(slope.tilt, 1)}
            <small>°</small>
          </strong>
        </div>
      </div>
      <div className="slope-card-foot">
        <span>
          <Clock3 size={13} />
          {elapsed(slope.updatedAt)}
        </span>
        <span>
          Ver encosta <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}
