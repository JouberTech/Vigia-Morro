import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Bell,
  Radio,
  Monitor,
  Users,
  Menu,
  X,
  FlaskConical,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  WifiOff,
  MapPin,
  CalendarDays,
} from "lucide-react";
import Brand from "../components/Brand";
import SimulationPanel from "../components/SimulationPanel";
import { ErrorState, Loading } from "../components/States";
import { useMonitoring } from "../hooks/useMonitoring";
import { time } from "../utils/format";

const links = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/mapa", label: "Mapa de encostas", icon: Map },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/dispositivos", label: "Dispositivos", icon: Radio },
  { to: "/central", label: "Central de monitoramento", icon: Monitor },
];
export default function AppLayout() {
  const { data, loading, error, retry, online } = useMonitoring();
  const [menu, setMenu] = useState(false);
  const [simulation, setSimulation] = useState(false);
  const [toast, setToast] = useState(null);
  const previousAlerts = useRef(null);
  const location = useLocation();
  const title =
    links.find((link) => link.to === location.pathname)?.label ??
    "Detalhes da encosta";
  useEffect(() => {
    setMenu(false);
    document.title = `${title} · VigiaMorro`;
  }, [location.pathname, title]);
  useEffect(() => {
    if (!data) return;
    const ids = new Set(data.alerts.map((a) => a.id));
    if (previousAlerts.current) {
      const added = data.alerts.find((a) => !previousAlerts.current.has(a.id));
      if (added) setToast(added);
    }
    previousAlerts.current = ids;
  }, [data]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 10000);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menu]);
  const selectedId = location.pathname.startsWith("/encostas/")
    ? location.pathname.split("/")[2]
    : undefined;
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        className={`sidebar ${menu ? "is-open" : ""}`}
        aria-label="Navegação principal"
      >
        <Link className="brand-link" to="/">
          <Brand />
        </Link>
        <div className="workspace-label">
          <span className="workspace-icon">
            <MapPin size={17} />
          </span>
          <div>
            <strong>Recife, PE</strong>
            <small>Rede de monitoramento</small>
          </div>
          <ChevronRight size={14} />
        </div>
        <div className="nav-caption">MONITORAMENTO</div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
              {to === "/alertas" && data?.dashboard.activeAlerts > 0 && (
                <span className="nav-count">{data.dashboard.activeAlerts}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="nav-caption community-caption">COMUNIDADE</div>
        <Link className="nav-link" to="/area/ibura-01">
          <Users size={19} />
          <span>Visão do morador</span>
          <ArrowUpRight size={15} />
        </Link>
        <div className="sidebar-bottom">
          <div className="mission-card">
            <ShieldCheck size={25} />
            <p>
              A encosta dá sinais.
              <br />
              <strong>
                O VigiaMorro ajuda
                <br />a escutá-los.
              </strong>
            </p>
            <span>Tecnologia a serviço da prevenção</span>
          </div>
          <div className="sidebar-status">
            <i className="status-dot" />
            <span>Ambiente de demonstração</span>
            <small>v1.0</small>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-button"
              aria-label={menu ? "Fechar navegação" : "Abrir navegação"}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? <X size={21} /> : <Menu size={21} />}
            </button>
            <span>Monitoramento</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="today">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="demo-pill">
              <FlaskConical size={13} />
              Dados simulados
            </span>
            <Link
              to="/alertas"
              className="notification-button icon-button"
              aria-label={`${data?.dashboard.activeAlerts ?? 0} alertas ativos`}
            >
              <Bell size={20} />
              {!!data?.dashboard.activeAlerts && <i />}
            </Link>
            <span className="profile-avatar" title="Ambiente de demonstração">
              VM
            </span>
          </div>
        </header>
        <main
          id="main-content"
          className={`main-content ${location.pathname === "/central" ? "central-content" : ""}`}
        >
          {!online && (
            <div className="offline-banner" role="status">
              <WifiOff size={17} />
              Sem internet. A simulação local continua; mapa e orientações
              externas podem ficar indisponíveis.
            </div>
          )}
          {error && data && (
            <div className="offline-banner" role="alert">
              Falha na atualização. As leituras exibidas podem estar
              desatualizadas.<button onClick={retry}>Reconectar</button>
            </div>
          )}
          {loading ? (
            <Loading />
          ) : error && !data ? (
            <ErrorState retry={retry} />
          ) : (
            <Outlet context={{ openSimulation: () => setSimulation(true) }} />
          )}
        </main>
        <footer className="app-footer">
          <span>
            VigiaMorro <span className="footer-divider">/</span> Monitoramento
            Inteligente de Encostas
          </span>
          <span>
            {error ? "Atualização interrompida" : "Leitura simulada"} ·{" "}
            {time(data?.updatedAt)}
          </span>
        </footer>
      </div>
      {data && (
        <SimulationPanel
          open={simulation}
          onClose={() => setSimulation(false)}
          initialSlopeId={selectedId}
        />
      )}
      {toast && (
        <div className="alert-toast" role="status">
          <Bell size={21} />
          <div>
            <strong>Novo alerta simulado</strong>
            <Link to="/alertas">{toast.slopeName} · Ver alerta</Link>
          </div>
          <button
            className="icon-button"
            onClick={() => setToast(null)}
            aria-label="Fechar aviso"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
