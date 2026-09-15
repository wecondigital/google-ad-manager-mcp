// Relatório de mídia por período — Di Terrá
// Le periodo_google.json (coleta_periodo.py) e periodo_meta.json (normaliza_periodo.py)
// e monta o relatório no modelo de design da WeCon.
//
//   node gera_periodo.js
//
// Identidade e artes extraidas de "Tema Apresentacao Wecon".
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const AQUI = __dirname;
const ler = f => JSON.parse(fs.readFileSync(path.join(AQUI, f), 'utf8'));
const G = ler('periodo_google.json');
const M = ler('periodo_meta.json');
const PLANO = ler('plano-setembro-2026.json');
const NOVOS = ler('novos_anuncios.json').anuncios;

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

// Seta e cor. `menorMelhor` inverte a leitura — no CPL, cair é bom.
function delta(atual, base, menorMelhor = false) {
  if (!base) return { txt: '—', cor: SEC, v: 0 };
  const v = (atual - base) / base * 100;
  const bom = menorMelhor ? v < 0 : v > 0;
  return { txt: (v >= 0 ? '▲ +' : '▼ ') + num(Math.abs(v), 1) + '%',
           cor: Math.abs(v) < 1 ? SEC : (bom ? BOM : RUIM), v };
}

// ---------- consolidação ----------
const CASAS = ['Fazenda A Querência', 'Palacete Monte Alegre', 'Casa Lucca',
               'Espaço Terrá', 'Institucional / multi-casa'];
const MAPA = {};
PLANO.plano.forEach(l => { MAPA[l.campanha.toLowerCase()] = l.casa; });
const PISTAS = [[/quer[êe]ncia/i, 'Fazenda A Querência'], [/palacete/i, 'Palacete Monte Alegre'],
                [/lucca/i, 'Casa Lucca'], [/terr[áa]/i, 'Espaço Terrá']];
function casaDe(nome) {
  const m = MAPA[nome.toLowerCase()];
  if (m) return m;
  for (const [re, casa] of PISTAS) if (re.test(nome)) return casa;
  return 'Institucional / multi-casa';
}

const junta = j => [...(G[j] || []).map(l => ({ ...l, plataforma: 'Google' })),
                    ...(M[j] || []).map(l => ({ ...l, plataforma: 'Meta' }))];
const total = ls => ls.reduce((a, l) => ({ custo: a.custo + (l.custo || 0),
                                           leads: a.leads + (l.leads || 0) }), { custo: 0, leads: 0 });
const cpl = t => (t.leads ? t.custo / t.leads : 0);

const ATU = junta('atual'), ANT = junta('anterior');
const tA = total(ATU), tB = total(ANT);
const ja = G.janelas.atual, jb = G.janelas.anterior;

// campanhas que existem no período atual e não existiam no anterior
const chavesAnt = new Set(ANT.map(l => l.id || l.campanha));
const NOVAS = ATU.filter(l => !chavesAnt.has(l.id || l.campanha) && l.custo > 0);

const p = new pptxgen();
p.layout = 'LAYOUT_16x9';
p.author = 'WeCon Digital';
p.company = 'WeCon Digital';
p.title = `Relatório de mídia Di Terrá — ${dataBR(ja.de)} a ${dataBR(ja.ate)}`;

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
    fontFace: F, fontSize: 8.5, bold: true, color: SEC, charSpacing: 0.8,
    align: c.a || 'left', fill: { color: CREME }, valign: 'bottom' } }));
  const body = linhas.map(l => l.map((c, i) => ({
    text: typeof c === 'object' ? c.t : c,
    options: { fontFace: F, fontSize: opt.fs || 10,
               bold: (typeof c === 'object' && c.b) || false,
               color: (typeof c === 'object' && c.c) || TINTA,
               align: cab[i].a || 'left', fill: { color: BRANCO }, valign: 'middle' },
  })));
  s.addTable([head, ...body], {
    x: opt.x || 0.6, y: opt.y, w: opt.w, colW: opt.colW, rowH: opt.rowH || 0.22,
    border: { type: 'solid', color: LINHA, pt: 0.5 }, margin: [2, 5, 2, 5],
  });
}
function rodape(s, txt) {
  s.addText(txt, { x: 0.6, y: 4.58, w: 8.8, h: 0.3, fontFace: F, fontSize: 8.5,
                   italic: true, color: SEC, margin: 0 });
}

