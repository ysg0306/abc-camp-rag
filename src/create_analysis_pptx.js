const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "ABC-RAG";
pres.title = "Yes24 베스트셀러 데이터 분석 리포트";

// Color palette
const C = {
  navy: "1B2A4A",
  teal: "2E86AB",
  amber: "F18F01",
  light: "F5F5F5",
  text: "333333",
  white: "FFFFFF",
  green: "27AE60",
  red: "E74C3C",
  gray: "95A5A6",
  darkGray: "64748B",
  paleBlue: "E8F4FD",
};

// Helper: fresh shadow
const cardShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.12 });

// ============================================================
// Slide 1: Title
// ============================================================
let s1 = pres.addSlide();
s1.background = { color: C.navy };
// Decorative top bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.amber } });
// Decorative bottom bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.545, w: 10, h: 0.08, fill: { color: C.teal } });
// Side accent
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.5, w: 0.06, h: 4.5, fill: { color: C.amber } });
// Title
s1.addText("Yes24 베스트셀러\n데이터 분석 리포트", {
  x: 0.8, y: 1.2, w: 8.4, h: 2.0, fontSize: 38, fontFace: "Georgia",
  color: C.white, bold: true, lineSpacingMultiple: 1.3,
});
// Subtitle
s1.addText("1,000권의 데이터로 보는 한국 출판 시장 트렌드", {
  x: 0.8, y: 3.3, w: 8.4, h: 0.6, fontSize: 18, fontFace: "Calibri",
  color: C.teal,
});
// Date
s1.addText("2026년 7월", {
  x: 0.8, y: 4.2, w: 4, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.gray,
});

// ============================================================
// Slide 2: Table of Contents
// ============================================================
let s2 = pres.addSlide();
s2.background = { color: C.light };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s2.addText("목차", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

const tocItems = [
  { num: "01", title: "데이터 개요", desc: "수집 현황 및 분석 방법론" },
  { num: "02", title: "가격 분석", desc: "판매가 분포, 가격대별 도서 수, 할인율" },
  { num: "03", title: "출판사 및 평점", desc: "출판사 점유율, 평점·리뷰 분포" },
  { num: "04", title: "키워드 트렌드", desc: "AI 도구 비교, 바이브 코딩, 에듀테크" },
  { num: "05", title: "시장 인사이트", desc: "카테고리 분석, 성장 추이, 전망" },
];
tocItems.forEach((item, i) => {
  let yy = 1.2 + i * 0.85;
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 9, h: 0.7, fill: { color: C.white }, shadow: cardShadow() });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 0.07, h: 0.7, fill: { color: C.teal } });
  s2.addText(item.num, { x: 0.75, y: yy, w: 0.6, h: 0.7, fontSize: 20, fontFace: "Georgia", color: C.amber, bold: true, valign: "middle", margin: 0 });
  s2.addText(item.title, { x: 1.5, y: yy, w: 3, h: 0.7, fontSize: 16, fontFace: "Calibri", color: C.navy, bold: true, valign: "middle", margin: 0 });
  s2.addText(item.desc, { x: 4.5, y: yy, w: 5, h: 0.7, fontSize: 12, fontFace: "Calibri", color: C.darkGray, valign: "middle", margin: 0 });
});

