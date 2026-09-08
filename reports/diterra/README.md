# Acompanhamento semanal — Di Terrá

Gera, toda terça-feira, o deck de acompanhamento de mídia que sustenta a reunião
de quarta com o cliente. Cobre **Google Ads** e **Meta Ads**, com dois recortes:
o **mês corrente até ontem** e a **última semana fechada (segunda a domingo)**.

Saída: `Acompanhamento-DiTerra-<segunda>-a-<domingo>.pptx`, 5 slides no modelo de
design da WeCon.

---

## Rotina de terça

```bash
cd reports/diterra
npm install                     # só na primeira vez da sessão

# 1. Google Ads — automático
python3 coleta_google.py

# 2. Meta Ads — via MCP (ver abaixo), depois:
python3 normaliza_meta.py

# 3. Deck + conferência
node gera_acompanhamento.js
python3 qa_deck.py
```

### Passo 2 em detalhe

O Meta não tem credencial de API neste ambiente — os dados vêm pelo MCP. Para
cada uma das quatro janelas que o `coleta_google.py` imprime, chame:

```
ads_get_ad_entities
  ad_account_id : 434423524017005
  level         : campaign
  fields        : ["name","amount_spent","results","impressions","clicks"]
  time_range    : {"since":"...","until":"..."}
  sort          : amount_spent_descending
  limit         : 25
```

e salve a resposta crua em `raw/mes.json`, `raw/semana.json`,
`raw/semana_anterior.json` e `raw/mes_anterior.json`. O `normaliza_meta.py`
cuida do resto.

**Por que não confiar no `results` direto:** ele devolve o indicador do objetivo
de *cada* campanha, não um número comparável. A campanha `Reconhecimento de
Marca | Corporativo` volta com `video_thruplay_watched_actions` — 29.315
"resultados" em agosto, que são visualizações de vídeo. Somados como lead,
derrubariam o CPL do mês para centavos. O `normaliza_meta.py` só conta os
indicadores da lista `LEAD` e imprime, ao final, quais campanhas ficaram de fora
e por quê. **Leia esse aviso antes de apresentar o deck** — `mixed` costuma ser
campanha com objetivos misturados e pode esconder lead real.

---

## O que cada arquivo faz

| arquivo | papel |
|---|---|
| `coleta_google.py` | GAQL na conta 654-214-0100 → `google.json`. Define as 4 janelas. |
| `normaliza_meta.py` | `raw/*.json` (MCP) → `meta.json`, aplicando a regra de lead. |
| `gera_acompanhamento.js` | `google.json` + `meta.json` + plano → PPTX. |
| `qa_deck.py` | QA geométrico: estouro de texto, sobreposição e margem. |
| `coleta_google_depara.py` | Teto atual de cada campanha do Google → `google_depara.json`. |
| `gera_status.js` | Deck de status da implementação (o que já mudou nas contas, o que falta). |
| `coleta_periodo.py` | Google em duas janelas: o período pedido e o anterior de mesma duração. |
| `normaliza_periodo.py` | `raw_periodo/*.json` (MCP) → `periodo_meta.json`. Reusa a regra de lead. |
| `gera_periodo.js` | Relatório de mídia de um período, comparado com o anterior. |
| `novos_anuncios.json` | As peças que estrearam no período, levantadas à mão (ver abaixo). |
| `plano-setembro-2026.json` | O plano aprovado. Referência de verba e de CPL por casa. |
| `tema/` | As três artes do "Tema Apresentação Wecon". |

`google.json`, `meta.json`, `google_depara.json`, `periodo_*.json`, `raw/`,
`raw_periodo/` e os `.pptx` gerados não são versionados — são saída de cada rodada.

## Os 5 slides do acompanhamento semanal

1. **Capa** — período coberto.
2. **O mês até aqui** — investido, leads, CPL, ritmo de verba contra o calendário
   e projeção de fechamento; tabela por plataforma com % do plano consumido.
3. **A última semana fechada** — cards com variação contra a semana anterior e as
   8 campanhas de maior investimento, com CPL comparado.
4. **Resultado por casa** — mês corrente contra o plano e contra o CPL de
   referência de cada casa.
5. **Pontos de atenção** — gerados por regra, não por opinião: pacing fora de
   ±5%, CPL da semana 15% acima da referência, casa 25% acima do seu CPL base e
   campanha com gasto relevante e zero lead.

## Deck de status da implementação

Separado do acompanhamento semanal: mostra o que já foi alterado nas contas e o
que falta. Útil enquanto o plano está sendo implementado.

```bash
python3 coleta_google_depara.py     # tetos atuais do Google
node gera_status.js                 # 6 slides
python3 qa_deck.py Implementacao-Setembro-DiTerra.pptx
```

A lista `APLICADO` no topo do `gera_status.js` é o registro manual do que já foi
mexido no Meta — atualize-a conforme aplicar mais alterações. O `PAUSADOS` é
derivado dela, então o número em destaque do slide 2 acompanha sozinho.

## Relatório de um período qualquer

Para "relatório de X a Y", com comparativo automático contra os mesmos dias
imediatamente anteriores:

```bash
python3 coleta_periodo.py --de 2026-08-31 --ate 2026-09-06
# salve as duas janelas do Meta em raw_periodo/atual.json e raw_periodo/anterior.json
# (mesma chamada ads_get_ad_entities da rotina de terça, com os time_range que o
#  coleta_periodo.py imprimiu)
python3 normaliza_periodo.py
node gera_periodo.js
python3 qa_deck.py Relatorio-DiTerra-<de>-a-<ate>.pptx
```

São 8 slides: capa, o período em números, Meta por campanha, Google por campanha,
resultado por casa, novos anúncios, os criativos, e o que falta do plano. A lista do
último slide é escrita à mão no `gera_periodo.js` — atualize conforme os itens forem
sendo concluídos.

### Os dois slides de criativo

`novos_anuncios.json` alimenta os slides 6 e 7 e é montado à mão a cada rodada.
Para levantar as peças novas, consulte `ads_get_ad_entities` no nível `ad` com
`created_time` e `sort: created_time_descending`, e depois `ads_get_ad_preview`
em cada anúncio para pegar o `preview_url`.

**As molduras do slide 7 saem vazias de propósito.** O proxy de saída bloqueia
`business.facebook.com` e os CDNs do Meta, então não dá para baixar o criativo e
embutir a imagem no arquivo. As molduras já estão no tamanho certo (1,55 × 2,05 in):
abra o preview pelo link, capture a tela e cole. Os links do Meta expiram — se algum
não abrir, gere de novo com `ads_get_ad_preview`.

## Ao trocar de mês

Substitua `plano-setembro-2026.json` pelo plano do mês novo (mesmo formato) e
ajuste o `ler(...)` no topo do `gera_acompanhamento.js`. As chaves usadas são
`total`, `plano[]`, `casas{}`, `cpl_base{}` e `projecao.cpl`.

## Limites conhecidos

- **Leitura, nunca escrita.** A skill do Google é read-only por instalação, e
  nada aqui altera conta — o deck reporta, quem muda orçamento é a pessoa.
- A conta do Google está **fora do MCC**, então a skill precisa do fallback de
  `login-customer-id`. Já é automático, mas explica o `PERMISSION_DENIED` que
  aparece no log antes de a consulta funcionar.
- Campanhas fora do plano são atribuídas a uma casa por palavra-chave no nome
  (`PISTAS`, no gerador). Nome novo e fora do padrão cai em "Institucional".
