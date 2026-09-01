# -*- coding: utf-8 -*-
"""Coleta os numeros do Google Ads do Di Terra para o deck de acompanhamento.

Roda duas janelas na mesma chamada: o mes corrente ate ontem e a ultima semana
fechada (segunda a domingo). Grava tudo em google.json, no mesmo formato que o
gera_acompanhamento.js espera.

    python3 coleta_google.py --saida google.json
    python3 coleta_google.py --hoje 2026-09-08     # util para reprocessar

Depende da skill google-ads-ratos (somente leitura), localizada em tempo de
execucao — o caminho dela muda a cada sincronizacao, entao nao da para fixar.
"""
import argparse
import glob
import json
import os
import sys
from datetime import date, timedelta

CUSTOMER_ID = "6542140100"          # Di Terra — fora do MCC, precisa do fallback
_AQUI = os.path.dirname(os.path.abspath(__file__))


def _carrega_lib():
    padrao = os.path.expanduser("~/.claude/skills/**/google-ads-ratos/SKILL.md")
    achados = glob.glob(padrao, recursive=True)
    if not achados:
        sys.exit("skill google-ads-ratos nao encontrada em ~/.claude/skills — "
                 "confirme que ela esta instalada nesta sessao.")
    sys.path.insert(0, os.path.join(os.path.dirname(achados[0]), "scripts"))
    from lib import run_query_raw  # noqa: E402
    return run_query_raw


def janelas(hoje):
    """(mes corrente ate ontem, ultima semana fechada seg-dom)."""
    ontem = hoje - timedelta(days=1)
    inicio_mes = hoje.replace(day=1)
    # domingo mais recente ja fechado; weekday(): seg=0 ... dom=6
    dom = hoje - timedelta(days=hoje.weekday() + 1)
    seg = dom - timedelta(days=6)
    return {
        "mes": {"de": inicio_mes.isoformat(), "ate": max(ontem, inicio_mes).isoformat()},
        "semana": {"de": seg.isoformat(), "ate": dom.isoformat()},
        "semana_anterior": {"de": (seg - timedelta(days=7)).isoformat(),
                            "ate": (dom - timedelta(days=7)).isoformat()},
        "mes_anterior": {"de": (inicio_mes - timedelta(days=1)).replace(day=1).isoformat(),
                         "ate": (inicio_mes - timedelta(days=1)).isoformat()},
    }


def coleta(run_query_raw, de, ate):
    """Custo, cliques, impressoes e conversoes por campanha na janela."""
    linhas = run_query_raw(CUSTOMER_ID, f"""
        SELECT campaign.name, campaign.status, campaign.advertising_channel_type,
               metrics.cost_micros, metrics.clicks, metrics.impressions,
               metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '{de}' AND '{ate}'
    """)
    por_campanha = {}
    for r in linhas:
        nome = r["campaign"]["name"]
        m = r["metrics"]
        acc = por_campanha.setdefault(nome, {
            "campanha": nome,
            "canal": r["campaign"].get("advertising_channel_type", ""),
            "custo": 0.0, "cliques": 0, "impressoes": 0, "leads": 0.0,
        })
        acc["custo"] += float(m.get("cost_micros", 0)) / 1e6
        acc["cliques"] += int(m.get("clicks", 0))
        acc["impressoes"] += int(m.get("impressions", 0))
        acc["leads"] += float(m.get("conversions", 0))
    return sorted(por_campanha.values(), key=lambda x: -x["custo"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--saida", default=os.path.join(_AQUI, "google.json"))
    ap.add_argument("--hoje", help="AAAA-MM-DD; padrao = hoje")
    args = ap.parse_args()

    hoje = date.fromisoformat(args.hoje) if args.hoje else date.today()
    run_query_raw = _carrega_lib()
    js = janelas(hoje)

    saida = {"gerado_em": hoje.isoformat(), "customer_id": CUSTOMER_ID, "janelas": js}
    for nome, j in js.items():
        dados = coleta(run_query_raw, j["de"], j["ate"])
        saida[nome] = dados
        custo = sum(d["custo"] for d in dados)
        leads = sum(d["leads"] for d in dados)
        print(f"  {nome:16s} {j['de']} a {j['ate']}  "
              f"R$ {custo:>10,.2f} | {leads:>6.1f} leads | "
              f"CPL R$ {custo / leads if leads else 0:>7,.2f}")

    with open(args.saida, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print("gravado:", args.saida)


if __name__ == "__main__":
    main()
