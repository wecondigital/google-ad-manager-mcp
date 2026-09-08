# -*- coding: utf-8 -*-
"""Google Ads em duas janelas: o periodo pedido e o imediatamente anterior,
de mesma duracao. Alimenta o gera_periodo.js.

    python3 coleta_periodo.py --de 2026-08-31 --ate 2026-09-06

Grava periodo_google.json. O periodo anterior e calculado sozinho: mesmo numero
de dias, terminando na vespera do inicio — comparar 7 dias com 7 dias.
"""
import argparse
import glob
import json
import os
import sys
from datetime import date, timedelta

CUSTOMER_ID = "6542140100"
AQUI = os.path.dirname(os.path.abspath(__file__))


def _carrega_lib():
    achados = glob.glob(os.path.expanduser("~/.claude/skills/**/google-ads-ratos/SKILL.md"),
                        recursive=True)
    if not achados:
        sys.exit("skill google-ads-ratos nao encontrada em ~/.claude/skills.")
    sys.path.insert(0, os.path.join(os.path.dirname(achados[0]), "scripts"))
    from lib import run_query_raw  # noqa: E402
    return run_query_raw


def coleta(run_query_raw, de, ate):
    linhas = run_query_raw(CUSTOMER_ID, f"""
        SELECT campaign.name, campaign.advertising_channel_type,
               metrics.cost_micros, metrics.clicks, metrics.impressions,
               metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '{de}' AND '{ate}'
    """)
    acc = {}
    for r in linhas:
        nome = r["campaign"]["name"]
        m = r["metrics"]
        a = acc.setdefault(nome, {"campanha": nome, "custo": 0.0, "cliques": 0,
                                  "impressoes": 0, "leads": 0.0})
        a["custo"] += float(m.get("cost_micros", 0)) / 1e6
        a["cliques"] += int(m.get("clicks", 0))
        a["impressoes"] += int(m.get("impressions", 0))
        a["leads"] += float(m.get("conversions", 0))
    for a in acc.values():
        a["custo"] = round(a["custo"], 2)
    return sorted(acc.values(), key=lambda x: -x["custo"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--de", required=True, help="AAAA-MM-DD")
    ap.add_argument("--ate", required=True, help="AAAA-MM-DD")
    ap.add_argument("--saida", default=os.path.join(AQUI, "periodo_google.json"))
    args = ap.parse_args()

    de, ate = date.fromisoformat(args.de), date.fromisoformat(args.ate)
    dias = (ate - de).days + 1
    ant_ate = de - timedelta(days=1)
    ant_de = ant_ate - timedelta(days=dias - 1)

    run_query_raw = _carrega_lib()
    saida = {"dias": dias,
             "janelas": {"atual": {"de": de.isoformat(), "ate": ate.isoformat()},
                         "anterior": {"de": ant_de.isoformat(), "ate": ant_ate.isoformat()}}}
    for rot, (d, a) in (("atual", (de, ate)), ("anterior", (ant_de, ant_ate))):
        dados = coleta(run_query_raw, d.isoformat(), a.isoformat())
        saida[rot] = dados
        c = sum(x["custo"] for x in dados)
        n = sum(x["leads"] for x in dados)
        print(f"  {rot:9s} {d} a {a}  R$ {c:>9,.2f} | {n:>6.1f} leads | "
              f"CPL R$ {c / n if n else 0:>7,.2f}  ({len(dados)} campanhas)")

    with open(args.saida, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print("gravado:", args.saida)


if __name__ == "__main__":
    main()
