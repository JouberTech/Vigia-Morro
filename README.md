# VigiaMorro

**Monitoramento Inteligente de Encostas**

> A encosta dá sinais. O VigiaMorro ajuda a escutá-los.

Frontend demonstrativo para um hackathon, voltado ao acompanhamento de encostas do Recife por agentes, gestores e moradores. Desenvolvido com **React, Vite e JavaScript**, sem TypeScript e sem backend.

Todos os pontos, leituras, dispositivos, índices e alertas são simulados. O protótipo não prevê deslizamentos e não deve ser utilizado em decisões de emergência. Os limites do simulador não são critérios geotécnicos.

## Executar

Requisitos: Node.js 22 ou superior e npm.

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. No celular conectado à mesma rede, use o endereço de rede exibido pelo Vite; o firewall do computador precisa permitir o acesso ao servidor de desenvolvimento.

Nenhuma chave, conta Firebase ou arquivo `.env` é necessário para a demonstração. O mapa base OpenStreetMap e as fontes web dependem de internet. Se as fontes não carregarem, o navegador utiliza a fonte de sistema. A lista de encostas continua disponível se o mapa base falhar.

```sh
npm test          # Testes de comportamento do motor demonstrativo
npm run build    # Gera o frontend estático em dist/
npm run preview  # Serve a versão compilada localmente
```

Em hospedagem estática, configure fallback das rotas para `index.html` (SPA), inclusive `/encostas/:id` e `/area/:id`. O projeto inclui `.openai/hosting.json` para publicação pelo Sites. Não copie `node_modules`, `.env` ou arquivos privados para a pasta pública.

## Roteiro de apresentação

1. Abra a **Visão geral**. São cinco encostas e vinte dispositivos simulados, com estados Online, Instável e Offline.
2. Abra **Mapa de encostas**. Selecione um bairro na lista ou clique em um marcador. A lista oferece a alternativa acessível ao mapa.
3. Clique em **Ver detalhes** para consultar a encosta e os quatro gráficos, selecionando 1h, 6h, 12h, 24h ou 7 dias.
4. Clique em **Simular cenário**. Escolha a encosta e altere chuva, umidade, inclinação, movimentação ou fio de tração.
5. Para demonstrar uma escalada, selecione **Chuva intensa** e depois **Aplicar simulação**. O cenário produz **Alerta máximo**, atualiza mapa, gráficos, totais e área, e gera um alerta visual.
6. Abra **Alertas**. Reconheça a ocorrência e, depois, resolva-a. Essas ações alteram apenas o registro do alerta; não diminuem o risco da encosta.
7. Abra **Visão do morador** na página da encosta. O mesmo estado será apresentado em uma interface simples, com orientações oficiais e o contato da Defesa Civil.
8. Na **Central de Monitoramento**, ative **Tela cheia** para a apresentação em monitor grande. Use o botão ou Esc para sair. Se a API de tela cheia não estiver disponível, o aplicativo usa o modo expandido.
9. **Reiniciar demonstração**, no simulador, restaura todas as leituras e alertas iniciais.

Use a navegação do aplicativo na mesma aba durante a apresentação. A simulação vive na memória da aba: recarregar a página ou abrir outra aba inicia um cenário independente. Não há persistência remota, sincronização entre usuários, envio de SMS ou notificações push. A entrada de novas amostras e os horários são atualizados a cada oito segundos; os valores permanecem estáveis até a aplicação de um novo cenário.

## Rotas

| Rota            | Conteúdo                                                               |
| --------------- | ---------------------------------------------------------------------- |
| `/`             | Estágio geral, indicadores, mapa, áreas prioritárias e histórico       |
| `/mapa`         | Recife no Leaflet/OSM, filtros, lista, marcadores e detalhes           |
| `/encostas/:id` | Indicadores individuais, localização, dispositivos e quatro históricos |
| `/alertas`      | Alertas ativos, reconhecidos e resolvidos; busca e filtros             |
| `/dispositivos` | Estado, bateria, sinal, firmware, último contato e sensores            |
| `/central`      | Visão de operação e modo tela cheia                                    |
| `/area/:id`     | Status simplificado, chuva, orientações e telefone                     |

