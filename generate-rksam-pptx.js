const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
pptx.layout = "WIDE";

// ── Paleta ──
const C = {
  navy: "1E3A5F",
  gold: "C59A3A",
  white: "FFFFFF",
  cream: "F5F2EB",
  red: "CC3333",
  blue: "2962A0",
  charcoal: "333333",
  gray: "888888",
  darkNavy: "152D4A",
  lightGold: "F5EAD6",
  green: "2E7D32",
};

// ── Helpers ──
function addDecoBar(slide, { x = 0, y = 0, w = 0.06, h = 7.5, color = C.gold } = {}) {
  slide.addShape(pptx.shapes.RECTANGLE, { x, y, w, h, fill: { color } });
}

function addFooter(slide, dark = false) {
  slide.addText("RKSAM — Inteligência de Pessoas", {
    x: 0.5, y: 7.0, w: 5, h: 0.4,
    fontSize: 9, color: dark ? "667799" : C.gray, fontFace: "Calibri",
  });
}

function addGoldLine(slide, x, y, w) {
  slide.addShape(pptx.shapes.RECTANGLE, { x, y, w, h: 0.03, fill: { color: C.gold } });
}

function card(slide, { x, y, w, h, title, body, borderColor = C.gold, bgColor = C.white }) {
  // Card background
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: bgColor },
    shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
  });
  // Left border accent
  slide.addShape(pptx.shapes.RECTANGLE, {
    x, y: y + 0.08, w: 0.06, h: h - 0.16,
    fill: { color: borderColor },
  });
  // Title
  slide.addText(title, {
    x: x + 0.25, y: y + 0.15, w: w - 0.4, h: 0.4,
    fontSize: 14, bold: true, color: C.navy, fontFace: "Georgia",
  });
  // Body
  slide.addText(body, {
    x: x + 0.25, y: y + 0.55, w: w - 0.4, h: h - 0.7,
    fontSize: 11, color: C.charcoal, fontFace: "Calibri", lineSpacingMultiple: 1.3,
    valign: "top",
  });
}

function iconCircle(slide, { x, y, size = 0.6, color = C.gold, text = "", textColor = C.white }) {
  slide.addShape(pptx.shapes.OVAL, {
    x, y, w: size, h: size,
    fill: { color },
  });
  if (text) {
    slide.addText(text, {
      x, y, w: size, h: size,
      fontSize: 20, color: textColor, fontFace: "Calibri", bold: true,
      align: "center", valign: "middle",
    });
  }
}

function bigNumber(slide, { x, y, number, label, numColor = C.gold }) {
  slide.addText(number, {
    x, y, w: 3.5, h: 0.7,
    fontSize: 36, bold: true, color: numColor, fontFace: "Georgia", align: "center",
  });
  slide.addText(label, {
    x, y: y + 0.65, w: 3.5, h: 0.4,
    fontSize: 12, color: C.white, fontFace: "Calibri", align: "center",
  });
}

