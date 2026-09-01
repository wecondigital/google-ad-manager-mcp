// Deck de acompanhamento semanal — Di Terrá
// Le google.json (coleta_google.py) e meta.json (preenchido via Meta MCP)
// e monta a apresentacao no modelo de design da WeCon.
//
//   node gera_acompanhamento.js [--saida Acompanhamento.pptx]
//
// Identidade e artes extraidas de "Tema Apresentacao Wecon".
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const AQUI = __dirname;
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};
const ler = f => JSON.parse(fs.readFileSync(path.join(AQUI, f), 'utf8'));

const G = ler('google.json');
const M = ler('meta.json');
const PLANO = ler('plano-setembro-2026.json');

// ---------- identidade WeCon ----------
const img = n => 'image/jpeg;base64,' +
  fs.readFileSync(path.join(AQUI, 'tema', `image${n}.jpg`)).toString('base64');
const PANEL = img(2), BAND = img(3), NARROW = img(1);
const CREME = 'EDEBDC', SALVIA = 'C2CA97', OLIVA = '55622F';
const TINTA = '1A1A17', SEC = '595959', BRANCO = 'FFFFFF', LINHA = 'D8D6C4';
const GOOGLE = '1D6EA8', META = 'A9761A', BOM = '1F7A55', RUIM = 'B3392F';
const F = 'Arial';

