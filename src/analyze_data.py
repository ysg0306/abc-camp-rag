"""Yes24 베스트셀러 데이터 분석 스크립트"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pandas as pd
import numpy as np
import json
import os

df = pd.read_csv('data/yes24_bestsellers.csv')

print(f"총 도서 수: {len(df)}")
print(f"컬럼: {list(df.columns)}")
print()

# Parse numeric columns
prices = pd.to_numeric(df['판매가'].astype(str).str.replace(',', ''), errors='coerce')
list_prices = pd.to_numeric(df['정가'].astype(str).str.replace(',', ''), errors='coerce')
sales_idx = pd.to_numeric(df['판매지수'].astype(str).str.replace(',', ''), errors='coerce')
ratings = pd.to_numeric(df['평점'], errors='coerce')
reviews = pd.to_numeric(df['리뷰수'], errors='coerce')

# === PRICE STATS ===
print("=== 판매가 통계 ===")
print(f"  평균: {prices.mean():,.0f}원")
print(f"  최소: {prices.min():,.0f}원")
print(f"  최대: {prices.max():,.0f}원")
print(f"  중앙값: {prices.median():,.0f}원")
print(f"  표준편차: {prices.std():,.0f}원")
print()

# === PUBLISHER COUNTS ===
print("=== 출판사별 도서 수 (상위 10) ===")
pub_counts = df['출판사'].value_counts().head(10)
for pub, cnt in pub_counts.items():
    print(f"  {pub}: {cnt}권")
print()

# === RATING DISTRIBUTION ===
print("=== 평점 분포 ===")
print(f"  평균 평점: {ratings.mean():.2f}")
for r in sorted(ratings.dropna().unique()):
    cnt = int((ratings == r).sum())
    print(f"  {r}: {cnt}권")
print()

# === REVIEW STATS ===
print("=== 리뷰수 통계 ===")
print(f"  평균: {reviews.mean():.0f}")
print(f"  최대: {reviews.max():.0f}")
print("  리뷰수 상위 5:")
top_r = df.nlargest(5, '리뷰수')[['도서명', '저자', '리뷰수']]
for _, row in top_r.iterrows():
    print(f"    {row['도서명']} - {row['리뷰수']}개")
print()

# === KEYWORD ANALYSIS ===
print("=== 키워드 분석 (도서명 기반) ===")
keywords_list = [
    'ChatGPT', 'AI', '인공지능', '클로드', '프롬프트', '코딩', '개발',
    '머신러닝', '딥러닝', '바이브', '제미나이', '에이전트', '교육', '교사',
    '엑셀', 'LLM', '데이터', '비즈니스', '생성형', '로봇', '반도체',
    '영상', '디자인', '쇼츠', '릴스'
]
keyword_counts = {}
for kw in keywords_list:
    c = int(df['도서명'].str.contains(kw, case=False, na=False).sum())
    if c > 0:
        keyword_counts[kw] = c
for kw, cnt in sorted(keyword_counts.items(), key=lambda x: -x[1]):
    print(f"  {kw}: {cnt}권")
print()

# === PRICE RANGE ===
print("=== 가격대별 분포 ===")
bins = [0, 15000, 20000, 25000, 30000, 35000, 60000]
labels = ['~1.5만원', '1.5~2만원', '2~2.5만원', '2.5~3만원', '3~3.5만원', '3.5만원~']
cats = pd.cut(prices, bins=bins, labels=labels)
for label in labels:
    cnt = int((cats == label).sum())
    pct = cnt / len(df) * 100
    print(f"  {label}: {cnt}권 ({pct:.1f}%)")
print()

# === TOP 10 BY SALES INDEX ===
print("=== 판매지수 상위 10 ===")
df['판매지수_num'] = sales_idx
top_s = df.nlargest(10, '판매지수_num')[['도서명', '출판사', '판매지수_num', '판매가', '평점', '리뷰수']]
for i, (_, row) in enumerate(top_s.iterrows(), 1):
    idx = row['판매지수_num']
    if isinstance(idx, str):
        idx = idx.replace(',', '')
    print(f"  {i}. {row['도서명']} ({row['출판사']}) - 지수: {idx}")
print()

# === DISCOUNT RATE ===
print("=== 할인율 분석 ===")
discounts = ((list_prices - prices) / list_prices * 100).dropna()
print(f"  평균 할인율: {discounts.mean():.1f}%")
print(f"  최대 할인율: {discounts.max():.1f}%")
print()

# === PUBLICATION DATE ===
print("=== 출판일 분석 ===")
dates = df['출판일'].dropna()
years = dates.str.extract(r'(\d{4})')[0]
year_counts = years.value_counts().sort_index()
for y, cnt in year_counts.items():
    print(f"  {y}년: {cnt}권")
print()

# === CATEGORY SEGMENTATION ===
print("=== 카테고리 분류 ===")
ai_keywords = ['AI', '인공지능', 'ChatGPT', '클로드', '제미나이', 'LLM', '에이전트', '머신러닝', '딥러닝', '프롬프트', '생성형']
edu_keywords = ['교사', '교육', '수업', '에듀테크']
coding_keywords = ['코딩', '개발', '프로그래밍', '바이브', '파이썬']

ai_count = 0
edu_count = 0
coding_count = 0
for _, row in df.iterrows():
    title = str(row['도서명'])
    desc = str(row.get('책소개', ''))
    text = title + ' ' + desc
    if any(kw in text for kw in ai_keywords):
        ai_count += 1
    if any(kw in text for kw in edu_keywords):
        edu_count += 1
    if any(kw in text for kw in coding_keywords):
        coding_count += 1

print(f"  AI/LLM 관련: {ai_count}권")
print(f"  교육/교사 관련: {edu_count}권")
print(f"  코딩/개발 관련: {coding_count}권")
print(f"  기타/일반: {len(df) - max(ai_count, edu_count, coding_count)}권")
print()

# === SUMMARY STATS (for slides) ===
summary = {
    "total_books": int(len(df)),
    "avg_price": round(prices.mean()),
    "median_price": round(prices.median()),
    "min_price": round(prices.min()),
    "max_price": round(prices.max()),
    "avg_rating": round(ratings.mean(), 2),
    "avg_reviews": round(reviews.mean()),
    "max_reviews": int(reviews.max()),
    "avg_discount": round(discounts.mean(), 1),
    "publisher_count": int(df['출판사'].nunique()),
    "top_publisher": pub_counts.index[0],
    "top_publisher_count": int(pub_counts.iloc[0]),
    "ai_related": ai_count,
    "edu_related": edu_count,
    "coding_related": coding_count,
    "keyword_counts": keyword_counts,
    "year_counts": {str(y): int(c) for y, c in year_counts.items()},
    "price_distribution": {str(l): int((cats == l).sum()) for l in labels},
}

# Save summary JSON for other scripts
os.makedirs('output', exist_ok=True)
with open('output/analysis_summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print("=== 분석 완료 ===")
print("결과가 output/analysis_summary.json에 저장되었습니다.")
