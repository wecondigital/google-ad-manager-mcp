// Deck de status da implementação do plano de setembro — Di Terrá
// O que já foi alterado nas contas e o que ainda falta.
//
//   node gera_status.js
//
// Identidade e artes extraidas de "Tema Apresentacao Wecon".
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const AQUI = __dirname;
const ler = f => JSON.parse(fs.readFileSync(path.join(AQUI, f), 'utf8'));
const PLANO = ler('plano-setembro-2026.json');
const GOOG = ler('google_depara.json');

const img = n => 'image/jpeg;base64,' +
  fs.readFileSync(path.join(AQUI, 'tema', `image${n}.jpg`)).toString('base64');
const PANEL = img(2), BAND = img(3), NARROW = img(1);
const CREME = 'EDEBDC', SALVIA = 'C2CA97', OLIVA = '55622F';
const TINTA = '1A1A17', SEC = '595959', BRANCO = 'FFFFFF', LINHA = 'D8D6C4';
const GOOGLE = '1D6EA8', META = 'A9761A', BOM = '1F7A55', RUIM = 'B3392F';
const F = 'Arial';

const brl = (v, dec = 0) =>
  'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const dia = v => (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- o que foi aplicado no Meta (registro das chamadas de hoje) ----------
// [campanha, conjunto, de, para, ficou_pausado]
const APLICADO = [
  ['CASAMENTOS | QUERÊNCIA | SITE', 'conjunto 1', 220, 241, true],
  ['CASAMENTOS | QUERÊNCIA | SITE', 'conjunto 2', 90, 99, true],
  ['Destination — Cópia', 'campanha (CBO)', 80, 67, true],
  ['Destination — SMS', 'campanha (CBO)', 40, 20, true],
  ['CASAMENTOS | PALACETE | SITE', 'conjunto 1', 60, 81, true],
  ['CASAMENTOS | PALACETE | SITE', 'conjunto 2', 45, 61, true],
  ['CASAMENTOS | PALACETE | SITE', 'INTERESSES | PALACETE', 35, 48, true],
  ['CASAMENTO | Mini Wedding | Casa Lucca', '[lookalike]', 45, 51, true],
  ['CASAMENTO | Mini Wedding | Casa Lucca', 'principal', 33, 37, true],
  ['CASAMENTO | Mini Wedding | Casa Lucca', 'Feed', 8, 9, true],
  ['CASAMENTOS | TERRÁ | SITE', 'conjunto 2', 35, 25, true],
  ['CASAMENTOS | TERRÁ | SITE', 'conjunto 1', 25, 19, true],
  ['CASAMENTOS | TERRÁ | SITE', 'conjunto 3', 7, 6, true],
  ['Social > Debutantes', 'Pais e Mães', 40, 27, false],
  ['BODAS | WhatsApp', 'conjunto único', 18, 57, true],
];
const PAUSADOS = APLICADO.filter(l => l[4]).length;

// ---------- o que falta no Meta: vitalicios ----------
// [campanha, conjunto, lifetime_hoje, lifetime_novo, fim]
const VITALICIO = [
  ['CASAMENTO | WhatsApp | Querência', '—', 17600, 19200, '04/12'],
  ['DEBUTANTES | MENSAGENS', 'TERRA | MENSAGENS', 9965, 7700, '04/12'],
  ['CORPORATIVO | WhatsApp', '—', 9900, 10700, '11/12'],
  ['Corporativo > Institucional', '—', 10000, 10250, '10/12'],
  ['CORPORATIVO | LP', 'conjunto 1', 13000, 7750, '15/12'],
  ['CORPORATIVO | LP', 'conjunto 2', 7500, 4800, '16/12'],
  ['Reconhecimento de Marca', 'Piracicaba e Região', 8000, 8500, '27/11'],
];

