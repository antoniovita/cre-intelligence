# CRE Intelligence

Inteligência de vagas para a educação infantil do Rio de Janeiro — mapeia a **pressão de demanda por território** (`pressure = demand / supply`), gerencia a fila de vagas e permite que famílias consultem e respondam a uma vaga oferecida.

Projeto do **Claude Impact Lab 2026**, sobre dados reais (anonimizados) de inscrição em creche da SME-Rio.

> ⚠️ Os dados passaram por anonimização (aleatorização, generalização, supressão). Os indicadores gerados **não representam a realidade** — servem para ilustrar a dinâmica do processo.

---

## Arquitetura

Não há backend em runtime. Um pipeline Python roda **offline**, uma vez, e gera JSONs estáticos; o Next.js apenas lê esses arquivos.

```
data/raw/  ──►  pipeline/  ──►  frontend/public/data/*.json  ──►  frontend/ (Next.js)
 (fontes)      (Python, offline)      (contrato de dados)            (só lê)
```

```
hackaton-claude/
├── README.md
├── TASKS.md                  # kanban e decisões do hackathon (registro histórico)
├── data/
│   ├── README.md             # proveniência das fontes + cadeia de joins
│   └── raw/
│       ├── inscricoes/       # inscrições, respostas socioeconômicas, régua de pontuação
│       ├── vagas/            # localização das unidades + vagas parceiras/públicas 2025
│       └── territorios/      # shapefile oficial de microáreas da SME (233 polígonos)
├── pipeline/                 # Python — roda offline, gera os JSONs
│   ├── PIPELINE.md           # como pressure e proxima_da_fila foram calculados
│   ├── build.py              # entrypoint
│   ├── loaders.py            # leitura/normalização dos arquivos brutos
│   ├── territories.py        # build_territories()
│   └── queue.py              # priority_score() + build_queue()
└── frontend/                 # Next.js 16 + React 19 + Tailwind 4
    ├── app/                  # rotas (App Router)
    ├── components/           # UI por domínio (territory-ops, vacancy, family, nav, ui)
    ├── lib/                  # hooks e lógica pura (pressure, geo, paginação)
    └── public/data/          # JSONs gerados pelo pipeline
```

---

## Como rodar

### 1. Pipeline (gera os dados)

Só é necessário quando as fontes em `data/raw/` mudarem — os JSONs gerados já estão versionados.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r pipeline/requirements.txt
python -m pipeline.build          # rodar da raiz do repo
```

Escreve `territories.json` e `queue.json` em `frontend/public/data/`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

Outros comandos: `npm run build`, `npm run start`, `npm run lint`.

---

## Rotas

| Rota | Público | Descrição |
|---|---|---|
| `/` | — | Landing com os dois pontos de entrada |
| `/login` | ambos | Login unificado, alterna entre gestor e família (`?tipo=familia`) |
| `/admin` | gestor | Mapa de pressão por território + simulador de cenários |
| `/admin/fila` | gestor | Fila de vagas aguardando confirmação |
| `/consulta` | família | Consultar vaga oferecida e inscrever criança |

---

## Contrato de dados

Os dois JSONs em `frontend/public/data/` são o contrato entre pipeline e frontend. Os tipos vivem em [`frontend/lib/types.ts`](frontend/lib/types.ts).

**`territories.json`** — uma entrada por microárea com demanda, oferta e `pressure`.

**`queue.json`** — uma entrada por vaga em aberto, com a criança `proxima_da_fila` e seu `prioridade_score`.

Como cada campo foi calculado (e o que é real vs. sintético) está documentado em [`pipeline/PIPELINE.md`](pipeline/PIPELINE.md). Em resumo: `pressure` e `prioridade_score` vêm de dados e régua oficiais; a existência de "uma vaga aberta agora" é sintetizada, pois não existe como campo no dataset bruto.

---

## Autenticação

**A autenticação é mockada** — não há backend que valide credenciais. O login existe para dar estrutura ao fluxo:

- `/consulta` exige uma sessão de família (`RequireFamilySession`), guardada em `sessionStorage`.
- Confirmar/recusar uma vaga exige estar logado, em vez de depender só de conhecer o código da inscrição.

Os pontos onde a validação real precisa entrar estão marcados com `TODO(backend)` em [`frontend/lib/useFamilySession.ts`](frontend/lib/useFamilySession.ts) e [`frontend/app/login/page.tsx`](frontend/app/login/page.tsx). Hoje o mock aceita qualquer senha não vazia, e não há vínculo responsável↔criança nos dados para verificar posse de uma inscrição.

---

## Deploy

O frontend vai para a Vercel. Como o Next.js está em `frontend/` e não na raiz, o projeto na Vercel precisa de **Root Directory = `frontend`** (Settings → General) — sem isso, todas as rotas retornam 404.