IDs disponíveis: `ibura-01`, `dois-unidos-01`, `brejo-01`, `linha-do-tiro-01`, `jenipapo-01`.

## Arquitetura

Fluxo desta etapa:

```text
Páginas / componentes
        ↓
useMonitoring / useTelemetry
        ↓
MonitoringContext
        ↓
services/sensorApi.js
        ↓
mocks/engine.js → mocks/data.js
```

Arquitetura futura:

```text
Sensores → ESP32 → API HTTPS → Firebase Cloud Functions → Firestore
                                                            ↓
                                              sensorApi.js / onSnapshot
                                                            ↓
                                             Context → frontend React
```

O navegador não recebe conexões dos ESP32 nem conhece suas credenciais. A interface apresenta o `riskLevel` recebido da camada de serviço. O cálculo ilustrativo dos cinco estágios existe somente em `mocks/engine.js`; ele deverá ser descartado na integração real.

O contexto mantém uma única assinatura compartilhada pelas telas. A assinatura devolve uma função de limpeza, e o timer simulado é interrompido quando não há assinantes, inclusive no ciclo de montagem do React StrictMode. Os hooks também descartam respostas de histórico após desmontagem ou mudança de período.

```text
src/
  assets/             Recursos visuais importados
  components/         RiskBadge, RecifeMap, gráficos, cards, simulador e estados
  context/            MonitoringProvider e estado compartilhado
  hooks/              useMonitoring e useTelemetry
  layouts/            Navegação, cabeçalho e avisos da aplicação
  mocks/              Dados iniciais, históricos e motor da demonstração
  pages/              As sete interfaces do MVP
  services/
    sensorApi.js      Contrato único de acesso aos dados
    firebase.js       Inicialização e helper onSnapshot, ainda não ativados
    pwa.js            Pontos de extensão para Service Worker
  utils/              Formatação e metadados dos cinco estágios
  App.jsx             Rotas, com carregamento sob demanda
  main.jsx            Montagem dos providers e do React
  styles.css          Tema, componentes e breakpoints responsivos
public/
  icon.svg
  manifest.webmanifest
  sw.js               Estrutura inativa para a etapa PWA
tests/
  monitoring.test.js  Fluxos de simulação, alertas, históricos e cleanup
```

## Contrato de dados

As interfaces existentes de `src/services/sensorApi.js` devolvem Promises:

```js
getDashboard();
getSlopes();
getSlope(id); // encosta ou null
getSlopeTelemetry(id, (hours = 24));
getAlerts();
getDevices();
```

Extensões para atualização e demonstração:

```js
subscribeMonitoring(onData, onError); // devolve unsubscribe()
simulateReadings(id, values); // apenas MOCK
updateAlertStatus(id, status); // apenas MOCK nesta etapa
resetDemo(); // apenas MOCK
```

Exemplo de encosta normalizada:

```js
{
  id: 'ibura-01',
  name: 'Encosta Ibura 01',
  neighborhood: 'Ibura',
  location: 'Setor de monitoramento • Zona Sul',
  latitude: -8.1163,
  longitude: -34.9492,
  sensorCount: 4,
  riskLevel: 'ALERTA',
  soilMoisture: 86,
  rain1h: 21.5,       // mm na última hora
  rain24h: 87.2,     // mm nas últimas 24 horas
  tilt: 3.7,         // graus
  movement: false,
  tractionWire: 'NORMAL', // NORMAL | ROMPIDO
  updatedAt: '2026-09-06T18:00:00.000Z'
}
```

Valores de `riskLevel`: `NORMALIDADE`, `MOBILIZACAO`, `ATENCAO`, `ALERTA`, `ALERTA_MAXIMO`. Rótulos em português com acentos são definidos em `utils/risk.js`. Um valor desconhecido é mostrado como **Sem informação**, nunca como normalidade.

