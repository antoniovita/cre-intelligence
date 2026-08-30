# CRE Intelligence — Kanban do Hackathon (8h / 3 pessoas)

> North star da demo: **pressure = demand / supply**. Tudo que não serve a essa métrica ou aos 3 blocos da demo (Territory → Vacancy Flow → Simulador) está fora do MVP. Ver `## Fora do escopo` no fim.

Como usar este arquivo durante o hackathon:
- Cada pessoa move os próprios cards entre `TODO → DOING → DONE` editando o checkbox e movendo a linha (ou só marcando `[x]`).
- `[ ]` não iniciado · `[~]` em andamento · `[x]` feito · `[!]` bloqueado (descreva o bloqueio ao lado)
- Todo card tem dono (P1/P2/P3), tempo estimado e o horário-alvo do cronograma. Se estourar o tempo, corte escopo, não corte o prazo.
- Contrato de dados (`territories.json` / `queue.json`) é lei — se mudar, avisar no grupo imediatamente, pois P2 e P3 dependem dele desde o minuto 0 via mock.

---

## Arquitetura do repo

Sem backend em runtime: pipeline Python roda offline e gera JSON estático; o Next.js só lê. Nada sobe além do `frontend/` na demo.

```
hackaton-claude/
├── TASKS.md
├── data/
│   ├── README.md              # proveniência dos dados (repo externo, ver abaixo) + cadeia de joins
│   └── raw/
│       ├── inscricoes/        # Query A/B/C/D + dicionário de dados
│       ├── vagas/              # localização das unidades + vagas parceiras/públicas 2025
│       └── territorios/        # shapefile oficial de microáreas da SME
├── pipeline/                   # 🐍 P1 — roda uma vez, offline
│   ├── requirements.txt
│   ├── loaders.py              # leitura/normalização de cada arquivo bruto (pronto)
│   ├── territories.py          # build_territories() — TODO
│   ├── queue.py                # priority_score() + build_queue() — TODO
│   ├── build.py                # entrypoint: python -m pipeline.build
│   └── PIPELINE.md             # decisões tomadas, preencher durante o dia
└── frontend/                   # ⚛️ P2 + P3 — único artefato que sobe na demo
    ├── public/data/            # territories.json + queue.json (saída do pipeline)
    ├── app/                    # páginas (Next.js App Router)
    ├── components/
    │   ├── map/                 # 🗺️ P2 — mapa + simulador
    │   └── vacancy/              # 🎤 P3 — painel de fila
    └── lib/
        ├── types.ts             # contrato TS espelhando os JSONs (pronto)
        └── pressure.ts          # fórmula do simulador, client-side (stub pronto)
```

`dadoscreche/` (a pasta com o dataset completo da organização) é um **repositório git separado**, só clonado localmente como referência — está no `.gitignore` e nunca é versionado aqui. Os únicos arquivos que o projeto de fato usa já foram copiados para `data/raw/`; ver `data/README.md` para a lista completa e a cadeia de joins entre eles.

---

## ⚡ Achado importante: os dados reais já resolvem o maior risco do brief

O brief original previa até 45min de timebox para tentar geocodificar/agregar por bairro/CEP, com fallback para mock. **Isso não é mais necessário** — inspecionei os dados reais fornecidos pela organização e o problema geográfico já vem resolvido. Os arquivos essenciais já foram copiados para `data/raw/` neste repo (o dataset original completo, `dadoscreche/`, é um repositório externo separado, só referência — ver `data/README.md` para a proveniência):

