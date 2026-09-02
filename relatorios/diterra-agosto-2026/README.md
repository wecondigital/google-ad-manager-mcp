# Di Terrá — Relatório de Mídia — Agosto/2026

Apresentação de fechamento mensal de mídia paga do Di Terrá, com comparativo
contra julho/2026, no design da Wecon.

**Entregável:** `Di Terra - Relatorio de Midia - Agosto 2026.pptx` (9 slides, 16:9)

## Números consolidados

| | Julho/2026 | Agosto/2026 | Δ |
|---|---:|---:|---:|
| Investimento | R$ 53.030,49 | R$ 51.565,07 | −2,8% |
| Leads | 1.411 | 1.472 | +4,3% |
| Custo por lead | R$ 37,59 | R$ 35,04 | −6,8% |

| Canal | Invest. ago | Leads ago | CPL ago | CPL jul |
|---|---:|---:|---:|---:|
| Meta Ads | R$ 37.026,22 | 1.051 | R$ 35,23 | R$ 39,03 |
| Google Ads | R$ 14.538,85 | 421 | R$ 34,55 | R$ 35,01 |

## Fontes

- **Google Ads** — conta `654-214-0100` (Di Terrá / ex-Grupo Terrá), via Google Ads API
  (skill `google-ads-ratos`, somente leitura).
- **Meta Ads** — conta `434423524017005` (DI TERRÁ), via Meta Ads MCP.
- Períodos fechados: 01–31/07/2026 e 01–31/08/2026, no fuso das contas.
- Coleta em 02/09/2026.

## Definição de lead

- **Google Ads:** as 420,75 conversões de agosto e 504,78 de julho são 100% ações de
  lead — `GRUPO TERRA SITE (web) contact_form` e `contact_form_whatsapp`. Não há
  conversão *soft* inflando o número.
- **Meta Ads:** soma de formulários nativos (`leadgen.other` + `lead`), formulários do
  site via pixel (`contact_form`) e conversas iniciadas no WhatsApp
  (`messaging_conversation_started_7d`).

## Cobertura

Campanhas do Meta com resultado misto ou de reconhecimento (`CORPORATIVO | LP`,
`[Posts] [Engajamento]` e `Reconhecimento de Marca`) não têm CPL único e ficam fora da
contagem de leads. Elas somam 15,6% da verba em agosto e 15,3% em julho — proporção
equivalente, o que preserva a comparação entre os meses.

## Identidade visual

Paleta e tipografia do *Wecon — Manual da Marca*:

| | Hex |
|---|---|
| Azul-noite | `#161F28` |
| Roxo | `#8A65C4` |
| Verde | `#C2CA97` |
| Off-white | `#EDEBDC` |

O manual especifica Source Han Serif (títulos) e Libre Franklin (textos). O deck usa
Cambria e Calibri, que mantêm o contraste serifa/sans e vêm instaladas com o Office —
as fontes do manual não têm substituto métrico garantido na máquina do cliente.

O logo do Di Terrá não está no Drive da conta; a capa traz um selo tipográfico com o
nome do cliente sobre o azul da marca (`#262749`). Basta trocar pelo arquivo oficial
quando ele estiver disponível.

## Regerar

```bash
npm install                       # pptxgenjs + sharp
node build.js                     # gera o .pptx
python3 qa_render.py qa.pptx qa   # QA visual: renderiza cada slide e acusa estouros
```

`dados.js` concentra todos os números — editar ali e rodar `node build.js` refaz o deck.

`qa_render.py` existe porque o LibreOffice não carrega arquivos neste container
(`Error: source file could not be loaded`), então o caminho normal de
`soffice --convert-to pdf` + `pdftoppm` não funciona. Ele lê o `.pptx` com `python-pptx`
e redesenha cada slide com PIL: aproxima o resultado, mas confere posição, sobreposição
e estouro de texto sobre o arquivo real. Usa Liberation Sans/Serif, mais largas que
Calibri/Cambria, então a checagem de estouro é conservadora.