// ============================================================
// Slide 3: Data Overview - Big Numbers
// ============================================================
let s3 = pres.addSlide();
s3.background = { color: C.light };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s3.addText("데이터 개요", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

const overviewCards = [
  { num: "1,000", label: "분석 도서", color: C.teal },
  { num: "195", label: "출판사", color: C.amber },
  { num: "12", label: "데이터 항목", color: C.green },
  { num: "9.59", label: "평균 평점", color: C.red },
];
overviewCards.forEach((card, i) => {
  let xx = 0.5 + i * 2.35;
  s3.addShape(pres.shapes.RECTANGLE, { x: xx, y: 1.3, w: 2.1, h: 2.0, fill: { color: C.white }, shadow: cardShadow() });
  s3.addShape(pres.shapes.RECTANGLE, { x: xx, y: 1.3, w: 2.1, h: 0.06, fill: { color: card.color } });
  s3.addText(card.num, { x: xx, y: 1.6, w: 2.1, h: 1.0, fontSize: 42, fontFace: "Georgia", color: card.color, bold: true, align: "center", valign: "middle", margin: 0 });
  s3.addText(card.label, { x: xx, y: 2.6, w: 2.1, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.darkGray, align: "center", margin: 0 });
});

s3.addText([
  { text: "데이터 소스: ", options: { bold: true, color: C.navy } },
  { text: "Yes24 베스트셀러 순위 (2026년 7월 기준)", options: { color: C.darkGray } },
], { x: 0.5, y: 3.8, w: 9, h: 0.5, fontSize: 13, fontFace: "Calibri" });
s3.addText("순위, 도서명, 저자, 출판사, 판매가, 정가, 판매지수, 평점, 리뷰수, 책소개 등 12개 항목 수집", {
  x: 0.5, y: 4.2, w: 9, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.darkGray,
});

// ============================================================
// Slide 4: Price Analysis
// ============================================================
let s4 = pres.addSlide();
s4.background = { color: C.light };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s4.addText("가격 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

// Big number
s4.addText("평균 22,846원", { x: 0.5, y: 1.2, w: 4, h: 0.8, fontSize: 36, fontFace: "Georgia", color: C.teal, bold: true, margin: 0 });

// Stats table
const priceStats = [
  ["지표", "수치"],
  ["중앙값", "21,600원"],
  ["최소", "5,625원"],
  ["최대", "65,000원"],
  ["표준편차", "7,726원"],
];
s4.addTable(priceStats, {
  x: 0.5, y: 2.1, w: 4.2, h: 2.2,
  border: { pt: 0.5, color: "E2E8F0" },
  colW: [2.0, 2.2],
  fontSize: 12, fontFace: "Calibri",
  autoPage: false,
  color: C.text,
});
// Style header row
priceStats[0] = priceStats[0].map(t => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.navy } } }));

// Chart image
s4.addImage({ path: path.resolve("output/charts/01_price_distribution.png"), x: 5.0, y: 1.2, w: 4.7, h: 3.8 });

