"""
Agregação territorial: demand, supply e pressure por microárea.

TODO (Pessoa 1): implementar durante o hackathon.
"""

from pyproj import Transformer

from . import loaders

_to_wgs84 = Transformer.from_crs("EPSG:31983", "EPSG:4326", always_xy=True)


def polygon_centroid(shape) -> tuple[float, float]:
    """
    Centróide aproximado (média dos vértices do primeiro anel) reprojetado
    para lat/lon. Suficiente para posicionar um ponto no mapa; não é o
    centróide geométrico exato para polígonos com múltiplas partes/buracos.
    """
    end = shape.parts[1] if len(shape.parts) > 1 else len(shape.points)
    ring = shape.points[: end]
    x = sum(p[0] for p in ring) / len(ring)
    y = sum(p[1] for p in ring) / len(ring)
    lon, lat = _to_wgs84.transform(x, y)
    return lat, lon


def build_territories() -> list[dict]:
    """
    Gera a lista de territórios no schema de territories.json:
    [{ id, name, demand, supply, pressure, latitude, longitude }]

    Passos (ver TASKS.md > PESSOA 1 para o detalhamento):
    1. Carregar shapes + atributos das microáreas (loaders.load_microareas)
    2. Carregar unidades com localização (loaders.load_unidades_localizacao)
       e juntar com Query D (esc_codigo) para achar a "microárea" de cada
       unidade que aparece na Query A
    3. Agregar demand = contagem de opções (Query A) por microárea
    4. Agregar supply = soma de "Meta Total" (Parceiras2025) por microárea
       (+ decisão de time sobre supply de unidades públicas)
    5. pressure = demand / supply
    6. lat/lon do território = polygon_centroid(shape) da microárea
    """
    raise NotImplementedError("Pessoa 1: implementar durante o hackathon")
