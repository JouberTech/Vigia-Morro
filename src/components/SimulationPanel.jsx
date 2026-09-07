import { useEffect, useRef, useState } from "react";
import {
  FlaskConical,
  X,
  RotateCcw,
  Play,
  CloudRain,
  Droplets,
  MoveUpRight,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import { simulateReadings, resetDemo } from "../services/sensorApi";
import { number } from "../utils/format";
import RiskBadge from "./RiskBadge";

export default function SimulationPanel({ open, onClose, initialSlopeId }) {
  const { data } = useMonitoring();
  const dialog = useRef(null);
  const [id, setId] = useState("ibura-01");
  const [values, setValues] = useState({
    soilMoisture: 86,
    rain1h: 21.5,
    tilt: 3.7,
    movement: false,
    tractionWire: "NORMAL",
  });
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const choose = (selected) => {
    const slope = data.slopes.find((s) => s.id === selected);
    setId(selected);
    setValues({
      soilMoisture: slope.soilMoisture,
      rain1h: slope.rain1h,
      tilt: slope.tilt,
      movement: slope.movement,
      tractionWire: slope.tractionWire,
    });
    setFeedback("");
  };
  useEffect(() => {
    if (open && data) {
      choose(initialSlopeId || data.slopes[0].id);
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [open, initialSlopeId]);
  const apply = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const slope = await simulateReadings(id, values);
      setFeedback(
        `Cenário aplicado em ${slope.neighborhood}. O mapa, os indicadores e a visão do morador foram atualizados.`,
      );
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    await resetDemo();
    setFeedback(
      "Demonstração reiniciada. Leituras e alertas voltaram ao cenário inicial.",
    );
    onClose();
  };
  const current = data?.slopes.find((s) => s.id === id);
  return (
    <dialog
      ref={dialog}
      className="simulation-dialog"
      aria-labelledby="simulation-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form onSubmit={apply}>
        <div className="drawer-heading">
          <span className="soft-icon">
            <FlaskConical size={23} />
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar simulador"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <span className="eyebrow">AMBIENTE DEMONSTRATIVO</span>
        <h2 id="simulation-title">Simular um cenário</h2>
        <p className="muted">
          Altere as leituras e acompanhe a resposta do monitoramento.
        </p>
        <div className="info-note">
          Limites apenas ilustrativos. Esta simulação não prevê deslizamentos e
          não representa uma avaliação geotécnica.
        </div>
        <label className="field-label" htmlFor="simulation-area">
          Encosta monitorada
        </label>
        <select
          id="simulation-area"
          value={id}
          onChange={(event) => choose(event.target.value)}
        >
          {data?.slopes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="current-stage">
          <span>Estágio atual</span>
          {current && <RiskBadge level={current.riskLevel} />}
        </div>
        <div className="preset-buttons">
          <button
            type="button"
            onClick={() =>
              setValues({
                soilMoisture: 94,
                rain1h: 39,
                tilt: 6.2,
                movement: true,
                tractionWire: "NORMAL",
              })
            }
          >
            <CloudRain size={16} />
            Chuva intensa
          </button>
          <button
            type="button"
            onClick={() =>
              setValues({
                soilMoisture: 48,
                rain1h: 3,
                tilt: 0.6,
                movement: false,
                tractionWire: "NORMAL",
              })
            }
          >
            Condições estáveis
          </button>
        </div>
        {[
          {
            key: "rain1h",
            name: "Chuva na última hora",
            unit: "mm",
            max: 60,
            icon: CloudRain,
          },
          {
            key: "soilMoisture",
            name: "Umidade do solo",
            unit: "%",
            max: 100,
            icon: Droplets,
          },
          {
            key: "tilt",
            name: "Inclinação",
            unit: "°",
            max: 10,
            icon: MoveUpRight,
          },
        ].map(({ key, name, unit, max, icon: Icon }) => (
          <div className="range-field" key={key}>
            <label htmlFor={`sim-${key}`}>
              <span>
                <Icon size={17} />
                {name}
              </span>
              <strong>
                {number(values[key], 1)} {unit}
              </strong>
            </label>
            <input
              id={`sim-${key}`}
              type="range"
              min="0"
              max={max}
              step="0.1"
              value={values[key]}
              onChange={(event) =>
                setValues((v) => ({ ...v, [key]: Number(event.target.value) }))
              }
            />
            <div>
              <span>0 {unit}</span>
              <span>
                {max} {unit}
              </span>
            </div>
          </div>
        ))}
        <label className="check-field">
          <input
            type="checkbox"
            checked={values.movement}
            onChange={(event) =>
              setValues((v) => ({ ...v, movement: event.target.checked }))
            }
          />
          Movimento detectado
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={values.tractionWire === "ROMPIDO"}
            onChange={(event) =>
              setValues((v) => ({
                ...v,
                tractionWire: event.target.checked ? "ROMPIDO" : "NORMAL",
              }))
            }
          />
          Fio de tração rompido
        </label>
        {feedback && (
          <div className="success-note" role="status">
            {feedback}
          </div>
        )}
        <button
          className="button primary full-width"
          type="submit"
          disabled={busy}
        >
          <Play size={17} />
          {busy ? "Aplicando…" : "Aplicar simulação"}
        </button>
        <button
          className="button ghost full-width"
          type="button"
          onClick={reset}
        >
          <RotateCcw size={15} />
          Reiniciar demonstração
        </button>
      </form>
    </dialog>
  );
}