// Casa a linha do periodo atual com a do anterior. No Meta a chave e o id da
// campanha, porque os nomes mudam: em 07/09 a conta inteira foi renomeada e a
// comparacao por nome marcaria tudo como campanha nova. No Google nao ha id na
// coleta, entao o nome segue sendo a chave.
const chave = l => l.id || l.campanha;

// linhas de campanha comparadas com o periodo anterior
function linhasComparadas(plataforma, limite) {
  const ant = {};
  ANT.filter(l => l.plataforma === plataforma).forEach(l => { ant[chave(l)] = l; });
  return ATU.filter(l => l.plataforma === plataforma && l.custo > 0)
    .sort((a, b) => b.custo - a.custo).slice(0, limite)
    .map(l => {
      const a = ant[chave(l)];
      const c = l.leads ? l.custo / l.leads : 0;
      const ca = a && a.leads ? a.custo / a.leads : 0;
      const d = delta(c, ca, true);
      const renomeada = a && a.campanha !== l.campanha;
      return [{ t: (l.campanha.length > 38 ? l.campanha.slice(0, 37) + '…' : l.campanha)
                  + (renomeada ? '  ·  renomeada' : ''), c: TINTA },
              brl(l.custo, 2), a ? brl(a.custo, 2) : { t: 'nova', c: OLIVA },
              num(l.leads, l.leads % 1 ? 1 : 0),
              { t: l.leads ? brl(c, 2) : '—', b: true },
              ca ? brl(ca, 2) : '—', { t: ca ? d.txt : '—', c: ca ? d.cor : SEC }];
    });
}
const CAB_CAMP = [{ t: 'CAMPANHA' }, { t: 'INVESTIDO', a: 'right' }, { t: 'PER. ANT.', a: 'right' },
                  { t: 'LEADS', a: 'right' }, { t: 'CPL', a: 'right' },
                  { t: 'CPL ANT.', a: 'right' }, { t: 'VAR.', a: 'right' }];
const COLW_CAMP = [3.0, 1.05, 1.05, 0.7, 1.0, 1.0, 1.0];

// ==================== 1 · CAPA ====================
{
  const s = p.addSlide();
  s.background = { color: CREME };
  s.addImage({ data: PANEL, x: 5.6, y: 0, w: 4.4, h: 5.625 });
  s.addText('WECON DIGITAL', { x: 0.7, y: 1.5, w: 4.6, h: 0.24, fontFace: F, fontSize: 10,
                               bold: true, color: OLIVA, charSpacing: 1.8, margin: 0 });
  s.addText('Relatório de mídia', { x: 0.7, y: 1.78, w: 4.7, h: 1.25, fontFace: F,
                                    fontSize: 34, bold: true, color: TINTA, margin: 0 });
  s.addText('Di Terrá  ·  Google Ads e Meta Ads', { x: 0.7, y: 3.10, w: 4.7, h: 0.3,
    fontFace: F, fontSize: 14, color: SEC, margin: 0 });
  s.addShape(p.ShapeType.rect, { x: 0.7, y: 3.55, w: 0.9, h: 0.035, fill: { color: SALVIA } });
  s.addText(`${dataBR(ja.de)} a ${dataBR(ja.ate)}  ·  comparado com ${dataBR(jb.de)} a ${dataBR(jb.ate)}`,
    { x: 0.7, y: 3.74, w: 4.7, h: 0.4, fontFace: F, fontSize: 11, color: SEC, margin: 0 });
}

