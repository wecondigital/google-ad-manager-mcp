# -*- coding: utf-8 -*-
"""Teto de orcamento atual de cada campanha do Google, contra o plano aprovado.

Alimenta o gera_status.js: o slide do Google mostra "teto hoje -> teto novo",
e o teto de hoje so existe na conta. Tambem separa as campanhas que estao
habilitadas mas nao aparecem no plano — elas gastam sem estar previstas.

    python3 coleta_google_depara.py
"""
import glob
import json
import os
import sys

CUSTOMER_ID = "6542140100"
DIAS_MES = 30
AQUI = os.path.dirname(os.path.abspath(__file__))


def _carrega_lib():
    achados = glob.glob(os.path.expanduser("~/.claude/skills/**/google-ads-ratos/SKILL.md"),
                        recursive=True)
    if not achados:
        sys.exit("skill google-ads-ratos nao encontrada em ~/.claude/skills.")
    sys.path.insert(0, os.path.join(os.path.dirname(achados[0]), "scripts"))
    from lib import run_query_raw  # noqa: E402
    return run_query_raw


def main():
    run_query_raw = _carrega_lib()
    tetos = {}
    for r in run_query_raw(CUSTOMER_ID, """
        SELECT campaign.name, campaign_budget.amount_micros
        FROM campaign WHERE campaign.status = 'ENABLED'
    """):
        tetos[r["campaign"]["name"]] = float(r["campaign_budget"].get("amount_micros", 0)) / 1e6

    plano = json.load(open(os.path.join(AQUI, "plano-setembro-2026.json"), encoding="utf-8"))
    linhas = [l for l in plano["plano"] if l["plataforma"] == "Google"]

    saida = {"plano": [], "fora": {}}
    for l in sorted(linhas, key=lambda x: -x["set"]):
        teto = tetos.get(l["campanha"])          # None = nao existe na conta, criar
        saida["plano"].append({
            "campanha": l["campanha"], "teto": teto,
            "novo": round(l["set"] / DIAS_MES, 2), "mes": l["set"],
        })
        print(f"  {l['campanha'][:44]:44s} {('—' if teto is None else f'{teto:,.2f}'):>9s} -> "
              f"{l['set'] / DIAS_MES:>7.2f}/dia")

    previstas = {l["campanha"] for l in linhas}
    saida["fora"] = {k: v for k, v in tetos.items() if k not in previstas}
    if saida["fora"]:
        print("\n  HABILITADAS FORA DO PLANO — pausar ou incluir:")
        for k, v in sorted(saida["fora"].items(), key=lambda x: -x[1]):
            print(f"    {k[:50]:50s} R$ {v:,.2f}/dia")

    destino = os.path.join(AQUI, "google_depara.json")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print("\ngravado:", destino)


if __name__ == "__main__":
    main()
