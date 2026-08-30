# Notas do pipeline (preencher durante o hackathon)

> Pessoa 1: documente aqui, em poucas linhas, as decisões reais tomadas — vira munição pro pitch ("como calculamos pressure", "como resolvemos proxima_da_fila sem inventar critério").

## Como `pressure` foi calculado

- Fonte de `demand`: _(preencher)_
- Fonte de `supply`: _(preencher — inclui como o supply de unidades públicas foi tratado, já que a planilha pública não tem capacidade declarada)_
- Território de agregação: microárea oficial (`cod_territ` do shapefile / `microárea` das unidades)

## Como `proxima_da_fila` foi calculado

- Régua usada: Query C (`perg_pontuacao`), por ano/processo da própria inscrição
- Critério de desempate: _(preencher, se usado)_
- Elegibilidade: _(preencher — o que faz uma criança "elegível" pra próxima vaga)_

## Decisões/simplificações assumidas

- _(ex.: "vagas em aberto e prazos são sintéticos, pois não existem como campo no dataset bruto")_
- _(ex.: "supply considera só rede parceira, pública ficou de fora por falta de capacidade declarada")_

## Números reais para a fala do pitch

- _(ex.: "X territórios têm pressure > 2")_
- _(ex.: "a régua de prioridade mudou de peso entre 2023 e 2024 — usamos sempre a do ano certo")_