- **`data/raw/vagas/Unidades_Unificadas_com_Localizacao.xlsx`** — 1.941 unidades, **0 nulos em `LATITUDE`/`LONGITUDE`** (já em WGS84, prontas pra usar). Traz também `CRE` (11 regiões) e `microárea` (código tipo `"1.1"`, `"2.15"` — só 51/1941 nulos).
- **`data/raw/territorios/Microareas_SME_revisao.shp`** — shapefile real com **233 polígonos de microárea oficiais da SME**, campo `cod_territ` (mesmo código `"1.1"` etc.) e `cre`. Está em **SIRGAS 2000 / UTM 23S** (metros) — precisa reprojetar pra lat/lon com `pyproj` (já instalado: `pyproj.Transformer.from_crs("EPSG:31983", "EPSG:4326")`), não com GDAL pesado.
- **Chave de join universal de unidade**: `DESIGNACAO` (arquivo de localização) = `esc_codigo` (Query D, `04_UnidadesEscolaresComEndereco.csv`) **casa direto em 99.5% (1932/1941)**, mesmo tipo numérico, sem precisar normalizar nome. `DESIGNACAO` = `CÓDIGO SGA` (planilhas de vagas parceiras) casa em 97% (336/347). Ou seja: **`DESIGNACAO`/`esc_codigo`/`CÓDIGO SGA`/`Designação` (públicas) são o mesmo identificador de unidade** em todos os arquivos de oferta e localização — só a Query A usa outro formato (`unidade`, ex. `"0101601"`, 7 dígitos), que já era sabido que casa 872/872 com `esc_codigo` (ver `Bases IC_.../README_dicionario_dados.md`), então a cadeia completa fecha: **Query A → Query D (`esc_codigo`) → planilha de localização (`DESIGNACAO`) → planilhas de vagas (`CÓDIGO SGA`/`Designação`)**.
- **Cuidado ao fazer o merge pela Query D**: ~103 `esc_codigo` aparecem duplicados (mesma unidade com registros de tipos diferentes, histórico conveniada/pública) — dedupe antes de mergear pra não multiplicar linhas.
- **Supply tem fontes diferentes por tipo de rede**: `Parceiras2025.xlsx` (aba `MAIO -2025`, header em 2 linhas mescladas) já traz `Meta Total` (capacidade/supply direto), `Total Alunos` (demanda atendida) e `Vagas` por grupamento etário — descartar a 1ª linha de dados (é rótulo residual do header mesclado). Já `totaalunoscreche2025.xlsx` (unidades **públicas**, também header em 2 linhas) só traz `Aluno` e `Turma` por grupamento (sem "Meta"/capacidade explícita) — supply de unidade pública precisa ser estimado (ex.: capacidade por turma × nº de turmas) ou o MVP usa só a rede parceira como fonte de supply e documenta a simplificação na fala do pitch. **Descartar a última linha "TOTAL"** desse arquivo antes de somar por unidade.
- **1 unidade com `LATITUDE=0.0`/`LONGITUDE=0.0`** (Escola Municipal Pedro Bruno, DESIGNACAO 121002) — filtrar antes de plotar no mapa, é erro de geocodificação, não um ponto real no oceano/Null Island.
- **`03_QueryC_PerguntasComDescricao.csv`** é literalmente a régua oficial de prioridade: `perg_pontuacao` (0–100 pontos) por pergunta/ano, `perg_criterio = Sim` marcando desempate. **Usar isso direto** para calcular `prioridade_score` de `proxima_da_fila` — soma de pontos das perguntas com `resposta = Sim` e `confirmado = Sim`, por inscrição em `Lista de espera`. Atenção: a régua mudou de peso entre 2023→2024 (ex.: `perg_id=2` caiu de 100 para 25 pontos) — usar sempre a régua do **mesmo ano/processo** da inscrição, nunca comparar pontuação bruta entre anos.

**Implicação prática**: o Módulo 1 (Territory) pode e deve usar geometria real das 233 microáreas + coordenadas reais das unidades desde o início — não é preciso timebox de 45min nem mock geográfico. O tempo que o brief reservava pra isso deve ir para validar os joins entre bases (unidade↔microárea↔inscrição) e tratar o supply de unidades públicas.

---

## 0. Setup (0:00–0:20) — todos juntos

