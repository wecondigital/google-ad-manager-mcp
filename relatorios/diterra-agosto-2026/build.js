const PptxGenJS = require('pptxgenjs');
const { meta, google, total } = require('./dados');

// ---------------------------------------------------------------- identidade
const INK    = '161F28'; // azul-noite institucional Wecon
const PURPLE = '8A65C4'; // roxo Wecon
const SAGE   = 'C2CA97'; // verde Wecon
const CREAM  = 'EDEBDC'; // off-white Wecon
const WHITE  = 'FFFFFF';
const MUTED  = '5E6874'; // cinza derivado do INK, para legendas
const LINE   = 'DAD7C6'; // divisoria sobre fundo creme
const NAVY   = '262749'; // azul da marca Di Terra

const SERIF = 'Cambria';
const SANS  = 'Calibri';

const W = 13.333, H = 7.5;
const M = 0.75;              // margem lateral
const LOGO_W = 1.15, LOGO_H = 0.163;

// ---------------------------------------------------------------- formatacao
const nf = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const brl = (v, d = 2) => 'R$ ' + nf(v, d);
const brlK = (v) => 'R$ ' + nf(v, 0);
const pct = (v, d = 2) => nf(v, d) + '%';
const delta = (a, b) => ((a - b) / b) * 100;                       // a = atual, b = anterior
const dTxt = (v, d = 1) => (v >= 0 ? '▲ +' : '▼ ') + nf(v, d) + '%';

// ---------------------------------------------------------------- primitivas
// tone: 'good' (evolucao favoravel) | 'watch' (ponto de atencao) | 'neutral'
// (variacao que e decisao de alocacao, nao performance)
const TONES = {
  good:    { fill: SAGE,     text: INK },
  watch:   { fill: PURPLE,   text: WHITE },
  neutral: { fill: 'E3E0CE', text: INK },
};

function chip(slide, { x, y, w = 1.02, h = 0.28, value, tone = 'neutral', size = 11 }) {
  const t = TONES[tone];
  slide.addShape('roundRect', {
    x, y, w, h, rectRadius: 0.13,
    fill: { color: t.fill }, line: { type: 'none' },
  });
  slide.addText(dTxt(value), {
    x, y, w, h, isTextBox: true, margin: 0,
    align: 'center', valign: 'middle',
    fontSize: size, bold: true, fontFace: SANS,
    color: t.text,
  });
}

function statCard(slide, o) {
  const { x, y, w, h, label, value, sub, deltaVal, tone, valueSize = 30, dark = false } = o;
  slide.addShape('roundRect', {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: dark ? '1E2833' : WHITE },
    line: dark ? { type: 'none' } : { color: LINE, width: 0.75 },
    shadow: dark ? undefined : { type: 'outer', color: 'B9B4A0', blur: 6, offset: 1, angle: 90, opacity: 0.22 },
  });
  slide.addText(label.toUpperCase(), {
    x: x + 0.24, y: y + 0.15, w: w - 0.48, h: 0.24, isTextBox: true, margin: 0,
    fontSize: 9.5, bold: true, charSpacing: 1.1, fontFace: SANS,
    color: dark ? SAGE : MUTED, valign: 'middle',
  });
  slide.addText(value, {
    x: x + 0.24, y: y + 0.40, w: w - 0.48, h: 0.52, isTextBox: true, margin: 0,
    fontSize: valueSize, bold: true, fontFace: SERIF,
    color: dark ? WHITE : INK, valign: 'middle',
  });
  if (deltaVal !== undefined && deltaVal !== null) {
    chip(slide, { x: x + 0.24, y: y + h - 0.46, w: 1.0, h: 0.28, value: deltaVal, tone, size: 10.5 });
  }
  if (sub) {
    slide.addText(sub, {
      x: x + 1.34, y: y + h - 0.46, w: w - 1.58, h: 0.28, isTextBox: true, margin: 0,
      fontSize: 10, fontFace: SANS, color: dark ? 'A9B2BC' : MUTED, valign: 'middle',
    });
  }
}

function slideTitle(slide, kicker, title, dark = false) {
  slide.addShape('ellipse', {
    x: M, y: 0.52, w: 0.115, h: 0.115, fill: { color: PURPLE }, line: { type: 'none' },
  });
  slide.addText(kicker.toUpperCase(), {
    x: M + 0.24, y: 0.42, w: 8.5, h: 0.34, isTextBox: true, margin: 0,
    fontSize: 10.5, bold: true, charSpacing: 1.6, fontFace: SANS,
    color: dark ? SAGE : MUTED, valign: 'middle',
  });
  slide.addText(title, {
    x: M, y: 0.80, w: W - 2 * M - 1.6, h: 0.66, isTextBox: true, margin: 0,
    fontSize: 32, bold: true, fontFace: SERIF, color: dark ? CREAM : INK, valign: 'middle',
  });
}

function footer(slide, n, dark = false) {
  slide.addImage({
    path: dark ? 'assets/wecon-white.png' : 'assets/wecon-dark.png',
    x: W - M - LOGO_W, y: H - 0.56, w: LOGO_W, h: LOGO_H,
  });
  slide.addText(`Di Terrá · Relatório de mídia · Agosto 2026     ${n}`, {
    x: M, y: H - 0.62, w: 7.6, h: 0.28, isTextBox: true, margin: 0,
    fontSize: 9, fontFace: SANS, color: dark ? '7B8794' : MUTED, valign: 'middle',
  });
}

const pres = new PptxGenJS();
pres.defineLayout({ name: 'WECON', width: W, height: H });
pres.layout = 'WECON';
pres.author = 'Wecon Agency';
pres.company = 'Wecon Agency';
pres.title = 'Di Terrá — Relatório de Mídia — Agosto 2026';

