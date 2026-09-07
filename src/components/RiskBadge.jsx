import {
  CheckCircle2,
  Activity,
  Eye,
  TriangleAlert,
  OctagonAlert,
} from "lucide-react";
import { riskInfo } from "../utils/risk";
const icons = {
  check: CheckCircle2,
  activity: Activity,
  eye: Eye,
  triangle: TriangleAlert,
  octagon: OctagonAlert,
};
export default function RiskBadge({ level, className = "" }) {
  const risk = riskInfo(level);
  const Icon = icons[risk.icon];
  return (
    <span
      className={`risk-badge ${className}`}
      style={{ "--risk-color": risk.color, "--risk-bg": risk.background }}
    >
      <Icon size={14} strokeWidth={2} />
      <span>{risk.label}</span>
    </span>
  );
}