- [ ] **[Todos]** Alinhar escopo mínimo em voz alta, confirmar que ninguém vai tentar meter ML/login/CRUD (`~10min`)
- [ ] **[Todos]** Travar fórmula: `pressure = demand / supply` (sem variações por enquanto) (`~5min`)
- [ ] **[P1]** Confirmar que `data/raw/` (já no repo) tem tudo: CSVs de inscrição/critérios (`inscricoes/`), planilhas de vagas (`vagas/`) e o shapefile de microáreas (`territorios/`) — ver `data/README.md` (`~5min`)
- [ ] **[P1]** `pip install -r pipeline/requirements.txt` (`~5min`)
- [ ] **[P2/P3]** Confirmar repo, branch de trabalho, e rodar `npm install` / `npm run dev` no `frontend/` pra garantir que builda antes de codar em cima (`~10min`)
- [ ] **[P3]** Criar os JSONs **mock** (`territories.mock.json`, `queue.mock.json`) seguindo o schema abaixo, com ~10-15 territórios e ~10 vagas fake, pra P2/P3 não ficarem bloqueados esperando P1 (`~15min`)

### Schema `territories.json`
```json
[
  { "id": "string", "name": "string", "demand": 1200, "supply": 600, "pressure": 2.0, "latitude": -22.9, "longitude": -43.2 }
]
```

### Schema `queue.json`
```json
[
  {
    "vaga_id": "10291",
    "unidade": "string",
    "crianca_atual": "#29381",
    "status": "aguardando_confirmacao",
    "prazo": "ISO timestamp",
    "proxima_da_fila": {
      "crianca_id": "#38491",
      "elegibilidade": "ok",
      "prioridade_score": 0.82,
      "resposta_socioeconomica_resumo": {}
    }
  }
]
```

---

## PESSOA 1 — Dados (pipeline Python, bloqueante) 🔴

Meta dura: entregar `territories.json` + `queue.json` reais até **2:00**. Depois disso, vira apoio de dados sob demanda para P2/P3.

**O timebox de 45min de geocodificação do brief original foi eliminado** — já validamos que os dados reais resolvem geografia de ponta a ponta (ver seção "⚡ Achado importante" acima). Use esse tempo de sobra para validar os joins entre bases e tratar o supply das unidades públicas.

O esqueleto do pipeline já existe em `pipeline/` (`loaders.py` com os leitores de cada arquivo já implementados, `territories.py`/`queue.py` com `NotImplementedError` marcando o que falta, `build.py` como entrypoint único). O trabalho é **implementar as duas funções que faltam**, não montar do zero.

### TODO
- [ ] `pip install -r pipeline/requirements.txt` e ler `pipeline/loaders.py` inteiro — todos os leitores de `data/raw/` (Query A/B/C/D, unidades com localização, vagas parceiras/públicas, shapefile) já estão prontos e tratam os problemas conhecidos (header mesclado, encoding, dedupe, lat/lon zerada) (`~10min`)
- [ ] Implementar `pipeline/territories.py::build_territories()` — usar `loaders.load_microareas()` + `loaders.load_unidades_localizacao()` + `loaders.load_query_a()` + `loaders.load_query_d()` para juntar unidade → microárea, agregar `demand`/`supply`, calcular `pressure = demand/supply`, e `polygon_centroid()` (já implementado) pra achar lat/lon do território (`~60min`)
- [ ] Decidir e documentar em `pipeline/PIPELINE.md` como tratar supply de unidades públicas (`loaders.load_vagas_publicas()` só tem `Aluno`/`Turma`, sem capacidade — ver TODO no arquivo) — estimar por turma ou restringir supply a parceiras no MVP (`~15min`, decisão em grupo)
- [ ] Implementar `pipeline/queue.py::priority_score()` — somar `perg_pontuacao` (Query C) das respostas `Sim`/confirmado `Sim` (Query B) de uma inscrição, **sempre usando a régua do mesmo ano/processo** (peso mudou entre 2023→2024) (`~30min`)
- [ ] Implementar `pipeline/queue.py::build_queue()` — inscrições em `situacao == "Lista de espera"` (Query A), ordenar por `priority_score` por vaga, montar `proxima_da_fila`; `status`/`prazo` não existem no dataset bruto — gerar valor sintético plausível e documentar isso no PIPELINE.md (`~30min`)
- [ ] Rodar `python -m pipeline.build` da raiz do repo — gera `territories.json`/`queue.json` direto em `frontend/public/data/` (`~5min`)
- [ ] **Checkpoint até 2:00**: confirmar que os dois arquivos existem em `frontend/public/data/` — avisar o grupo assim que rodar (`checkpoint`)
- [ ] Validar com P2/P3 que os campos batem 1:1 com `frontend/lib/types.ts`; ajustar nomes se necessário (`~15min`)
- [ ] Preencher `pipeline/PIPELINE.md` com como `pressure` e `proxima_da_fila` foram calculados — vai virar munição pro pitch (`~10min`)