// Insight
s4.addText("평균(22,846원)이 중앙값(21,600원)보다 높아, 고가 도서가 분포를 오른쪽으로 끌어당기고 있습니다.", {
  x: 0.5, y: 4.6, w: 9, h: 0.5, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 5: Price Range Distribution (Chart)
// ============================================================
let s5 = pres.addSlide();
s5.background = { color: C.light };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s5.addText("가격대별 분포", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

// Bar chart
s5.addChart(pres.charts.BAR, [{
  name: "도서 수",
  labels: ["~1.5만", "1.5~2만", "2~2.5만", "2.5~3만", "3~3.5만", "3.5만~"],
  values: [102, 328, 249, 175, 84, 61],
}], {
  x: 0.5, y: 1.1, w: 5.5, h: 3.8, barDir: "col",
  chartColors: [C.teal, C.teal, C.teal, C.teal, C.teal, C.amber],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text,
  catAxisLabelColor: C.darkGray, valAxisLabelColor: C.darkGray,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: false, chartArea: { fill: { color: C.white }, roundedCorners: true },
});

// Insight card
s5.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.2, w: 3.4, h: 3.5, fill: { color: C.white }, shadow: cardShadow() });
s5.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.2, w: 3.4, h: 0.06, fill: { color: C.amber } });
s5.addText("핵심 발견", { x: 6.5, y: 1.4, w: 3, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
s5.addText([
  { text: "1.5~2.5만원대가 전체의 57.7%를 차지", options: { breakLine: true, bold: true, color: C.teal } },
  { text: "\n", options: { breakLine: true, fontSize: 6 } },
  { text: "IT/AI 도서의 적정 가격대는 2만원 전후로 형성", options: { breakLine: true } },
  { text: "\n", options: { breakLine: true, fontSize: 6 } },
  { text: "3만원 이상은 14.5%로 고급/전문서적 시장", options: {} },
], { x: 6.5, y: 1.9, w: 3, h: 2.5, fontSize: 12, fontFace: "Calibri", color: C.text });

// ============================================================
// Slide 6: Publisher Ranking
// ============================================================
let s6 = pres.addSlide();
s6.background = { color: C.light };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s6.addText("출판사 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s6.addText("195개 출판사가 시장에 참여", { x: 0.5, y: 1.1, w: 5, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.teal, bold: true, margin: 0 });

s6.addChart(pres.charts.BAR, [{
  name: "도서 수",
  labels: ["한빛미디어", "길벗", "이지스퍼블리싱", "커뮤니케이션북스", "골든래빗", "영진닷컴", "제이펍", "앤써북", "인사이트", "위키북스"],
  values: [146, 80, 53, 52, 47, 40, 35, 31, 31, 27],
}], {
  x: 0.5, y: 1.6, w: 9, h: 3.5, barDir: "bar",
  chartColors: [C.teal, C.teal, C.teal, C.teal, C.amber, C.teal, C.teal, C.teal, C.teal, C.teal],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text,
  catAxisLabelColor: C.darkGray, valAxisLabelColor: C.darkGray,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: false,
});

s6.addText("한빛미디어가 146권(14.6%)으로 압도적 1위. 상위 5개사가 전체 37% 점유.", {
  x: 0.5, y: 5.0, w: 9, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 7: Rating Distribution
// ============================================================
let s7 = pres.addSlide();
s7.background = { color: C.light };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s7.addText("평점 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

// Big number
s7.addText("평균 9.59점", { x: 0.5, y: 1.2, w: 3.5, h: 0.7, fontSize: 36, fontFace: "Georgia", color: C.green, bold: true, margin: 0 });

// Key stats cards
const ratingCards = [
  { num: "289", label: "10.0점 만점", pct: "28.9%", color: C.green },
  { num: "~500", label: "9.5점 이상", pct: "50%+", color: C.teal },
  { num: "~40", label: "8.0점 이하", pct: "4.0%", color: C.red },
];
ratingCards.forEach((rc, i) => {
  let xx = 0.5 + i * 3.1;
  s7.addShape(pres.shapes.RECTANGLE, { x: xx, y: 2.1, w: 2.8, h: 1.2, fill: { color: C.white }, shadow: cardShadow() });
  s7.addText(rc.num, { x: xx, y: 2.15, w: 2.8, h: 0.7, fontSize: 28, fontFace: "Georgia", color: rc.color, bold: true, align: "center", margin: 0 });
  s7.addText(rc.label + " (" + rc.pct + ")", { x: xx, y: 2.8, w: 2.8, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.darkGray, align: "center", margin: 0 });
});

// Chart image
s7.addImage({ path: path.resolve("output/charts/04_rating_distribution.png"), x: 0.5, y: 3.5, w: 9, h: 2.0 });

// ============================================================
// Slide 8: Review Leaders
// ============================================================
let s8 = pres.addSlide();
s8.background = { color: C.light };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s8.addText("리뷰 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s8.addText([
  { text: "평균 리뷰수: 25개  |  최대: 388개", options: { bold: true, color: C.teal } },
], { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", margin: 0 });

// Top 5 review books as cards
const reviewBooks = [
  { rank: "1", title: "진짜 쓰는 실무 엑셀", count: "388개" },
  { rank: "2", title: "20가지 템플릿으로 배우는 노션", count: "370개" },
  { rank: "3", title: "코딩 자율학습 파이썬 입문", count: "310개" },
  { rank: "4", title: "SNS 디자인 캔바", count: "273개" },
  { rank: "5", title: "챗GPT 미친 활용법 71제", count: "259개" },
];
reviewBooks.forEach((rb, i) => {
  let yy = 1.8 + i * 0.7;
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 9, h: 0.58, fill: { color: C.white }, shadow: cardShadow() });
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 0.06, h: 0.58, fill: { color: i === 0 ? C.amber : C.teal } });
  s8.addText(rb.rank, { x: 0.7, y: yy, w: 0.4, h: 0.58, fontSize: 18, fontFace: "Georgia", color: C.amber, bold: true, valign: "middle", margin: 0 });
  s8.addText(rb.title, { x: 1.2, y: yy, w: 5.5, h: 0.58, fontSize: 13, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
  s8.addText(rb.count, { x: 7.5, y: yy, w: 2, h: 0.58, fontSize: 16, fontFace: "Georgia", color: C.teal, bold: true, align: "right", valign: "middle", margin: 0 });
});

s8.addText("리뷰가 많은 도서는 실무 활용서와 입문서가 주를 이룹니다.", {
  x: 0.5, y: 5.0, w: 9, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 9: Sales Index Top 10
// ============================================================
let s9 = pres.addSlide();
s9.background = { color: C.light };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s9.addText("판매지수 TOP 10", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s9.addChart(pres.charts.BAR, [{
  name: "판매지수",
  labels: [
    "AI 수업 활용 가이드",
    "바이브 코딩 with 클로드",
    "제미나이 미친 활용법 81제",
    "프롬프트 엔지니어링",
    "제미나이 활용법",
    "실무 엑셀",
    "에듀테크 5대장",
    "점프 투 파이썬",
    "바로바로 클로드",
    "챗GPT 활용법",
  ],
  values: [83292, 80943, 78570, 78219, 76161, 66294, 46059, 40797, 40350, 31194],
}], {
  x: 0.5, y: 1.1, w: 9, h: 4.0, barDir: "bar",
  chartColors: [C.amber, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text, dataLabelFontSize: 9,
  catAxisLabelColor: C.darkGray, catAxisLabelFontSize: 9,
  valAxisLabelColor: C.darkGray,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: false,
});

s9.addText("상위 5권 중 4권이 AI 도서 — 교육과 AI 활용이 현재 가장 강력한 키워드", {
  x: 0.5, y: 5.1, w: 9, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 10: Keyword Trends
// ============================================================
let s10 = pres.addSlide();
s10.background = { color: C.light };
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s10.addText("키워드 트렌드", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s10.addText('"AI" 키워드가 299권으로 전체의 약 30%', { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.teal, bold: true, margin: 0 });

// Chart
s10.addChart(pres.charts.BAR, [{
  name: "도서 수",
  labels: ["AI", "코딩", "디자인", "개발", "바이브", "데이터", "제미나이", "클로드", "인공지능", "교사", "교육", "엑셀"],
  values: [299, 68, 49, 46, 39, 35, 33, 31, 29, 29, 28, 28],
}], {
  x: 0.5, y: 1.6, w: 9, h: 3.5, barDir: "bar",
  chartColors: [C.amber, C.teal, C.teal, C.teal, C.green, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text, dataLabelFontSize: 9,
  catAxisLabelColor: C.darkGray, catAxisLabelFontSize: 10,
  valAxisLabelColor: C.darkGray,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: false,
});

s10.addText('"바이브"(39권)는 2025~2026년 가장 빠르게 성장하는 트렌드 키워드', {
  x: 0.5, y: 5.1, w: 9, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 11: AI Tool Comparison
// ============================================================
let s11 = pres.addSlide();
s11.background = { color: C.light };
s11.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s11.addText("AI 도구별 비교", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s11.addText("제미나이·클로드의 부상 — ChatGPT를 넘어", { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.amber, bold: true, margin: 0 });

// Three AI tool cards
const aiTools = [
  { name: "제미나이", count: "33권", desc: "Google AI\n워크스페이스 연동\n노트북LM", color: C.teal },
  { name: "클로드", count: "31권", desc: "Anthropic AI\n코워크·스킬·코드\n에이전틱 코딩", color: C.green },
  { name: "ChatGPT", count: "8권", desc: "OpenAI\n범용 AI 대명사\n여전히 기준점", color: C.amber },
];
aiTools.forEach((tool, i) => {
  let xx = 0.5 + i * 3.15;
  s11.addShape(pres.shapes.RECTANGLE, { x: xx, y: 1.8, w: 2.85, h: 3.0, fill: { color: C.white }, shadow: cardShadow() });
  s11.addShape(pres.shapes.RECTANGLE, { x: xx, y: 1.8, w: 2.85, h: 0.07, fill: { color: tool.color } });
  s11.addText(tool.name, { x: xx, y: 2.0, w: 2.85, h: 0.5, fontSize: 22, fontFace: "Georgia", color: tool.color, bold: true, align: "center", margin: 0 });
  s11.addText(tool.count, { x: xx, y: 2.5, w: 2.85, h: 0.6, fontSize: 36, fontFace: "Georgia", color: tool.color, bold: true, align: "center", margin: 0 });
  s11.addText(tool.desc, { x: xx + 0.3, y: 3.2, w: 2.25, h: 1.4, fontSize: 11, fontFace: "Calibri", color: C.darkGray, align: "center", margin: 0 });
});

s11.addText("AI 도구 시장이 ChatGPT 중심에서 멀티 AI 도구 시대로 빠르게 전환 중", {
  x: 0.5, y: 5.0, w: 9, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 12: Category Analysis (Pie Chart)
// ============================================================
let s12 = pres.addSlide();
s12.background = { color: C.light };
s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s12.addText("카테고리 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s12.addChart(pres.charts.DOUGHNUT, [{
  name: "카테고리",
  labels: ["AI/LLM (433권)", "교육 (83권)", "코딩/개발 (177권)", "기타 (307권)"],
  values: [433, 83, 177, 307],
}], {
  x: 0.3, y: 1.1, w: 5.5, h: 4.2,
  chartColors: [C.teal, C.green, C.amber, C.gray],
  showPercent: true, showTitle: false,
  showLegend: true, legendPos: "b", legendFontSize: 11,
});

// Right side insight
s12.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 1.2, w: 3.7, h: 4.0, fill: { color: C.white }, shadow: cardShadow() });
s12.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 1.2, w: 3.7, h: 0.06, fill: { color: C.teal } });
s12.addText("핵심 분석", { x: 6.2, y: 1.4, w: 3.3, h: 0.4, fontSize: 18, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
s12.addText([
  { text: "AI/LLM 도서가 43.3%로\n거의 절반을 차지\n\n", options: { breakLine: true, bold: true, color: C.teal, fontSize: 14 } },
  { text: "IT 베스트셀러 시장은\n사실상 AI 도서 시장\n\n", options: { breakLine: true, fontSize: 12 } },
  { text: "코딩/개발 17.7%\n교육 8.3%\n기타 30.7%", options: { fontSize: 11, color: C.darkGray } },
], { x: 6.2, y: 1.9, w: 3.3, h: 3.0, fontFace: "Calibri", color: C.text });

// ============================================================
// Slide 13: Publication Timeline
// ============================================================
let s13 = pres.addSlide();
s13.background = { color: C.light };
s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s13.addText("출판 연도별 동향", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s13.addText("2024년 이후 폭발적 성장", { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.red, bold: true, margin: 0 });

s13.addChart(pres.charts.BAR, [{
  name: "도서 수",
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
  values: [8, 8, 19, 16, 38, 35, 114, 319, 422],
}], {
  x: 0.5, y: 1.6, w: 9, h: 3.5, barDir: "col",
  chartColors: [C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.teal, C.red],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text,
  catAxisLabelColor: C.darkGray, valAxisLabelColor: C.darkGray,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: false,
});

s13.addText("ChatGPT 등장(2022) → 베스트셀러 폭증(2024) → 사상 최대(2026). 성장 초기 단계.", {
  x: 0.5, y: 5.1, w: 9, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.darkGray, italic: true,
});

// ============================================================
// Slide 14: Education Market
// ============================================================
let s14 = pres.addSlide();
s14.background = { color: C.light };
s14.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s14.addText("교육 시장 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s14.addText("AI+교육 융합 — 교육 현장이 AI 도입의 최전선", { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.green, bold: true, margin: 0 });

// Stats
const eduStats = [
  { num: "83", label: "교육 관련 도서", color: C.green },
  { num: "29", label: "'교사' 키워드", color: C.teal },
  { num: "28", label: "'교육' 키워드", color: C.amber },
];
eduStats.forEach((es, i) => {
  let xx = 0.5 + i * 3.1;
  s14.addShape(pres.shapes.RECTANGLE, { x: xx, y: 1.7, w: 2.8, h: 1.3, fill: { color: C.white }, shadow: cardShadow() });
  s14.addText(es.num, { x: xx, y: 1.75, w: 2.8, h: 0.8, fontSize: 36, fontFace: "Georgia", color: es.color, bold: true, align: "center", margin: 0 });
  s14.addText(es.label, { x: xx, y: 2.5, w: 2.8, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.darkGray, align: "center", margin: 0 });
});

// Top edu books
const eduBooks = [
  { title: "요즘 교사를 위한 AI 수업 활용 가이드", idx: "83,292 (1위)" },
  { title: "요즘 교사를 위한 에듀테크 5대장", idx: "46,059" },
  { title: "바로바로 클로드 with 코워크", idx: "40,350" },
  { title: "학교에서 바로 쓰는 제미나이 & 노트북LM", idx: "12,117" },
];
s14.addText("주요 교육 도서", { x: 0.5, y: 3.2, w: 9, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
eduBooks.forEach((eb, i) => {
  let yy = 3.7 + i * 0.45;
  s14.addText(eb.title, { x: 0.7, y: yy, w: 6, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.text, margin: 0 });
  s14.addText(eb.idx, { x: 7.0, y: yy, w: 2.5, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.teal, bold: true, align: "right", margin: 0 });
});

// ============================================================
// Slide 15: Vibe Coding
// ============================================================
let s15 = pres.addSlide();
s15.background = { color: C.light };
s15.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s15.addText("바이브 코딩 열풍", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s15.addText('"바이브" 키워드: 39권 — 코딩 없이 AI로 만드는 시대', { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.green, bold: true, margin: 0 });

// Definition card
s15.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.7, w: 4.5, h: 1.5, fill: { color: C.white }, shadow: cardShadow() });
s15.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.7, w: 0.06, h: 1.5, fill: { color: C.green } });
s15.addText("바이브 코딩이란?", { x: 0.7, y: 1.8, w: 4, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
s15.addText("AI와 대화하듯 코드를 작성하는 새로운 개발 방식. 코딩 문법을 몰라도 AI에게 자연어로 설명하면 앱/웹 서비스를 만들 수 있습니다.", {
  x: 0.7, y: 2.2, w: 4, h: 0.9, fontSize: 11, fontFace: "Calibri", color: C.darkGray, margin: 0,
});

// Key books list
s15.addText("주요 도서", { x: 5.3, y: 1.7, w: 4.3, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
const vibeBooks = [
  "혼자 공부하는 바이브 코딩 with 클로드 코드",
  "조코딩의 바이브 코딩 1인 창업",
  "클로드 코드를 활용한 바이브 코딩 완벽 입문",
  "코딩 몰라도 시작하는 바이브 코딩",
  "1일 10분 바이브 코딩",
  "바이브 코딩 by 안티그래비티",
];
vibeBooks.forEach((vb, i) => {
  let yy = 2.15 + i * 0.38;
  s15.addText([
    { text: "  ", options: { bullet: true } },
    { text: vb },
  ], { x: 5.3, y: yy, w: 4.3, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.text, margin: 0 });
});

// Bottom insight
s15.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.5, w: 9, h: 1.8, fill: { color: C.navy } });
s15.addText("클로드 코드 + 커서 AI + 안티그래비티", { x: 0.8, y: 3.6, w: 8.4, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.amber, bold: true, margin: 0 });
s15.addText("바이브 코딩을 실현하는 주요 도구. \"코딩 몰라도 만드는 시대\"를 열며,\n교육·창업·업무 전반으로 확산 중.", {
  x: 0.8, y: 4.1, w: 8.4, h: 0.9, fontSize: 13, fontFace: "Calibri", color: C.white, margin: 0,
});

// ============================================================
// Slide 16: Content Creation Tools
// ============================================================
let s16 = pres.addSlide();
s16.background = { color: C.light };
s16.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s16.addText("콘텐츠 제작 도구", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s16.addText("AI+콘텐츠 제작 — 1인 창작자 시대 본격화", { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.amber, bold: true, margin: 0 });

// Keyword cards
const contentKw = [
  { kw: "디자인", count: "49권", color: C.teal },
  { kw: "영상", count: "23권", color: C.amber },
  { kw: "캡컷", count: "다수", color: C.green },
  { kw: "프리미어", count: "다수", color: C.red },
];
contentKw.forEach((ck, i) => {
  let xx = 0.5 + i * 2.35;
  s16.addShape(pres.shapes.RECTANGLE, { x: xx, y: 1.7, w: 2.1, h: 1.0, fill: { color: C.white }, shadow: cardShadow() });
  s16.addText(ck.kw, { x: xx, y: 1.75, w: 2.1, h: 0.55, fontSize: 18, fontFace: "Georgia", color: ck.color, bold: true, align: "center", margin: 0 });
  s16.addText(ck.count, { x: xx, y: 2.25, w: 2.1, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.darkGray, align: "center", margin: 0 });
});

// Key books
s16.addText("주요 콘텐츠 제작서", { x: 0.5, y: 3.0, w: 9, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
const contentBooks = [
  { title: "된다! 캡컷 영상 편집", cat: "영상 편집" },
  { title: "맛있는 디자인 포토샵&일러스트레이터 CC 2026", cat: "그래픽 디자인" },
  { title: "맛있는 디자인 피그마 with AI", cat: "UI/UX 디자인" },
  { title: "AI 영상 제작", cat: "AI 영상" },
  { title: "7가지 생성 AI로 영상 제작 & 편집하기", cat: "AI 영상" },
];
contentBooks.forEach((cb, i) => {
  let yy = 3.5 + i * 0.38;
  s16.addText(cb.title, { x: 0.7, y: yy, w: 6, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.text, margin: 0 });
  s16.addText(cb.cat, { x: 7.0, y: yy, w: 2.5, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.teal, align: "right", margin: 0 });
});

// ============================================================
// Slide 17: Discount Analysis
// ============================================================
let s17 = pres.addSlide();
s17.background = { color: C.light };
s17.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s17.addText("할인율 분석", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

s17.addText("평균 할인율 8.5%", { x: 0.5, y: 1.2, w: 4, h: 0.7, fontSize: 36, fontFace: "Georgia", color: C.amber, bold: true, margin: 0 });

// Chart image
s17.addImage({ path: path.resolve("output/charts/10_discount_analysis.png"), x: 0.5, y: 1.9, w: 5.5, h: 3.2 });

// Insight card
s17.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.2, w: 3.4, h: 3.8, fill: { color: C.white }, shadow: cardShadow() });
s17.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.2, w: 3.4, h: 0.06, fill: { color: C.amber } });
s17.addText("할인율 인사이트", { x: 6.5, y: 1.4, w: 3, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.navy, bold: true, margin: 0 });
s17.addText([
  { text: "온라인 서점간 가격 경쟁이 치열\n\n", options: { breakLine: true, bold: true } },
  { text: "정가 대비 약 10% 할인이 일반적\n\n", options: { breakLine: true } },
  { text: "IT/AI 도서는 \"가격\"보다\n\"실용성\"이 구매 결정에\n더 큰 영향\n\n", options: { breakLine: true, color: C.teal, bold: true } },
  { text: "고품질 콘텐츠는 할인율과\n상관없이 꾸준한 판매 유지", options: { color: C.darkGray } },
], { x: 6.5, y: 1.9, w: 3, h: 2.8, fontSize: 12, fontFace: "Calibri", color: C.text });

// ============================================================
// Slide 18: 5 Key Insights
// ============================================================
let s18 = pres.addSlide();
s18.background = { color: C.light };
s18.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s18.addText("시장 인사이트 5가지", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

const insights = [
  { num: "01", title: "AI 도서 시장의 폭발적 성장", desc: "2024년 이후 연간 300~400권 이상 진입", color: C.teal },
  { num: "02", title: "멀티 AI 시대 도래", desc: "ChatGPT → 제미나이·클로드로 분화", color: C.amber },
  { num: "03", title: "바이브 코딩 = 새로운 리터러시", desc: "코딩 모르는 사람도 AI로 앱 제작", color: C.green },
  { num: "04", title: "교육 시장이 AI 도입 최전선", desc: "교사 AI 활용서 베스트셀러 1위", color: C.red },
  { num: "05", title: "도구→수익화 연결", desc: "AI로 돈 버는 실전서 급증", color: C.navy },
];
insights.forEach((ins, i) => {
  let yy = 1.1 + i * 0.85;
  s18.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 9, h: 0.72, fill: { color: C.white }, shadow: cardShadow() });
  s18.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 0.07, h: 0.72, fill: { color: ins.color } });
  s18.addText(ins.num, { x: 0.75, y: yy, w: 0.6, h: 0.72, fontSize: 22, fontFace: "Georgia", color: ins.color, bold: true, valign: "middle", margin: 0 });
  s18.addText(ins.title, { x: 1.5, y: yy, w: 4.5, h: 0.72, fontSize: 15, fontFace: "Calibri", color: C.navy, bold: true, valign: "middle", margin: 0 });
  s18.addText(ins.desc, { x: 6.0, y: yy, w: 3.5, h: 0.72, fontSize: 12, fontFace: "Calibri", color: C.darkGray, valign: "middle", margin: 0 });
});

// ============================================================
// Slide 19: 2026 H2 Outlook
// ============================================================
let s19 = pres.addSlide();
s19.background = { color: C.light };
s19.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
s19.addText("2026 하반기 전망", { x: 0.5, y: 0.1, w: 9, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true });

const predictions = [
  { num: "1", title: "AI 에이전트 도서 급증", desc: "하네스 엔지니어링, MCP 커넥터, 에이전틱 코딩 등 \"AI가 스스로 일하는\" 도구를 다루는 도서가 크게 늘어날 전망.", color: C.teal },
  { num: "2", title: "sLLM·로컬 AI 서적 부상", desc: "개인정보보호와 비용 절감을 위한 소형 언어 모델(sLLM), 로컬 AI 관련 서적이 신규 카테고리로 성장.", color: C.amber },
  { num: "3", title: "교육 AI 도서 2차 붐", desc: "2026년 2학기 AI 디지털 교과서 전면 도입과 함께 교사·학부모 대상 AI 서적이再度 폭발적 수요.", color: C.green },
  { num: "4", title: "AI+비즈니스 융합서 확대", desc: "마케팅(AEO/GEO), 재테크, 쇼핑몰 등 \"AI로 돈 버는\" 분야 전문서가 새로운 성장 동력.", color: C.red },
];
predictions.forEach((pred, i) => {
  let yy = 1.1 + i * 1.05;
  s19.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 9, h: 0.9, fill: { color: C.white }, shadow: cardShadow() });
  s19.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yy, w: 0.06, h: 0.9, fill: { color: pred.color } });
  s19.addText(pred.num, { x: 0.7, y: yy, w: 0.5, h: 0.9, fontSize: 28, fontFace: "Georgia", color: pred.color, bold: true, valign: "middle", margin: 0 });
  s19.addText(pred.title, { x: 1.3, y: yy, w: 8, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.navy, bold: true, valign: "middle", margin: 0 });
  s19.addText(pred.desc, { x: 1.3, y: yy + 0.4, w: 8, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.darkGray, valign: "top", margin: 0 });
});

// ============================================================
// Slide 20: Conclusion
// ============================================================
let s20 = pres.addSlide();
s20.background = { color: C.navy };
s20.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.amber } });
s20.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.545, w: 10, h: 0.08, fill: { color: C.teal } });
s20.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.5, w: 0.06, h: 4.5, fill: { color: C.amber } });

s20.addText("핵심 요약", { x: 0.8, y: 0.5, w: 8.4, h: 0.7, fontSize: 32, fontFace: "Georgia", color: C.white, bold: true });

s20.addText("1,000권의 데이터가 말하는 것:\n한국 IT 도서 시장은 \"AI 시대\"에 진입했습니다.", {
  x: 0.8, y: 1.3, w: 8.4, h: 0.9, fontSize: 18, fontFace: "Calibri", color: C.teal, italic: true,
});

const summaryItems = [
  "AI/LLM 도서가 전체의 43% — 시장의 거의 절반",
  "한빛미디어 146권 1위 — 출판사 집중도 높음",
  "제미나이·클로드 > ChatGPT — AI 도구 시장 다변화",
  "바이브 코딩 39권 — \"코딩 없이 만드는 시대\" 개막",
  "교육 분야 AI 도입 최전선 — 교사 대상 서적 1위",
  "2024년 이후 연간 300권+ 급증 — 폭발적 성장 중",
];
summaryItems.forEach((si, i) => {
  let yy = 2.5 + i * 0.42;
  s20.addText([
    { text: si, options: { color: C.white } },
  ], { x: 1.0, y: yy, w: 8, h: 0.4, fontSize: 13, fontFace: "Calibri", bullet: true, margin: 0 });
});

s20.addText("데이터 분석: ABC-RAG 시스템  |  수집: Yes24 베스트셀러  |  분석일: 2026년 7월", {
  x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 10, fontFace: "Calibri", color: C.gray, align: "center",
});

// ============================================================
// Save
// ============================================================
pres.writeFile({ fileName: path.resolve("output/yes24_analysis.pptx") })
  .then(() => console.log("PPTX generated: output/yes24_analysis.pptx"))
  .catch(err => console.error("Error:", err));
