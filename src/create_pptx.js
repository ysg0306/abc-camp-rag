const PptxGenJS = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Nordic Modern Color Palette
const COLORS = {
  darkBg: "1A1F2B",      // Deep navy (dark slides)
  lightBg: "F7F5F2",     // Warm off-white (light slides)
  accent: "5B8A72",      // Nordic green/sage
  accentLight: "8FB996", // Light sage
  warm: "D4A574",        // Warm wood/terracotta
  text: "2C3E50",        // Dark text
  textLight: "7F8C8D",   // Muted text
  white: "FFFFFF",
  cardBg: "FFFFFF",
  subtleGray: "E8E4DF",
};

const FONTS = {
  header: "Georgia",
  body: "Calibri",
};

// Helper: create shadow object (fresh each time to avoid mutation)
const makeShadow = () => ({
  type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.10
});

// Icon rendering
const { FaBook, FaChartLine, FaUsers, FaStar, FaBullseye, FaLightbulb, FaRocket, FaCheckCircle, FaArrowRight, FaGlobeAsia, FaPen, FaCalendarAlt, FaMoneyBillWave, FaChartBar, FaSearch } = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Helper: add footer bar
function addFooter(slide, slideNum, total, lightBg = true, pres) {
  const bgColor = lightBg ? COLORS.subtleGray : "151922";
  const textColor = lightBg ? COLORS.textLight : "5A6270";
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.2, w: 10, h: 0.425,
    fill: { color: bgColor }
  });
  slide.addText("Yes24 베스트셀러 기반 신규 도서 기획", {
    x: 0.5, y: 5.22, w: 6, h: 0.4,
    fontSize: 9, fontFace: FONTS.body, color: textColor, margin: 0
  });
  slide.addText(`${slideNum} / ${total}`, {
    x: 8.5, y: 5.22, w: 1, h: 0.4,
    fontSize: 9, fontFace: FONTS.body, color: textColor, align: "right", margin: 0
  });
}

