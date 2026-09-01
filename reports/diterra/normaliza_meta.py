# -*- coding: utf-8 -*-
"""Transforma as respostas cruas do Meta MCP em meta.json.

O motivo de existir: o campo `results` do Meta nao tem um significado unico.
Ele devolve o indicador do objetivo de cada campanha — a de Reconhecimento
volta com `video_thruplay_watched_actions` e 29.315 "resultados", que sao
visualizacoes de video, nao leads. Somar isso como lead derrubaria o CPL do
mes inteiro para centavos. Entao a regra de leitura mora aqui, em codigo, e
nao no julgamento de quem gera o deck a cada semana.

Uso:
  1) para cada janela, salve a resposta de ads_get_ad_entities (nivel campaign,
     fields name/amount_spent/results/impressions/clicks) em:
         raw/mes.json  raw/semana.json  raw/semana_anterior.json  raw/mes_anterior.json
  2) python3 normaliza_meta.py
"""
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
JANELAS = ["mes", "semana", "semana_anterior", "mes_anterior"]

# Indicadores que contam como lead para o Di Terra. Qualquer outro entra
# como zero e sai listado no aviso — inclusive "mixed", que aparece quando a
# campanha mistura objetivos e o Meta nao consegue dar um numero unico.
LEAD = {
    "actions:lead",
    "actions:leadgen.other",
    "conversions:offsite_conversion.fb_pixel_custom.contact_form",
    "actions:onsite_conversion.messaging_conversation_started_7d",
    "actions:onsite_conversion.messaging_conversation_started",
}


def moeda(txt):
    """'R$1.402,19 BRL' -> 1402.19"""
    if not txt:
        return 0.0
    t = re.sub(r"[^\d,.]", "", str(txt).replace("\xa0", ""))
    if "," in t:
        t = t.replace(".", "").replace(",", ".")
    return float(t) if t else 0.0


def inteiro(v):
    try:
        return int(str(v).replace(".", "").replace(",", ""))
    except (ValueError, TypeError):
        return 0


def leads(res):
    """Numero de leads e o indicador usado. Devolve (leads, indicador, contou)."""
    if not isinstance(res, dict):
        return 0.0, "", False
    ind = res.get("indicator", "")
    vals = res.get("values")
    if not vals or ind not in LEAD:
        return 0.0, ind, False
    total = sum(float(str(v.get("value", 0)).replace(",", "")) for v in vals
                if str(v.get("value", "")).replace(",", "").replace(".", "").isdigit())
    return total, ind, True


def main():
    saida, ignorados = {}, {}
    for j in JANELAS:
        caminho = os.path.join(AQUI, "raw", f"{j}.json")
        if not os.path.exists(caminho):
            sys.exit(f"faltando {caminho} — veja o cabecalho deste arquivo.")
        bruto = json.load(open(caminho, encoding="utf-8"))
        ents = bruto.get("ad_entities", bruto)
        if isinstance(ents, str):
            ents = json.loads(ents)

        linhas = []
        for e in ents:
            custo = moeda(e.get("amount_spent"))
            n, ind, contou = leads(e.get("results"))
            if custo <= 0 and n <= 0:
                continue                       # campanha parada na janela
            # so avisa quando o indicador NAO e de lead. Indicador de lead com
            # valor ausente e simplesmente zero lead na janela, sem ambiguidade.
            if custo > 0 and ind not in LEAD:
                ignorados.setdefault(ind or "sem indicador", set()).add(e.get("name", "?"))
            linhas.append({
                "campanha": e.get("name", "?"),
                "custo": round(custo, 2),
                "leads": n,
                "impressoes": inteiro(e.get("impressions")),
                "cliques": inteiro(e.get("clicks")),
                "indicador": ind,
                "lead_contado": contou,
            })
        linhas.sort(key=lambda x: -x["custo"])
        saida[j] = linhas
        c = sum(l["custo"] for l in linhas)
        n = sum(l["leads"] for l in linhas)
        print(f"  {j:16s} {len(linhas):>3} campanhas | R$ {c:>10,.2f} | {n:>6.0f} leads | "
              f"CPL R$ {c / n if n else 0:>7,.2f}")

    if ignorados:
        print("\n  ATENCAO — campanhas com gasto cujo `results` NAO foi contado como lead:")
        for ind, nomes in sorted(ignorados.items()):
            print(f"    [{ind or 'sem indicador'}]")
            for nm in sorted(nomes):
                print(f"       - {nm}")
        print("    Elas entram no investimento e no denominador do CPL, mas com zero lead.")
        print("    'mixed' costuma ser campanha com objetivos misturados: vale conferir na")
        print("    interface se ha lead real ali antes de apresentar o CPL do mes.")

    destino = os.path.join(AQUI, "meta.json")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print("\ngravado:", destino)


if __name__ == "__main__":
    main()
