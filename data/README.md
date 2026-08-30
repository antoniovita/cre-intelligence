# Dados — CRE Intelligence

Cópia de trabalho, dentro deste repo, apenas dos arquivos que o pipeline (`pipeline/`) realmente consome. Organizados por domínio, não pela estrutura de pastas do dataset original.

## Origem

Extraído de **Claude Impact Lab 2026 | Dataset Inscrição Creche do Rio** (repositório separado, não é submodule deste projeto), commit `057b975` (2026-08-29). Dicionário de dados completo, materiais de apoio e o restante das bases (histórico de vagas 2021–2024, nascidos vivos, docx de parametrização) ficam só no repo original — não foram copiados aqui por não serem usados no MVP do hackathon. Se precisar deles, consulte o repo original.

**Aviso da organização, válido também aqui**: todos os dados passaram por anonimização (aleatorização, generalização, supressão). Indicadores gerados a partir deles **não representam a realidade** — servem só para ilustrar a dinâmica do processo.

## Estrutura

```
data/raw/
├── inscricoes/     # inscrições, respostas socioeconômicas, régua de pontuação, endereços de unidades
├── vagas/          # localização das unidades (lat/lon) + vagas ofertadas (parceiras e públicas), 2025
└── territorios/     # shapefile oficial de microáreas da SME (233 polígonos)
```

### `raw/inscricoes/`

| Arquivo | Grão | Uso no pipeline |
|---|---|---|
| `01_QueryA_InscricoesPorAno.csv.gz` | uma opção de creche escolhida | base de `demand` (inscrições/opções por unidade → por território) |
| `02_QueryB_RespostasSocioEconomicas.csv.gz` | uma pergunta respondida | insumo do `prioridade_score` de `proxima_da_fila` |
| `03_QueryC_PerguntasComDescricao.csv` | uma pergunta por processo/ano | **régua oficial de pontuação** (`perg_pontuacao`) — não inventar critério novo, usar este |
| `04_UnidadesEscolaresComEndereco.csv` | uma unidade escolar | ponte entre `unidade` (Query A) e `DESIGNACAO` (vagas/localização) via `esc_codigo` |
| `README_dicionario_dados.md` | — | dicionário de dados completo do repo original, mantido como referência de schema/armadilhas de leitura (encoding, separador, valores de `situacao`) |

Separador `;`, encoding UTF-8 com BOM. `04_...csv` não tem header — ler com `header=None` (ver o próprio README para os nomes de coluna).

### `raw/vagas/`

| Arquivo | Descrição | Uso no pipeline |
|---|---|---|
| `Unidades_Unificadas_com_Localizacao.xlsx` | 1.941 unidades com `LATITUDE`/`LONGITUDE` prontas e coluna `microárea` | fonte de geolocalização — filtrar 1 unidade com lat/lon = 0.0 (`DESIGNACAO 121002`) |
| `Parceiras2025.xlsx` | vagas de unidades conveniadas, maio/2025 (aba `MAIO -2025`) | fonte principal de `supply` — coluna `Meta Total` |
| `totaalunoscreche2025.xlsx` | matrícula de unidades públicas, 2025 (aba `Consolidado`) | só matrícula/turmas, sem capacidade declarada — ver nota no pipeline sobre supply público |
| `LEIAME_OFERECIMENTOSPARCEIRASEPUBLICAS.txt` | leiame original explicando as duas fontes (parceiras vs. públicas) | referência |

Ambas as planilhas de vagas têm cabeçalho em 2 linhas mescladas — ler com atenção (ver `pipeline/loaders.py`).

### `raw/territorios/`

| Arquivo | Descrição |
|---|---|
| `Microareas_SME_revisao.shp` (+ `.dbf`, `.prj`, `.shx`, `.sbn`, `.sbx`, `.cpg`, `.shp.xml`) | 233 polígonos de microárea oficial da SME. Campo `cod_territ` bate com a coluna `microárea` das unidades. CRS: SIRGAS 2000 / UTM 23S (EPSG:31983) — reprojetar para WGS84 (EPSG:4326) com `pyproj` antes de usar como lat/lon |

## Cadeia de join entre os arquivos

```
Query A (unidade, "0101601")
   ↓ 872/872 match
Query D (esc_codigo, "01001")
   ↓ 99.5% match (1932/1941)
Unidades_Unificadas_com_Localizacao (DESIGNACAO, 101501)
   ↓ 97% match (336/347)          ↓ via coluna "microárea"
Parceiras2025 (CÓDIGO SGA)        Microareas_SME_revisao.shp (cod_territ)
```

Ver detalhamento completo, red flags e decisões de tratamento no [`TASKS.md`](../TASKS.md) (seção "⚡ Achado importante") e em `pipeline/PIPELINE.md` (a preencher pela Pessoa 1 durante o hackathon).