// =========================================================== 1. CAPA
{
  const s = pres.addSlide();
  s.background = { color: INK };

  // grafismo de apoio: brise em tom sobre tom, no canto direito
  for (let i = 0; i < 7; i++) {
    s.addShape('roundRect', {
      x: 9.55 + i * 0.52, y: 1.15, w: 0.235, h: 5.2, rectRadius: 0.11,
      fill: { color: i % 2 === 0 ? PURPLE : SAGE, transparency: 88 }, line: { type: 'none' },
    });
  }

  // selo da marca do cliente
  s.addShape('roundRect', {
    x: M, y: 1.38, w: 2.34, h: 0.86, rectRadius: 0.08,
    fill: { color: NAVY }, line: { color: '3B3C63', width: 0.75 },
  });
  s.addText('DI TERRÁ', {
    x: M, y: 1.38, w: 2.34, h: 0.86, isTextBox: true, margin: 0,
    align: 'center', valign: 'middle',
    fontSize: 21, fontFace: SERIF, color: WHITE, charSpacing: 3.2,
  });

  s.addText('Relatório de Mídia Paga', {
    x: M, y: 2.72, w: 8.3, h: 0.95, isTextBox: true, margin: 0,
    fontSize: 46, bold: true, fontFace: SERIF, color: CREAM, valign: 'middle',
  });
  s.addText('Agosto de 2026', {
    x: M, y: 3.66, w: 8.3, h: 0.62, isTextBox: true, margin: 0,
    fontSize: 27, fontFace: SERIF, color: PURPLE, valign: 'middle',
  });
  s.addText('Google Ads e Meta Ads  ·  comparativo com julho de 2026', {
    x: M, y: 4.34, w: 8.3, h: 0.34, isTextBox: true, margin: 0,
    fontSize: 14, fontFace: SANS, color: 'A9B2BC', valign: 'middle',
  });

  // resumo de tres numeros
  const head = [
    { k: 'Investimento', v: brlK(total.ago.invest), d: delta(total.ago.invest, total.jul.invest) },
    { k: 'Leads', v: nf(total.ago.leads, 0), d: delta(total.ago.leads, total.jul.leads) },
    { k: 'Custo por lead', v: brl(total.ago.cpl), d: delta(total.ago.cpl, total.jul.cpl) },
  ];
  head.forEach((it, i) => {
    const x = M + i * 2.72;
    s.addText(it.k.toUpperCase(), {
      x, y: 5.28, w: 2.5, h: 0.26, isTextBox: true, margin: 0,
      fontSize: 9.5, bold: true, charSpacing: 1.1, fontFace: SANS, color: SAGE, valign: 'middle',
    });
    s.addText(it.v, {
      x, y: 5.54, w: 2.5, h: 0.52, isTextBox: true, margin: 0,
      fontSize: 25, bold: true, fontFace: SERIF, color: WHITE, valign: 'middle',
    });
    s.addText(dTxt(it.d) + ' vs. julho', {
      x, y: 6.08, w: 2.5, h: 0.28, isTextBox: true, margin: 0,
      fontSize: 10.5, bold: true, fontFace: SANS, color: PURPLE, valign: 'middle',
    });
  });

  s.addImage({ path: 'assets/wecon-white.png', x: M, y: 6.72, w: 1.62, h: 0.23 });
  s.addText('Elaborado em 02/09/2026', {
    x: W - M - 3.2, y: 6.70, w: 3.2, h: 0.28, isTextBox: true, margin: 0,
    align: 'right', fontSize: 9.5, fontFace: SANS, color: '7B8794', valign: 'middle',
  });
  s.addNotes('Investimento total de R$ 51.565 em agosto (-2,8% vs. julho), 1.472 leads (+4,3%) e CPL de R$ 35,04 (-6,8%).');
}

// =========================================================== 2. PANORAMA
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  slideTitle(s, 'Visão geral', 'Menos verba, mais leads');

  const cards = [
    { label: 'Investimento', value: brlK(total.ago.invest), sub: `jul: ${brlK(total.jul.invest)}`,
      d: delta(total.ago.invest, total.jul.invest), tone: 'neutral' },
    { label: 'Leads gerados', value: nf(total.ago.leads, 0), sub: `jul: ${nf(total.jul.leads, 0)}`,
      d: delta(total.ago.leads, total.jul.leads), tone: 'good' },
    { label: 'Custo por lead', value: brl(total.ago.cpl), sub: `jul: ${brl(total.jul.cpl)}`,
      d: delta(total.ago.cpl, total.jul.cpl), tone: 'good' },
    { label: 'Cliques', value: nf(total.ago.clicks), sub: `jul: ${nf(total.jul.clicks)}`,
      d: delta(total.ago.clicks, total.jul.clicks), tone: 'good' },
  ];
  const cw = (W - 2 * M - 3 * 0.28) / 4;
  cards.forEach((c, i) => statCard(s, {
    x: M + i * (cw + 0.28), y: 1.66, w: cw, h: 1.52,
    label: c.label, value: c.value, sub: c.sub, deltaVal: c.d, tone: c.tone, valueSize: 27,
  }));

  // leitura em destaque
  s.addShape('roundRect', {
    x: M, y: 3.44, w: W - 2 * M, h: 1.02, rectRadius: 0.07,
    fill: { color: INK }, line: { type: 'none' },
  });
  s.addText([
    { text: 'A conta ficou mais eficiente. ', options: { bold: true, color: SAGE } },
    { text: 'Agosto entregou 61 leads a mais que julho gastando R$ 1.465 a menos. Cada lead custou R$ 2,55 mais barato — uma economia equivalente a R$ 3.757 sobre o volume do mês.', options: { color: 'E4E7EA' } },
  ], {
    x: M + 0.34, y: 3.44, w: W - 2 * M - 0.68, h: 1.02, isTextBox: true, margin: 0,
    fontSize: 14, fontFace: SANS, valign: 'middle', lineSpacingMultiple: 1.18,
  });

  // participacao por canal
  s.addText('Participação por canal em agosto', {
    x: M, y: 4.68, w: 6, h: 0.32, isTextBox: true, margin: 0,
    fontSize: 13, bold: true, fontFace: SERIF, color: INK, valign: 'middle',
  });

  const bars = [
    { t: 'Investimento', metaV: meta.ago.invest, googleV: google.ago.invest, fmt: (v) => brlK(v) },
    { t: 'Leads',        metaV: meta.ago.leads,  googleV: google.ago.leads,  fmt: (v) => nf(v, 0) },
  ];
  bars.forEach((b, i) => {
    const y = 5.10 + i * 0.82;
    const totalV = b.metaV + b.googleV;
    const share = b.metaV / totalV;
    const barW = W - 2 * M - 1.9;
    s.addText(b.t, {
      x: M, y, w: 1.75, h: 0.44, isTextBox: true, margin: 0,
      fontSize: 12, bold: true, fontFace: SANS, color: INK, valign: 'middle',
    });
    s.addShape('roundRect', {
      x: M + 1.9, y: y + 0.06, w: barW * share, h: 0.32, rectRadius: 0.05,
      fill: { color: PURPLE }, line: { type: 'none' },
    });
    s.addShape('roundRect', {
      x: M + 1.9 + barW * share + 0.05, y: y + 0.06, w: barW * (1 - share) - 0.05, h: 0.32, rectRadius: 0.05,
      fill: { color: SAGE }, line: { type: 'none' },
    });
    s.addText(`Meta  ${nf(share * 100, 1)}%  ·  ${b.fmt(b.metaV)}`, {
      x: M + 2.02, y: y + 0.06, w: barW * share - 0.24, h: 0.32, isTextBox: true, margin: 0,
      fontSize: 10.5, bold: true, fontFace: SANS, color: WHITE, valign: 'middle',
    });
    s.addText(`Google  ${nf((1 - share) * 100, 1)}%  ·  ${b.fmt(b.googleV)}`, {
      x: M + 2.02 + barW * share, y: y + 0.06, w: barW * (1 - share) - 0.12, h: 0.32, isTextBox: true, margin: 0,
      fontSize: 10.5, bold: true, fontFace: SANS, color: INK, valign: 'middle',
    });
  });

  s.addText('Chip verde: evolução favorável. Chip roxo: ponto de atenção. Chip cinza: variação de alocação, sem leitura de performance.', {
    x: M, y: 6.50, w: 7.5, h: 0.26, isTextBox: true, margin: 0,
    fontSize: 9, italic: true, fontFace: SANS, color: MUTED, valign: 'middle',
  });
  footer(s, '02');
  s.addNotes('Os dois canais ficaram proporcionais: Meta responde por 71,8% da verba e 71,4% dos leads.');
}