// ════════════════════════════════════════════════════════════════
// SLIDE 1 — CAPA
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.navy };

  // Gradient overlay effect (darker at bottom)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 5, w: 13.33, h: 2.5,
    fill: { color: C.darkNavy, transparency: 50 },
  });

  // Gold accent line top
  addGoldLine(slide, 1.5, 1.8, 2);

  // Title
  slide.addText("De Vigilância\npara Inteligência.", {
    x: 1.5, y: 2.0, w: 10, h: 2.2,
    fontSize: 48, bold: true, color: C.white, fontFace: "Georgia",
    lineSpacingMultiple: 1.1,
  });

  // Subtitle
  slide.addText(
    "A nova era da gestão de pessoas: como a RKSAM transforma dados\noperacionais em crescimento, eficiência e desenvolvimento humano.",
    {
      x: 1.5, y: 4.3, w: 9, h: 1.0,
      fontSize: 18, color: C.gold, fontFace: "Calibri",
      lineSpacingMultiple: 1.4,
    }
  );

  // Decorative bar left
  addDecoBar(slide, { x: 0.8, y: 2.0, w: 0.08, h: 3.2, color: C.gold });

  // RKSAM logo text (bottom right)
  slide.addText("RKSAM", {
    x: 10.5, y: 6.5, w: 2.3, h: 0.6,
    fontSize: 28, bold: true, color: C.gold, fontFace: "Georgia", align: "right",
  });
  slide.addText("Inteligência de Pessoas", {
    x: 10.5, y: 7.0, w: 2.3, h: 0.3,
    fontSize: 10, color: "8899AA", fontFace: "Calibri", align: "right",
  });

  // Year badge
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 11.5, y: 1.5, w: 1.2, h: 0.5, rectRadius: 0.1,
    fill: { color: C.gold },
  });
  slide.addText("2026", {
    x: 11.5, y: 1.5, w: 1.2, h: 0.5,
    fontSize: 18, bold: true, color: C.navy, fontFace: "Georgia", align: "center", valign: "middle",
  });
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 2 — O PROBLEMA
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("O Inimigo Silencioso do Crescimento:", {
    x: 0.8, y: 0.5, w: 11, h: 0.6,
    fontSize: 32, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText("A Gestão por Achismo", {
    x: 0.8, y: 1.05, w: 11, h: 0.5,
    fontSize: 28, bold: true, color: C.gold, fontFace: "Georgia",
  });
  addGoldLine(slide, 0.8, 1.6, 3);

  const cards = [
    {
      title: "Ineficiência Operacional", icon: "⚠",
      body: "Custos ocultos com retrabalho, processos\nredundantes e falta de visibilidade sobre\na real alocação de recursos.",
    },
    {
      title: "Injustiça nas Avaliações", icon: "⚖",
      body: "Avaliações subjetivas baseadas em\npercepções, não em dados. Falta de\nmeritocracia e critérios transparentes.",
    },
    {
      title: "Riscos Críticos", icon: "🔥",
      body: "Passivos trabalhistas por jornadas\nirregulares, burnout não detectado e\ndimensionamento inadequado de equipes.",
    },
    {
      title: "Perda de Talentos", icon: "📉",
      body: "Colaboradores de alta performance saem\npor falta de reconhecimento, plano de\ncarreira e desenvolvimento estruturado.",
    },
  ];

  const positions = [
    { x: 0.8, y: 2.1 }, { x: 6.8, y: 2.1 },
    { x: 0.8, y: 4.5 }, { x: 6.8, y: 4.5 },
  ];

  cards.forEach((c, i) => {
    const pos = positions[i];
    card(slide, {
      x: pos.x, y: pos.y, w: 5.6, h: 2.1,
      title: c.title, body: c.body,
      borderColor: i === 2 ? C.red : C.gold,
    });
    iconCircle(slide, { x: pos.x + 4.7, y: pos.y + 0.15, size: 0.5, text: c.icon });
  });

  addFooter(slide);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 3 — OS CUSTOS
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("A falta de dados gera perdas tangíveis e diárias.", {
    x: 0.8, y: 0.5, w: 11, h: 0.7,
    fontSize: 32, bold: true, color: C.navy, fontFace: "Georgia",
  });
  addGoldLine(slide, 0.8, 1.25, 3);

  const cols = [
    {
      icon: "💰", title: "Custo Financeiro",
      items: [
        "Jornadas estendidas sem controle",
        "Dimensionamento impreciso de equipes",
        "Perda silenciosa de produtividade",
        "Decisões baseadas em intuição",
      ],
    },
    {
      icon: "❤", title: "Custo Humano",
      items: [
        "Perda de talentos por falta de dados",
        "Feedbacks inconsistentes e tardios",
        "Risco de burnout não identificado",
        "Desmotivação e desengajamento",
      ],
    },
    {
      icon: "🎯", title: "Custo Estratégico",
      items: [
        "Cortes de equipe ineficazes",
        "Incapacidade de alinhar força de trabalho",
        "Decisões estratégicas às cegas",
        "Perda de competitividade",
      ],
    },
  ];

  cols.forEach((col, i) => {
    const x = 0.8 + i * 4.1;
    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.7, w: 3.8, h: 4.8, rectRadius: 0.12,
      fill: { color: C.white },
      shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
    });
    // Icon
    iconCircle(slide, { x: x + 1.5, y: 1.95, size: 0.7, color: C.navy, text: col.icon });
    // Title
    slide.addText(col.title, {
      x, y: 2.8, w: 3.8, h: 0.45,
      fontSize: 16, bold: true, color: C.navy, fontFace: "Georgia", align: "center",
    });
    addGoldLine(slide, x + 1.2, 3.3, 1.4);
    // Items
    col.items.forEach((item, j) => {
      slide.addText(`▸  ${item}`, {
        x: x + 0.3, y: 3.5 + j * 0.55, w: 3.2, h: 0.45,
        fontSize: 12, color: C.charcoal, fontFace: "Calibri", valign: "middle",
      });
    });
  });

  addFooter(slide);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 4 — OCEANO VERMELHO
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("O Oceano Vermelho da Vigilância:", {
    x: 0.8, y: 0.5, w: 11, h: 0.6,
    fontSize: 30, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText("Soluções que Trocam Confiança por Controle.", {
    x: 0.8, y: 1.05, w: 11, h: 0.5,
    fontSize: 24, bold: true, color: C.red, fontFace: "Georgia",
  });
  addGoldLine(slide, 0.8, 1.6, 3);

  // Competitors badge
  const competitors = ["Teramind UAM", "FSense", "Monitoo"];
  competitors.forEach((name, i) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8 + i * 2.6, y: 1.9, w: 2.3, h: 0.45, rectRadius: 0.1,
      fill: { color: "FFE8E8" },
      line: { color: C.red, width: 1 },
    });
    slide.addText(name, {
      x: 0.8 + i * 2.6, y: 1.9, w: 2.3, h: 0.45,
      fontSize: 12, bold: true, color: C.red, fontFace: "Calibri", align: "center", valign: "middle",
    });
  });

  // List with X
  const items = [
    "Monitoramento detalhado de atividades individuais",
    "Rastreamento de tempo focado em pausas e inatividade",
    "Pontuação de produtividade individual exposta",
    "Ferramentas invasivas: capturas de tela, gravação de sessão",
    "Alertas de comportamento \"suspeito\" e \"desvio de padrão\"",
    "Foco em conformidade através do controle e vigilância",
  ];

  // Card background
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 2.6, w: 7.5, h: 4.2, rectRadius: 0.12,
    fill: { color: C.white },
    shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
  });

  items.forEach((item, i) => {
    slide.addText("✕", {
      x: 1.1, y: 2.85 + i * 0.6, w: 0.4, h: 0.4,
      fontSize: 16, bold: true, color: C.red, fontFace: "Calibri", align: "center", valign: "middle",
    });
    slide.addText(item, {
      x: 1.6, y: 2.85 + i * 0.6, w: 6.3, h: 0.4,
      fontSize: 13, color: C.charcoal, fontFace: "Calibri", valign: "middle",
    });
  });

  // Quote box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.8, y: 2.6, w: 4.0, h: 4.2, rectRadius: 0.12,
    fill: { color: C.navy },
  });
  slide.addText("\u201CEssa abordagem destr\u00F3i a confian\u00E7a, a autonomia e a seguran\u00E7a psicol\u00F3gica \u2014 os pilares da alta performance.\u201D", {
    x: 9.1, y: 3.2, w: 3.4, h: 2.8,
    fontSize: 16, italic: true, color: C.white, fontFace: "Georgia",
    lineSpacingMultiple: 1.5, valign: "middle",
  });
  // Gold accent
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 9.0, y: 3.4, w: 0.06, h: 2.2, fill: { color: C.gold },
  });

  addFooter(slide);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 5 — A SOLUÇÃO
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.navy };

  slide.addText("Trazemos luz para a\ncaixa-preta da operação.", {
    x: 1.0, y: 0.6, w: 11, h: 1.5,
    fontSize: 40, bold: true, color: C.white, fontFace: "Georgia",
    lineSpacingMultiple: 1.1,
  });
  addGoldLine(slide, 1.0, 2.2, 2.5);

  // Flow: Dados Brutos → RKSAM → Decisões Inteligentes
  const flowBoxes = [
    { label: "Dados Brutos\nda Operação", color: "2A4A6F", x: 1.5 },
    { label: "RKSAM\nInteligência", color: C.gold, x: 5.2 },
    { label: "Decisões\nInteligentes", color: C.blue, x: 8.9 },
  ];

  flowBoxes.forEach((box) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: box.x, y: 2.8, w: 3.0, h: 1.5, rectRadius: 0.15,
      fill: { color: box.color },
    });
    slide.addText(box.label, {
      x: box.x, y: 2.8, w: 3.0, h: 1.5,
      fontSize: 18, bold: true, color: C.white, fontFace: "Georgia",
      align: "center", valign: "middle", lineSpacingMultiple: 1.2,
    });
  });

  // Arrows
  [4.55, 8.25].forEach((ax) => {
    slide.addText("→", {
      x: ax, y: 3.1, w: 0.7, h: 1.0,
      fontSize: 36, color: C.gold, fontFace: "Calibri", align: "center", valign: "middle",
    });
  });

  // Quote
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 1.3, y: 4.8, w: 0.06, h: 1.0, fill: { color: C.gold },
  });
  slide.addText("\u201COs dados gerados por cada colaborador falam por ele.\nPromovemos cultura de transpar\u00EAncia, avalia\u00E7\u00F5es justas e meritocracia.\u201D", {
    x: 1.6, y: 4.8, w: 10, h: 1.0,
    fontSize: 17, italic: true, color: C.gold, fontFace: "Georgia",
    lineSpacingMultiple: 1.5,
  });

  // Big numbers row
  const nums = [
    { n: "2,1 bi", l: "eventos coletados" },
    { n: "~7.000", l: "profissionais" },
    { n: "11M+", l: "novos eventos/dia" },
  ];
  nums.forEach((item, i) => {
    const x = 1.0 + i * 4.0;
    slide.addText(item.n, {
      x, y: 6.0, w: 3.5, h: 0.6,
      fontSize: 30, bold: true, color: C.gold, fontFace: "Georgia", align: "center",
    });
    slide.addText(item.l, {
      x, y: 6.55, w: 3.5, h: 0.35,
      fontSize: 12, color: "8899AA", fontFace: "Calibri", align: "center",
    });
  });

  addFooter(slide, true);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 6 — OCEANO AZUL
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("A Matriz de Inovação de Valor da RKSAM", {
    x: 0.8, y: 0.5, w: 11, h: 0.7,
    fontSize: 32, bold: true, color: C.navy, fontFace: "Georgia",
  });
  addGoldLine(slide, 0.8, 1.25, 3);

  const quadrants = [
    {
      title: "ELIMINAR", color: C.red, bgColor: "FFEDED",
      items: ["Vigilância invasiva", "Foco em \"tempo logado\"", "Relatórios punitivos"],
      x: 0.8, y: 1.7,
    },
    {
      title: "REDUZIR", color: C.gold, bgColor: C.lightGold,
      items: ["Complexidade de interpretação", "Intervenções reativas", "Métricas isoladas sem contexto"],
      x: 6.8, y: 1.7,
    },
    {
      title: "ELEVAR", color: C.blue, bgColor: "E8EEF8",
      items: ["People Analytics estratégico", "Suporte a lideranças com dados", "Experiência do colaborador", "Transparência ética"],
      x: 0.8, y: 4.3,
    },
    {
      title: "CRIAR", color: C.green, bgColor: "E8F5E9",
      items: ["Feedback contínuo + OKRs", "Alertas preditivos de burnout", "Análise de custos por atividade", "Biorritmo e percepção de jornada"],
      x: 6.8, y: 4.3,
    },
  ];

  quadrants.forEach((q) => {
    // Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: q.x, y: q.y, w: 5.6, h: 2.3, rectRadius: 0.12,
      fill: { color: q.bgColor },
      line: { color: q.color, width: 1.5 },
    });
    // Title
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: q.x + 0.2, y: q.y + 0.15, w: 2.0, h: 0.4, rectRadius: 0.08,
      fill: { color: q.color },
    });
    slide.addText(q.title, {
      x: q.x + 0.2, y: q.y + 0.15, w: 2.0, h: 0.4,
      fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle",
    });
    // Items
    q.items.forEach((item, j) => {
      slide.addText(`▸  ${item}`, {
        x: q.x + 0.3, y: q.y + 0.7 + j * 0.38, w: 5.0, h: 0.35,
        fontSize: 12, color: C.charcoal, fontFace: "Calibri", valign: "middle",
      });
    });
  });

  addFooter(slide);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 7 — CURVA DE VALOR
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("Uma Curva de Valor Radicalmente Diferente.", {
    x: 0.8, y: 0.5, w: 11, h: 0.7,
    fontSize: 32, bold: true, color: C.navy, fontFace: "Georgia",
  });
  addGoldLine(slide, 0.8, 1.25, 3);

  // Chart area background
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.6, w: 11.7, h: 4.5, rectRadius: 0.12,
    fill: { color: C.white },
    shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
  });

  const factors = [
    "Vigilância\nInvasiva",
    "Foco em\nTempo",
    "People\nAnalytics",
    "Suporte à\nLiderança",
    "EX &\nBem-Estar",
    "Alertas\nPreditivos",
  ];
  const rksam = [1, 1, 5, 5, 5, 5]; // values 1-5
  const industry = [5, 5, 2, 1, 1, 1];

  const chartX = 1.5;
  const chartY = 2.0;
  const chartW = 10.2;
  const chartH = 3.2;
  const stepX = chartW / (factors.length - 1);

  // Grid lines
  for (let i = 0; i <= 5; i++) {
    const yy = chartY + chartH - (i / 5) * chartH;
    slide.addShape(pptx.shapes.LINE, {
      x: chartX, y: yy, w: chartW, h: 0,
      line: { color: "E0E0E0", width: 0.5 },
    });
    if (i > 0) {
      slide.addText(`${i}`, {
        x: chartX - 0.4, y: yy - 0.15, w: 0.35, h: 0.3,
        fontSize: 9, color: C.gray, fontFace: "Calibri", align: "right",
      });
    }
  }

  // Factor labels
  factors.forEach((f, i) => {
    slide.addText(f, {
      x: chartX + i * stepX - 0.6, y: chartY + chartH + 0.1, w: 1.2, h: 0.6,
      fontSize: 9, color: C.charcoal, fontFace: "Calibri", align: "center", valign: "top",
      lineSpacingMultiple: 1.1,
    });
  });

  // Draw lines using connected segments
  function drawCurve(values, color, lineWidth = 2.5) {
    for (let i = 0; i < values.length - 1; i++) {
      const x1 = chartX + i * stepX;
      const y1 = chartY + chartH - (values[i] / 5) * chartH;
      const x2 = chartX + (i + 1) * stepX;
      const y2 = chartY + chartH - (values[i + 1] / 5) * chartH;
      slide.addShape(pptx.shapes.LINE, {
        x: x1, y: y1, w: x2 - x1, h: y2 - y1,
        line: { color, width: lineWidth },
      });
    }
    // Dots
    values.forEach((v, i) => {
      const cx = chartX + i * stepX - 0.1;
      const cy = chartY + chartH - (v / 5) * chartH - 0.1;
      slide.addShape(pptx.shapes.OVAL, {
        x: cx, y: cy, w: 0.2, h: 0.2,
        fill: { color },
      });
    });
  }

  drawCurve(industry, C.red, 2);
  drawCurve(rksam, C.blue, 3);

  // Legend
  slide.addShape(pptx.shapes.OVAL, { x: 9.5, y: 1.8, w: 0.2, h: 0.2, fill: { color: C.blue } });
  slide.addText("RKSAM", { x: 9.8, y: 1.75, w: 1.5, h: 0.3, fontSize: 11, bold: true, color: C.blue, fontFace: "Calibri" });
  slide.addShape(pptx.shapes.OVAL, { x: 10.8, y: 1.8, w: 0.2, h: 0.2, fill: { color: C.red } });
  slide.addText("Indústria", { x: 11.1, y: 1.75, w: 1.5, h: 0.3, fontSize: 11, bold: true, color: C.red, fontFace: "Calibri" });

  // Sub
  slide.addText("A RKSAM se posiciona como plataforma de inteligência de pessoas, não de vigilância.", {
    x: 0.8, y: 6.4, w: 11, h: 0.5,
    fontSize: 14, italic: true, color: C.navy, fontFace: "Georgia", align: "center",
  });

  addFooter(slide);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 8 — COMO FUNCIONA 1/2
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("Percepção de Jornada:", {
    x: 0.8, y: 0.5, w: 11, h: 0.6,
    fontSize: 30, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText("Revela a Alocação Real do Tempo", {
    x: 0.8, y: 1.05, w: 11, h: 0.5,
    fontSize: 22, color: C.gold, fontFace: "Georgia", bold: true,
  });
  addGoldLine(slide, 0.8, 1.6, 3);

  // Left side - How it works + Benefits
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.9, w: 5.8, h: 4.6, rectRadius: 0.12,
    fill: { color: C.white },
    shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
  });

  slide.addText("Como Funciona", {
    x: 1.1, y: 2.05, w: 5, h: 0.4,
    fontSize: 15, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText(
    "Um agente leve coleta metadados de uso das ferramentas de trabalho (não conteúdo). " +
    "Os dados são processados em nuvem e transformados em dashboards de alocação de tempo por equipe, projeto e atividade.",
    {
      x: 1.1, y: 2.5, w: 5.2, h: 1.2,
      fontSize: 11, color: C.charcoal, fontFace: "Calibri", lineSpacingMultiple: 1.4, valign: "top",
    }
  );

  slide.addText("Benefícios", {
    x: 1.1, y: 3.8, w: 5, h: 0.4,
    fontSize: 15, bold: true, color: C.navy, fontFace: "Georgia",
  });
  const benefits = [
    "Balanceamento real de carga de trabalho",
    "Capacidade real vs. alocação planejada",
    "Identificação de gargalos operacionais",
    "Dimensionamento preciso de equipes",
  ];
  benefits.forEach((b, i) => {
    slide.addText("✓", {
      x: 1.1, y: 4.25 + i * 0.45, w: 0.3, h: 0.35,
      fontSize: 14, bold: true, color: C.green, fontFace: "Calibri",
    });
    slide.addText(b, {
      x: 1.5, y: 4.25 + i * 0.45, w: 4.8, h: 0.35,
      fontSize: 12, color: C.charcoal, fontFace: "Calibri", valign: "middle",
    });
  });

  // Right side - Flow visual
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.0, y: 1.9, w: 5.8, h: 4.6, rectRadius: 0.12,
    fill: { color: C.navy },
  });

  const flowSteps = [
    { icon: "⌨", label: "Estação de\nTrabalho", y: 2.3 },
    { icon: "📡", label: "Agente\nLeve", y: 3.3 },
    { icon: "☁", label: "Cloud\nProcessing", y: 4.3 },
    { icon: "📊", label: "Dashboard\nInteligente", y: 5.3 },
  ];

  flowSteps.forEach((step, i) => {
    iconCircle(slide, { x: 7.8, y: step.y, size: 0.6, color: C.gold, text: step.icon });
    slide.addText(step.label, {
      x: 8.6, y: step.y, w: 3.5, h: 0.6,
      fontSize: 13, color: C.white, fontFace: "Calibri", bold: true, valign: "middle",
      lineSpacingMultiple: 1.1,
    });
    if (i < flowSteps.length - 1) {
      slide.addText("↓", {
        x: 7.8, y: step.y + 0.6, w: 0.6, h: 0.4,
        fontSize: 18, color: C.gold, fontFace: "Calibri", align: "center",
      });
    }
  });

  // Highlight box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 6.7, w: 12, h: 0.5, rectRadius: 0.08,
    fill: { color: C.gold },
  });
  slide.addText("⚡  Configuração 100% customizável por empresa, equipe e até por colaborador.", {
    x: 0.8, y: 6.7, w: 12, h: 0.5,
    fontSize: 13, bold: true, color: C.navy, fontFace: "Calibri", align: "center", valign: "middle",
  });
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 9 — COMO FUNCIONA 2/2
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("Biorritmo:", {
    x: 0.8, y: 0.5, w: 11, h: 0.6,
    fontSize: 30, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText("Otimiza o Fluxo de Trabalho e a Energia", {
    x: 0.8, y: 1.05, w: 11, h: 0.5,
    fontSize: 22, color: C.gold, fontFace: "Georgia", bold: true,
  });
  addGoldLine(slide, 0.8, 1.6, 3);

  // Left side
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.9, w: 5.8, h: 4.6, rectRadius: 0.12,
    fill: { color: C.white },
    shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
  });

  slide.addText("Como Funciona", {
    x: 1.1, y: 2.05, w: 5, h: 0.4,
    fontSize: 15, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText(
    "Analisa padrões de atividade ao longo do dia para identificar picos de produtividade, " +
    "períodos de baixa energia e flutuações naturais do ritmo de trabalho de cada equipe.",
    {
      x: 1.1, y: 2.5, w: 5.2, h: 1.2,
      fontSize: 11, color: C.charcoal, fontFace: "Calibri", lineSpacingMultiple: 1.4, valign: "top",
    }
  );

  slide.addText("Benefícios", {
    x: 1.1, y: 3.8, w: 5, h: 0.4,
    fontSize: 15, bold: true, color: C.navy, fontFace: "Georgia",
  });
  const benefits = [
    "Identificação de flutuações naturais de energia",
    "Distribuição otimizada de trabalho",
    "Revisão de processos improdutivos",
    "Favorece feedback e troca de ideias",
  ];
  benefits.forEach((b, i) => {
    slide.addText("✓", {
      x: 1.1, y: 4.25 + i * 0.45, w: 0.3, h: 0.35,
      fontSize: 14, bold: true, color: C.green, fontFace: "Calibri",
    });
    slide.addText(b, {
      x: 1.5, y: 4.25 + i * 0.45, w: 4.8, h: 0.35,
      fontSize: 12, color: C.charcoal, fontFace: "Calibri", valign: "middle",
    });
  });

  // Right side - Biorhythm wave visualization
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.0, y: 1.9, w: 5.8, h: 4.6, rectRadius: 0.12,
    fill: { color: C.navy },
  });

  slide.addText("Padrão de Atividade — Dia Típico", {
    x: 7.3, y: 2.1, w: 5.2, h: 0.4,
    fontSize: 13, bold: true, color: C.gold, fontFace: "Calibri", align: "center",
  });

  // Time labels
  const times = ["9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h"];
  times.forEach((t, i) => {
    slide.addText(t, {
      x: 7.3 + i * 0.52, y: 5.9, w: 0.5, h: 0.3,
      fontSize: 8, color: "8899AA", fontFace: "Calibri", align: "center",
    });
  });

  // Wave visualization using bars
  const wave = [3, 5, 5, 2, 1, 4, 5, 4, 3, 2]; // energy levels
  wave.forEach((level, i) => {
    const barH = level * 0.5;
    const barY = 5.7 - barH;
    const barColor = level >= 4 ? C.gold : level >= 3 ? C.blue : "4A6A8F";
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.4 + i * 0.52, y: barY, w: 0.35, h: barH, rectRadius: 0.05,
      fill: { color: barColor },
    });
  });

  // Labels for peaks/valleys
  slide.addText("⚡ Pico", { x: 7.6, y: 2.7, w: 1.5, h: 0.3, fontSize: 10, color: C.gold, fontFace: "Calibri", bold: true });
  slide.addText("💤 Almoço", { x: 9.0, y: 4.5, w: 1.5, h: 0.3, fontSize: 10, color: "8899AA", fontFace: "Calibri" });
  slide.addText("⚡ Retomada", { x: 10.2, y: 2.9, w: 1.5, h: 0.3, fontSize: 10, color: C.gold, fontFace: "Calibri", bold: true });

  // Highlight
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 6.7, w: 12, h: 0.5, rectRadius: 0.08,
    fill: { color: C.gold },
  });
  slide.addText("⚡  A Análise de Biorritmo favorece o feedback e a troca de ideias entre equipes.", {
    x: 0.8, y: 6.7, w: 12, h: 0.5,
    fontSize: 13, bold: true, color: C.navy, fontFace: "Calibri", align: "center", valign: "middle",
  });
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 10 — SEGMENTOS-ALVO
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.cream };

  slide.addText("Nossos Parceiros Ideais:", {
    x: 0.8, y: 0.5, w: 11, h: 0.6,
    fontSize: 30, bold: true, color: C.navy, fontFace: "Georgia",
  });
  slide.addText("Segmentos que Priorizam o Capital Humano", {
    x: 0.8, y: 1.05, w: 11, h: 0.5,
    fontSize: 22, color: C.gold, fontFace: "Georgia", bold: true,
  });
  addGoldLine(slide, 0.8, 1.6, 3);

  const segments = [
    { icon: "💻", title: "Tecnologia\ne Software", desc: "Empresas de produto, SaaS,\nstartups e scale-ups" },
    { icon: "📋", title: "Serviços\nProfissionais", desc: "Consultorias, advocacia,\nauditoria e BPOs" },
    { icon: "🎨", title: "Agências\nCriativas", desc: "Marketing, publicidade,\nconteúdo e design" },
    { icon: "🏦", title: "Setor\nFinanceiro", desc: "Bancos, seguradoras,\nfintechs e corretoras" },
    { icon: "🏗", title: "Engenharia\ne Arquitetura", desc: "Escritórios de projeto,\nconstrução e infraestrutura" },
    { icon: "🏥", title: "Saúde\nCorporativa", desc: "Administrativo e operacional\nde hospitais e clínicas" },
  ];

  const positions = [
    { x: 0.8, y: 2.0 }, { x: 4.9, y: 2.0 }, { x: 9.0, y: 2.0 },
    { x: 0.8, y: 4.5 }, { x: 4.9, y: 4.5 }, { x: 9.0, y: 4.5 },
  ];

  segments.forEach((seg, i) => {
    const pos = positions[i];
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: pos.x, y: pos.y, w: 3.8, h: 2.2, rectRadius: 0.12,
      fill: { color: C.white },
      shadow: { type: "outer", blur: 6, offset: 2, color: "CCCCCC", opacity: 0.3 },
    });
    // Gold left border
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: pos.x, y: pos.y + 0.1, w: 0.06, h: 2.0, fill: { color: C.gold },
    });
    // Icon
    iconCircle(slide, { x: pos.x + 0.3, y: pos.y + 0.3, size: 0.6, color: C.navy, text: seg.icon });
    // Title
    slide.addText(seg.title, {
      x: pos.x + 1.1, y: pos.y + 0.25, w: 2.4, h: 0.7,
      fontSize: 14, bold: true, color: C.navy, fontFace: "Georgia", lineSpacingMultiple: 1.1,
    });
    // Desc
    slide.addText(seg.desc, {
      x: pos.x + 0.3, y: pos.y + 1.15, w: 3.2, h: 0.8,
      fontSize: 11, color: C.gray, fontFace: "Calibri", lineSpacingMultiple: 1.3,
    });
  });

  addFooter(slide);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 11 — CLIENTES
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.navy };

  slide.addText("A escolha de líderes que operam\ncom base em dados.", {
    x: 1.0, y: 0.6, w: 11, h: 1.3,
    fontSize: 36, bold: true, color: C.white, fontFace: "Georgia",
    lineSpacingMultiple: 1.1,
  });
  slide.addText("Processamos bilhões de eventos para empresas que não abrem mão da excelência operacional.", {
    x: 1.0, y: 2.0, w: 10, h: 0.5,
    fontSize: 16, color: C.gold, fontFace: "Calibri",
  });
  addGoldLine(slide, 1.0, 2.6, 2.5);

  const clients = [
    { name: "Banco\nRendimento", events: "3M", desc: "eventos/dia", icon: "🏦" },
    { name: "MAG\nSeguradora", events: "2,5M", desc: "eventos/dia", icon: "🛡" },
    { name: "Qintess", events: "2M", desc: "eventos/dia", icon: "💎" },
  ];

  clients.forEach((client, i) => {
    const x = 1.0 + i * 4.1;
    // Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.2, w: 3.7, h: 3.5, rectRadius: 0.15,
      fill: { color: "223F63" },
      line: { color: C.gold, width: 1 },
    });
    // Icon
    iconCircle(slide, { x: x + 1.45, y: 3.5, size: 0.7, color: C.gold, text: client.icon });
    // Name
    slide.addText(client.name, {
      x, y: 4.4, w: 3.7, h: 0.8,
      fontSize: 18, bold: true, color: C.white, fontFace: "Georgia",
      align: "center", valign: "middle", lineSpacingMultiple: 1.1,
    });
    // Big number
    slide.addText(client.events, {
      x, y: 5.3, w: 3.7, h: 0.7,
      fontSize: 40, bold: true, color: C.gold, fontFace: "Georgia", align: "center",
    });
    // Desc
    slide.addText(client.desc, {
      x, y: 5.95, w: 3.7, h: 0.4,
      fontSize: 13, color: "8899AA", fontFace: "Calibri", align: "center",
    });
  });

  addFooter(slide, true);
})();

