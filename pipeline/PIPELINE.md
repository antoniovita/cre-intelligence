# Notas do pipeline (preencher durante o hackathon)

> Pessoa 1: documente aqui, em poucas linhas, as decisões reais tomadas — vira munição pro pitch ("como calculamos pressure", "como resolvemos proxima_da_fila sem inventar critério").

## Como `pressure` foi calculado

- **`demand`**: contagem de opções de creche (Query A) do **processo 2025** com `situacao` em `{Confirmado, Lista de espera, Selecionado da lista, Ativo, Selecionado}` — ou seja, tudo que segue no funil, excluindo os 3 tipos de cancelamento (que somam ~55% das linhas). Filtramos por 2025 porque o dataset cobre 2021–2025 e a mesma criança pode aparecer em vários anos — somar tudo infla demand (pressure máximo ia a 96x) e mistura processos diferentes.
- **`supply`**: soma de `Meta Total` (capacidade declarada) das unidades **parceiras** (`Parceiras2025.xlsx`), por território. **Unidades públicas ficaram de fora do supply** — a planilha pública (`totaalunoscreche2025.xlsx`) só tem `Aluno`/`Turma`, sem capacidade declarada, e não achamos uma forma direta de estimar capacidade sem inventar um número. Isso significa que o `supply` real da rede é maior do que o que aparece aqui — declarar isso na fala do pitch.
- Território de agregação: microárea oficial (`cod_territ` do shapefile / `microárea` das unidades — mesmo código, ex. `"1.1"`)
- **Join usado**: Query A (`unidade`) → Query D (`esc_codigo`) → `Unidades_Unificadas_com_Localizacao` (`DESIGNACAO`, `microárea`) → shapefile (`cod_territ`). Todos os IDs de unidade são numéricos e batem direto (convertidos pra `int`), sem precisar normalizar string.
- Territórios sem `demand` ou sem `supply` (rede parceira) no ano filtrado são **excluídos** do `territories.json` — não fazem sentido pra mostrar `pressure`. Resultado: **97 de 233 microáreas** entraram no JSON final.
- Resultado real: `pressure` variando de **0.31 a 11.0**, mediana ≈ **1.12**.

## Como `proxima_da_fila` foi calculado

- Régua usada: Query C (`perg_pontuacao`), por ano/processo da própria inscrição
- Critério de desempate: _(preencher, se usado)_
- Elegibilidade: _(preencher — o que faz uma criança "elegível" pra próxima vaga)_

## Decisões/simplificações assumidas

- `demand` usa só o processo 2025 (não soma 2021–2025) para não misturar anos/crianças repetidas e ficar comparável com o `supply`, que também é só de 2025.
- `supply` considera só rede parceira — pública ficou de fora por falta de capacidade declarada na fonte pública.
- Territórios sem demand ou sem supply (rede parceira) no ano filtrado saem do JSON final (97 de 233 microáreas).
- `proxima_da_fila`/`queue.json`: _(preencher quando implementado)_ — vagas em aberto e prazos são sintéticos, pois não existem como campo no dataset bruto.

## Números reais para a fala do pitch

- 97 microáreas entraram na análise; a de maior pressão (`7.11`, CRE 7) tem pressure **11.0** (836 inscrições ativas para 76 vagas parceiras), contra uma mediana de **1.12**.
- A régua de prioridade mudou de peso entre 2023 e 2024 (ex.: `perg_id=2`, deficiência, caiu de 100 para 25 pontos) — usamos sempre a régua do ano certo, nunca comparamos pontuação bruta entre anos.
