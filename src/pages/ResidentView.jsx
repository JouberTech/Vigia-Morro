import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Phone,
  CloudRain,
  Clock3,
  ChevronRight,
  X,
  ExternalLink,
  TriangleAlert,
  CheckCircle2,
  Eye,
  Activity,
  OctagonAlert,
  FlaskConical,
} from "lucide-react";
import { useMonitoring } from "../hooks/useMonitoring";
import Brand from "../components/Brand";
import { Loading, ErrorState, NotFound } from "../components/States";
import { riskInfo } from "../utils/risk";
import { number, dateTime } from "../utils/format";

const icons = {
  check: CheckCircle2,
  eye: Eye,
  activity: Activity,
  triangle: TriangleAlert,
  octagon: OctagonAlert,
};
export default function ResidentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, retry, online } = useMonitoring();
  const guide = useRef(null);
  const slope = data?.slopes.find((s) => s.id === id);
  useEffect(() => {
    document.title = `${slope?.neighborhood ?? "Minha área"} · VigiaMorro`;
  }, [slope?.neighborhood]);
  if (loading) return <Loading />;
  if (error && !data) return <ErrorState retry={retry} />;
  if (!slope) return <NotFound area />;
  const risk = riskInfo(slope.riskLevel);
  const Icon = icons[risk.icon];
  return (
    <div className="resident-shell">
      <header className="resident-header">
        <Link to="/">
          <Brand compact />
        </Link>
        <span>Para nossa comunidade</span>
      </header>
      <main className="resident-main">
        <Link className="back-link" to={`/encostas/${id}`}>
          <ArrowLeft size={16} />
          Voltar ao painel
        </Link>
        <div className="resident-demo">
          <FlaskConical size={17} />
          <div>
            <strong>Esta é uma demonstração</strong>
            <p>
              Dados e alertas simulados. Consulte os canais oficiais para
              informações reais.
            </p>
          </div>
        </div>
        {(!online || error) && (
          <div className="offline-banner" role="status">
            {error
              ? "As leituras podem estar desatualizadas. Consulte os canais oficiais."
              : "Sem internet. Os links externos podem estar indisponíveis."}
          </div>
        )}
        <div className="resident-location">
          <span className="eyebrow">COMO ESTÁ A MINHA ÁREA?</span>
          <h1>
            <MapPin size={24} />
            {slope.neighborhood}
          </h1>
          <label className="sr-only" htmlFor="resident-area">
            Selecionar sua área
          </label>
          <select
            id="resident-area"
            value={id}
            onChange={(event) => navigate(`/area/${event.target.value}`)}
          >
            {data.slopes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.neighborhood} · Recife
              </option>
            ))}
          </select>
        </div>
        <section
          className="resident-status"
          style={{ "--risk-color": risk.color, "--risk-bg": risk.background }}
          aria-label={`Status da área: ${risk.label}`}
        >
          <div className="resident-status-icon">
            <Icon size={42} strokeWidth={1.5} />
          </div>
          <span>STATUS DA ÁREA · SIMULADO</span>
          <h2>{risk.label}</h2>
          <p>
            {risk.rank === 0
              ? "As leituras simuladas não indicam alterações relevantes neste momento. Continue acompanhando as orientações oficiais."
              : "Os sensores identificaram alterações nas condições da encosta. Acompanhe as orientações oficiais."}
          </p>
          <div>
            <Clock3 size={15} />
            Última atualização: {dateTime(slope.updatedAt)}
          </div>
        </section>
        <section className="resident-readings">
          <article>
            <CloudRain size={25} />
            <div>
              <span>Chuva nas últimas 24 horas</span>
              <strong>
                {number(slope.rain24h, 1)} <small>mm</small>
              </strong>
            </div>
          </article>
          <article>
            <ShieldCheck size={25} />
            <div>
              <span>Situação da encosta</span>
              <strong>
                {slope.movement || slope.tractionWire === "ROMPIDO"
                  ? "Alterações detectadas"
                  : "Em acompanhamento"}
              </strong>
            </div>
          </article>
        </section>
        <button
          className="button primary resident-guide"
          onClick={() => guide.current.showModal()}
        >
          <ShieldCheck size={22} />
          <span>Orientações de segurança</span>
          <ChevronRight size={21} />
        </button>
        <a className="button secondary resident-phone" href="tel:08000813400">
          <Phone size={21} />
          <span>
            Ligar para Defesa Civil
            <small>0800 081 3400 · ligação gratuita, 24h</small>
          </span>
        </a>
        <p className="resident-disclaimer">
          O VigiaMorro apresenta indicadores de monitoramento. Eles não são uma
          previsão de deslizamento nem substituem a avaliação da Defesa Civil.
        </p>
        <div className="resident-motto">
          A encosta dá sinais.
          <br />
          <strong>O VigiaMorro ajuda a escutá-los.</strong>
        </div>
      </main>
      <dialog
        className="safety-dialog"
        ref={guide}
        aria-labelledby="safety-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) guide.current.close();
        }}
      >
        <button
          className="icon-button safety-close"
          aria-label="Fechar orientações"
          onClick={() => guide.current.close()}
        >
          <X size={21} />
        </button>
        <span className="soft-icon">
          <ShieldCheck size={25} />
        </span>
        <h2 id="safety-title">Cuide de você e da sua família</h2>
        <p>Orientações gerais da Prefeitura do Recife.</p>
        <ul>
          <li>
            Percebeu sinais de perigo? Procure um local seguro e acione a Defesa
            Civil.
          </li>
          <li>
            Rachaduras, infiltrações, postes inclinados e pequenos deslizamentos
            devem ser comunicados à Defesa Civil.
          </li>
          <li>
            Acompanhe os alertas oficiais e siga as orientações das equipes
            responsáveis.
          </li>
          <li>
            Preserve as lonas de proteção. Evite o despejo de água e lixo nas
            encostas.
          </li>
        </ul>
        <a className="button primary full-width" href="tel:08000813400">
          <Phone size={18} />
          Defesa Civil · 0800 081 3400
        </a>
        <a
          className="official-link"
          href="https://acaoinverno.recife.pe.gov.br/"
          target="_blank"
          rel="noreferrer"
        >
          Orientações oficiais · Prefeitura do Recife <ExternalLink size={14} />
        </a>
      </dialog>
    </div>
  );
}