// ════════════════════════════════════════════════════════════════
// SLIDE 12 — FECHAMENTO
// ════════════════════════════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { fill: C.navy };

  // Gold accent line
  addGoldLine(slide, 2.5, 1.8, 8.33);

  // Main quote
  slide.addText("Dados são o novo petróleo.\nNós somos a refinaria.", {
    x: 1.0, y: 2.0, w: 11.33, h: 2.0,
    fontSize: 44, bold: true, color: C.white, fontFace: "Georgia",
    align: "center", lineSpacingMultiple: 1.15,
  });

  // Sub
  slide.addText("Refinamos os dados operacionais da sua empresa e os\ntransformamos em energia para o seu negócio.", {
    x: 2.0, y: 4.0, w: 9.33, h: 0.9,
    fontSize: 18, color: C.gold, fontFace: "Calibri",
    align: "center", lineSpacingMultiple: 1.4,
  });

  // CTA button
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 4.5, y: 5.2, w: 4.33, h: 0.7, rectRadius: 0.15,
    fill: { color: C.gold },
  });
  slide.addText("Vamos transformar seus dados em resultados?", {
    x: 4.5, y: 5.2, w: 4.33, h: 0.7,
    fontSize: 14, bold: true, color: C.navy, fontFace: "Calibri",
    align: "center", valign: "middle",
  });

  // Bottom gold line
  addGoldLine(slide, 2.5, 6.2, 8.33);

  // RKSAM logo
  slide.addText("RKSAM", {
    x: 5.0, y: 6.4, w: 3.33, h: 0.6,
    fontSize: 32, bold: true, color: C.gold, fontFace: "Georgia", align: "center",
  });
  slide.addText("Inteligência de Pessoas", {
    x: 5.0, y: 6.95, w: 3.33, h: 0.3,
    fontSize: 12, color: "8899AA", fontFace: "Calibri", align: "center",
  });
})();

// ── Generate ──
const outputPath = "/Users/josesevero/Documents/RKSAM_Apresentacao_2026.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log(`✅ Apresentação gerada: ${outputPath}`);
}).catch((err) => {
  console.error("Erro:", err);
});
