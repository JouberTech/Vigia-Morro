import { LoaderCircle, TriangleAlert, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
export function Loading() {
  return (
    <div className="state-box" role="status">
      <LoaderCircle className="spin" />
      <h2>Carregando monitoramento</h2>
      <p>Buscando as últimas leituras das encostas.</p>
    </div>
  );
}
export function ErrorState({ retry }) {
  return (
    <div className="state-box" role="alert">
      <TriangleAlert />
      <h2>Não foi possível atualizar os dados</h2>
      <p>As leituras podem estar desatualizadas. Tente conectar novamente.</p>
      <button className="button primary" onClick={retry}>
        Tentar novamente
      </button>
    </div>
  );
}
export function Empty({
  text = "Nenhum resultado para os filtros selecionados.",
}) {
  return (
    <div className="empty-state">
      <Inbox size={30} />
      <p>{text}</p>
    </div>
  );
}
export function NotFound({ area = false }) {
  return (
    <div className="state-box">
      <TriangleAlert />
      <span className="eyebrow">404 · NÃO ENCONTRADO</span>
      <h1>
        {area ? "Encosta não encontrada" : "Esta página não está por aqui"}
      </h1>
      <p>O endereço pode ter mudado. Consulte as áreas monitoradas.</p>
      <Link className="button primary" to="/mapa">
        Ir para o mapa
      </Link>
    </div>
  );
}