// ==================== 2 · O PERÍODO ====================
{
  const s = base('faixa');
  titulo(s, 'VISÃO GERAL', 'O período em números',
    `${G.dias} dias, de ${dataBR(ja.de)} a ${dataBR(ja.ate)}, contra os ${G.dias} dias anteriores`);
  const dInv = delta(tA.custo, tB.custo);
  const dLead = delta(tA.leads, tB.leads);
  const dC = delta(cpl(tA), cpl(tB), true);
  card(s, 0.6, 1.52, 2.82, 1.2, 'INVESTIDO', brl(tA.custo, 2),
       `${dInv.txt} · antes ${brl(tB.custo, 2)}`, SEC);
  card(s, 3.59, 1.52, 2.82, 1.2, 'LEADS', num(tA.leads, tA.leads % 1 ? 1 : 0),
       `${dLead.txt} · antes ${num(tB.leads, 1)}`, dLead.cor);
  card(s, 6.58, 1.52, 2.82, 1.2, 'CUSTO POR LEAD', brl(cpl(tA), 2),
       `${dC.txt} · antes ${brl(cpl(tB), 2)}`, dC.cor);

  tabela(s, [{ t: 'PLATAFORMA' }, { t: 'INVESTIDO', a: 'right' }, { t: 'VAR.', a: 'right' },
             { t: 'LEADS', a: 'right' }, { t: 'VAR.', a: 'right' },
             { t: 'CPL', a: 'right' }, { t: 'CPL ANT.', a: 'right' }, { t: 'VAR.', a: 'right' }],
    ['Google', 'Meta'].map(pl => {
      const a = total(ATU.filter(l => l.plataforma === pl));
      const b = total(ANT.filter(l => l.plataforma === pl));
      const di = delta(a.custo, b.custo), dl = delta(a.leads, b.leads);
      const dc = delta(cpl(a), cpl(b), true);
      return [pl + ' Ads', { t: brl(a.custo, 2), b: true }, { t: di.txt, c: SEC },
              num(a.leads, a.leads % 1 ? 1 : 0), { t: dl.txt, c: dl.cor },
              { t: brl(cpl(a), 2), b: true }, brl(cpl(b), 2), { t: dc.txt, c: dc.cor }];
    }).concat([[{ t: 'Total', b: true }, { t: brl(tA.custo, 2), b: true, c: OLIVA },
               { t: dInv.txt, b: true, c: SEC }, { t: num(tA.leads, 0), b: true },
               { t: dLead.txt, b: true, c: dLead.cor }, { t: brl(cpl(tA), 2), b: true },
               { t: brl(cpl(tB), 2), b: true }, { t: dC.txt, b: true, c: dC.cor }]]),
    { y: 3.0, w: 8.8, colW: [1.5, 1.25, 0.95, 0.85, 0.95, 1.1, 1.1, 1.1], rowH: 0.28, fs: 10 });

  s.addText([
    { text: 'A leitura do período.  ', options: { bold: true, color: TINTA } },
    { text: `O investimento subiu ${num(Math.abs(dInv.v), 1)}% e os leads caíram `
      + `${num(Math.abs(dLead.v), 1)}%. A piora está concentrada no Google, onde o CPL quase dobrou; `
      + 'o Meta melhorou custo e volume no mesmo intervalo.', options: { color: SEC } },
  ], { x: 0.6, y: 3.98, w: 8.8, h: 0.5, fontFace: F, fontSize: 10.5, margin: 0, lineSpacing: 14 });
  s.addNotes('Setas verdes indicam melhora. No CPL a leitura é invertida: cair é bom.');
}

// ==================== 3 · META ====================
{
  const s = base('faixa');
  titulo(s, 'POR CAMPANHA', 'Meta Ads', 'As campanhas de maior investimento no período');
  tabela(s, CAB_CAMP, linhasComparadas('Meta', 13),
    { y: 1.45, w: 8.8, colW: COLW_CAMP, rowH: 0.21, fs: 9 });
  rodape(s, 'CPL "—" indica campanha sem lead registrado no período. As de Reconhecimento, [Posts] e CORPORATIVO | LP entram no investimento com zero lead: o indicador que o Meta devolve nelas é visualização de vídeo ou objetivo misto, não lead.');
  s.addNotes('O CPL do Meta melhorou 8,4% com mais volume — foi o que segurou o resultado do período.');
}