const brl = (v, dec = 0) =>
  'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const num = (v, dec = 0) =>
  (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const dataBR = s => s.split('-').reverse().slice(0, 2).join('/');

// Seta e cor de variacao. `menorMelhor` inverte a leitura — serve pro CPL,
// onde cair e bom. Sem isso o deck pintaria de vermelho uma melhora de custo.
function delta(atual, base, menorMelhor = false) {
  if (!base) return { txt: '—', cor: SEC };
  const v = (atual - base) / base * 100;
  const bom = menorMelhor ? v < 0 : v > 0;
  return {
    txt: (v >= 0 ? '▲ +' : '▼ ') + num(Math.abs(v), 1) + '%',
    cor: Math.abs(v) < 1 ? SEC : (bom ? BOM : RUIM),
    v,
  };
}

// ---------- consolidacao ----------
const CASAS = ['Fazenda A Querência', 'Palacete Monte Alegre', 'Casa Lucca',
               'Espaço Terrá', 'Institucional / multi-casa'];

// mapa campanha -> casa/evento, vindo do plano aprovado
const MAPA = {};
PLANO.plano.forEach(l => { MAPA[l.campanha.toLowerCase()] = { casa: l.casa, evento: l.evento }; });

// campanhas fora do plano caem aqui, por palavra-chave no nome
const PISTAS = [
  [/quer[êe]ncia/i, 'Fazenda A Querência'],
  [/palacete/i, 'Palacete Monte Alegre'],
  [/lucca/i, 'Casa Lucca'],
  [/terr[áa]/i, 'Espaço Terrá'],
];
function casaDe(nome) {
  const m = MAPA[nome.toLowerCase()];
  if (m) return m.casa;
  for (const [re, casa] of PISTAS) if (re.test(nome)) return casa;
  return 'Institucional / multi-casa';
}

// junta as duas plataformas numa lista so, com a plataforma marcada
function junta(janela) {
  return [
    ...(G[janela] || []).map(l => ({ ...l, plataforma: 'Google' })),
    ...(M[janela] || []).map(l => ({ ...l, plataforma: 'Meta' })),
  ];
}
const total = ls => ls.reduce((a, l) => ({
  custo: a.custo + (l.custo || 0), leads: a.leads + (l.leads || 0),
}), { custo: 0, leads: 0 });
const cpl = t => (t.leads ? t.custo / t.leads : 0);

const MES = junta('mes'), SEM = junta('semana');
const SEM_ANT = junta('semana_anterior'), MES_ANT = junta('mes_anterior');
const tMes = total(MES), tSem = total(SEM), tSemAnt = total(SEM_ANT), tMesAnt = total(MES_ANT);

// ritmo: quanto do plano ja foi gasto contra quanto do mes ja passou
const jm = G.janelas.mes;
const diasCorridos = (new Date(jm.ate) - new Date(jm.de)) / 864e5 + 1;
const diasMes = new Date(new Date(jm.de).getFullYear(), new Date(jm.de).getMonth() + 1, 0).getDate();
const ritmoTempo = diasCorridos / diasMes;
const ritmoVerba = tMes.custo / PLANO.total;
const projetado = ritmoTempo ? tMes.custo / ritmoTempo : 0;

// ---------- montagem ----------
const p = new pptxgen();
p.layout = 'LAYOUT_16x9';
p.author = 'WeCon Digital';
p.company = 'WeCon Digital';
p.title = `Acompanhamento Di Terrá — ${dataBR(jm.de)} a ${dataBR(jm.ate)}`;

function base(sub) {
  const s = p.addSlide();
  s.background = { color: CREME };
  if (sub === 'faixa') s.addImage({ data: BAND, x: 0, y: 4.94, w: 10, h: 0.69 });
  if (sub === 'estreito') s.addImage({ data: NARROW, x: 8.41, y: 0, w: 1.59, h: 5.625 });
  return s;
}
function titulo(s, eyebrow, t, sub) {
  s.addText(eyebrow, { x: 0.6, y: 0.28, w: 7.5, h: 0.22, fontFace: F, fontSize: 10, bold: true,
                       color: OLIVA, charSpacing: 1.6, margin: 0 });
  s.addText(t, { x: 0.6, y: 0.52, w: 7.6, h: 0.52, fontFace: F, fontSize: 30, bold: true,
                 color: TINTA, margin: 0 });
  if (sub) s.addText(sub, { x: 0.6, y: 1.06, w: 7.6, h: 0.3, fontFace: F, fontSize: 13,
                            color: SEC, margin: 0 });
}
function card(s, x, y, w, h, rot, val, nota, cor) {
  s.addShape(p.ShapeType.rect, { x, y, w, h, fill: { color: BRANCO }, line: { color: LINHA, width: 0.75 } });
  s.addText(rot, { x: x + 0.18, y: y + 0.13, w: w - 0.36, h: 0.2, fontFace: F, fontSize: 9,
                   bold: true, color: SEC, charSpacing: 1.2, margin: 0 });
  s.addText(val, { x: x + 0.18, y: y + 0.34, w: w - 0.36, h: 0.42, fontFace: F, fontSize: 21,
                   bold: true, color: cor || TINTA, margin: 0 });
  if (nota) s.addText(nota, { x: x + 0.18, y: y + 0.78, w: w - 0.36, h: 0.4, fontFace: F,
                              fontSize: 9.5, color: SEC, margin: 0 });
}
function tabela(s, cab, linhas, opt = {}) {
  const head = cab.map(c => ({ text: c.t, options: {
    fontFace: F, fontSize: 9, bold: true, color: SEC, charSpacing: 0.8,
    align: c.a || 'left', fill: { color: CREME }, valign: 'bottom' } }));
  const body = linhas.map(l => l.map((c, i) => ({
    text: typeof c === 'object' ? c.t : c,
    options: { fontFace: F, fontSize: opt.fs || 10.5,
               bold: (typeof c === 'object' && c.b) || false,
               color: (typeof c === 'object' && c.c) || TINTA,
               align: cab[i].a || 'left', fill: { color: BRANCO }, valign: 'middle' },
  })));
  s.addTable([head, ...body], {
    x: opt.x || 0.6, y: opt.y, w: opt.w, colW: opt.colW, rowH: opt.rowH || 0.28,
    border: { type: 'solid', color: LINHA, pt: 0.5 }, margin: [3, 6, 3, 6],
  });
}
function rodape(s, txt) {
  s.addText(txt, { x: 0.6, y: 4.58, w: 8.8, h: 0.28, fontFace: F, fontSize: 8.5,
                   italic: true, color: SEC, margin: 0 });
}

// ==================== 1 · CAPA ====================
{
  const s = p.addSlide();
  s.background = { color: CREME };
  s.addImage({ data: PANEL, x: 5.6, y: 0, w: 4.4, h: 5.625 });
  s.addText('WECON DIGITAL', { x: 0.7, y: 1.5, w: 4.6, h: 0.24, fontFace: F, fontSize: 10,
                               bold: true, color: OLIVA, charSpacing: 1.8, margin: 0 });
  s.addText('Acompanhamento de mídia', { x: 0.7, y: 1.78, w: 4.7, h: 1.25, fontFace: F,
                                         fontSize: 34, bold: true, color: TINTA, margin: 0 });
  s.addText('Di Terrá  ·  Google Ads e Meta Ads', { x: 0.7, y: 3.10, w: 4.7, h: 0.3,
    fontFace: F, fontSize: 14, color: SEC, margin: 0 });
  s.addShape(p.ShapeType.rect, { x: 0.7, y: 3.55, w: 0.9, h: 0.035, fill: { color: SALVIA } });
  s.addText(`Mês até ${dataBR(jm.ate)}  ·  semana de ${dataBR(G.janelas.semana.de)} a ${dataBR(G.janelas.semana.ate)}`,
    { x: 0.7, y: 3.74, w: 4.7, h: 0.3, fontFace: F, fontSize: 11, color: SEC, margin: 0 });
}

// ==================== 2 · O MÊS ATÉ AQUI ====================
{
  const s = base('faixa');
  titulo(s, 'VISÃO DO MÊS', 'O mês até aqui',
    `${dataBR(jm.de)} a ${dataBR(jm.ate)} · ${diasCorridos} de ${diasMes} dias corridos`);
  const dCpl = delta(cpl(tMes), cpl(tMesAnt), true);
  card(s, 0.6, 1.52, 2.15, 1.2, 'INVESTIDO', brl(tMes.custo),
       `${num(ritmoVerba * 100, 1)}% do plano de ${brl(PLANO.total)}`);
  card(s, 2.92, 1.52, 2.15, 1.2, 'LEADS', num(tMes.leads),
       `mês anterior: ${num(tMesAnt.leads)}`, BOM);
  card(s, 5.24, 1.52, 2.15, 1.2, 'CUSTO POR LEAD', brl(cpl(tMes), 2),
       `${dCpl.txt} vs. mês anterior`, dCpl.cor);
  card(s, 7.56, 1.52, 1.84, 1.2, 'RITMO', `${num(ritmoVerba / (ritmoTempo || 1) * 100, 0)}%`,
       ritmoVerba > ritmoTempo ? 'acima do previsto' : 'dentro do previsto',
       Math.abs(ritmoVerba - ritmoTempo) < 0.05 ? BOM : RUIM);

  s.addText([
    { text: 'Projeção de fechamento.  ', options: { bold: true, color: TINTA } },
    { text: `No ritmo atual o mês fecha em ${brl(projetado)} de mídia, contra os ${brl(PLANO.total)} `
      + `planejados — uma diferença de ${brl(Math.abs(projetado - PLANO.total))}. `
      + 'A leitura vale como alerta de pacing, não como resultado: entregas de fim de mês e '
      + 'ajustes de orçamento ao longo da semana mudam esse número.', options: { color: SEC } },
  ], { x: 0.6, y: 2.96, w: 8.8, h: 0.62, fontFace: F, fontSize: 10.5, margin: 0, lineSpacing: 14 });

  tabela(s, [{ t: 'PLATAFORMA' }, { t: 'INVESTIDO', a: 'right' }, { t: 'LEADS', a: 'right' },
             { t: 'CPL', a: 'right' }, { t: 'PLANO DO MÊS', a: 'right' }, { t: '% DO PLANO', a: 'right' }],
    ['Google', 'Meta'].map(pl => {
      const t = total(MES.filter(l => l.plataforma === pl));
      const alvo = PLANO.plano.filter(l => l.plataforma === pl).reduce((a, b) => a + b.set, 0);
      return [pl + ' Ads', { t: brl(t.custo, 2), b: true }, num(t.leads), brl(cpl(t), 2),
              brl(alvo), { t: num(t.custo / alvo * 100, 1) + '%', c: pl === 'Google' ? GOOGLE : META }];
    }).concat([[{ t: 'Total', b: true }, { t: brl(tMes.custo, 2), b: true, c: OLIVA },
               { t: num(tMes.leads), b: true }, { t: brl(cpl(tMes), 2), b: true },
               { t: brl(PLANO.total), b: true }, { t: num(ritmoVerba * 100, 1) + '%', b: true }]]),
    { y: 3.68, w: 8.8, colW: [1.9, 1.5, 1.2, 1.3, 1.5, 1.4], rowH: 0.28 });
  s.addNotes('Ritmo = quanto do plano ja foi gasto dividido por quanto do mes ja passou. '
    + '100% significa gastar exatamente no compasso do calendario.');
}

// ==================== 3 · A SEMANA ====================
{
  const s = base('faixa');
  const js = G.janelas.semana, ja = G.janelas.semana_anterior;
  titulo(s, 'VISÃO DA SEMANA', 'A última semana fechada',
    `${dataBR(js.de)} a ${dataBR(js.ate)} · comparada com ${dataBR(ja.de)} a ${dataBR(ja.ate)}`);
  const dInv = delta(tSem.custo, tSemAnt.custo);
  const dLead = delta(tSem.leads, tSemAnt.leads);
  const dC = delta(cpl(tSem), cpl(tSemAnt), true);
  card(s, 0.6, 1.52, 2.82, 1.2, 'INVESTIDO NA SEMANA', brl(tSem.custo, 2),
       `${dInv.txt} vs. semana anterior`, SEC);
  card(s, 3.59, 1.52, 2.82, 1.2, 'LEADS NA SEMANA', num(tSem.leads),
       `${dLead.txt} vs. semana anterior`, dLead.cor);
  card(s, 6.58, 1.52, 2.82, 1.2, 'CUSTO POR LEAD', brl(cpl(tSem), 2),
       `${dC.txt} vs. semana anterior`, dC.cor);

  // as 8 campanhas que mais gastaram na semana
  const antPorNome = {};
  SEM_ANT.forEach(l => { antPorNome[l.campanha] = l; });
  const top = [...SEM].sort((a, b) => b.custo - a.custo).slice(0, 8);
  tabela(s, [{ t: 'CAMPANHA' }, { t: 'PLAT.' }, { t: 'INVESTIDO', a: 'right' },
             { t: 'LEADS', a: 'right' }, { t: 'CPL', a: 'right' }, { t: 'CPL SEM. ANT.', a: 'right' },
             { t: 'VARIAÇÃO', a: 'right' }],
    top.map(l => {
      const a = antPorNome[l.campanha];
      const c = l.leads ? l.custo / l.leads : 0;
      const ca = a && a.leads ? a.custo / a.leads : 0;
      const d = delta(c, ca, true);
      return [l.campanha.length > 40 ? l.campanha.slice(0, 39) + '…' : l.campanha,
              { t: l.plataforma, c: l.plataforma === 'Google' ? GOOGLE : META },
              brl(l.custo, 2), num(l.leads), { t: l.leads ? brl(c, 2) : '—', b: true },
              ca ? brl(ca, 2) : '—', { t: d.txt, c: d.cor }];
    }),
    { y: 2.94, w: 8.8, colW: [3.0, 0.75, 1.15, 0.7, 1.0, 1.1, 1.1], rowH: 0.2, fs: 9 });
  rodape(s, 'As oito campanhas de maior investimento na semana. CPL "—" indica semana sem lead registrado no período.');
}

// ==================== 4 · POR CASA ====================
{
  const s = base('faixa');
  titulo(s, 'RECORTE', 'Resultado por casa', `Mês corrente, ${dataBR(jm.de)} a ${dataBR(jm.ate)}`);
  const porCasa = c => total(MES.filter(l => casaDe(l.campanha) === c));
  const alvoCasa = c => PLANO.casas[c] ? PLANO.casas[c].set : 0;
  tabela(s, [{ t: 'CASA' }, { t: 'INVESTIDO', a: 'right' }, { t: 'LEADS', a: 'right' },
             { t: 'CPL', a: 'right' }, { t: 'PLANO DO MÊS', a: 'right' },
             { t: '% CONSUMIDO', a: 'right' }, { t: 'CPL PREVISTO', a: 'right' }],
    CASAS.map(c => {
      const t = porCasa(c), alvo = alvoCasa(c), prev = PLANO.cpl_base[c] || 0;
      const d = delta(cpl(t), prev, true);
      return [c.replace(' / multi-casa', ''), { t: brl(t.custo, 2), b: true }, num(t.leads),
              { t: t.leads ? brl(cpl(t), 2) : '—', b: true, c: t.leads ? d.cor : SEC },
              brl(alvo), alvo ? num(t.custo / alvo * 100, 1) + '%' : '—', brl(prev, 2)];
    }).concat([[{ t: 'Total', b: true }, { t: brl(tMes.custo, 2), b: true, c: OLIVA },
               { t: num(tMes.leads), b: true }, { t: brl(cpl(tMes), 2), b: true },
               { t: brl(PLANO.total), b: true }, { t: num(ritmoVerba * 100, 1) + '%', b: true },
               { t: brl(PLANO.projecao.cpl, 2), b: true }]]),
    { y: 1.5, w: 8.8, colW: [2.2, 1.3, 0.9, 1.0, 1.35, 1.15, 1.1], rowH: 0.3 });

  s.addChart(p.ChartType.bar, [
    { name: 'Investido no mês', labels: CASAS.map(c => c.replace(' / multi-casa', '')),
      values: CASAS.map(c => porCasa(c).custo) },
    { name: 'Plano do mês', labels: CASAS.map(c => c.replace(' / multi-casa', '')),
      values: CASAS.map(c => alvoCasa(c)) },
  ], {
    x: 0.6, y: 3.5, w: 8.8, h: 1.05, barDir: 'bar', barGrouping: 'clustered',
    chartColors: [OLIVA, SALVIA], showLegend: true, legendPos: 'b',
    legendFontFace: F, legendFontSize: 8, legendColor: SEC,
    catAxisLabelFontFace: F, catAxisLabelFontSize: 8, catAxisLabelColor: SEC,
    valAxisLabelFontFace: F, valAxisLabelFontSize: 7, valAxisLabelColor: SEC,
    valGridLine: { color: LINHA, size: 0.5 }, catGridLine: { style: 'none' },
    plotArea: { fill: { color: CREME } }, chartArea: { fill: { color: CREME } },
  });
  s.addNotes('"CPL previsto" e a base usada no plano de setembro. Casa acima dela precisa de ajuste '
    + 'de criativo ou de segmentacao, nao necessariamente de mais verba.');
}

// ==================== 5 · PONTOS DE ATENÇÃO ====================
{
  const s = base('estreito');
  titulo(s, 'DECISÕES DA SEMANA', 'Pontos de atenção',
    'Levantados automaticamente a partir dos números do período');

  const pontos = [];
  // pacing fora da linha
  if (Math.abs(ritmoVerba - ritmoTempo) > 0.05) {
    const acima = ritmoVerba > ritmoTempo;
    pontos.push(['Ritmo de verba ' + (acima ? 'acima' : 'abaixo') + ' do calendário',
      `${num(ritmoVerba * 100, 1)}% do plano gasto com ${num(ritmoTempo * 100, 1)}% do mês corrido. `
      + `No ritmo atual o mês fecha em ${brl(projetado)} contra ${brl(PLANO.total)} planejados. `
      + (acima ? 'Revisar os tetos diários antes que a verba acabe antes do mês.'
               : 'Verificar se há campanha limitada por entrega, não por orçamento.')]);
  }
  // CPL da semana pior que o previsto no plano
  if (cpl(tSem) > PLANO.projecao.cpl * 1.15) {
    pontos.push(['CPL da semana acima do previsto no plano',
      `${brl(cpl(tSem), 2)} contra ${brl(PLANO.projecao.cpl, 2)} de referência `
      + `(${num((cpl(tSem) / PLANO.projecao.cpl - 1) * 100, 0)}% acima). `
      + 'Olhar primeiro as campanhas que mais gastaram na semana.']);
  }
  // casas fora do CPL base
  CASAS.forEach(c => {
    const t = total(MES.filter(l => casaDe(l.campanha) === c));
    const prev = PLANO.cpl_base[c];
    if (t.leads >= 5 && prev && cpl(t) > prev * 1.25) {
      pontos.push([`${c.replace(' / multi-casa', '')} acima do CPL de referência`,
        `${brl(cpl(t), 2)} no mês contra ${brl(prev, 2)} previstos, com ${num(t.leads)} leads. `
        + 'Revisar criativo e segmentação antes de mexer em verba.']);
    }
  });
  // campanhas gastando sem lead na semana
  const secas = SEM.filter(l => l.custo > 150 && l.leads < 1)
                   .sort((a, b) => b.custo - a.custo).slice(0, 3);
  secas.forEach(l => pontos.push([`${l.campanha} sem lead na semana`,
    `Gastou ${brl(l.custo, 2)} entre ${dataBR(G.janelas.semana.de)} e ${dataBR(G.janelas.semana.ate)} `
    + 'sem registrar conversão. Verificar rastreamento antes de concluir que é performance.']));

  if (!pontos.length) {
    pontos.push(['Nenhum desvio relevante no período',
      'Ritmo de verba, CPL da semana e CPL por casa estão dentro das faixas do plano. '
      + 'Manter a configuração atual e reavaliar na próxima terça.']);
  }

  let y = 1.42;
  pontos.slice(0, 4).forEach(([t, txt], i) => {
    s.addShape(p.ShapeType.ellipse, { x: 0.6, y: y + 0.02, w: 0.34, h: 0.34, fill: { color: SALVIA } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.02, w: 0.34, h: 0.34, fontFace: F, fontSize: 13,
                               bold: true, color: TINTA, align: 'center', valign: 'middle', margin: 0 });
    s.addText(t, { x: 1.1, y: y + 0.02, w: 6.9, h: 0.24, fontFace: F, fontSize: 12, bold: true,
                   color: TINTA, margin: 0 });
    s.addText(txt, { x: 1.1, y: y + 0.28, w: 6.9, h: 0.62, fontFace: F, fontSize: 10, color: SEC,
                     margin: 0, lineSpacing: 13 });
    y += 0.95;
  });
  s.addNotes('Os pontos saem de regras fixas sobre os numeros do periodo: pacing fora de +-5%, '
    + 'CPL da semana 15% acima da referencia, casa 25% acima do CPL base e campanha com gasto '
    + 'relevante e zero lead. Vale conferir cada um antes da reuniao.');
}

const saida = arg('--saida', path.join(AQUI,
  `Acompanhamento-DiTerra-${G.janelas.semana.de}-a-${G.janelas.semana.ate}.pptx`));
p.writeFile({ fileName: saida }).then(f => console.log('gerado:', f));
