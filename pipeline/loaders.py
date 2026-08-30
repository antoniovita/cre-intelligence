"""
Leitura e normalização dos arquivos brutos em data/raw/.

Cada função devolve um DataFrame já limpo (encoding, header, nulos tratados),
sem nenhuma lógica de negócio — só parsing. Fórmulas (pressure, prioridade)
ficam em territories.py e queue.py.
"""

from pathlib import Path

import pandas as pd

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"


def load_query_a() -> pd.DataFrame:
    """Uma linha por opção de creche escolhida. Chave: (prm_id, plm_id, ipl_id)."""
    return pd.read_csv(
        RAW / "inscricoes" / "01_QueryA_InscricoesPorAno.csv.gz",
        sep=";",
        encoding="utf-8-sig",
    )


def load_query_b() -> pd.DataFrame:
    """Uma linha por pergunta respondida. Chave: (prm_id, plm_id, ipl_id, ich_perg_id)."""
    # Arquivo grande (~436MB descompactado) — ler em chunks se for agregar,
    # ver README_dicionario_dados.md para o padrão de leitura em blocos.
    return pd.read_csv(
        RAW / "inscricoes" / "02_QueryB_RespostasSocioEconomicas.csv.gz",
        sep=";",
        encoding="utf-8-sig",
    )


def load_query_c() -> pd.DataFrame:
    """Régua oficial de pontuação por pergunta/ano. Chave: ich_perg_id."""
    return pd.read_csv(
        RAW / "inscricoes" / "03_QueryC_PerguntasComDescricao.csv",
        sep=";",
        encoding="utf-8-sig",
    )


def load_query_d() -> pd.DataFrame:
    """Catálogo de unidades escolares. Sem header no arquivo original."""
    df = pd.read_csv(
        RAW / "inscricoes" / "04_UnidadesEscolaresComEndereco.csv",
        sep=";",
        header=None,
        encoding="utf-8-sig",
        na_values=["NULL"],
        names=[
            "seq", "esc_codigo", "nome", "tipo", "logradouro",
            "numero", "complemento", "bairro", "cep",
        ],
    )
    # ~103 esc_codigo aparecem duplicados (mesma unidade, tipos históricos
    # diferentes) — dedupe antes de mergear com qualquer outra base.
    return df.dropna(subset=["esc_codigo"]).drop_duplicates(subset=["esc_codigo"])


def load_unidades_localizacao() -> pd.DataFrame:
    """1.941 unidades com LATITUDE/LONGITUDE prontas e código de microárea."""
    df = pd.read_excel(
        RAW / "vagas" / "Unidades_Unificadas_com_Localizacao.xlsx",
        sheet_name="Unidades_Unificadas",
    )
    # DESIGNACAO 121002 tem lat/lon = 0.0 — erro de geocodificação, não um
    # ponto real. Filtrar antes de qualquer uso geográfico.
    return df[(df["LATITUDE"] != 0) | (df["LONGITUDE"] != 0)]


def load_vagas_parceiras() -> pd.DataFrame:
    """Vagas ofertadas por unidades conveniadas, maio/2025. Supply = 'Meta Total'."""
    df = pd.read_excel(
        RAW / "vagas" / "Parceiras2025.xlsx",
        sheet_name="MAIO -2025",
        header=1,
    )
    # A primeira linha de dados é um rótulo residual do header mesclado.
    return df.iloc[1:].reset_index(drop=True)


def load_vagas_publicas() -> pd.DataFrame:
    """Matrícula/turmas de unidades públicas, 2025. Sem capacidade declarada."""
    df = pd.read_excel(
        RAW / "vagas" / "totaalunoscreche2025.xlsx",
        sheet_name="Consolidado",
        header=[0, 1],
    )
    # Última linha é o TOTAL agregado da rede inteira — não é uma unidade.
    return df.iloc[:-1].reset_index(drop=True)


def load_microareas():
    """
    Shapefile oficial de microáreas da SME (233 polígonos).
    Retorna a lista de shapes (pyshp) e o DataFrame de atributos (cod_territ, cre).
    Requer reprojeção UTM 23S (EPSG:31983) -> WGS84 (EPSG:4326), ver territories.py.
    """
    import shapefile  # pyshp

    sf = shapefile.Reader(str(RAW / "territorios" / "Microareas_SME_revisao.shp"))
    fields = [f[0] for f in sf.fields[1:]]  # pula o DeletionFlag
    attrs = pd.DataFrame(sf.records(), columns=fields)
    return sf.shapes(), attrs