Cada ponto histórico contém `timestamp` (ISO 8601), `soilMoisture`, `rain1h`, `tilt` e `riskIndex`. O histórico mock cobre sete dias e é reduzido para no máximo 101 amostras por gráfico, preservando a amostra mais recente. O índice de 0–100 é ilustrativo e não representa probabilidade de deslizamento.

O callback `onData` recebe:

```js
{
  slopes: [], devices: [], alerts: [], events: [],
  updatedAt: 'ISO 8601',
  isMock: true,
  dashboard: {
    generalRisk: 'ALERTA', slopesCount: 5,
    online: 17, unstable: 1, offline: 2,
    activeAlerts: 2, criticalSlopes: 1,
    maxRain24h: 87.2, maxSoilMoisture: 86,
    updatedAt: 'ISO 8601'
  }
}
```

`criticalSlopes` conta áreas em Alerta ou Alerta máximo; `activeAlerts` conta somente alertas com status Ativo. Reconhecido significa que o alerta foi assumido para acompanhamento. Resolver um registro não equivale a uma avaliação de segurança da área. Os valores de chuva e umidade no dashboard são **máximos entre estações**, não médias municipais ou somas entre sensores.

## Substituir mocks por API real

Centralize a alteração de transporte e normalização em **`src/services/sensorApi.js`**, preservando as assinaturas e formatos acima. Os componentes não precisam saber URLs, coleções ou detalhes do ESP32.

1. Substitua as consultas ao motor mock por `fetch` aos endpoints autorizados ou por leituras Firestore. Trate respostas HTTP não bem-sucedidas, ausência de encosta e falha de comunicação.
2. Normalize timestamps Firestore com `timestamp.toDate().toISOString()` e valide campos, unidades e identificadores. Preserve o `riskLevel` calculado no backend.
3. Implemente `subscribeMonitoring` com `onSnapshot`, WebSocket ou SSE. Monte o mesmo snapshot normalizado, encaminhe falhas a `onError` e retorne uma função que encerre todas as assinaturas.
4. Mapeie `updateAlertStatus` para uma operação autenticada e autorizada no backend. O histórico de reconhecimento e resolução deve ser auditável no servidor.
5. Remova o import de `mocks/engine.js` do adaptador real. Operações `simulateReadings` e `resetDemo` devem ficar indisponíveis em produção, ou apontar somente para um ambiente separado de demonstração.

Exemplo de transporte futuro, dentro de `sensorApi.js`:

```js
async function request(path, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    headers: { Authorization: `Bearer ${await getAuthorizedUserToken()}` },
  });
  if (!response.ok)
    throw new Error(`Falha ao consultar dados (${response.status})`);
  return response.json();
}

export const getSlope = async (id) => {
  const result = await request(`/slopes/${encodeURIComponent(id)}`);
  return normalizeSlope(result);
};
```

`API_BASE_URL`, `getAuthorizedUserToken()` e `normalizeSlope()` são contratos ilustrativos a implementar na etapa de integração; não existe backend neste repositório. A URL da API não é uma credencial. Tokens de dispositivos, chaves de contas de serviço e segredos de ingestão nunca pertencem a variáveis `VITE_*`.

Esta entrega é identificada permanentemente como protótipo. Antes de colocá-la em operação real, além da troca do adaptador, revise os textos de demonstração, retire os controles de simulação, implemente autenticação/perfis, avaliação de dados antigos, regras operacionais e validação técnica dos estágios. As telas administrativas atuais são demonstrativas e não constituem controle de acesso.

## Firebase e ESP32 na próxima etapa

O Firebase Web SDK está instalado. `services/firebase.js` oferece inicialização **sob demanda**, com aplicação nomeada e `subscribeCollection(path, onData, onError)`. O modo mock não importa esse módulo nem faz consultas ao Firebase.

Copie `.env.example` para `.env.local` e preencha somente a configuração pública do aplicativo Firebase quando implementar a integração. Regras do Firestore e autenticação devem limitar a consulta a dados autorizados; jamais use regras abertas como solução temporária de produção.

