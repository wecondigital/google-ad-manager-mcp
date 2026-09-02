// Dados extraidos em 02/09/2026 via Google Ads API (customer 6542140100)
// e Meta Ads MCP (ad account 434423524017005). Periodos fechados: 01-31/07 e 01-31/08/2026.

const meta = {
  jul: { invest: 35360.23, impr: 2817526, clicks: 36531, ctr: 1.30, cpc: 0.97, cpm: 12.55, reach: 987123, freq: 2.85, leads: 906 },
  ago: { invest: 37026.22, impr: 2590448, clicks: 38487, ctr: 1.49, cpc: 0.96, cpm: 14.29, reach: 761721, freq: 3.40, leads: 1051 },
  // composicao dos leads por tipo de conversao
  tipos: {
    'Formulário Meta (lead ads)': { jul: 366, ago: 711 },
    'Formulário no site (pixel)': { jul: 413, ago: 245 },
    'Conversas no WhatsApp':      { jul: 127, ago: 95 },
  },
  // campanhas com investimento em agosto (ordenadas por verba)
  campanhas: [
    { nome: 'CASAMENTOS | QUERÊNCIA | SITE',        invest: 9564.15, leads: 161, cpl: 59.40,  tipo: 'Form. site' },
    { nome: 'CASAMENTOS | PALACETE | SITE',         invest: 4496.93, leads: 51,  cpl: 88.18,  tipo: 'Form. site' },
    { nome: 'CORPORATIVO | LP',                     invest: 3053.75, leads: null, cpl: null,  tipo: 'Resultado misto' },
    { nome: 'CASAMENTO | Mini Wedding | Casa Lucca',invest: 2501.05, leads: 27,  cpl: 92.63,  tipo: 'Form. site' },
    { nome: 'Corporativo > Institucional',          invest: 2057.57, leads: 11,  cpl: 187.05, tipo: 'Form. Meta' },
    { nome: '[Leads Ads] [Casamentos] [form]',      invest: 1840.18, leads: 75,  cpl: 24.54,  tipo: 'Form. Meta' },
    { nome: 'CORPORATIVO | WhatsApp',               invest: 1812.37, leads: 41,  cpl: 44.20,  tipo: 'WhatsApp' },
    { nome: 'Reconhecimento de Marca | Corporativo',invest: 1455.07, leads: null, cpl: null,  tipo: 'Awareness' },
    { nome: 'Social > Querência > Destination (4 camp.)', invest: 4828.08, leads: 515, cpl: 9.37, tipo: 'Form. Meta' },
    { nome: 'Social > Debutantes > Leads form',     invest: 1195.12, leads: 110, cpl: 10.86,  tipo: 'Form. Meta' },
    { nome: '[Posts] [Engajamento]',                invest: 1283.87, leads: null, cpl: null,  tipo: 'Resultado misto' },
    { nome: 'CASAMENTOS | TERRÁ | SITE',            invest: 965.34,  leads: 6,   cpl: 160.89, tipo: 'Form. site' },
    { nome: 'DEBUTANTES | MENSAGENS',               invest: 609.70,  leads: 11,  cpl: 55.43,  tipo: 'WhatsApp' },
    { nome: 'BODAS | WhatsApp',                     invest: 575.03,  leads: 12,  cpl: 47.92,  tipo: 'WhatsApp' },
    { nome: 'CASAMENTO | WhatsApp | Querência',     invest: 519.56,  leads: 22,  cpl: 23.62,  tipo: 'WhatsApp' },
    { nome: 'Social > Querência > Destination > Wpp', invest: 268.45, leads: 9,  cpl: 29.83,  tipo: 'WhatsApp' },
  ],
};

const google = {
  jul: { invest: 17670.26, impr: 81925, clicks: 6982, ctr: 8.52, cpc: 2.53, leads: 504.78, cvr: 7.16, is: 42.28 },
  ago: { invest: 14538.85, impr: 91175, clicks: 5914, ctr: 6.49, cpc: 2.46, leads: 420.75, cvr: 7.07, is: 42.07 },
  // conversoes por acao (100% acoes de lead — nenhuma conversao "soft" na conta)
  acoes: {
    'Formulário do site':   { jul: 267.78, ago: 235.00 },
    'WhatsApp do site':     { jul: 237.00, ago: 185.75 },
  },
  campanhas: [
    { nome: 'SEARCH | CASAMENTO | QUERÊNCIA | SP', tipo: 'Search', invest: 3298.24, leads: 22.0,  cpl: 149.92, is: 43.9 },
    { nome: 'SEARCH | BODAS | TERRÁ',              tipo: 'Search', invest: 3039.85, leads: 22.0,  cpl: 138.17, is: 41.4 },
    { nome: 'Casamento — Performance Max',         tipo: 'PMax',   invest: 1824.65, leads: 79.0,  cpl: 23.10,  is: 14.2 },
    { nome: 'SEARCH | QUERÊNCIA | CASAMENTO',      tipo: 'Search', invest: 1414.36, leads: 19.0,  cpl: 74.44,  is: 44.3 },
    { nome: 'SEARCH | TERRÁ | INSTITUCIONAL',      tipo: 'Search', invest: 1202.58, leads: 16.75, cpl: 71.80,  is: 42.8 },
    { nome: 'Corporativo — Performance Max',       tipo: 'PMax',   invest: 912.34,  leads: 230.0, cpl: 3.97,   is: 10.0 },
    { nome: 'SEARCH | DEBUTANTES | TERRÁ',         tipo: 'Search', invest: 840.71,  leads: 10.0,  cpl: 84.07,  is: 43.4 },
    { nome: 'SEARCH | PALACETE MONTE ALEGRE',      tipo: 'Search', invest: 607.99,  leads: 2.0,   cpl: 304.00, is: 62.2 },
    { nome: 'SEARCH | CASAMENTO | TERRÁ',          tipo: 'Search', invest: 549.18,  leads: 7.0,   cpl: 78.45,  is: 46.7 },
    { nome: 'SEARCH | CORPORATIVO | TERRÁ',        tipo: 'Search', invest: 425.27,  leads: 10.0,  cpl: 42.53,  is: 37.6 },
    { nome: 'SEARCH | CASAMENTO | CASA LUCCA',     tipo: 'Search', invest: 423.67,  leads: 3.0,   cpl: 141.22, is: 53.8 },
  ],
};

const total = {
  jul: { invest: meta.jul.invest + google.jul.invest, leads: meta.jul.leads + google.jul.leads,
         clicks: meta.jul.clicks + google.jul.clicks, impr: meta.jul.impr + google.jul.impr },
  ago: { invest: meta.ago.invest + google.ago.invest, leads: meta.ago.leads + google.ago.leads,
         clicks: meta.ago.clicks + google.ago.clicks, impr: meta.ago.impr + google.ago.impr },
};
total.jul.cpl = total.jul.invest / total.jul.leads;
total.ago.cpl = total.ago.invest / total.ago.leads;

module.exports = { meta, google, total };
