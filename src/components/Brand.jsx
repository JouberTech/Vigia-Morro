import { Mountain, Radio } from "lucide-react";
export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-symbol">
        <Mountain size={29} />
        <Radio className="brand-signal" size={14} />
      </span>
      <span>
        <strong>
          Vigia<span>Morro</span>
        </strong>
        <small>MONITORAMENTO DE ENCOSTAS</small>
      </span>
    </div>
  );
}