// ==================== 4 · GOOGLE ====================
{
  const s = base('faixa');
  titulo(s, 'POR CAMPANHA', 'Google Ads', 'As campanhas de maior investimento no período');
  tabela(s, CAB_CAMP, linhasComparadas('Google', 13),
    { y: 1.45, w: 8.8, colW: COLW_CAMP, rowH: 0.21, fs: 9 });
  rodape(s, 'Leads = conversões registradas na conta, incluindo frações de atribuição — por isso aparecem valores quebrados.');
  s.addNotes('O CPL do Google saiu de R$ 42,17 para R$ 77,25 com investimento maior. '
    + 'É o ponto que precisa de diagnóstico antes de qualquer novo aporte.');
}

// ==================== 5 · POR CASA ====================
{
  const s = base('estreito');
  titulo(s, 'RECORTE', 'Resultado por casa', 'As duas plataformas somadas, no período');
  const porCasa = (ls, c) => total(ls.filter(l => casaDe(l.campanha) === c));
  tabela(s, [{ t: 'CASA' }, { t: 'INVESTIDO', a: 'right' }, { t: 'LEADS', a: 'right' },
             { t: 'CPL', a: 'right' }, { t: 'CPL ANT.', a: 'right' }, { t: 'VAR.', a: 'right' }],
    CASAS.map(c => {
      const a = porCasa(ATU, c), b = porCasa(ANT, c);
      const d = delta(cpl(a), cpl(b), true);
      return [c.replace(' / multi-casa', ''), { t: brl(a.custo, 2), b: true },
              num(a.leads, a.leads % 1 ? 1 : 0),
              { t: a.leads ? brl(cpl(a), 2) : '—', b: true },
              b.leads ? brl(cpl(b), 2) : '—',
              { t: a.leads && b.leads ? d.txt : '—', c: a.leads && b.leads ? d.cor : SEC }];
    }).concat([[{ t: 'Total', b: true }, { t: brl(tA.custo, 2), b: true, c: OLIVA },
               { t: num(tA.leads, 0), b: true }, { t: brl(cpl(tA), 2), b: true },
               { t: brl(cpl(tB), 2), b: true },
               { t: delta(cpl(tA), cpl(tB), true).txt, b: true, c: delta(cpl(tA), cpl(tB), true).cor }]]),
    { y: 1.5, w: 7.4, colW: [2.1, 1.25, 0.8, 1.05, 1.1, 1.1], rowH: 0.26, fs: 9.5 });

  if (NOVAS.length) {
    s.addText('Campanhas que estrearam no período', { x: 0.6, y: 3.66, w: 7.4, h: 0.24,
      fontFace: F, fontSize: 11, bold: true, color: TINTA, margin: 0 });
    tabela(s, [{ t: 'CAMPANHA' }, { t: 'PLAT.' }, { t: 'INVESTIDO', a: 'right' },
               { t: 'LEADS', a: 'right' }, { t: 'CPL', a: 'right' }],
      NOVAS.sort((a, b) => b.custo - a.custo).slice(0, 4).map(l => [
        l.campanha.length > 34 ? l.campanha.slice(0, 33) + '…' : l.campanha,
        { t: l.plataforma, c: l.plataforma === 'Google' ? GOOGLE : META },
        brl(l.custo, 2), num(l.leads, 0),
        { t: l.leads ? brl(l.custo / l.leads, 2) : '—', b: true }]),
      { y: 3.96, w: 7.4, colW: [3.0, 0.8, 1.2, 0.8, 1.6], rowH: 0.22, fs: 9 });
  }
  s.addNotes('Casas sem lead no período aparecem com CPL "—". A atribuição por casa usa o plano '
    + 'aprovado e, para campanha fora dele, o nome.');
}