// =========================================================== 3. COMPARATIVO
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  slideTitle(s, 'Agosto x Julho', 'Comparativo por canal');

  const th = { fill: INK, color: CREAM, bold: true, fontSize: 11, fontFace: SANS, valign: 'middle', margin: [6, 8, 6, 8] };
  const td = { fill: WHITE, color: INK, fontSize: 11.5, fontFace: SANS, valign: 'middle', margin: [7, 8, 7, 8] };
  const tdB = Object.assign({}, td, { bold: true, fill: 'F5F3E8' });

  const row = (nome, j, a, base) => {
    const dv = delta(a, j);
    const good = base === 'cpl' ? dv < 0 : dv > 0;
    return [dv, good];
  };
  const cell = (txt, opt) => ({ text: txt, options: Object.assign({}, opt) });
  const TONE_COLOR = { good: '4A6B2E', watch: PURPLE, neutral: MUTED };
  const dCell = (dv, tone, bold) => ({
    text: dTxt(dv),
    options: Object.assign({}, bold ? tdB : td, { bold: true, color: TONE_COLOR[tone], align: 'center' }),
  });

  const mk = (nome, jI, aI, jL, aL, strong) => {
    const base = strong ? tdB : td;
    const jC = jI / jL, aC = aI / aL;
    const [dI] = row(nome, jI, aI, 'invest');
    const [dL, gL] = row(nome, jL, aL, 'leads');
    const [dC, gC] = row(nome, jC, aC, 'cpl');
    return [
      cell(nome, Object.assign({}, base, { bold: true, align: 'left' })),
      cell(brlK(jI), Object.assign({}, base, { align: 'right' })),
      cell(brlK(aI), Object.assign({}, base, { align: 'right' })),
      dCell(dI, 'neutral', strong),
      cell(nf(jL, 0), Object.assign({}, base, { align: 'right' })),
      cell(nf(aL, 0), Object.assign({}, base, { align: 'right' })),
      dCell(dL, gL ? 'good' : 'watch', strong),
      cell(brl(jC), Object.assign({}, base, { align: 'right' })),
      cell(brl(aC), Object.assign({}, base, { align: 'right' })),
      dCell(dC, gC ? 'good' : 'watch', strong),
    ];
  };

  const header = ['Canal', 'Invest. jul', 'Invest. ago', 'Δ', 'Leads jul', 'Leads ago', 'Δ', 'CPL jul', 'CPL ago', 'Δ']
    .map((t, i) => cell(t, Object.assign({}, th, { align: i === 0 ? 'left' : (i % 3 === 0 && i > 0 ? 'center' : 'right') })));

  s.addTable([
    header,
    mk('Meta Ads', meta.jul.invest, meta.ago.invest, meta.jul.leads, meta.ago.leads, false),
    mk('Google Ads', google.jul.invest, google.ago.invest, google.jul.leads, google.ago.leads, false),
    mk('Total', total.jul.invest, total.ago.invest, total.jul.leads, total.ago.leads, true),
  ], {
    x: M, y: 1.64, w: W - 2 * M,
    colW: [2.34, 1.16, 1.16, 0.92, 1.00, 1.00, 0.98, 1.02, 1.02, 0.98],
    border: { type: 'solid', color: LINE, pt: 0.75 },
    rowH: 0.42,
  });

  s.addChart(pres.ChartType.bar, [
    { name: 'Julho',  labels: ['Meta Ads', 'Google Ads', 'Total'], values: [meta.jul.leads, Math.round(google.jul.leads), Math.round(total.jul.leads)] },
    { name: 'Agosto', labels: ['Meta Ads', 'Google Ads', 'Total'], values: [meta.ago.leads, Math.round(google.ago.leads), Math.round(total.ago.leads)] },
  ], {
    x: M, y: 3.58, w: 6.35, h: 2.92,
    barDir: 'col', barGapWidthPct: 55,
    chartColors: [SAGE, PURPLE],
    dataLabelFormatCode: '[$-416]#,##0', showTitle: true, title: 'Leads por canal', titleColor: INK, titleFontSize: 13, titleFontFace: SERIF, titleBold: true,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: INK, dataLabelFontSize: 10, dataLabelFontBold: true, dataLabelFontFace: SANS,
    showLegend: true, legendPos: 'b', legendColor: MUTED, legendFontSize: 10, legendFontFace: SANS,
    catAxisLabelColor: INK, catAxisLabelFontSize: 10.5, catAxisLabelFontFace: SANS,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 9.5, valAxisLabelFontFace: SANS, valAxisMinVal: 0, valAxisMaxVal: 1750,
    valGridLine: { color: LINE, size: 0.75 }, catGridLine: { style: 'none' },
    plotArea: { fill: { color: CREAM } }, chartArea: { fill: { color: CREAM } },
  });

  s.addChart(pres.ChartType.bar, [
    { name: 'Julho',  labels: ['Meta Ads', 'Google Ads', 'Total'], values: [+(meta.jul.invest / meta.jul.leads).toFixed(2), +(google.jul.invest / google.jul.leads).toFixed(2), +total.jul.cpl.toFixed(2)] },
    { name: 'Agosto', labels: ['Meta Ads', 'Google Ads', 'Total'], values: [+(meta.ago.invest / meta.ago.leads).toFixed(2), +(google.ago.invest / google.ago.leads).toFixed(2), +total.ago.cpl.toFixed(2)] },
  ], {
    x: M + 6.55, y: 3.58, w: 5.28, h: 2.92,
    barDir: 'col', barGapWidthPct: 55,
    chartColors: [SAGE, PURPLE],
    dataLabelFormatCode: '[$-416]#,##0.00', showTitle: true, title: 'Custo por lead (R$)', titleColor: INK, titleFontSize: 13, titleFontFace: SERIF, titleBold: true,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: INK, dataLabelFontSize: 10, dataLabelFontBold: true, dataLabelFontFace: SANS,
    showLegend: true, legendPos: 'b', legendColor: MUTED, legendFontSize: 10, legendFontFace: SANS,
    catAxisLabelColor: INK, catAxisLabelFontSize: 10.5, catAxisLabelFontFace: SANS,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 9.5, valAxisLabelFontFace: SANS, valAxisMinVal: 0, valAxisMaxVal: 48,
    valGridLine: { color: LINE, size: 0.75 }, catGridLine: { style: 'none' },
    plotArea: { fill: { color: CREAM } }, chartArea: { fill: { color: CREAM } },
  });

  footer(s, '03');
  s.addNotes('A queda de leads do Google acompanha a queda de verba (-17,7%); o CPL do canal ficou praticamente estável.');
}