### Depois de 2:00 (apoio)
- [ ] Gerar variações/ajustes finos nos dados se P2 pedir (ex.: mais territórios de alta pressão para o mapa ficar visualmente interessante)
- [ ] Ajudar a validar números que aparecem na fala do pitch ("de 1,71 para 1,60") batem com os dados reais usados no simulador
- [ ] Puxar 2-3 números/fatos reais do dataset para reforçar a narrativa da demo (ex.: "X territórios têm pressure > 2")

---

## PESSOA 2 — Mapa + Simulador (clímax da demo) 🗺️

Trabalha contra o mock de P3 desde o minuto 0; troca pelo `territories.json` real assim que P1 entregar (~2:00).

`frontend/lib/types.ts` (contrato `Territory`) e `frontend/lib/pressure.ts` (`simulateAddedSupply`, já implementada) já existem — usar direto, não recriar.

### TODO
- [ ] Setup Mapbox/MapLibre no projeto Next.js já existente (`frontend/`) — token, provider, container base (`~30min`, alvo 0:20–0:50)
- [ ] Criar `frontend/components/map/TerritoryMap.tsx` — renderizar mapa do Rio centralizado, carregando `territories.mock.json` (`~20min`)
- [ ] Plotar territórios como pontos/heatmap coloridos por `pressure` (escala de cor: baixa → alta pressão) (`~40min`, alvo até 2:00)
- [ ] Criar `frontend/components/map/TerritoryDetail.tsx` — clique em território abre painel/popup com `name`, `demand`, `supply`, `pressure` (`~30min`)
- [ ] **Checkpoint 2:00**: trocar mock por `territories.json` real de P1 (gerado pelo pipeline em `frontend/public/data/`); validar que o mapa não quebra com os dados reais (`~20min`)
- [ ] Ajustar zoom/bounds/cores para os dados reais (a distribuição real de pressure pode ser diferente do mock) (`~20min`, janela 2:00–4:30)
- [ ] Criar `frontend/components/map/Simulator.tsx` — botões `+10 / +25 / +50 / +100` vagas por território selecionado (`~30min`, janela 4:30–6:00)
- [ ] Usar `simulateAddedSupply()` de `lib/pressure.ts` ao clicar, recalculando `supply`/`pressure` do território selecionado (sem chamar backend, sem persistir) (`~30min`)
- [ ] Atualizar o mapa (cor do ponto/heatmap) e o painel de detalhe em tempo real após simular (`~30min`)
- [ ] Botão de reset do território simulado (voltar ao valor original) (`~15min`)
- [ ] **Polish do simulador** — é o momento de maior impacto da demo: transição suave de cor, número do pressure animando, feedback visual claro do antes/depois (`~40min`, reservar tempo extra aqui de propósito)
- [ ] Testar o fluxo completo mapa → clique → simulador com os números que vão aparecer na fala do pitch (`~20min`, janela 6:00–7:00)

### Fora do escopo do P2
- Geoprocessamento sofisticado, camadas GIS extras, clustering complexo — agregação simples por território basta

---

## PESSOA 3 — Vacancy Flow + UI geral + Pitch 🎤

Também trabalha contra mock desde o minuto 0. Dona do layout geral e do roteiro de apresentação.