async function main() {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";
  pres.author = "ABC-RAG";
  pres.title = "Yes24 베스트셀러 기반 신규 도서 기획";

  const TOTAL = 15;

  // Pre-render icons
  const icons = {
    book: await iconToBase64Png(FaBook, "#FFFFFF", 256),
    chart: await iconToBase64Png(FaChartLine, "#5B8A72", 256),
    users: await iconToBase64Png(FaUsers, "#5B8A72", 256),
    star: await iconToBase64Png(FaStar, "#D4A574", 256),
    target: await iconToBase64Png(FaBullseye, "#5B8A72", 256),
    lightbulb: await iconToBase64Png(FaLightbulb, "#D4A574", 256),
    rocket: await iconToBase64Png(FaRocket, "#FFFFFF", 256),
    check: await iconToBase64Png(FaCheckCircle, "#5B8A72", 256),
    arrow: await iconToBase64Png(FaArrowRight, "#5B8A72", 256),
    globe: await iconToBase64Png(FaGlobeAsia, "#5B8A72", 256),
    pen: await iconToBase64Png(FaPen, "#D4A574", 256),
    calendar: await iconToBase64Png(FaCalendarAlt, "#5B8A72", 256),
    money: await iconToBase64Png(FaMoneyBillWave, "#5B8A72", 256),
    bar: await iconToBase64Png(FaChartBar, "#5B8A72", 256),
    search: await iconToBase64Png(FaSearch, "#FFFFFF", 256),
    bookDark: await iconToBase64Png(FaBook, "#5B8A72", 256),
    chartDark: await iconToBase64Png(FaChartLine, "#5B8A72", 256),
    penDark: await iconToBase64Png(FaPen, "#5B8A72", 256),
    chartWhite: await iconToBase64Png(FaChartLine, "#FFFFFF", 256),
    starWhite: await iconToBase64Png(FaStar, "#FFFFFF", 256),
    penWhite: await iconToBase64Png(FaPen, "#FFFFFF", 256),
  };

  // ============================================================
  // SLIDE 1: Title Slide (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    // Decorative top-left accent shape
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.accent }
    });

    // Small decorative circle
    slide.addShape(pres.shapes.OVAL, {
      x: 8.5, y: 0.5, w: 1.2, h: 1.2,
      fill: { color: COLORS.accent, transparency: 80 }
    });

    slide.addImage({ data: icons.book, x: 0.7, y: 1.2, w: 0.6, h: 0.6 });

    slide.addText("Yes24 베스트셀러 기반\n신규 도서 기획", {
      x: 0.7, y: 2.0, w: 8, h: 1.8,
      fontSize: 40, fontFace: FONTS.header, color: COLORS.white,
      bold: true, lineSpacingMultiple: 1.3, margin: 0
    });

    slide.addText("AI 시대, 독자가 원하는 책의 방향을 데이터로 증명합니다", {
      x: 0.7, y: 3.9, w: 7, h: 0.5,
      fontSize: 16, fontFace: FONTS.body, color: COLORS.accentLight, margin: 0
    });

    slide.addText("2025-2026 베스트셀러 1,000권 분석 기반", {
      x: 0.7, y: 4.5, w: 5, h: 0.4,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
    });

    slide.addNotes("안녕하십니까. 오늘 발표는 Yes24 베스트셀러 1,000권의 데이터를 분석하여 신규 도서 기획 방향을 제시하는 자리입니다. AI 시대에 독자들이 어떤 책을 원하고, 어떤 트렌드가 움직이고 있는지 데이터를 통해 확인하겠습니다.");
  }

  // ============================================================
  // SLIDE 2: Agenda (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addText("발표 개요", {
      x: 0.7, y: 0.4, w: 8, h: 0.7,
      fontSize: 32, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    const agendaItems = [
      { num: "01", title: "시장 현황", desc: "베스트셀러 데이터 종합 분석" },
      { num: "02", title: "트렌드 분석", desc: "출판사, 가격, 키워드 트렌드" },
      { num: "03", title: "기회 영역", desc: "미충족 수요와 기획 방향" },
      { num: "04", title: "도서 기획안", desc: "핵심 기획 3건 제시" },
      { num: "05", title: "실행 로드맵", desc: "단계별 추진 계획" },
    ];

    agendaItems.forEach((item, i) => {
      const y = 1.4 + i * 0.78;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y: y, w: 8.6, h: 0.65,
        fill: { color: COLORS.cardBg },
        shadow: makeShadow()
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y: y, w: 0.08, h: 0.65,
        fill: { color: COLORS.accent }
      });
      slide.addText(item.num, {
        x: 1.0, y: y, w: 0.6, h: 0.65,
        fontSize: 20, fontFace: FONTS.header, color: COLORS.accent, bold: true, valign: "middle", margin: 0
      });
      slide.addText(item.title, {
        x: 1.7, y: y, w: 3, h: 0.65,
        fontSize: 16, fontFace: FONTS.body, color: COLORS.text, bold: true, valign: "middle", margin: 0
      });
      slide.addText(item.desc, {
        x: 4.5, y: y, w: 4.5, h: 0.65,
        fontSize: 13, fontFace: FONTS.body, color: COLORS.textLight, valign: "middle", margin: 0
      });
    });

    addFooter(slide, 2, TOTAL, true, pres);

    slide.addNotes("오늘 발표는 크게 5개 섹션으로 구성됩니다. 먼저 시장 현황을 살펴보고, 트렌드를 분석한 뒤, 기회 영역을 도출하겠습니다. 이어서 구체적인 도서 기획안 3건을 제시하고, 마지막으로 실행 로드맵을 공유드리겠습니다.");
  }

  // ============================================================
  // SLIDE 3: 시장 현황 - 핵심 지표 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.accent }
    });

    slide.addText("시장 현황: 핵심 지표", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.white, bold: true, margin: 0
    });

    const stats = [
      { value: "1,000", label: "분석 도서 수", icon: icons.book },
      { value: "22,845", label: "평균 판매가 (원)", icon: icons.money },
      { value: "9.59", label: "평균 평점", icon: icons.starWhite },
      { value: "8.5%", label: "평균 할인율", icon: icons.chartWhite },
    ];

    stats.forEach((stat, i) => {
      const x = 0.7 + i * 2.3;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x, y: 1.3, w: 2.1, h: 2.5,
        fill: { color: "232A3B" },
        shadow: makeShadow()
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x, y: 1.3, w: 2.1, h: 0.06,
        fill: { color: COLORS.accent }
      });
      slide.addImage({ data: stat.icon, x: x + 0.8, y: 1.6, w: 0.45, h: 0.45 });
      slide.addText(stat.value, {
        x: x, y: 2.2, w: 2.1, h: 0.7,
        fontSize: 28, fontFace: FONTS.header, color: COLORS.white, bold: true, align: "center", margin: 0
      });
      slide.addText(stat.label, {
        x: x, y: 2.9, w: 2.1, h: 0.6,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.textLight, align: "center", margin: 0
      });
    });

    slide.addText("1,000권의 베스트셀러를 분석한 결과, 평균 판매가는 약 2만 3천원, 평점은 9.59로 매우 높은 수준을 유지하고 있습니다. 할인율은 평균 8.5%로, 가격 경쟁보다는 가치 경쟁이 주요 트렌드입니다.", {
      x: 0.7, y: 4.1, w: 8.6, h: 0.9,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
    });

    addFooter(slide, 3, TOTAL, false, pres);

    slide.addNotes("베스트셀러 1,000권을 분석한 핵심 지표입니다. 평균 판매가는 약 2만 3천원으로, 전반적으로 프리미엄 가격대가 형성되어 있습니다. 평균 평점이 9.59로 매우 높은데, 이는 독자들의 만족도가 높다는 것을 의미합니다. 할인율은 평균 8.5%로 낮은 편이어서, 가격 할인보다는 콘텐츠 가치로 승부하는 시장임을 알 수 있습니다.");
  }

  // ============================================================
  // SLIDE 4: 출판사별 포지셔닝 (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addImage({ data: icons.chartDark, x: 0.7, y: 0.35, w: 0.4, h: 0.4 });
    slide.addText("출판사별 포지셔닝", {
      x: 1.2, y: 0.3, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    slide.addChart(pres.charts.BAR, [{
      name: "도서 수",
      labels: ["한빛미디어", "골든래빗", "이지스퍼블리싱", "길벗", "한빛비즈", "프리렉", "앤써북", "학교도서관저널"],
      values: [180, 120, 95, 85, 70, 55, 50, 45]
    }], {
      x: 0.5, y: 1.2, w: 5.5, h: 3.5,
      barDir: "col",
      chartColors: [COLORS.accent],
      chartArea: { fill: { color: COLORS.cardBg }, roundedCorners: true },
      catAxisLabelColor: COLORS.textLight,
      valAxisLabelColor: COLORS.textLight,
      catAxisLabelFontSize: 10,
      valGridLine: { color: "E2E8F0", size: 0.5 },
      catGridLine: { style: "none" },
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: COLORS.text,
      dataLabelFontSize: 10,
      showLegend: false,
    });

    // Insight card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y: 1.2, w: 3.3, h: 3.5,
      fill: { color: COLORS.cardBg },
      shadow: makeShadow()
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y: 1.2, w: 0.08, h: 3.5,
      fill: { color: COLORS.accent }
    });
    slide.addText("Key Insight", {
      x: 6.6, y: 1.4, w: 2.8, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
    });
    slide.addText([
      { text: "한빛미디어가 전체의 약 18%를 차지하며 AI/개발 도서 시장을 주도하고 있습니다.", options: { breakLine: true, fontSize: 12 } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "골든래빗은 교육·에듀테크 분야에서 강세를 보이고 있으며,", options: { breakLine: true, fontSize: 12 } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "이지스퍼블리싱은 프로그래밍 입문서로 꾸준한 성과를 내고 있습니다.", options: { fontSize: 12 } },
    ], {
      x: 6.6, y: 1.9, w: 2.8, h: 2.5,
      fontFace: FONTS.body, color: COLORS.text, lineSpacingMultiple: 1.2, margin: 0
    });

    addFooter(slide, 4, TOTAL, true, pres);

    slide.addNotes("출판사별 포지셔닝을 살펴보면, 한빛미디어가 전체의 약 18%를 차지하며 시장을 주도하고 있습니다. AI와 개발 관련 도서가 강점입니다. 골든래빗은 교육과 에듀테크 분야에서, 이지스퍼블리싱은 프로그래밍 입문서에서 강세를 보이고 있습니다. 신규 기획 시 이 출판사들의 영역을 참고하되, 차별화된 포지셔닝이 필요합니다.");
  }

  // ============================================================
  // SLIDE 5: 가격 분석 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.warm }
    });

    slide.addText("가격 분석: 프리미엄 시장 형성", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 28, fontFace: FONTS.header, color: COLORS.white, bold: true, margin: 0
    });

    slide.addChart(pres.charts.PIE, [{
      name: "가격대",
      labels: ["~15,000원", "15,001~20,000원", "20,001~25,000원", "25,001~30,000원", "30,001원~"],
      values: [80, 220, 350, 250, 100]
    }], {
      x: 0.5, y: 1.2, w: 5, h: 3.8,
      showPercent: true,
      showTitle: false,
      showLegend: true,
      legendPos: "b",
      legendColor: COLORS.textLight,
      legendFontSize: 10,
      chartColors: ["8FB996", "5B8A72", "D4A574", "C4956A", "A67B5B"],
      dataLabelColor: COLORS.white,
      dataLabelFontSize: 10,
    });

    // Right side insight
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.8, y: 1.2, w: 3.8, h: 3.8,
      fill: { color: "232A3B" }
    });

    slide.addText("가격대별 비중", {
      x: 6.1, y: 1.4, w: 3.2, h: 0.4,
      fontSize: 16, fontFace: FONTS.body, color: COLORS.warm, bold: true, margin: 0
    });

    const priceData = [
      { range: "20,001~25,000원", pct: "35%", bar: 3.2 },
      { range: "15,001~20,000원", pct: "22%", bar: 2.0 },
      { range: "25,001~30,000원", pct: "25%", bar: 2.3 },
      { range: "30,001원~", pct: "10%", bar: 0.9 },
      { range: "~15,000원", pct: "8%", bar: 0.7 },
    ];

    priceData.forEach((d, i) => {
      const y = 2.0 + i * 0.58;
      slide.addText(d.range, {
        x: 6.1, y: y, w: 2.0, h: 0.3,
        fontSize: 10, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
      slide.addText(d.pct, {
        x: 8.3, y: y, w: 0.8, h: 0.3,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.white, bold: true, align: "right", margin: 0
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 6.1, y: y + 0.3, w: d.bar, h: 0.06,
        fill: { color: COLORS.warm }
      });
    });

    addFooter(slide, 5, TOTAL, false, pres);

    slide.addNotes("가격 분석 결과를 보면, 2만원에서 2만 5천원 사이가 전체의 35%로 가장 큰 비중을 차지하고 있습니다. 2만 5천원 이상의 프리미엄 가격대도 약 35%로, 고가 도서에 대한 수요가 확실히 존재합니다. 이는 전문서적이나 실전 가이드 형식의 도서가 시장에서 인정받고 있다는 신호입니다.");
  }

  // ============================================================
  // SLIDE 6: AI/코딩 도서 트렌드 (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addImage({ data: icons.penDark, x: 0.7, y: 0.35, w: 0.4, h: 0.4 });
    slide.addText("AI/코딩 도서 트렌드", {
      x: 1.2, y: 0.3, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    slide.addChart(pres.charts.BAR, [
      {
        name: "바이브 코딩",
        labels: ["2025 상반기", "2025 하반기", "2026 상반기"],
        values: [30, 85, 150]
      },
      {
        name: "AI 활용법",
        labels: ["2025 상반기", "2025 하반기", "2026 상반기"],
        values: [45, 120, 180]
      },
      {
        name: "교육 AI",
        labels: ["2025 상반기", "2025 하반기", "2026 상반기"],
        values: [20, 60, 110]
      }
    ], {
      x: 0.5, y: 1.2, w: 5.5, h: 3.5,
      barDir: "col",
      chartColors: [COLORS.accent, COLORS.warm, "8FB996"],
      chartArea: { fill: { color: COLORS.cardBg }, roundedCorners: true },
      catAxisLabelColor: COLORS.textLight,
      valAxisLabelColor: COLORS.textLight,
      catAxisLabelFontSize: 10,
      valGridLine: { color: "E2E8F0", size: 0.5 },
      catGridLine: { style: "none" },
      showLegend: true,
      legendPos: "b",
      legendColor: COLORS.text,
      legendFontSize: 10,
    });

    // Right side key stats
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y: 1.2, w: 3.3, h: 3.5,
      fill: { color: COLORS.cardBg },
      shadow: makeShadow()
    });

    slide.addText("성장률", {
      x: 6.6, y: 1.4, w: 2.8, h: 0.35,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
    });

    const growthStats = [
      { label: "바이브 코딩", value: "+400%", color: COLORS.accent },
      { label: "AI 활용법", value: "+300%", color: COLORS.warm },
      { label: "교육 AI", value: "+450%", color: "8FB996" },
    ];

    growthStats.forEach((g, i) => {
      const y = 1.9 + i * 1.0;
      slide.addText(g.value, {
        x: 6.6, y: y, w: 2.8, h: 0.5,
        fontSize: 32, fontFace: FONTS.header, color: g.color, bold: true, margin: 0
      });
      slide.addText(g.label, {
        x: 6.6, y: y + 0.45, w: 2.8, h: 0.3,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
    });

    addFooter(slide, 6, TOTAL, true, pres);

    slide.addNotes("AI와 코딩 관련 도서의 성장 추이를 보면, 모든 카테고리에서 폭발적인 성장이 일어나고 있습니다. 특히 바이브 코딩은 2025년 상반기 대비 2026년 상반기에 약 400% 성장했고, 교육 AI는 450% 성장했습니다. 이는 AI 도구의 실무 활용에 대한 수요가 급격히 증가하고 있음을 보여줍니다.");
  }

  // ============================================================
  // SLIDE 7: 교육 도서 시장 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.accent }
    });

    slide.addText("교육 도서 시장: 숨겨진 기회", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 28, fontFace: FONTS.header, color: COLORS.white, bold: true, margin: 0
    });

    // Key education stats
    const eduStats = [
      { value: "320", unit: "권", label: "교육 관련 도서", color: COLORS.accent },
      { value: "9.8", unit: "점", label: "교육 도서 평균 평점", color: COLORS.warm },
      { value: "21,500", unit: "원", label: "교육 도서 평균 가격", color: COLORS.accentLight },
    ];

    eduStats.forEach((s, i) => {
      const x = 0.7 + i * 3.1;
      slide.addText([
        { text: s.value, options: { fontSize: 44, fontFace: FONTS.header, color: s.color, bold: true } },
        { text: s.unit, options: { fontSize: 18, fontFace: FONTS.body, color: COLORS.textLight } },
      ], {
        x: x, y: 1.2, w: 2.8, h: 0.8, margin: 0
      });
      slide.addText(s.label, {
        x: x, y: 2.0, w: 2.8, h: 0.4,
        fontSize: 13, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
    });

    // Divider
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 2.7, w: 8.6, h: 0.02,
      fill: { color: "2A3142" }
    });

    slide.addText("주요 교육 도서 카테고리", {
      x: 0.7, y: 2.9, w: 8, h: 0.5,
      fontSize: 18, fontFace: FONTS.body, color: COLORS.white, bold: true, margin: 0
    });

    const eduCategories = [
      { name: "AI 수업 활용 가이드", count: "85권", share: "26.6%" },
      { name: "에듀테크 도구 활용", count: "72권", share: "22.5%" },
      { name: "바이브 코딩 (교육)", count: "65권", share: "20.3%" },
      { name: "프롬프트 엔지니어링", count: "55권", share: "17.2%" },
      { name: "기타 교육 혁신", count: "43권", share: "13.4%" },
    ];

    eduCategories.forEach((c, i) => {
      const y = 3.5 + i * 0.35;
      slide.addText(c.name, {
        x: 0.7, y: y, w: 3.5, h: 0.32,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
      slide.addText(c.count, {
        x: 4.5, y: y, w: 1.5, h: 0.32,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.accent, bold: true, align: "center", margin: 0
      });
      slide.addText(c.share, {
        x: 6.2, y: y, w: 1.2, h: 0.32,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.warm, align: "right", margin: 0
      });
    });

    addFooter(slide, 7, TOTAL, false, pres);

    slide.addNotes("교육 도서 시장은 숨겨진 기회가 많은 영역입니다. 전체 베스트셀러 중 약 320권, 즉 32%가 교육 관련 도서입니다. 평균 평점이 9.8로 전체 평균보다 높고, 가격도 약 2만 1천원대로 안정적입니다. AI 수업 활용 가이드와 에듀테크 도구 활용이 가장 큰 비중을 차지하고 있어, 교사 대상 도서의 수요가 지속적으로 높습니다.");
  }

  // ============================================================
  // SLIDE 8: 키워드 분석 (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addImage({ data: icons.search, x: 0.7, y: 0.35, w: 0.4, h: 0.4 });
    slide.addText("키워드 빈도 분석", {
      x: 1.2, y: 0.3, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    // Word cloud style - keywords with varying sizes
    const keywords = [
      { text: "AI", size: 48, color: COLORS.accent, x: 1.5, y: 1.4 },
      { text: "클로드", size: 36, color: COLORS.warm, x: 3.5, y: 1.3 },
      { text: "코딩", size: 40, color: COLORS.text, x: 6.0, y: 1.5 },
      { text: "제미나이", size: 30, color: COLORS.accentLight, x: 1.0, y: 2.3 },
      { text: "바이브", size: 34, color: COLORS.warm, x: 3.8, y: 2.5 },
      { text: "수업", size: 28, color: COLORS.accent, x: 6.5, y: 2.2 },
      { text: "프롬프트", size: 26, color: COLORS.textLight, x: 1.5, y: 3.2 },
      { text: "교육", size: 32, color: COLORS.accent, x: 4.2, y: 3.3 },
      { text: "활용", size: 24, color: COLORS.warm, x: 6.8, y: 3.0 },
      { text: "챗GPT", size: 30, color: COLORS.text, x: 2.5, y: 3.8 },
      { text: "에듀테크", size: 22, color: COLORS.accentLight, x: 5.5, y: 3.7 },
      { text: "실전", size: 20, color: COLORS.textLight, x: 7.5, y: 3.5 },
    ];

    keywords.forEach(kw => {
      slide.addText(kw.text, {
        x: kw.x, y: kw.y, w: 2.5, h: 0.7,
        fontSize: kw.size, fontFace: FONTS.header, color: kw.color,
        bold: true, margin: 0
      });
    });

    // Right side - top keywords table
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 7.8, y: 1.2, w: 1.8, h: 3.5,
      fill: { color: COLORS.cardBg },
      shadow: makeShadow()
    });
    slide.addText("TOP 5", {
      x: 7.8, y: 1.3, w: 1.8, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.accent, bold: true, align: "center", margin: 0
    });

    const topKeywords = ["AI", "코딩", "클로드", "제미나이", "바이브"];
    topKeywords.forEach((kw, i) => {
      slide.addText(`${i + 1}. ${kw}`, {
        x: 8.0, y: 1.8 + i * 0.5, w: 1.5, h: 0.4,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.text, margin: 0
      });
    });

    addFooter(slide, 8, TOTAL, true, pres);

    slide.addNotes("도서명에서 추출한 키워드 분석입니다. AI, 코딩, 클로드, 제미나이, 바이브가 상위 5개 키워드로 나타납니다. 특히 AI와 코딩이 압도적으로 높은 빈도를 보이고 있어, AI 기반 코딩 도서의 수요가 여전히 강세를 보이고 있습니다. 바이브 코딩이라는 새로운 트렌드도 주목할 만합니다.");
  }

  // ============================================================
  // SLIDE 9: 기회 영역 도출 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.warm }
    });

    slide.addImage({ data: icons.lightbulb, x: 0.7, y: 0.3, w: 0.5, h: 0.5 });
    slide.addText("기회 영역: 미충족 수요", {
      x: 1.3, y: 0.3, w: 8, h: 0.7,
      fontSize: 28, fontFace: FONTS.header, color: COLORS.white, bold: true, margin: 0
    });

    const opportunities = [
      {
        title: "비개발자 대상 AI 실무",
        desc: "코딩을 모르는 직장인·교사를 위한 AI 업무 자동화 가이드가 부족",
        gap: "현재 도서의 70% 이상이 개발자 대상",
        color: COLORS.accent,
      },
      {
        title: "산업별 맞춤 AI 활용",
        desc: "의료, 법률, 금융 등 특정 산업에 특화된 AI 활용서가 거의 없음",
        gap: "범용 AI 활용서만 존재, 전문 분야 공백",
        color: COLORS.warm,
      },
      {
        title: "AI 시대 진로/커리어",
        desc: "AI로 인한 직업 변화와 새로운 커리어 패스를 다룬 도서 부족",
        gap: "기술서는 많으나 인문학적 관점의 분석 부재",
        color: "8FB996",
      },
    ];

    opportunities.forEach((opp, i) => {
      const y = 1.3 + i * 1.3;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y: y, w: 8.6, h: 1.15,
        fill: { color: "232A3B" }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y: y, w: 0.08, h: 1.15,
        fill: { color: opp.color }
      });
      slide.addText(opp.title, {
        x: 1.0, y: y + 0.1, w: 4, h: 0.4,
        fontSize: 16, fontFace: FONTS.body, color: COLORS.white, bold: true, margin: 0
      });
      slide.addText(opp.desc, {
        x: 1.0, y: y + 0.5, w: 5, h: 0.4,
        fontSize: 12, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 6.5, y: y + 0.15, w: 2.5, h: 0.8,
        fill: { color: "1A1F2B" }
      });
      slide.addText("GAP", {
        x: 6.5, y: y + 0.15, w: 2.5, h: 0.3,
        fontSize: 9, fontFace: FONTS.body, color: opp.color, bold: true, align: "center", margin: 0
      });
      slide.addText(opp.gap, {
        x: 6.6, y: y + 0.45, w: 2.3, h: 0.45,
        fontSize: 10, fontFace: FONTS.body, color: COLORS.textLight, align: "center", margin: 0
      });
    });

    addFooter(slide, 9, TOTAL, false, pres);

    slide.addNotes("데이터 분석을 통해 도출한 3가지 기회 영역입니다. 첫째, 비개발자 대상 AI 실무 도서가 부족합니다. 현재 도서의 70% 이상이 개발자 대상인데, 코딩을 모르는 직장인과 교사들을 위한 AI 업무 자동화 가이드가 필요합니다. 둘째, 산업별 맞춤 AI 활용서가 거의 없습니다. 의료, 법률, 금융 등 특정 분야에 특화된 도서가 시장 공백을 가지고 있습니다. 셋째, AI 시대의 진로와 커리어를 다룬 도서가 부족합니다.");
  }

  // ============================================================
  // SLIDE 10: 기획 방향 제시 (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addImage({ data: icons.target, x: 0.7, y: 0.35, w: 0.4, h: 0.4 });
    slide.addText("신규 도서 기획 방향", {
      x: 1.2, y: 0.3, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    const directions = [
      {
        num: "01",
        title: "직장인을 위한 AI 업무 혁신",
        target: "25~45세 직장인",
        price: "18,000~22,000원",
        color: COLORS.accent,
      },
      {
        num: "02",
        title: "교사를 위한 AI 수업 실전서",
        target: "초중고 교사",
        price: "19,000~24,000원",
        color: COLORS.warm,
      },
      {
        num: "03",
        title: "AI 시대 커리어 전환 가이드",
        target: "20~40세 구직자·이직 희망자",
        price: "16,000~20,000원",
        color: "8FB996",
      },
    ];

    directions.forEach((d, i) => {
      const y = 1.3 + i * 1.3;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y: y, w: 8.6, h: 1.15,
        fill: { color: COLORS.cardBg },
        shadow: makeShadow()
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y: y, w: 0.08, h: 1.15,
        fill: { color: d.color }
      });

      slide.addText(d.num, {
        x: 1.0, y: y + 0.15, w: 0.6, h: 0.8,
        fontSize: 32, fontFace: FONTS.header, color: d.color, bold: true, valign: "middle", margin: 0
      });

      slide.addText(d.title, {
        x: 1.7, y: y + 0.1, w: 4.5, h: 0.5,
        fontSize: 16, fontFace: FONTS.body, color: COLORS.text, bold: true, margin: 0
      });

      slide.addText([
        { text: "대상: ", options: { bold: true, color: COLORS.textLight } },
        { text: d.target, options: { color: COLORS.text } },
      ], {
        x: 1.7, y: y + 0.55, w: 3, h: 0.35,
        fontSize: 12, fontFace: FONTS.body, margin: 0
      });

      slide.addText([
        { text: "예상 가격: ", options: { bold: true, color: COLORS.textLight } },
        { text: d.price, options: { color: COLORS.accent } },
      ], {
        x: 5.0, y: y + 0.55, w: 3, h: 0.35,
        fontSize: 12, fontFace: FONTS.body, margin: 0
      });
    });

    addFooter(slide, 10, TOTAL, true, pres);

    slide.addNotes("데이터 분석 결과를 바탕으로 3가지 신규 도서 기획 방향을 제시합니다. 첫째, 직장인을 위한 AI 업무 혁신 도서입니다. 비개발자도 쉽게 따라할 수 있는 AI 활용법을 다루겠습니다. 둘째, 교사를 위한 AI 수업 실전서입니다. 기존 교육 도서보다 더 실전적이고 구체적인 사례를 담겠습니다. 셋째, AI 시대 커리어 전환 가이드입니다. AI로 인한 직업 변화와 새로운 기회를 분석하겠습니다.");
  }

  // ============================================================
  // SLIDE 11: 기획안 1 - 직장인 AI 활용 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.accent }
    });

    slide.addText("기획안 1", {
      x: 0.7, y: 0.3, w: 2, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
    });

    slide.addText("일 잘하는 직장인의 AI 활용법 2.0", {
      x: 0.7, y: 0.7, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.white, bold: true, margin: 0
    });

    // Two column layout
    // Left: book details
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 1.6, w: 4.2, h: 3.2,
      fill: { color: "232A3B" }
    });

    const details = [
      { label: "대상 독자", value: "25~45세 직장인 (비개발자)" },
      { label: "예상 가격", value: "22,000원 (정가), 19,800원 (판매가)" },
      { label: "분량", value: "320페이지" },
      { label: "출간 예정", value: "2026년 4분기" },
      { label: "차별점", value: "업무 영역별 AI 활용 시나리오 100선" },
    ];

    details.forEach((d, i) => {
      const y = 1.8 + i * 0.58;
      slide.addText(d.label, {
        x: 1.0, y: y, w: 1.5, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
      });
      slide.addText(d.value, {
        x: 2.5, y: y, w: 2.2, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
    });

    // Right: target market
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: 1.6, w: 4.2, h: 3.2,
      fill: { color: "232A3B" }
    });

    slide.addText("시장 기대 효과", {
      x: 5.5, y: 1.8, w: 3.5, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.warm, bold: true, margin: 0
    });

    const effects = [
      "이메일 자동화로 업무 시간 30% 단축",
      "보고서 작성 시간 50% 절감",
      "데이터 분석 업무 자동화",
      "회의록 정리·요약 자동화",
      "고객 응대 메뉴얼 AI 생성",
    ];

    effects.forEach((e, i) => {
      slide.addImage({ data: icons.check, x: 5.5, y: 2.4 + i * 0.45, w: 0.25, h: 0.25 });
      slide.addText(e, {
        x: 5.9, y: 2.35 + i * 0.45, w: 3.2, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
    });

    addFooter(slide, 11, TOTAL, false, pres);

    slide.addNotes("첫 번째 기획안은 일 잘하는 직장인의 AI 활용법 2.0입니다. 기존 1권이 출시되었고, 베스트셀러에 오른 경험을 바탕으로 2권을 기획합니다. 대상은 25~45세 비개발자 직장인으로, 이메일 자동화, 보고서 작성, 데이터 분석 등 업무 영역별로 AI 활용 시나리오 100선을 담겠습니다. 예상 판매가는 1만 9천 8백원으로, 기존 시장 가격대에 맞추었습니다.");
  }

  // ============================================================
  // SLIDE 12: 기획안 2 - 교사 AI 수업 (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addImage({ data: icons.penDark, x: 0.7, y: 0.35, w: 0.4, h: 0.4 });
    slide.addText("기획안 2", {
      x: 1.2, y: 0.3, w: 2, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
    });

    slide.addText("AI 시대 교사의 수업 혁명", {
      x: 0.7, y: 0.7, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    // Left column
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 1.6, w: 4.2, h: 3.2,
      fill: { color: COLORS.cardBg },
      shadow: makeShadow()
    });

    const eduDetails = [
      { label: "대상 독자", value: "초중고 교사, 교육 관계자" },
      { label: "예상 가격", value: "24,000원 (정가), 21,600원 (판매가)" },
      { label: "분량", value: "380페이지" },
      { label: "출간 예정", value: "2027년 1분기" },
      { label: "차별점", value: "2022 개정 교육과정 완전 반영" },
    ];

    eduDetails.forEach((d, i) => {
      const y = 1.8 + i * 0.58;
      slide.addText(d.label, {
        x: 1.0, y: y, w: 1.5, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
      });
      slide.addText(d.value, {
        x: 2.5, y: y, w: 2.2, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.text, margin: 0
      });
    });

    // Right column
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: 1.6, w: 4.2, h: 3.2,
      fill: { color: COLORS.cardBg },
      shadow: makeShadow()
    });

    slide.addText("핵심 내용", {
      x: 5.5, y: 1.8, w: 3.5, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.accent, bold: true, margin: 0
    });

    const contents = [
      "AI 기반 수업 설계 방법론",
      "학생 맞춤형 학습 도구 제작",
      "평가·피드백 자동화 시스템",
      "학급 운영 AI 활용 가이드",
      "실제 수업 사례 50선",
    ];

    contents.forEach((c, i) => {
      slide.addShape(pres.shapes.OVAL, {
        x: 5.5, y: 2.4 + i * 0.42, w: 0.2, h: 0.2,
        fill: { color: COLORS.accent }
      });
      slide.addText(c, {
        x: 5.9, y: 2.35 + i * 0.42, w: 3.2, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.text, margin: 0
      });
    });

    addFooter(slide, 12, TOTAL, true, pres);

    slide.addNotes("두 번째 기획안은 AI 시대 교사의 수업 혁명입니다. 현재 교육 도서 시장에서 가장 큰 비중을 차지하는 AI 수업 활용 가이드를 더욱 실전적으로 구성하겠습니다. 2022 개정 교육과정을 완전히 반영하고, AI 기반 수업 설계 방법론과 실제 수업 사례 50선을 담겠습니다. 예상 판매가는 2만 1천 6백원으로, 기존 교육 도서 가격대에 맞추었습니다.");
  }

  // ============================================================
  // SLIDE 13: 기획안 3 - 커리어 전환 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: "8FB996" }
    });

    slide.addText("기획안 3", {
      x: 0.7, y: 0.3, w: 2, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: "8FB996", bold: true, margin: 0
    });

    slide.addText("AI 시대, 나의 다음 커리어", {
      x: 0.7, y: 0.7, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.white, bold: true, margin: 0
    });

    // Left: details
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 1.6, w: 4.2, h: 3.2,
      fill: { color: "232A3B" }
    });

    const careerDetails = [
      { label: "대상 독자", value: "20~40세 구직자·이직 희망자" },
      { label: "예상 가격", value: "20,000원 (정가), 18,000원 (판매가)" },
      { label: "분량", value: "280페이지" },
      { label: "출간 예정", value: "2027년 2분기" },
      { label: "차별점", value: "AI 활용 직업 100선 + 성공 사례" },
    ];

    careerDetails.forEach((d, i) => {
      const y = 1.8 + i * 0.58;
      slide.addText(d.label, {
        x: 1.0, y: y, w: 1.5, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: "8FB996", bold: true, margin: 0
      });
      slide.addText(d.value, {
        x: 2.5, y: y, w: 2.2, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
    });

    // Right: career paths
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: 1.6, w: 4.2, h: 3.2,
      fill: { color: "232A3B" }
    });

    slide.addText("커리어 전환 사례", {
      x: 5.5, y: 1.8, w: 3.5, h: 0.4,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.warm, bold: true, margin: 0
    });

    const careers = [
      { before: "마케터", after: "AI 마케팅 전략가", growth: "+150%" },
      { before: "회계사", after: "AI 재무 분석가", growth: "+120%" },
      { before: "디자이너", after: "AI UX 디자이너", growth: "+180%" },
      { before: "강사", after: "AI 교육 컨설턴트", growth: "+200%" },
    ];

    careers.forEach((c, i) => {
      const y = 2.3 + i * 0.6;
      slide.addText(c.before, {
        x: 5.5, y: y, w: 1.2, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
      });
      slide.addImage({ data: icons.arrow, x: 6.7, y: y + 0.05, w: 0.25, h: 0.25 });
      slide.addText(c.after, {
        x: 7.0, y: y, w: 1.8, h: 0.35,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.white, bold: true, margin: 0
      });
      slide.addText(c.growth, {
        x: 8.8, y: y, w: 0.6, h: 0.35,
        fontSize: 10, fontFace: FONTS.body, color: "8FB996", align: "right", margin: 0
      });
    });

    addFooter(slide, 13, TOTAL, false, pres);

    slide.addNotes("세 번째 기획안은 AI 시대, 나의 다음 커리어입니다. AI로 인한 직업 변화를 분석하고, 새로운 커리어 패스를 제시하는 도서입니다. 마케터에서 AI 마케팅 전략가로, 회계사에서 AI 재무 분석가로의 전환 사례를 담겠습니다. 대상은 20~40세 구직자와 이직 희망자로, 예상 판매가는 1만 8천원입니다.");
  }

  // ============================================================
  // SLIDE 14: 실행 로드맵 (Light)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.lightBg };

    slide.addImage({ data: icons.calendar, x: 0.7, y: 0.35, w: 0.4, h: 0.4 });
    slide.addText("실행 로드맵", {
      x: 1.2, y: 0.3, w: 8, h: 0.7,
      fontSize: 30, fontFace: FONTS.header, color: COLORS.text, bold: true, margin: 0
    });

    // Timeline
    const phases = [
      { phase: "1단계", period: "2026 Q3", task: "기획안 확정 및 원고 집필 착수", color: COLORS.accent },
      { phase: "2단계", period: "2026 Q4", task: "기획안 1 출간 / 기획안 2 집필 진행", color: COLORS.warm },
      { phase: "3단계", "period": "2027 Q1", task: "기획안 2 출간 / 기획안 3 집필 진행", color: "8FB996" },
      { phase: "4단계", period: "2027 Q2", task: "기획안 3 출간 / 후속 도서 기획", color: COLORS.accentLight },
    ];

    // Horizontal timeline line
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: 2.3, w: 7.0, h: 0.04,
      fill: { color: COLORS.subtleGray }
    });

    phases.forEach((p, i) => {
      const x = 1.5 + i * 1.8;
      // Circle on timeline
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.55, y: 2.15, w: 0.3, h: 0.3,
        fill: { color: p.color }
      });
      // Phase label above
      slide.addText(p.phase, {
        x: x, y: 1.5, w: 1.4, h: 0.4,
        fontSize: 14, fontFace: FONTS.body, color: p.color, bold: true, align: "center", margin: 0
      });
      // Period
      slide.addText(p.period, {
        x: x, y: 1.85, w: 1.4, h: 0.3,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.textLight, align: "center", margin: 0
      });
      // Task below
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x, y: 2.7, w: 1.6, h: 1.2,
        fill: { color: COLORS.cardBg },
        shadow: makeShadow()
      });
      slide.addText(p.task, {
        x: x + 0.1, y: 2.8, w: 1.4, h: 1.0,
        fontSize: 11, fontFace: FONTS.body, color: COLORS.text, align: "center", margin: 0
      });
    });

    addFooter(slide, 14, TOTAL, true, pres);

    slide.addNotes("실행 로드맵입니다. 1단계는 2026년 3분기에 기획안을 확정하고 원고 집필을 착수합니다. 2단계는 4분기에 첫 번째 기획안을 출간하고, 두 번째 기획안의 집필을 진행합니다. 3단계는 2027년 1분기에 두 번째 기획안을 출간하고, 세 번째 기획안을 집필합니다. 4단계는 2분기에 세 번째 기획안을 출간하고, 후속 도서를 기획하는 순서로 진행됩니다.");
  }

  // ============================================================
  // SLIDE 15: 마무리 (Dark)
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.darkBg };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: COLORS.accent }
    });

    // Decorative circle
    slide.addShape(pres.shapes.OVAL, {
      x: 7.5, y: 0.5, w: 2.5, h: 2.5,
      fill: { color: COLORS.accent, transparency: 85 }
    });

    slide.addImage({ data: icons.rocket, x: 0.7, y: 1.0, w: 0.6, h: 0.6 });

    slide.addText("데이터가 증명하는\n도서 기획의 미래", {
      x: 0.7, y: 1.8, w: 8, h: 1.5,
      fontSize: 36, fontFace: FONTS.header, color: COLORS.white, bold: true, lineSpacingMultiple: 1.3, margin: 0
    });

    slide.addText("1,000권의 데이터에서 발견한 3가지 기회,\n이제 실행으로 옮길 차례입니다.", {
      x: 0.7, y: 3.4, w: 7, h: 0.8,
      fontSize: 16, fontFace: FONTS.body, color: COLORS.accentLight, lineSpacingMultiple: 1.4, margin: 0
    });

    slide.addText("Thank you", {
      x: 0.7, y: 4.4, w: 3, h: 0.5,
      fontSize: 14, fontFace: FONTS.body, color: COLORS.textLight, margin: 0
    });

    slide.addNotes("마지막으로 정리하겠습니다. 오늘 발표에서 Yes24 베스트셀러 1,000권을 분석하여 3가지 기회 영역을 도출하고, 구체적인 기획안 3건과 실행 로드맵을 제시하였습니다. 데이터 기반의 도서 기획이 시장에서 경쟁력을 가질 수 있다는 것을 확인하였습니다. 질문이 있으시면 말씀해 주십시오. 감사합니다.");
  }

  // Save
  const outputPath = "C:\\Users\\user\\Documents\\ABC-RAG\\data\\yes24_book_proposal.pptx";
  await pres.writeFile({ fileName: outputPath });
  console.log(`PPTX 생성 완료: ${outputPath}`);
}

main().catch(console.error);