const p = new pptxgen();
p.layout = 'LAYOUT_16x9';
p.author = 'WeCon Digital';
p.company = 'WeCon Digital';
p.title = 'Implementação do plano de setembro — Di Terrá';

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
  s.addText('Implementação do plano', { x: 0.7, y: 1.78, w: 4.7, h: 1.25, fontFace: F,
                                        fontSize: 34, bold: true, color: TINTA, margin: 0 });
  s.addText('Di Terrá  ·  setembro de 2026', { x: 0.7, y: 3.10, w: 4.7, h: 0.3,
    fontFace: F, fontSize: 14, color: SEC, margin: 0 });
  s.addShape(p.ShapeType.rect, { x: 0.7, y: 3.55, w: 0.9, h: 0.035, fill: { color: SALVIA } });
  s.addText('O que já foi alterado nas contas e o que ainda falta', { x: 0.7, y: 3.74, w: 4.7,
    h: 0.4, fontFace: F, fontSize: 11, color: SEC, margin: 0 });
}

// ==================== 2 · ONDE ESTAMOS ====================
{
  const s = base('faixa');
  titulo(s, 'STATUS', 'Onde estamos', 'Balanço da execução do plano nas duas plataformas');
  card(s, 0.6, 1.52, 2.15, 1.2, 'ALTERAÇÕES APLICADAS', String(APLICADO.length),
       'todas no Meta, orçamento diário', BOM);
  card(s, 2.92, 1.52, 2.15, 1.2, 'AINDA PENDENTES', String(VITALICIO.length + 2 + GOOG.plano.length),
       '7 vitalícios + 2 tetos + 13 no Google');
  card(s, 5.24, 1.52, 2.15, 1.2, 'AGUARDANDO PUBLICAÇÃO', String(PAUSADOS),
       'entidades pausadas pela edição', RUIM);
  card(s, 7.56, 1.52, 1.84, 1.2, 'VERBA DO PLANO', brl(PLANO.total),
       `Meta ${brl(PLANO.meta)} + Google ${brl(PLANO.google)}`);

  s.addText([
    { text: 'O que precisa acontecer primeiro.  ', options: { bold: true, color: RUIM } },
    { text: `A ferramenta de edição do Meta pausa a entidade ao alterar o orçamento — trava de `
      + `segurança que exige revisão humana. Os valores estão certos, mas ${PAUSADOS} entidades `
      + 'aguardam publicação no Gerenciador, e até lá a maior parte da mídia não entrega.',
      options: { color: SEC } },
  ], { x: 0.6, y: 2.96, w: 8.8, h: 0.62, fontFace: F, fontSize: 10.5, margin: 0, lineSpacing: 14 });

  tabela(s, [{ t: 'FRENTE' }, { t: 'APLICADO', a: 'center' }, { t: 'PENDENTE', a: 'center' },
             { t: 'SITUAÇÃO' }], [
    ['Meta — orçamento diário', { t: '15', b: true, c: BOM }, { t: '—', a: 'center' },
     'Concluído. Falta publicar no Gerenciador.'],
    ['Meta — orçamento vitalício', '—', { t: '7', b: true }, 'Aguardando aprovação: define o ritmo até dezembro.'],
    ['Meta — tetos de campanha', '—', { t: '2', b: true }, '[Leads Ads] e [Posts]: distribuir entre os conjuntos no ar.'],
    ['Google — orçamentos', '—', { t: '12', b: true }, 'Nenhuma alteração feita: a skill é somente leitura.'],
    ['Google — nova campanha', '—', { t: '1', b: true }, 'YouTube corporativo, a criar do zero.'],
    ['Google — negativas', '—', { t: '1', b: true }, 'Lista já entregue, independe da verba.'],
  ], { y: 3.7, w: 8.8, colW: [2.3, 1.0, 1.0, 4.5], rowH: 0.2, fs: 9.5 });
  s.addNotes('Abrir a reunião por aqui: o número que importa é o de entidades aguardando publicação.');
}