Coleções sugeridas, a definir no backend: `slopes`, `devices`, `alerts`, `events` e `slopes/{id}/telemetry`. A função de ingestão HTTPS deve autenticar o dispositivo, validar o payload, unidades, timestamps e associação à encosta, persistir os dados e calcular o estágio de risco. A classificação técnica deve ser desenvolvida e validada por profissionais responsáveis. O frontend consulta apenas os resultados autorizados.

Não coloque credenciais ESP32 em `.env.example`, código React, `public/`, manifesto ou bundle. Variáveis Vite são públicas após o build, mesmo se vierem de `.env.local`.

## Mapa e GeoJSON

O mapa usa Leaflet, React Leaflet e tiles padrão do OpenStreetMap, com atribuição visível. As posições das cinco áreas são aproximadas e simuladas, não pontos oficialmente instrumentados.

`RecifeMap` aceita uma camada GeoJSON futura configurada por `VITE_RISK_GEOJSON_URL`. A URL precisa entregar um `FeatureCollection` válido, em coordenadas WGS84, com CORS habilitado. A camada é carregada com cancelamento e mensagem de erro; sem a variável, são mostrados apenas os marcadores simulados. Integre somente polígonos de risco com procedência e versão verificadas.

O [portal de dados do Recife](https://dados.recife.pe.gov.br/dataset/area-urbana/resource/5c67ce14-1799-40c4-a37c-9daa04d1761c) oferece limites de bairros em GeoJSON; **limites de bairros não são polígonos de risco**. Por isso esse arquivo não é exibido como área de risco no protótipo.

Respeite a [política de tiles do OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/). O MVP não faz prefetch de regiões, download em massa nem cache offline de tiles. Para escalar a operação, escolha um provedor de mapas com capacidade e contrato adequados.

## PWA, acessibilidade e limites atuais

- Manifesto, ícone e estrutura de Service Worker incluídos. `sw.js` não é registrado automaticamente e não intercepta requisições.
- `services/pwa.js` mantém pontos de extensão. Cache offline, push e atualização em segundo plano ficam para a próxima etapa; não existem notificações fictícias ou permissões solicitadas silenciosamente.
- Antes de habilitar cache, defina expiração e identificação inequívoca de leituras antigas. Dados de risco não devem parecer atuais quando recuperados offline.
- Estágios combinam texto, ícone e cor. Há link para pular navegação, controles nativos, foco visível, diálogo modal, filtros rotulados, alternativa de lista ao mapa e resumo textual das séries.
- Layout responsivo para celular, tablet e desktop; tabelas largas têm rolagem horizontal e a central usa modo expandido em monitores grandes.
- A visão do morador é informativa e aponta para canais oficiais. O botão telefônico abre o discador; não realiza chamadas automaticamente.

## Validação

Os testes em Node verificam dados iniciais, cinco estágios, aplicação de cenário crítico, notificações aos assinantes, geração e não duplicação de alertas, transições de status, reset, histórico em todos os períodos, rejeição de entradas inválidas e limpeza da assinatura. `npm run build` valida e compila todas as rotas.

Não há integração de hardware, autenticação, persistência remota, backend Firebase ativo nem validação geotécnica. Os testes não substituem ensaios de campo ou homologação operacional.

## Fontes oficiais

- [Defesa Civil do Recife: 0800 081 3400, gratuito, 24 horas](https://www2.recife.pe.gov.br/node/13223).
- [Ação Inverno — orientações da Prefeitura do Recife](https://acaoinverno.recife.pe.gov.br/).
- [Firebase: listeners em tempo real, erros e encerramento de assinatura](https://firebase.google.com/docs/firestore/query-data/listen).
- [Leaflet: início e atribuição do mapa](https://leafletjs.com/examples/quick-start/).

Fontes consultadas em 6 de setembro de 2026. O texto de orientação do morador é geral; decisões e instruções locais devem vir da Defesa Civil.
