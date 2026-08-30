"""
Fila de convocação: status por vaga em aberto e proxima_da_fila pré-computada
usando a régua oficial de pontuação (Query C).
"""

import pandas as pd

from . import loaders

# Mesmo ano usado em territories.py — mantém demand/queue no mesmo processo.
QUEUE_ANO = 2025

# Quantas vagas sintéticas gerar pro Módulo 2 (Vacancy Flow). O dataset bruto
# não tem um conceito de "vaga em aberto" com prazo — é sintetizado a partir
# das unidades com maior fila de espera. Ver decisão em PIPELINE.md.
N_VAGAS = 20


def _priority_scores(ano: int) -> pd.DataFrame:
    """
    Soma perg_pontuacao (Query C) das perguntas respondidas com resposta='Sim'
    e confirmado='Sim' (Query B), por inscrição, usando SEMPRE a régua do
    mesmo ano/processo (os pesos mudaram entre 2023 e 2024).

    Retorna DataFrame com colunas: prm_id, plm_id, ipl_id, prioridade_score.
    """
    query_b = loaders.load_query_b()
    query_c = loaders.load_query_c()

    respostas = query_b[
        (query_b["ano"] == ano)
        & (query_b["resposta"] == "Sim")
        & (query_b["confirmado"] == "Sim")
    ]
    regua = query_c[query_c["ano"] == ano][["ich_perg_id", "perg_pontuacao"]]

    pontuadas = respostas.merge(regua, on="ich_perg_id", how="inner")

    return (
        pontuadas.groupby(["prm_id", "plm_id", "ipl_id"])["perg_pontuacao"]
        .sum()
        .rename("prioridade_score")
        .reset_index()
    )


def build_queue() -> list[dict]:
    """
    Gera a lista de vagas no schema de queue.json:
    [{ vaga_id, unidade, crianca_atual, status, prazo, proxima_da_fila }]

    "Vaga em aberto" não existe como campo no dataset bruto — é sintetizada
    a partir das N_VAGAS unidades com maior lista de espera em QUEUE_ANO,
    uma vaga por unidade. status/prazo são sintéticos (documentado em
    PIPELINE.md); proxima_da_fila é 100% real, calculada pela régua oficial.
    """
    import random
    from datetime import datetime, timedelta, timezone

    query_a = loaders.load_query_a()
    scores = _priority_scores(QUEUE_ANO)

    fila = query_a[
        (query_a["ano"] == QUEUE_ANO) & (query_a["situacao"] == "Lista de espera")
    ].merge(scores, on=["prm_id", "plm_id", "ipl_id"], how="left")
    fila["prioridade_score"] = fila["prioridade_score"].fillna(0)

    # Uma criança pode ter mais de uma opção (linha) na fila; para eleger a
    # "próxima da fila" de uma unidade, cada criança conta só pela sua opção
    # naquela unidade específica — sem deduplicar entre unidades diferentes.
    fila = fila.sort_values("prioridade_score", ascending=False)

    unidades_com_fila = fila["unidade"].value_counts().head(N_VAGAS).index

    rng = random.Random(42)  # seed fixa: mesma saída a cada rodada do pipeline
    statuses = ["aguardando_confirmacao", "confirmada", "vencendo"]
    now = datetime(2026, 8, 30, tzinfo=timezone.utc)

    # Uma criança pode estar na lista de espera de várias unidades ao mesmo
    # tempo (escolheu múltiplas opções). Pra não mostrar a MESMA criança como
    # "próxima da fila" em duas vagas simultâneas na demo — o que pareceria
    # bug, mesmo sendo dado real — cada criança só é elegível como "próxima"
    # uma vez: se já foi escolhida em outra vaga, passa pro próximo candidato
    # da fila daquela unidade (mesma régua de prioridade, sem inventar score).
    ja_escolhidas: set[str] = set()

    queue_items = []
    for i, unidade in enumerate(unidades_com_fila):
        candidatos = fila[fila["unidade"] == unidade]
        disponiveis = candidatos[~candidatos["aluno_anon"].isin(ja_escolhidas)]
        proxima = disponiveis.iloc[0] if len(disponiveis) else candidatos.iloc[0]
        ja_escolhidas.add(proxima["aluno_anon"])

        status = statuses[i % len(statuses)]
        prazo = now + timedelta(days=rng.randint(1, 10))

        queue_items.append(
            {
                "vaga_id": f"V{int(unidade)}-{i:03d}",
                "unidade": str(proxima["nome_unidade"]).strip(),
                "crianca_atual": f"aluno_{rng.randint(1000000, 9999999)}",
                "status": status,
                "prazo": prazo.isoformat(),
                "proxima_da_fila": {
                    "crianca_id": str(proxima["aluno_anon"]),
                    "elegibilidade": "ok",
                    "prioridade_score": float(proxima["prioridade_score"]),
                    "resposta_socioeconomica_resumo": {
                        "bairro": proxima["bairro"] if pd.notna(proxima["bairro"]) else None,
                    },
                },
            }
        )

    return queue_items