// ==================== 6 · NOVOS ANÚNCIOS ====================
{
  const s = base('faixa');
  const c = NOVOS.reduce((a, l) => a + l.custo, 0);
  const n = NOVOS.reduce((a, l) => a + l.leads, 0);
  titulo(s, 'CRIATIVO', 'Novos anúncios no ar',
    `${NOVOS.length} peças estrearam no período, todas no Meta`);
  card(s, 0.6, 1.5, 2.15, 1.15, 'PEÇAS NOVAS', String(NOVOS.length), 'todas no Meta', OLIVA);
  card(s, 2.92, 1.5, 2.15, 1.15, 'INVESTIDO', brl(c, 2),
       `${num(c / total(ATU.filter(l => l.plataforma === 'Meta')).custo * 100, 1)}% da verba do Meta`);
  card(s, 5.24, 1.5, 2.15, 1.15, 'LEADS', String(n), 'no período');
  card(s, 7.56, 1.5, 1.84, 1.15, 'CPL', brl(c / n, 2),
       `contra ${brl(cpl(tA), 2)} da conta`, c / n < cpl(tA) ? BOM : RUIM);

  tabela(s, [{ t: 'ANÚNCIO' }, { t: 'CAMPANHA' }, { t: 'NO AR', a: 'center' },
             { t: 'INVESTIDO', a: 'right' }, { t: 'LEADS', a: 'right' },
             { t: 'CPL', a: 'right' }, { t: 'STATUS' }],
    NOVOS.map(l => [
      l.nome.length > 30 ? l.nome.slice(0, 29) + '…' : l.nome,
      l.campanha.length > 28 ? l.campanha.slice(0, 27) + '…' : l.campanha,
      dataBR(l.criado), brl(l.custo, 2), String(l.leads),
      { t: l.leads ? brl(l.custo / l.leads, 2) : '—', b: true },
      { t: l.status === 'ACTIVE' ? 'no ar' : l.status.toLowerCase(),
        c: l.status === 'ACTIVE' ? BOM : RUIM },
    ]),
    { y: 2.9, w: 8.8, colW: [2.35, 2.2, 0.75, 1.1, 0.6, 0.9, 0.9], rowH: 0.25, fs: 9 });
  rodape(s, 'Leitura de poucos dias de veiculação: serve para decidir o que escalar, não para concluir desempenho. No Google não houve anúncio novo no período.');
  s.addNotes('As peças do Mês do Cliente concentram o resultado da semana em debutantes.');
}

