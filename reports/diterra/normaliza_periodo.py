# -*- coding: utf-8 -*-
"""Normaliza as duas janelas do Meta para o relatorio de periodo.

Guarda o `id` de cada campanha: a conta renomeia campanhas de tempos em tempos
(em 07/09 todas mudaram de nome), e comparar por nome faria cada uma aparecer
como campanha nova. O id e o unico identificador estavel entre as janelas.

Reaproveita a regra de lead do normaliza_meta — o `results` do Meta devolve o
indicador do objetivo de cada campanha, e so alguns deles sao lead de verdade.

    python3 normaliza_periodo.py
"""
import json
import os

from normaliza_meta import LEAD, inteiro, leads, moeda

AQUI = os.path.dirname(os.path.abspath(__file__))


def main():
    saida, ignorados = {}, {}
    for j in ("atual", "anterior"):
        bruto = json.load(open(os.path.join(AQUI, "raw_periodo", f"{j}.json"), encoding="utf-8"))
        ents = bruto.get("ad_entities", bruto)
        if isinstance(ents, str):
            ents = json.loads(ents)
        linhas = []
        for x in ents:
            custo = moeda(x.get("amount_spent"))
            n, ind, contou = leads(x.get("results"))
            if custo <= 0 and n <= 0:
                continue
            if custo > 0 and ind not in LEAD:
                ignorados.setdefault(ind or "sem indicador", set()).add(x.get("name", "?"))
            linhas.append({"id": str(x.get("id", "")),
                           "campanha": x.get("name", "?"), "custo": round(custo, 2), "leads": n,
                           "impressoes": inteiro(x.get("impressions")),
                           "cliques": inteiro(x.get("clicks")),
                           "indicador": ind, "lead_contado": contou})
        linhas.sort(key=lambda v: -v["custo"])
        saida[j] = linhas
        c = sum(v["custo"] for v in linhas)
        n = sum(v["leads"] for v in linhas)
        print(f"  {j:9s} {len(linhas):>2} campanhas | R$ {c:>9,.2f} | {n:>5.0f} leads | "
              f"CPL R$ {c / n if n else 0:>7,.2f}")

    if ignorados:
        print("\n  Gasto cujo `results` NAO conta como lead:")
        for ind, nomes in sorted(ignorados.items()):
            print(f"    [{ind}] {', '.join(sorted(nomes))}")

    destino = os.path.join(AQUI, "periodo_meta.json")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print("\ngravado:", destino)


if __name__ == "__main__":
    main()
