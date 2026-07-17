"""Yes24 베스트셀러 데이터 시각화 차트 생성 스크립트"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import os

# Korean font setup
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False
plt.rcParams['figure.dpi'] = 150

# Color palette
COLORS = {
    'primary': '#1B2A4A',
    'secondary': '#2E86AB',
    'accent': '#F18F01',
    'light': '#F5F5F5',
    'text': '#333333',
    'success': '#27AE60',
    'danger': '#E74C3C',
    'palette': ['#1B2A4A', '#2E86AB', '#F18F01', '#27AE60', '#E74C3C', 
                '#8E44AD', '#16A085', '#D35400', '#2C3E50', '#2980B9']
}

# Read data
df = pd.read_csv('data/yes24_bestsellers.csv')
prices = pd.to_numeric(df['판매가'].astype(str).str.replace(',', ''), errors='coerce')
list_prices = pd.to_numeric(df['정가'].astype(str).str.replace(',', ''), errors='coerce')
sales_idx = pd.to_numeric(df['판매지수'].astype(str).str.replace(',', ''), errors='coerce')
ratings = pd.to_numeric(df['평점'], errors='coerce')
reviews = pd.to_numeric(df['리뷰수'], errors='coerce')

# Create output directory
os.makedirs('output/charts', exist_ok=True)

# ============================================================
# Chart 1: Price Distribution
# ============================================================
fig, ax = plt.subplots(figsize=(12, 7))
bins = np.arange(0, 70000, 2500)
ax.hist(prices.dropna(), bins=bins, color=COLORS['secondary'], edgecolor='white', alpha=0.8)
ax.axvline(prices.mean(), color=COLORS['accent'], linewidth=2, linestyle='--', label=f'평균: {prices.mean():,.0f}원')
ax.axvline(prices.median(), color=COLORS['danger'], linewidth=2, linestyle='--', label=f'중앙값: {prices.median():,.0f}원')
ax.set_title('판매가 분포', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('판매가 (원)', fontsize=14)
ax.set_ylabel('도서 수', fontsize=14)
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'{x/10000:.0f}만'))
ax.legend(fontsize=12)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/01_price_distribution.png', bbox_inches='tight')
plt.close()
print("Chart 1: Price Distribution - Done")

# ============================================================
# Chart 2: Publisher Ranking (Top 15)
# ============================================================
fig, ax = plt.subplots(figsize=(12, 8))
pub_counts = df['출판사'].value_counts().head(15)
bars = ax.barh(range(len(pub_counts)), pub_counts.values, color=COLORS['palette'][:len(pub_counts)])
ax.set_yticks(range(len(pub_counts)))
ax.set_yticklabels(pub_counts.index, fontsize=11)
ax.invert_yaxis()
ax.set_title('출판사별 베스트셀러 수 (상위 15)', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('도서 수', fontsize=14)
for i, v in enumerate(pub_counts.values):
    ax.text(v + 1, i, str(v), va='center', fontsize=11, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/02_publisher_ranking.png', bbox_inches='tight')
plt.close()
print("Chart 2: Publisher Ranking - Done")

# ============================================================
# Chart 3: Keyword Frequency (Top 15)
# ============================================================
keywords_list = [
    'AI', '코딩', '디자인', '개발', '바이브', '데이터', '제미나이', '클로드',
    '인공지능', '교사', '교육', '엑셀', '생성형', '에이전트', '영상',
    '딥러닝', 'LLM', '프롬프트', '머신러닝', 'ChatGPT'
]
keyword_counts = {}
for kw in keywords_list:
    c = int(df['도서명'].str.contains(kw, case=False, na=False).sum())
    if c > 0:
        keyword_counts[kw] = c
kw_sorted = dict(sorted(keyword_counts.items(), key=lambda x: -x[1])[:15])

fig, ax = plt.subplots(figsize=(12, 8))
bars = ax.barh(range(len(kw_sorted)), list(kw_sorted.values()), color=COLORS['palette'][:len(kw_sorted)])
ax.set_yticks(range(len(kw_sorted)))
ax.set_yticklabels(list(kw_sorted.keys()), fontsize=12)
ax.invert_yaxis()
ax.set_title('도서명 키워드 빈도 (상위 15)', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('도서 수', fontsize=14)
for i, v in enumerate(kw_sorted.values()):
    ax.text(v + 1, i, str(v), va='center', fontsize=11, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/03_keyword_frequency.png', bbox_inches='tight')
plt.close()
print("Chart 3: Keyword Frequency - Done")

# ============================================================
# Chart 4: Rating Distribution
# ============================================================
fig, ax = plt.subplots(figsize=(12, 7))
rating_bins = np.arange(1.5, 10.5, 0.5)
ax.hist(ratings.dropna(), bins=rating_bins, color=COLORS['success'], edgecolor='white', alpha=0.8)
ax.axvline(ratings.mean(), color=COLORS['accent'], linewidth=2, linestyle='--', label=f'평균: {ratings.mean():.2f}')
ax.set_title('평점 분포', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('평점', fontsize=14)
ax.set_ylabel('도서 수', fontsize=14)
ax.legend(fontsize=12)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Add annotation for 10.0 rating count
ten_count = int((ratings == 10.0).sum())
ax.annotate(f'10.0점: {ten_count}권', xy=(10.0, ten_count), xytext=(9.2, ten_count * 0.8),
            fontsize=12, fontweight='bold', color=COLORS['danger'],
            arrowprops=dict(arrowstyle='->', color=COLORS['danger']))
plt.tight_layout()
plt.savefig('output/charts/04_rating_distribution.png', bbox_inches='tight')
plt.close()
print("Chart 4: Rating Distribution - Done")

# ============================================================
# Chart 5: Top 10 Books by Reviews
# ============================================================
fig, ax = plt.subplots(figsize=(12, 8))
top_reviews = df.nlargest(10, '리뷰수')[['도서명', '리뷰수']].copy()
# Truncate long titles
top_reviews['도서명'] = top_reviews['도서명'].apply(lambda x: x[:30] + '...' if len(str(x)) > 30 else str(x))
bars = ax.barh(range(len(top_reviews)), top_reviews['리뷰수'].values, color=COLORS['palette'][:10])
ax.set_yticks(range(len(top_reviews)))
ax.set_yticklabels(top_reviews['도서명'].values, fontsize=10)
ax.invert_yaxis()
ax.set_title('리뷰수 상위 10권', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('리뷰 수', fontsize=14)
for i, v in enumerate(top_reviews['리뷰수'].values):
    ax.text(v + 3, i, f'{int(v)}', va='center', fontsize=11, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/05_review_leaders.png', bbox_inches='tight')
plt.close()
print("Chart 5: Review Leaders - Done")

# ============================================================
# Chart 6: Top 10 Books by Sales Index
# ============================================================
fig, ax = plt.subplots(figsize=(12, 8))
df['판매지수_num'] = sales_idx
top_sales = df.nlargest(10, '판매지수_num')[['도서명', '판매지수_num']].copy()
top_sales['도서명'] = top_sales['도서명'].apply(lambda x: x[:35] + '...' if len(str(x)) > 35 else str(x))
bars = ax.barh(range(len(top_sales)), top_sales['판매지수_num'].values, color=COLORS['palette'][:10])
ax.set_yticks(range(len(top_sales)))
ax.set_yticklabels(top_sales['도서명'].values, fontsize=10)
ax.invert_yaxis()
ax.set_title('판매지수 상위 10권', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('판매지수', fontsize=14)
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'{x/1000:.0f}K'))
for i, v in enumerate(top_sales['판매지수_num'].values):
    ax.text(v + 500, i, f'{int(v):,}', va='center', fontsize=11, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/06_sales_index_top10.png', bbox_inches='tight')
plt.close()
print("Chart 6: Sales Index Top 10 - Done")

# ============================================================
# Chart 7: Category Split (Donut Chart)
# ============================================================
fig, ax = plt.subplots(figsize=(10, 10))
ai_keywords = ['AI', '인공지능', 'ChatGPT', '클로드', '제미나이', 'LLM', '에이전트', '머신러닝', '딥러닝', '프롬프트', '생성형']
edu_keywords = ['교사', '교육', '수업', '에듀테크']
coding_keywords = ['코딩', '개발', '프로그래밍', '바이브', '파이썬']

ai_count = edu_count = coding_count = 0
for _, row in df.iterrows():
    text = str(row['도서명']) + ' ' + str(row.get('책소개', ''))
    if any(kw in text for kw in ai_keywords):
        ai_count += 1
    if any(kw in text for kw in edu_keywords):
        edu_count += 1
    if any(kw in text for kw in coding_keywords):
        coding_count += 1

other_count = len(df) - max(ai_count, edu_count, coding_count)
sizes = [ai_count, edu_count, coding_count, other_count]
labels = [f'AI/LLM\n{ai_count}권', f'교육\n{edu_count}권', f'코딩/개발\n{coding_count}권', f'기타\n{other_count}권']
colors = [COLORS['secondary'], COLORS['success'], COLORS['accent'], '#95A5A6']

wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%',
                                   startangle=90, pctdistance=0.75, textprops={'fontsize': 13})
for t in autotexts:
    t.set_fontsize(12)
    t.set_fontweight('bold')
# Draw donut
centre_circle = plt.Circle((0, 0), 0.50, fc='white')
ax.add_artist(centre_circle)
ax.set_title('카테고리별 분포', fontsize=20, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('output/charts/07_category_split.png', bbox_inches='tight')
plt.close()
print("Chart 7: Category Split - Done")

# ============================================================
# Chart 8: Publication Timeline
# ============================================================
fig, ax = plt.subplots(figsize=(14, 7))
dates = df['출판일'].dropna()
years = dates.str.extract(r'(\d{4})')[0]
year_counts = years.value_counts().sort_index()
# Focus on 2018+
year_counts_recent = year_counts[year_counts.index.astype(int) >= 2018]
bars = ax.bar(range(len(year_counts_recent)), year_counts_recent.values, 
              color=[COLORS['danger'] if y == '2026' else COLORS['secondary'] for y in year_counts_recent.index])
ax.set_xticks(range(len(year_counts_recent)))
ax.set_xticklabels([f'{y}년' for y in year_counts_recent.index], fontsize=12)
ax.set_title('출판 연도별 베스트셀러 수 (2018~2026)', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('출판 연도', fontsize=14)
ax.set_ylabel('도서 수', fontsize=14)
for i, v in enumerate(year_counts_recent.values):
    ax.text(i, v + 5, str(v), ha='center', fontsize=12, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Add growth annotation
ax.annotate('2024년 이후\n폭발적 성장', xy=(5, 422), xytext=(3, 350),
            fontsize=13, fontweight='bold', color=COLORS['danger'],
            arrowprops=dict(arrowstyle='->', color=COLORS['danger'], lw=2))
plt.tight_layout()
plt.savefig('output/charts/08_publication_timeline.png', bbox_inches='tight')
plt.close()
print("Chart 8: Publication Timeline - Done")

# ============================================================
# Chart 9: Price vs Rating Scatter
# ============================================================
fig, ax = plt.subplots(figsize=(12, 8))
valid = pd.DataFrame({'price': prices, 'rating': ratings, 'reviews': reviews}).dropna()
scatter = ax.scatter(valid['price'], valid['rating'], 
                     s=valid['reviews'].clip(upper=200) * 3,
                     c=valid['reviews'], cmap='YlOrRd', alpha=0.6, edgecolors='white', linewidth=0.5)
plt.colorbar(scatter, label='리뷰 수', ax=ax)
ax.set_title('판매가 vs 평점 (버블 크기 = 리뷰 수)', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('판매가 (원)', fontsize=14)
ax.set_ylabel('평점', fontsize=14)
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'{x/10000:.0f}만'))
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/09_price_vs_rating.png', bbox_inches='tight')
plt.close()
print("Chart 9: Price vs Rating - Done")

# ============================================================
# Chart 10: Discount Rate Analysis
# ============================================================
fig, ax = plt.subplots(figsize=(12, 7))
discounts = ((list_prices - prices) / list_prices * 100).dropna()
bins = [0, 5, 8, 9, 10, 11]
labels_disc = ['~5%', '5~8%', '8~9%', '9~10%', '10%+']
cats_disc = pd.cut(discounts, bins=bins, labels=labels_disc)
disc_counts = cats_disc.value_counts().sort_index()

bars = ax.bar(range(len(disc_counts)), disc_counts.values, color=COLORS['palette'][:len(disc_counts)])
ax.set_xticks(range(len(disc_counts)))
ax.set_xticklabels(disc_counts.index, fontsize=12)
ax.set_title('할인율 분포', fontsize=20, fontweight='bold', pad=15)
ax.set_xlabel('할인율', fontsize=14)
ax.set_ylabel('도서 수', fontsize=14)
for i, v in enumerate(disc_counts.values):
    ax.text(i, v + 5, f'{v}권', ha='center', fontsize=12, fontweight='bold')

# Add avg annotation
ax.axhline(y=0, color='gray', linewidth=0.5)
ax.text(len(disc_counts) - 0.5, max(disc_counts.values) * 0.9, 
        f'평균 할인율: {discounts.mean():.1f}%', fontsize=14, fontweight='bold',
        color=COLORS['accent'], ha='right',
        bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['light'], edgecolor=COLORS['accent']))
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('output/charts/10_discount_analysis.png', bbox_inches='tight')
plt.close()
print("Chart 10: Discount Analysis - Done")

print("\n=== All charts generated in output/charts/ ===")