// ==================== 7 · OS CRIATIVOS ====================
{
  const s = base('estreito');
  titulo(s, 'CRIATIVO', 'As peças que estrearam', 'Abra o preview para ver o anúncio como ele aparece no feed');
  const destaque = [...NOVOS].sort((a, b) => b.custo - a.custo).slice(0, 3);
  destaque.forEach((l, i) => {
    const x = 0.6 + i * 2.55;
    // moldura reservada para o print — o download do criativo é bloqueado
    // pelo proxy de saida, entao a imagem entra manualmente
    s.addShape(p.ShapeType.rect, { x, y: 1.45, w: 1.55, h: 2.05,
      fill: { color: BRANCO }, line: { color: LINHA, width: 0.75, dashType: 'dash' } });
    s.addText('cole aqui\no print', { x, y: 2.28, w: 1.55, h: 0.4, fontFace: F, fontSize: 9,
      color: LINHA, align: 'center', valign: 'middle', margin: 0 });
    s.addText(l.nome.length > 26 ? l.nome.slice(0, 25) + '…' : l.nome,
      { x: x + 1.68, y: 1.45, w: 0.82, h: 0.5, fontFace: F, fontSize: 9.5, bold: true,
        color: TINTA, margin: 0 });
    s.addText([{ text: brl(l.custo, 2) + '\n', options: { bold: true, color: TINTA } },
               { text: `${l.leads} lead${l.leads === 1 ? '' : 's'}\n`, options: { color: SEC } },
               { text: l.leads ? 'CPL ' + brl(l.custo / l.leads, 2) : 'sem lead',
                 options: { color: l.leads ? BOM : SEC } }],
      { x: x + 1.68, y: 2.0, w: 0.82, h: 0.8, fontFace: F, fontSize: 9, margin: 0, lineSpacing: 11 });
    s.addText(l.criativo, { x, y: 3.56, w: 2.25, h: 0.62, fontFace: F, fontSize: 8.5,
      color: SEC, margin: 0, lineSpacing: 10.5 });
    s.addText('abrir preview', { x, y: 4.2, w: 2.25, h: 0.2, fontFace: F, fontSize: 8.5,
      color: GOOGLE, underline: true, hyperlink: { url: l.url }, margin: 0 });
  });
  s.addText([
    { text: 'Por que a moldura está vazia.  ', options: { bold: true, color: TINTA } },
    { text: 'O download do criativo é bloqueado nesta sessão. Os links acima abrem o preview '
      + 'oficial: capture e cole na moldura, que já está no tamanho certo.', options: { color: SEC } },
  ], { x: 0.6, y: 4.52, w: 7.4, h: 0.4, fontFace: F, fontSize: 9.5, margin: 0, lineSpacing: 12 });
  s.addNotes('Os links de preview do Meta expiram depois de algum tempo. Se algum não abrir, '
    + 'o anúncio pode ser visto direto no Gerenciador.');
}

// ==================== 6 · O QUE FALTA DO PLANO ====================
{
  const s = base('faixa');
  titulo(s, 'IMPLEMENTAÇÃO', 'O que falta do plano de setembro',
    'Levantado na conta — o plano ainda não está inteiro no ar');
  tabela(s, [{ t: '#' }, { t: 'O QUE FALTA' }, { t: 'ONDE' }, { t: 'QUEM' }], [
    ['1', 'Ativar 4 entidades: Destination — Cópia (arquivada), Destination — SMS e 2 conjuntos do TERRÁ (R$ 25 e R$ 6/dia)',
     'Meta', { t: 'Di Terrá / WeCon', c: RUIM }],
    ['2', 'Aplicar os 7 orçamentos vitalícios (define o ritmo até dezembro)', 'Meta', 'Di Terrá'],
    ['3', 'Distribuir os tetos de [Leads Ads] R$ 80/dia e [Posts] R$ 30/dia', 'Meta', 'WeCon'],
    ['4', 'Ajustar os 12 orçamentos de campanha', 'Google', 'WeCon'],
    ['5', 'Criar a campanha de YouTube corporativo (R$ 46,67/dia)', 'Google', 'WeCon'],
    ['6', 'Aplicar a lista de negativas do corporativo', 'Google', 'WeCon'],
    ['7', 'Definir 3 campanhas habilitadas fora do plano, com gasto zero em agosto', 'Google', 'Di Terrá + WeCon'],
    ['8', 'Revisar criativos de Palacete e Casa Lucca, que já receberam +22% e +30%', 'Meta e Google', 'WeCon'],
    ['9', 'Retorno do comercial sobre a qualidade dos leads de agosto', '—', 'Di Terrá'],
  ], { y: 1.45, w: 8.8, colW: [0.35, 5.15, 1.4, 1.9], rowH: 0.32, fs: 9.5 });
  rodape(s, 'A campanha Social > Querência > Destination voltou ao ar em 07/09 e sozinha respondeu por 93 dos 297 leads do Meta. As outras quatro entidades seguem fora — item 1.');
  s.addNotes('Fechar a reunião definindo quem faz o item 1 e quando.');
}

const saida = path.join(AQUI, `Relatorio-DiTerra-${ja.de}-a-${ja.ate}.pptx`);
p.writeFile({ fileName: saida }).then(f => console.log('gerado:', f));
