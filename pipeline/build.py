"""
Entrypoint único do pipeline: lê data/raw/, escreve os JSONs estáticos que
o frontend consome. Rodar da raiz do repo:

    python -m pipeline.build

Não depende de nada do frontend/ nem sobe em runtime durante a demo — só o
output (territories.json, queue.json) importa.
"""

import json
from pathlib import Path

from . import queue, territories

OUT_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public" / "data"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    territories_data = territories.build_territories()
    (OUT_DIR / "territories.json").write_text(
        json.dumps(territories_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"territories.json: {len(territories_data)} territórios")

    queue_data = queue.build_queue()
    (OUT_DIR / "queue.json").write_text(
        json.dumps(queue_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"queue.json: {len(queue_data)} vagas")


if __name__ == "__main__":
    main()
