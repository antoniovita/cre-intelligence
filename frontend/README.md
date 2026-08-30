# Frontend — CRE Intelligence

Next.js 16 (App Router) + React 19 + Tailwind 4. Lê apenas JSONs estáticos de `public/data/`, gerados offline pelo pipeline Python — não há chamadas a backend.

Visão geral do projeto, arquitetura e contrato de dados: [`../README.md`](../README.md).

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |

## Estrutura

```
app/                    # rotas (App Router)
├── page.tsx            # landing
├── login/              # login unificado (gestor | família)
├── admin/              # área da gestão: mapa de pressão + fila
└── consulta/           # área da família: consultar vaga + inscrever

components/
├── territory-ops/      # tela operacional de pressão por território (/admin)
├── vacancy/            # fila de vagas e cards de vaga
├── family/             # consulta, inscrição e mapa da família
├── nav/                # sidebars, brand, container de página
└── ui/                 # componentes genéricos (StatTile, PaginationControls)

lib/                    # hooks e lógica pura (cálculo de pressure, geo, paginação)
public/data/            # territories.json e queue.json — gerados pelo pipeline
```

## Dados

Os JSONs em `public/data/` são o contrato com o pipeline; os tipos estão em [`lib/types.ts`](lib/types.ts). Para regenerá-los, rode `python -m pipeline.build` na raiz do repo.

## Autenticação

Mockada — não há backend validando credenciais. `/consulta` exige sessão de família (`RequireFamilySession`, via `sessionStorage`); confirmar/recusar vaga exige estar logado. Os pontos de integração real estão marcados com `TODO(backend)`.
