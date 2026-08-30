"""
Fila de convocação: status por vaga em aberto e proxima_da_fila pré-computada
usando a régua oficial de pontuação (Query C).

TODO (Pessoa 1): implementar durante o hackathon.
"""

from . import loaders


def priority_score(ano: int, respostas: "pd.DataFrame", regua: "pd.DataFrame") -> float:
    """
    Soma perg_pontuacao (Query C) das perguntas respondidas com
    resposta='Sim' e confirmado='Sim' (Query B), para uma inscrição.

    Importante: usar sempre a régua (Query C) do mesmo `ano`/processo da
    inscrição — os pesos mudaram entre 2023 e 2024 (ex.: perg_id=2 caiu de
    100 para 25 pontos). Nunca comparar pontuação bruta entre anos.
    """
    raise NotImplementedError("Pessoa 1: implementar durante o hackathon")


def build_queue() -> list[dict]:
    """
    Gera a lista de vagas no schema de queue.json:
    [{ vaga_id, unidade, crianca_atual, status, prazo, proxima_da_fila }]

    Passos (ver TASKS.md > PESSOA 1 para o detalhamento):
    1. Selecionar inscrições em situacao == "Lista de espera" (Query A)
    2. Calcular priority_score de cada uma (Query B + Query C do mesmo ano)
    3. Para cada vaga em aberto, ordenar os candidatos por priority_score e
       pegar o primeiro como proxima_da_fila (elegibilidade + score)
    4. status/prazo: dado sintético plausível (não existe no dataset bruto)
       — documentar a decisão em PIPELINE.md
    """
    raise NotImplementedError("Pessoa 1: implementar durante o hackathon")