// =========================================================== 4. META ADS
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  slideTitle(s, 'Meta Ads', 'O canal que puxou o mês');

  const k = [
    { label: 'Investimento', value: brlK(meta.ago.invest), d: delta(meta.ago.invest, meta.jul.invest), tone: 'neutral' },
    { label: 'Leads', value: nf(meta.ago.leads), d: delta(meta.ago.leads, meta.jul.leads), tone: 'good' },
    { label: 'Custo por lead', value: brl(meta.ago.invest / meta.ago.leads), d: delta(meta.ago.invest / meta.ago.leads, meta.jul.invest / meta.jul.leads), tone: 'good' },
    { label: 'CTR', value: pct(meta.ago.ctr), d: delta(meta.ago.ctr, meta.jul.ctr), tone: 'good' },
    { label: 'Alcance', value: nf(meta.ago.reach), d: delta(meta.ago.reach, meta.jul.reach), tone: 'watch' },
    { label: 'Frequência', value: nf(meta.ago.freq, 2), d: delta(meta.ago.freq, meta.jul.freq), tone: 'watch' },
  ];
  const kw = (W - 2 * M - 5 * 0.2) / 6;
  k.forEach((c, i) => {
    const x = M + i * (kw + 0.2);
    s.addShape('roundRect', {
      x, y: 1.64, w: kw, h: 1.30, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addText(c.label.toUpperCase(), {
      x: x + 0.16, y: 1.76, w: kw - 0.32, h: 0.24, isTextBox: true, margin: 0,
      fontSize: 9, bold: true, charSpacing: 0.8, fontFace: SANS, color: MUTED, valign: 'middle',
    });
    s.addText(c.value, {
      x: x + 0.16, y: 2.02, w: kw - 0.32, h: 0.46, isTextBox: true, margin: 0,
      fontSize: 20, bold: true, fontFace: SERIF, color: INK, valign: 'middle',
    });
    chip(s, { x: x + 0.16, y: 2.53, w: 0.98, h: 0.27, value: c.d, tone: c.tone, size: 10 });
  });

  const tipos = Object.keys(meta.tipos);
  s.addChart(pres.ChartType.bar, [
    { name: 'Julho',  labels: tipos, values: tipos.map((t) => meta.tipos[t].jul) },
    { name: 'Agosto', labels: tipos, values: tipos.map((t) => meta.tipos[t].ago) },
  ], {
    x: M, y: 3.20, w: 6.9, h: 3.20,
    barDir: 'col', barGapWidthPct: 60,
    chartColors: [SAGE, PURPLE],
    dataLabelFormatCode: '[$-416]#,##0', showTitle: true, title: 'Leads do Meta por tipo de conversão', titleColor: INK, titleFontSize: 13, titleFontFace: SERIF, titleBold: true,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: INK, dataLabelFontSize: 10.5, dataLabelFontBold: true, dataLabelFontFace: SANS,
    showLegend: true, legendPos: 'b', legendColor: MUTED, legendFontSize: 10, legendFontFace: SANS,
    catAxisLabelColor: INK, catAxisLabelFontSize: 10, catAxisLabelFontFace: SANS,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 9.5, valAxisLabelFontFace: SANS, valAxisMinVal: 0, valAxisMaxVal: 850,
    valGridLine: { color: LINE, size: 0.75 }, catGridLine: { style: 'none' },
    plotArea: { fill: { color: CREAM } }, chartArea: { fill: { color: CREAM } },
  });

  const notas = [
    ['Formulário nativo dobrou.', 'De 366 para 711 leads (+94%). O cluster “Social > Querência > Destination” sozinho trouxe 515 leads a R$ 9,37 usando 13% da verba do canal.'],
    ['Site e WhatsApp recuaram.', 'Formulário no site caiu 41% (413 → 245) e conversas no WhatsApp, 25% (127 → 95). A troca de mix explica quase todo o ganho de CPL.'],
    ['Público começou a saturar.', 'Alcance caiu 22,8% e a frequência subiu de 2,85 para 3,40. O CTR melhorou 15%, então o criativo funciona — falta público novo.'],
  ];
  notas.forEach((n, i) => {
    const y = 3.34 + i * 1.06;
    s.addShape('roundRect', {
      x: M + 7.15, y, w: W - M - (M + 7.15), h: 0.92, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addText([
      { text: n[0] + ' ', options: { bold: true, color: INK } },
      { text: n[1], options: { color: MUTED } },
    ], {
      x: M + 7.35, y: y + 0.06, w: W - M - (M + 7.15) - 0.4, h: 0.80, isTextBox: true, margin: 0,
      fontSize: 11, fontFace: SANS, valign: 'middle', lineSpacingMultiple: 1.12,
    });
  });

  footer(s, '04');
  s.addNotes('Ganho de CPL do Meta veio de mudança de mix (lead form nativo), não de melhora uniforme do canal.');
}

// =========================================================== 5. GOOGLE ADS
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  slideTitle(s, 'Google Ads', 'Menos verba, mesma eficiência');

  const k = [
    { label: 'Investimento', value: brlK(google.ago.invest), d: delta(google.ago.invest, google.jul.invest), tone: 'neutral' },
    { label: 'Leads', value: nf(google.ago.leads, 0), d: delta(google.ago.leads, google.jul.leads), tone: 'watch' },
    { label: 'Custo por lead', value: brl(google.ago.invest / google.ago.leads), d: delta(google.ago.invest / google.ago.leads, google.jul.invest / google.jul.leads), tone: 'good' },
    { label: 'CTR', value: pct(google.ago.ctr), d: delta(google.ago.ctr, google.jul.ctr), tone: 'watch' },
    { label: 'CPC médio', value: brl(google.ago.cpc), d: delta(google.ago.cpc, google.jul.cpc), tone: 'good' },
    { label: 'Impression share', value: pct(google.ago.is, 1), d: delta(google.ago.is, google.jul.is), tone: 'neutral' },
  ];
  const kw = (W - 2 * M - 5 * 0.2) / 6;
  k.forEach((c, i) => {
    const x = M + i * (kw + 0.2);
    s.addShape('roundRect', {
      x, y: 1.64, w: kw, h: 1.30, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addText(c.label.toUpperCase(), {
      x: x + 0.16, y: 1.76, w: kw - 0.32, h: 0.24, isTextBox: true, margin: 0,
      fontSize: 9, bold: true, charSpacing: 0.8, fontFace: SANS, color: MUTED, valign: 'middle',
    });
    s.addText(c.value, {
      x: x + 0.16, y: 2.02, w: kw - 0.32, h: 0.46, isTextBox: true, margin: 0,
      fontSize: 20, bold: true, fontFace: SERIF, color: INK, valign: 'middle',
    });
    chip(s, { x: x + 0.16, y: 2.53, w: 0.98, h: 0.27, value: c.d, tone: c.tone, size: 10 });
  });

  // 8 campanhas de maior verba, ordenadas por CPL crescente: no grafico de barras
  // horizontais o PowerPoint plota a 1a categoria embaixo, entao o CPL mais alto
  // aparece no topo e a leitura vira um ranking.
  const top = google.campanhas.slice(0, 8).slice().sort((a, b) => a.cpl - b.cpl);
  s.addChart(pres.ChartType.bar, [
    { name: 'Custo por lead (R$)', labels: top.map((c) => c.nome.replace('SEARCH | ', '').replace(' — Performance Max', ' (PMax)')), values: top.map((c) => +c.cpl.toFixed(2)) },
  ], {
    x: M, y: 3.22, w: 7.3, h: 3.20,
    barDir: 'bar', barGapWidthPct: 40,
    chartColors: [PURPLE],
    dataLabelFormatCode: '[$-416]#,##0.00', showTitle: true, title: 'Custo por lead por campanha — agosto', titleColor: INK, titleFontSize: 13, titleFontFace: SERIF, titleBold: true,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: INK, dataLabelFontSize: 9.5, dataLabelFontBold: true, dataLabelFontFace: SANS,
    showLegend: false,
    catAxisLabelColor: INK, catAxisLabelFontSize: 9, catAxisLabelFontFace: SANS,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 9, valAxisLabelFontFace: SANS, valAxisMinVal: 0, valAxisMaxVal: 360,
    valGridLine: { color: LINE, size: 0.75 }, catGridLine: { style: 'none' },
    plotArea: { fill: { color: CREAM } }, chartArea: { fill: { color: CREAM } },
  });

  const pmaxInv = google.campanhas.filter((c) => c.tipo === 'PMax').reduce((a, c) => a + c.invest, 0);
  const pmaxLd = google.campanhas.filter((c) => c.tipo === 'PMax').reduce((a, c) => a + c.leads, 0);
  const caras = google.campanhas.filter((c) => ['SEARCH | CASAMENTO | QUERÊNCIA | SP', 'SEARCH | BODAS | TERRÁ', 'SEARCH | PALACETE MONTE ALEGRE'].includes(c.nome));
  const carasInv = caras.reduce((a, c) => a + c.invest, 0);
  const carasLd = caras.reduce((a, c) => a + c.leads, 0);

  const blocos = [
    { t: 'Performance Max carrega a conta', c: SAGE,
      d: `${nf(pmaxInv / google.ago.invest * 100, 1)}% da verba → ${nf(pmaxLd / google.ago.leads * 100, 1)}% dos leads. Corporativo PMax a R$ 3,97 e Casamento PMax a R$ 23,10.` },
    { t: 'Search de casamento está caro', c: PURPLE,
      d: `Querência SP, Bodas e Palacete somam ${nf(carasInv / google.ago.invest * 100, 1)}% da verba e apenas ${nf(carasLd / google.ago.leads * 100, 1)}% dos leads, com CPL de R$ 138 a R$ 304.` },
    { t: 'Palacete: paga caro pelo que já domina', c: PURPLE,
      d: 'Impression share de 62,2% — o maior da conta — e CPL de R$ 304. Ampliar cobertura ali custa muito e rende pouco.' },
  ];
  blocos.forEach((b, i) => {
    const y = 3.28 + i * 1.10;
    s.addShape('roundRect', {
      x: M + 7.55, y, w: W - M - (M + 7.55), h: 1.02, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addShape('ellipse', { x: M + 7.74, y: y + 0.19, w: 0.13, h: 0.13, fill: { color: b.c }, line: { type: 'none' } });
    s.addText(b.t, {
      x: M + 7.95, y: y + 0.10, w: W - M - (M + 7.95) - 0.18, h: 0.30, isTextBox: true, margin: 0,
      fontSize: 11.5, bold: true, fontFace: SANS, color: INK, valign: 'middle',
    });
    s.addText(b.d, {
      x: M + 7.95, y: y + 0.38, w: W - M - (M + 7.95) - 0.18, h: 0.58, isTextBox: true, margin: 0,
      fontSize: 10, fontFace: SANS, color: MUTED, valign: 'top', lineSpacingMultiple: 1.1,
    });
  });

  footer(s, '05');
  s.addNotes('As 421 conversões do Google são 100% ações de lead (formulário do site e WhatsApp do site) — não há conversão soft inflando o número.');
}

// =========================================================== 6. EFICIENCIA
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  slideTitle(s, 'Eficiência', 'Onde o lead sai barato e onde sai caro');

  const destaques = [
    { n: 'Corporativo — PMax', ch: 'Google', i: 912.34, l: 230, c: 3.97 },
    { n: 'Social > Querência > Destination', ch: 'Meta', i: 4828.08, l: 515, c: 9.37 },
    { n: 'Social > Debutantes > Leads form', ch: 'Meta', i: 1195.12, l: 110, c: 10.86 },
    { n: 'Casamento — PMax', ch: 'Google', i: 1824.65, l: 79, c: 23.10 },
    { n: '[Leads Ads] Casamentos (form)', ch: 'Meta', i: 1840.18, l: 75, c: 24.54 },
  ];
  const ofensores = [
    { n: 'SEARCH | Palacete Monte Alegre', ch: 'Google', i: 607.99, l: 2, c: 304.00 },
    { n: 'Corporativo > Institucional', ch: 'Meta', i: 2057.57, l: 11, c: 187.05 },
    { n: 'CASAMENTOS | Terrá | Site', ch: 'Meta', i: 965.34, l: 6, c: 160.89 },
    { n: 'SEARCH | Casamento | Querência SP', ch: 'Google', i: 3298.24, l: 22, c: 149.92 },
    { n: 'SEARCH | Bodas | Terrá', ch: 'Google', i: 3039.85, l: 22, c: 138.17 },
  ];

  const colW = (W - 2 * M - 0.4) / 2;
  [[destaques, 'Puxando o resultado', SAGE, M], [ofensores, 'Pesando no custo', PURPLE, M + colW + 0.4]].forEach(([lista, titulo, cor, x]) => {
    s.addShape('ellipse', { x, y: 1.76, w: 0.14, h: 0.14, fill: { color: cor }, line: { type: 'none' } });
    s.addText(titulo, {
      x: x + 0.26, y: 1.66, w: colW - 0.26, h: 0.34, isTextBox: true, margin: 0,
      fontSize: 15, bold: true, fontFace: SERIF, color: INK, valign: 'middle',
    });
    lista.forEach((it, i) => {
      const y = 2.14 + i * 0.84;
      s.addShape('roundRect', {
        x, y, w: colW, h: 0.74, rectRadius: 0.06,
        fill: { color: WHITE }, line: { color: LINE, width: 0.75 },
      });
      s.addText(it.n, {
        x: x + 0.22, y: y + 0.08, w: colW - 1.85, h: 0.28, isTextBox: true, margin: 0,
        fontSize: 11.5, bold: true, fontFace: SANS, color: INK, valign: 'middle',
      });
      s.addText(`${it.ch}  ·  ${brlK(it.i)}  ·  ${nf(it.l)} leads`, {
        x: x + 0.22, y: y + 0.38, w: colW - 1.85, h: 0.26, isTextBox: true, margin: 0,
        fontSize: 10, fontFace: SANS, color: MUTED, valign: 'middle',
      });
      s.addText(brl(it.c), {
        x: x + colW - 1.72, y: y + 0.10, w: 1.5, h: 0.34, isTextBox: true, margin: 0,
        align: 'right', fontSize: 17, bold: true, fontFace: SERIF, color: cor === SAGE ? '4A6B2E' : PURPLE, valign: 'middle',
      });
      s.addText('por lead', {
        x: x + colW - 1.72, y: y + 0.42, w: 1.5, h: 0.22, isTextBox: true, margin: 0,
        align: 'right', fontSize: 9, fontFace: SANS, color: MUTED, valign: 'middle',
      });
    });
  });

  s.addText('Do topo à base desta lista o custo por lead varia 77 vezes. Realocar verba dentro da própria conta é a alavanca mais barata para setembro.', {
    x: M, y: 6.36, w: W - 2 * M - 1.7, h: 0.44, isTextBox: true, margin: 0,
    fontSize: 11.5, italic: true, fontFace: SANS, color: INK, valign: 'middle',
  });
  footer(s, '06');
  s.addNotes('R$ 304,00 vs R$ 3,97 = 77 vezes. Campanhas de resultado misto (CORPORATIVO | LP e Posts) ficam fora do ranking por não terem CPL único.');
}

// =========================================================== 7. INSIGHTS
{
  const s = pres.addSlide();
  s.background = { color: INK };
  slideTitle(s, 'Leitura do mês', 'Principais insights', true);

  const ins = [
    ['A conta ficou mais eficiente', 'Com 2,8% menos verba, agosto entregou 4,3% mais leads. O CPL consolidado caiu de R$ 37,59 para R$ 35,04.'],
    ['O Meta foi o motor do mês', '+4,7% de verba viraram +16% de leads e CPL 9,7% menor. Foi o único canal que cresceu em volume.'],
    ['O Google não piorou — foi desinvestido', 'Os leads caíram 16,6% porque a verba caiu 17,7%. O CPL do canal ficou praticamente igual (-1,3%): foi decisão de alocação, não perda de performance.'],
    ['A virada veio do formulário nativo', 'Lead ads saltaram 94% (366 → 711) enquanto o formulário do site caiu 41%. Antes de escalar, é preciso validar no CRM se esse lead converte igual.'],
    ['O Meta começou a saturar público', 'Alcance -22,8% e frequência de 2,85 para 3,40. Está falando mais vezes com menos gente, e o CPM subiu 13,9%.'],
    ['No Google, a PMax sustenta o resultado', '18,8% da verba geram 73,4% dos leads. Já o Search de casamento consome 47,8% da verba para 10,9% dos leads.'],
  ];

  const cw = (W - 2 * M - 2 * 0.32) / 3;
  ins.forEach((it, i) => {
    const col = i % 3, rowI = Math.floor(i / 3);
    const x = M + col * (cw + 0.32);
    const y = 1.72 + rowI * 2.42;
    s.addShape('roundRect', {
      x, y, w: cw, h: 2.16, rectRadius: 0.07,
      fill: { color: '1E2833' }, line: { color: '2C3846', width: 0.75 },
    });
    s.addShape('ellipse', { x: x + 0.28, y: y + 0.26, w: 0.40, h: 0.40, fill: { color: i < 3 ? PURPLE : SAGE }, line: { type: 'none' } });
    s.addText(String(i + 1), {
      x: x + 0.28, y: y + 0.26, w: 0.40, h: 0.40, isTextBox: true, margin: 0,
      align: 'center', valign: 'middle', fontSize: 13, bold: true, fontFace: SANS, color: i < 3 ? WHITE : INK,
    });
    s.addText(it[0], {
      x: x + 0.28, y: y + 0.76, w: cw - 0.56, h: 0.58, isTextBox: true, margin: 0,
      fontSize: 14.5, bold: true, fontFace: SERIF, color: CREAM, valign: 'top', lineSpacingMultiple: 1.05,
    });
    s.addText(it[1], {
      x: x + 0.28, y: y + 1.36, w: cw - 0.56, h: 0.72, isTextBox: true, margin: 0,
      fontSize: 10.5, fontFace: SANS, color: 'A9B2BC', valign: 'top', lineSpacingMultiple: 1.14,
    });
  });

  footer(s, '07', true);
}

// =========================================================== 8. RECOMENDACOES
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  slideTitle(s, 'Plano de ação', 'O que fazer em setembro');

  const recs = [
    ['Realocar R$ 3 a 4 mil do Search caro', 'Reduzir Querência SP, Bodas e Palacete e mover a verba para Performance Max e para o cluster de lead form do Meta, que hoje entregam lead entre R$ 4 e R$ 24.', 'Alto'],
    ['Auditar a qualidade dos 711 leads de formulário', 'Cruzar com o CRM taxa de contato, de agendamento e de visita. Se o lead nativo converter abaixo do formulário de site, o CPL menor é ilusório.', 'Crítico'],
    ['Renovar criativos e ampliar públicos no Meta', 'Frequência em 3,40 e alcance em queda. Novos criativos e expansão de audiência para segurar o CPM antes que o CPL volte a subir.', 'Alto'],
    ['Revisar Palacete Monte Alegre no Search', '62,2% de impression share e CPL de R$ 304. Reduzir lance ou pausar e testar o mesmo público via PMax.', 'Médio'],
    ['Investigar a queda de CTR do Google', 'CTR de 8,52% para 6,49% com 11% mais impressões: entrou volume menos qualificado. Revisar termos de busca e cobertura da PMax.', 'Médio'],
  ];

  recs.forEach((r, i) => {
    const y = 1.66 + i * 0.99;
    s.addShape('roundRect', {
      x: M, y, w: W - 2 * M, h: 0.86, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: LINE, width: 0.75 },
    });
    s.addShape('ellipse', { x: M + 0.28, y: y + 0.24, w: 0.38, h: 0.38, fill: { color: INK }, line: { type: 'none' } });
    s.addText(String(i + 1), {
      x: M + 0.28, y: y + 0.24, w: 0.38, h: 0.38, isTextBox: true, margin: 0,
      align: 'center', valign: 'middle', fontSize: 12.5, bold: true, fontFace: SANS, color: CREAM,
    });
    s.addText(r[0], {
      x: M + 0.82, y: y + 0.11, w: 4.55, h: 0.30, isTextBox: true, margin: 0,
      fontSize: 13, bold: true, fontFace: SERIF, color: INK, valign: 'middle',
    });
    s.addText(r[1], {
      x: M + 0.82, y: y + 0.41, w: 8.35, h: 0.40, isTextBox: true, margin: 0,
      fontSize: 10.5, fontFace: SANS, color: MUTED, valign: 'top', lineSpacingMultiple: 1.1,
    });
    const cor = r[2] === 'Crítico' ? PURPLE : (r[2] === 'Alto' ? INK : SAGE);
    const txt = r[2] === 'Médio' ? INK : WHITE;
    s.addShape('roundRect', {
      x: W - M - 1.35, y: y + 0.28, w: 1.05, h: 0.30, rectRadius: 0.14,
      fill: { color: cor }, line: { type: 'none' },
    });
    s.addText(r[2], {
      x: W - M - 1.35, y: y + 0.28, w: 1.05, h: 0.30, isTextBox: true, margin: 0,
      align: 'center', valign: 'middle', fontSize: 10, bold: true, fontFace: SANS, color: txt,
    });
  });

  s.addText('Prioridade sugerida pela Wecon com base no impacto estimado sobre o custo por lead de setembro.', {
    x: M, y: 6.64, w: 8.5, h: 0.28, isTextBox: true, margin: 0,
    fontSize: 9.5, italic: true, fontFace: SANS, color: MUTED, valign: 'middle',
  });
  footer(s, '08');
}

// =========================================================== 9. METODOLOGIA
{
  const s = pres.addSlide();
  s.background = { color: INK };

  for (let i = 0; i < 7; i++) {
    s.addShape('roundRect', {
      x: 9.55 + i * 0.52, y: 1.15, w: 0.235, h: 5.2, rectRadius: 0.11,
      fill: { color: i % 2 === 0 ? PURPLE : SAGE, transparency: 90 }, line: { type: 'none' },
    });
  }

  slideTitle(s, 'Anexo', 'Como estes números foram apurados', true);

  const notas = [
    ['Fontes', 'Google Ads API (conta 654-214-0100) e Meta Ads (conta DI TERRÁ, 434423524017005). Períodos fechados de 01 a 31/07/2026 e 01 a 31/08/2026, no fuso da conta.'],
    ['Definição de lead', 'Google Ads: 100% das conversões são ações de lead — formulário do site e WhatsApp do site. Meta Ads: soma de formulários nativos, formulários do site (pixel) e conversas iniciadas no WhatsApp.'],
    ['Cobertura', 'No Meta, campanhas de resultado misto ou de reconhecimento (CORPORATIVO | LP, Posts e Reconhecimento de Marca) não têm CPL único e ficam fora da contagem de leads. Elas representam 15,6% da verba em agosto e 15,3% em julho, o que mantém a comparação entre os meses equivalente.'],
    ['Arredondamento', 'As conversões do Google são fracionadas por atribuição (420,75 em agosto e 504,78 em julho) e aparecem arredondadas nos gráficos. Os cálculos de CPL usam os valores cheios.'],
  ];
  notas.forEach((n, i) => {
    const y = 1.78 + i * 1.14;
    s.addText(n[0].toUpperCase(), {
      x: M, y, w: 1.85, h: 0.3, isTextBox: true, margin: 0,
      fontSize: 10, bold: true, charSpacing: 1.2, fontFace: SANS, color: SAGE, valign: 'top',
    });
    s.addText(n[1], {
      x: M + 1.95, y, w: 6.55, h: 0.96, isTextBox: true, margin: 0,
      fontSize: 11, fontFace: SANS, color: 'C3CAD2', valign: 'top', lineSpacingMultiple: 1.16,
    });
  });

  s.addImage({ path: 'assets/wecon-white.png', x: M, y: 6.58, w: 1.62, h: 0.23 });
  s.addText('wecondigital.com.br', {
    x: W - M - 3.2, y: 6.56, w: 3.2, h: 0.28, isTextBox: true, margin: 0,
    align: 'right', fontSize: 10, fontFace: SANS, color: '7B8794', valign: 'middle',
  });
}

// ---------------------------------------------------------------- correcao
// O pptxgenjs grava TODA categoria de texto como <c:multiLvlStrRef> (referencia
// multinivel), mesmo quando ha um unico nivel. PowerPoint, Google Slides e
// LibreOffice nao leem esse cache num eixo de nivel unico e caem no fallback
// numerico: o eixo aparece como 1, 2, 3 em vez dos nomes das categorias.
// A forma correta para categoria simples e <c:strRef>/<c:strCache>, que e o que
// o proprio PowerPoint escreve. Reescrevemos so os casos de um unico <c:lvl>;
// um grafico realmente multinivel passa intacto.
const SINGLE_LEVEL_CAT = new RegExp(
  '<c:multiLvlStrRef>\\s*<c:f>(.*?)</c:f>\\s*<c:multiLvlStrCache>\\s*' +
  '<c:ptCount val="(\\d+)"/>\\s*<c:lvl>(.*?)</c:lvl>\\s*' +
  '</c:multiLvlStrCache>\\s*</c:multiLvlStrRef>',
  'g');

async function corrigirCategoriasDosGraficos(file) {
  const fs = require('fs');
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const partes = Object.keys(zip.files).filter((n) => /^ppt\/charts\/chart\d+\.xml$/.test(n));
  let total = 0;

  for (const nome of partes) {
    const xml = await zip.file(nome).async('string');
    let n = 0;
    const corrigido = xml.replace(SINGLE_LEVEL_CAT, (_m, f, ptCount, pts) => {
      n++;
      return `<c:strRef><c:f>${f}</c:f><c:strCache>` +
             `<c:ptCount val="${ptCount}"/>${pts}` +
             `</c:strCache></c:strRef>`;
    });
    if (n) {
      zip.file(nome, corrigido);
      total += n;
      console.log(`   ${nome}: ${n} eixo(s) de categoria corrigido(s)`);
    }
  }

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(file, buf);
  return total;
}

const ARQUIVO = 'Di Terra - Relatorio de Midia - Agosto 2026.pptx';
pres.writeFile({ fileName: ARQUIVO })
  .then((f) => corrigirCategoriasDosGraficos(f).then((n) => {
    console.log(`OK -> ${f}  (${n} eixos de categoria reescritos para <c:strRef>)`);
  }));
