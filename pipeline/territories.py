"""
Agregação territorial: demand, supply e pressure por microárea.
"""

from pyproj import Transformer

from . import loaders

_to_wgs84 = Transformer.from_crs("EPSG:31983", "EPSG:4326", always_xy=True)

# situacao que conta como demanda real (exclui os 3 tipos de cancelamento,
# que juntos são a maioria das linhas da Query A — ver data/README.md).
# "Não representa quem está matriculado", representa quem segue no funil:
# confirmado, na fila, ou já selecionado.
DEMAND_SITUACOES = {
    "Confirmado",
    "Lista de espera",
    "Selecionado da lista",
    "Ativo",
    "Selecionado",
}

# Ano do processo usado para demand. O dataset cobre 2021-2025 e a mesma
# criança pode aparecer em vários anos — somar tudo infla o número e mistura
# processos diferentes. Supply (Parceiras2025/totaalunoscreche2025) também é
# só de 2025, então usar o mesmo ano dos dois lados mantém pressure comparável.
DEMAND_ANO = 2025


def polygon_centroid(shape) -> tuple[float, float]:
    """
    Centróide aproximado (média dos vértices do primeiro anel) reprojetado
    para lat/lon. Suficiente para posicionar um ponto no mapa; não é o
    centróide geométrico exato para polígonos com múltiplas partes/buracos.
    """
    end = shape.parts[1] if len(shape.parts) > 1 else len(shape.points)
    ring = shape.points[:end]
    x = sum(p[0] for p in ring) / len(ring)
    y = sum(p[1] for p in ring) / len(ring)
    lon, lat = _to_wgs84.transform(x, y)
    return lat, lon


def _unidade_para_microarea():
    """
    Monta o mapa unidade -> cod_territ (microárea), atravessando:
    Query D (esc_codigo) -> Unidades_Unificadas (DESIGNACAO, microárea)

    Devolve um DataFrame com colunas: esc_codigo (== unidade da Query A),
    cod_territ (string, ex. "1.1").
    """
    query_d = loaders.load_query_d()
    localizacao = loaders.load_unidades_localizacao()

    query_d = query_d.assign(esc_codigo=query_d["esc_codigo"].astype(int))
    localizacao = localizacao.assign(
        DESIGNACAO=localizacao["DESIGNACAO"].astype(int)
    )

    merged = query_d.merge(
        localizacao[["DESIGNACAO", "microárea"]],
        left_on="esc_codigo",
        right_on="DESIGNACAO",
        how="inner",
    ).dropna(subset=["microárea"])

    merged["cod_territ"] = merged["microárea"].astype(str)
    return merged[["esc_codigo", "cod_territ"]].drop_duplicates()


def _demand_por_territorio():
    """
    Conta opções de creche (Query A) do processo DEMAND_ANO com situacao
    relevante, por cod_territ.
    """
    query_a = loaders.load_query_a()
    unidade_territorio = _unidade_para_microarea()

    demanda = query_a[
        (query_a["ano"] == DEMAND_ANO) & (query_a["situacao"].isin(DEMAND_SITUACOES))
    ]
    demanda = demanda.merge(
        unidade_territorio,
        left_on="unidade",
        right_on="esc_codigo",
        how="inner",
    )
    return demanda.groupby("cod_territ").size().rename("demand")


def _supply_por_territorio():
    """
    Soma 'Meta Total' (Parceiras2025) por cod_territ, via CÓDIGO SGA == DESIGNACAO.

    Simplificação assumida no MVP: supply considera só a rede parceira, que
    já declara capacidade ("Meta Total"). A rede pública (totaalunoscreche)
    só expõe matrícula/turmas, sem capacidade declarada — decisão documentada
    em pipeline/PIPELINE.md.
    """
    vagas = loaders.load_vagas_parceiras()
    localizacao = loaders.load_unidades_localizacao()

    vagas = vagas.assign(**{"CÓDIGO SGA": vagas["CÓDIGO SGA"].astype(int)})
    localizacao = localizacao.assign(
        DESIGNACAO=localizacao["DESIGNACAO"].astype(int)
    )

    merged = vagas.merge(
        localizacao[["DESIGNACAO", "microárea"]],
        left_on="CÓDIGO SGA",
        right_on="DESIGNACAO",
        how="inner",
    ).dropna(subset=["microárea"])
    merged["cod_territ"] = merged["microárea"].astype(str)

    return merged.groupby("cod_territ")["Meta Total"].sum().rename("supply")


def build_territories() -> list[dict]:
    """
    Gera a lista de territórios no schema de territories.json:
    [{ id, name, demand, supply, pressure, latitude, longitude }]

    Território = microárea oficial da SME (cod_territ do shapefile). Um
    cod_territ pode ter mais de um polígono (ex. "7.28" — área descontínua);
    nesse caso usamos o de maior área pra representar o ponto no mapa, e o
    território aparece uma única vez no JSON.
    """
    shapes, attrs = loaders.load_microareas()

    demand = _demand_por_territorio()
    supply = _supply_por_territorio()

    # Pra cada cod_territ, guarda o shape de maior área (attrs.st_area_sh).
    maior_shape_por_territorio: dict[str, tuple[float, object, dict]] = {}
    for shape, (_, attr) in zip(shapes, attrs.iterrows()):
        cod_territ = attr["cod_territ"]
        area = attr["st_area_sh"]
        atual = maior_shape_por_territorio.get(cod_territ)
        if atual is None or area > atual[0]:
            maior_shape_por_territorio[cod_territ] = (area, shape, attr)

    territories = []
    for cod_territ, (_, shape, attr) in maior_shape_por_territorio.items():
        d = int(demand.get(cod_territ, 0))
        s = int(supply.get(cod_territ, 0))

        if d == 0 or s == 0:
            continue

        lat, lon = polygon_centroid(shape)
        territories.append(
            {
                "id": cod_territ,
                "name": f"Microárea {cod_territ} (CRE {int(attr['cre'])})",
                "demand": d,
                "supply": s,
                "pressure": round(d / s, 2),
                "latitude": lat,
                "longitude": lon,
            }
        )

    return territories