// ==================== 3 · META, O QUE JÁ MUDOU ====================
{
  const s = base('faixa');
  titulo(s, 'FEITO', 'Meta · o que já foi alterado',
    'Orçamento diário, campanha por campanha — valores já gravados na conta');
  tabela(s, [{ t: 'CAMPANHA' }, { t: 'CONJUNTO' }, { t: 'DE', a: 'right' }, { t: 'PARA', a: 'right' },
             { t: 'VAR.', a: 'right' }, { t: 'STATUS' }],
    APLICADO.map(([c, cj, de, pa, pau]) => [
      c.length > 32 ? c.slice(0, 31) + '…' : c, cj,
      dia(de), { t: dia(pa), b: true },
      { t: (pa >= de ? '+' : '') + Math.round((pa / de - 1) * 100) + '%', c: pa >= de ? BOM : SEC },
      { t: pau ? 'pausado — publicar' : 'ativo', c: pau ? RUIM : BOM },
    ]),
    { y: 1.45, w: 8.8, colW: [2.7, 1.9, 0.8, 0.85, 0.75, 1.8], rowH: 0.2, fs: 9 });
  rodape(s, 'Valores em R$/dia. O conjunto 3 de TERRÁ foi para R$ 6,00 e não R$ 5,00: o mínimo da plataforma é R$ 5,21 — o R$ 1,00 saiu do conjunto 2, mantendo a campanha em R$ 50/dia.');
  s.addNotes('Somente o conjunto de Debutantes seguiu ativo após a edição. Conferir no Gerenciador '
    + 'quais estão realmente pausadas antes de publicar.');
}

// ==================== 4 · META, O QUE FALTA ====================
{
  const s = base('estreito');
  titulo(s, 'PENDENTE', 'Meta · o que ainda falta', 'Sete orçamentos vitalícios e dois tetos de campanha');
  tabela(s, [{ t: 'CAMPANHA' }, { t: 'CONJUNTO' }, { t: 'HOJE', a: 'right' },
             { t: 'NOVO', a: 'right' }, { t: 'TÉRMINO', a: 'center' }],
    VITALICIO.map(([c, cj, de, pa, fim]) => [
      c.length > 26 ? c.slice(0, 25) + '…' : c, cj,
      brl(de), { t: brl(pa), b: true, c: pa >= de ? BOM : RUIM }, fim,
    ]),
    { y: 1.5, w: 7.4, colW: [2.2, 1.7, 1.15, 1.15, 1.2], rowH: 0.24, fs: 9.5 });

  s.addText([
    { text: 'Por que estas ficaram para depois.  ', options: { bold: true, color: TINTA } },
    { text: 'O vitalício não é o valor do mês: reparte o saldo pelos dias até a data de término. '
      + 'Definir setembro por ele fixa também outubro e novembro — decisão de trimestre, não de mês.',
      options: { color: SEC } },
  ], { x: 0.6, y: 3.62, w: 7.4, h: 0.62, fontFace: F, fontSize: 10.5, margin: 0, lineSpacing: 14 });

  s.addText([
    { text: 'Atenção · CASAMENTO | WhatsApp | Querência.  ', options: { bold: true, color: RUIM } },
    { text: 'Restam R$ 1.227,72 do vitalício atual — cerca de 41 dias no ritmo novo. '
      + 'Sem o ajuste, a campanha para sozinha ainda em outubro.', options: { color: SEC } },
  ], { x: 0.6, y: 4.28, w: 7.4, h: 0.42, fontFace: F, fontSize: 10.5, margin: 0, lineSpacing: 14 });
  s.addNotes('Os dois tetos de campanha que faltam — [Leads Ads] R$ 2.400/mês e [Posts] R$ 900/mês — '
    + 'não têm um conjunto único: a verba precisa ser distribuída entre os que estiverem no ar.');
}