### TODO
- [ ] Criar `frontend/public/data/territories.mock.json` e `queue.mock.json` no schema de `lib/types.ts`, para liberar P2 e a si mesma (`~15min`, alvo 0:00–0:20 — ver seção Setup)
- [ ] Definir layout geral do dashboard: onde entra o mapa, onde entra o painel de fila, como plugam juntos (wireframe rápido, pode ser só no código) (`~20min`)
- [ ] Montar skeleton das páginas/componentes no Next.js: `app/page.tsx` (dashboard) + `frontend/components/vacancy/VacancyList.tsx`, `VacancyCard.tsx` (`~30min`, alvo 0:20–1:10)
- [ ] Lista de vagas em aberto lendo `queue.mock.json`, exibindo `unidade`, `status` (`~30min`)
- [ ] Countdown client-side por vaga a partir do campo `prazo` (`~30min`, janela 1:40–2:30)
- [ ] Badge/cor por status: aguardando confirmação / confirmada / vencendo (`~15min`)
- [ ] Criar `frontend/components/vacancy/NextInQueue.tsx` — exibir `proxima_da_fila` (nome/id, elegibilidade, score) diretamente do JSON, é leitura pura, sem lógica (`~20min`)
- [ ] Botão "Enviar lembrete" com simulação visual (toast/texto "✓ Lembrete registrado"), sem chamada real (`~15min`)
- [ ] **Checkpoint 2:00**: trocar `queue.mock.json` pelo `queue.json` real de P1 (`~15min`)
- [ ] Integração visual: selecionar território no mapa filtra/destaca vagas daquele território no painel de fila (`~40min`, janela 4:30–6:00, coordenar com P2)
- [ ] Polish geral do dashboard: cards, espaçamento, cores consistentes com a escala de pressure do mapa (`~30min`)
- [ ] Escrever o roteiro de apresentação (5 falas do roteiro da demo, ver seção 7 do brief) e treinar o timing (3-5min) (`~20min`, começar cedo, ir ajustando ao longo do dia)
- [ ] Preparar fallback de demo (prints/GIF do fluxo funcionando) caso algo quebre ao vivo (`~15min`, janela 6:00–7:00)
- [ ] Ensaiar a demo completa end-to-end pelo menos 2x com o time (`~30min`, janela 7:00–8:00)

### Fora do escopo do P3
- Timeline evento-a-evento detalhada da vaga — só status atual + countdown + próxima da fila

---

## Checkpoints de sincronização (todos param e conferem)

- [ ] **2:00** — P1 entrega `territories.json` + `queue.json` reais. P2 e P3 trocam mocks pelos arquivos reais.
- [ ] **4:30** — Mapa + pressure funcionando end-to-end (P2). Vacancy Flow funcionando com `proxima_da_fila` real (P3).
- [ ] **6:00** — Buffer começa: **nenhuma feature nova a partir daqui**, só integração e bugs.
- [ ] **7:00** — Código congelado. Só teste de demo e ajuste de pitch.

---

## Fora do escopo (não fazer, nem "só um pouquinho")

- ML complexo / modelo de classificação
- CRUD completo
- Envio real de WhatsApp/SMS
- Backend elaborado, microsserviços, Kubernetes, servidor rodando durante a apresentação
- Inventar critério de prioridade novo — usar a regra oficial existente do processo
- GIS sofisticado (buffers, isócronas, roteamento) — a agregação por microárea via shapefile oficial + coordenadas reais das unidades já é o dado pronto, não precisa de mais processamento geoespacial que isso
- Timeline evento-a-evento no Vacancy Flow
- Cascata de fila em N níveis — só pré-computar 1 próximo por vaga

> **Atualização (pós-MVP, com tempo sobrando):** o time decidiu incluir login/autenticação de admin
> e persistência de lembretes via um backend leve dentro do próprio Next.js (Route Handlers +
> Prisma + Neon/Postgres serverless) — não um serviço separado, sem infra nova pra administrar.
> Os dados reais (`territories.json`/`queue.json`) continuam estáticos; o banco entra só para as
> interações que precisam de estado mutável (lembretes, sessão de usuário).

---

## Roteiro da demo (referência rápida para P3 e ensaio geral)

1. **Mapa:** "Aqui estão os territórios pressionados."
2. **Clique:** "Essa região possui alta demanda e pouca oferta."
3. **Vacancy:** "Enquanto isso, essa vaga está aguardando confirmação — e o sistema já sabe quem é o próximo da fila antes mesmo dela expirar."
4. **Simulador:** "Se adicionarmos 50 vagas aqui, o indicador cai de 1,71 para 1,60."
5. **Conclusão:** "O CRE Intelligence ajuda a SME a decidir onde agir e a reduzir o tempo em que vagas ficam paradas no processo de convocação."