// ==================== 5 · GOOGLE ====================
{
  const s = base('faixa');
  titulo(s, 'PENDENTE', 'Google · o que ainda falta',
    'Nenhuma alteração feita — a integração do Google é somente leitura');
  tabela(s, [{ t: 'CAMPANHA' }, { t: 'TETO HOJE', a: 'right' }, { t: 'NOVO TETO', a: 'right' },
             { t: 'MÊS', a: 'right' }, { t: 'OBSERVAÇÃO' }],
    GOOG.plano.map(l => [
      l.campanha.length > 34 ? l.campanha.slice(0, 33) + '…' : l.campanha,
      l.teto === null ? '—' : dia(l.teto), { t: dia(l.novo), b: true }, brl(l.mes),
      l.teto === null ? { t: 'criar do zero', c: OLIVA }
        : (l.teto > l.novo * 1.8 ? 'teto muito acima do gasto real'
                                 : (l.novo < l.teto ? 'redução de teto' : 'aumento de teto')),
    ]),
    { y: 1.45, w: 8.8, colW: [3.2, 1.1, 1.1, 1.0, 2.4], rowH: 0.2, fs: 9 });
  rodape(s, 'Valores em R$/dia. Três campanhas seguem habilitadas fora do plano — DISPLAY | CASAMENTO (R$ 5/dia), SEARCH | FESTAS-EVENTOS (R$ 8/dia) e SEARCH | PALACETE MONTE ALEGRE (R$ 25/dia) — com gasto zero em agosto: pausar ou incluir.');
  s.addNotes('A skill do Google é read-only por instalação: lê e reporta, não altera nada. '
    + 'Todos esses ajustes são manuais.');
}

// ==================== 6 · PRÓXIMOS PASSOS ====================
{
  const s = base('estreito');
  titulo(s, 'EXECUÇÃO', 'Próximos passos', 'Na ordem em que precisam acontecer');
  const passos = [
    ['1', 'Publicar as alterações pausadas do Meta', 'Di Terrá / WeCon', RUIM,
     `${PAUSADOS} entidades com valor correto, fora do ar. É a pendência mais urgente: `
      + 'a maior parte da mídia do Meta não entrega até isso ser feito.'],
    ['2', 'Aprovar e aplicar os 7 orçamentos vitalícios', 'Di Terrá', TINTA,
     'Decisão de trimestre, não de mês. O WhatsApp da Querência é o mais urgente dos sete.'],
    ['3', 'Ajustar os 12 orçamentos do Google e criar o YouTube', 'WeCon', TINTA,
     'Manual, pela interface. A campanha de YouTube corporativo não existe na conta.'],
    ['4', 'Aplicar as negativas do corporativo', 'WeCon', TINTA,
     'Lista já entregue, separada por destino. Independe da aprovação de verba.'],
    ['5', 'Revisar criativos de Palacete e Casa Lucca', 'WeCon', TINTA,
     'As duas casas recebem +22% e +30%. Sem criativo novo, o aumento repete o CPL de agosto em escala maior.'],
  ];
  let y = 1.42;
  passos.forEach(([n, t, quem, cor, txt]) => {
    s.addShape(p.ShapeType.ellipse, { x: 0.6, y: y + 0.02, w: 0.3, h: 0.3, fill: { color: SALVIA } });
    s.addText(n, { x: 0.6, y: y + 0.02, w: 0.3, h: 0.3, fontFace: F, fontSize: 12, bold: true,
                   color: TINTA, align: 'center', valign: 'middle', margin: 0 });
    s.addText(t, { x: 1.05, y: y, w: 5.3, h: 0.24, fontFace: F, fontSize: 11.5, bold: true,
                   color: cor, margin: 0 });
    s.addText(quem, { x: 6.4, y: y + 0.02, w: 1.6, h: 0.22, fontFace: F, fontSize: 9.5,
                      color: SEC, align: 'right', margin: 0 });
    s.addText(txt, { x: 1.05, y: y + 0.26, w: 6.95, h: 0.42, fontFace: F, fontSize: 9.5,
                     color: SEC, margin: 0, lineSpacing: 12 });
    y += 0.74;
  });
  s.addNotes('Fechar a reunião confirmando quem faz o passo 1 e quando.');
}

const saida = path.join(AQUI, 'Implementacao-Setembro-DiTerra.pptx');
p.writeFile({ fileName: saida }).then(f => console.log('gerado:', f));
