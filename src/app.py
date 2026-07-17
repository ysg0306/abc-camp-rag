"""Yes24 베스트셀러 탐색적 데이터 분석(EDA) 및 검색 Streamlit 대시보드.

이 모듈은 data/yes24_bestsellers.csv 데이터를 읽거나 사용자가 업로드한 CSV를 활용하여
가격 분포, 출판사 점유율, 판매지수 상관관계 등의 EDA 시각화를 제공하고,
제목 및 책소개 텍스트 통합 키워드 검색 기능을 지원합니다.
"""

import sys
import os
import re
from collections import Counter
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from groq import Groq

# 프로젝트 루트 경로를 sys.path에 추가하여 src 패키지 임포트 문제 해결
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """도서 raw DataFrame 데이터를 로드하고 타입 변환 및 가공 처리를 적용합니다.

    Args:
        df: 원본 도서 데이터프레임.

    Returns:
        전처리가 완료된 데이터프레임.
    """
    df_clean = df.copy()

    # 가격 데이터에서 쉼표 제거 및 숫자 변환
    for col in ["판매가", "정가"]:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].astype(str).str.replace(",", "", regex=True)
            df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")

    # 판매지수 변환
    if "판매지수" in df_clean.columns:
        df_clean["판매지수"] = df_clean["판매지수"].astype(str).str.replace(",", "", regex=True)
        df_clean["판매지수"] = pd.to_numeric(df_clean["판매지수"], errors="coerce")

    # 평점 및 리뷰 수 변환
    if "평점" in df_clean.columns:
        df_clean["평점"] = pd.to_numeric(df_clean["평점"], errors="coerce")
    if "리뷰수" in df_clean.columns:
        df_clean["리뷰수"] = pd.to_numeric(df_clean["리뷰수"], errors="coerce")

    # 할인율 계산 (정가 대비 판매가)
    if "정가" in df_clean.columns and "판매가" in df_clean.columns:
        df_clean["할인율"] = ((df_clean["정가"] - df_clean["판매가"]) / df_clean["정가"] * 100).round(1)
        df_clean.loc[df_clean["할인율"] < 0, "할인율"] = 0
        df_clean.loc[df_clean["할인율"] > 100, "할인율"] = 0

    # 출판일로부터 연도 및 월 추출
    if "출판일" in df_clean.columns:
        df_clean["출판연도"] = df_clean["출판일"].astype(str).apply(
            lambda x: re.search(r"(\d{4})년", x).group(1) if re.search(r"(\d{4})년", x) else "기타"
        )
        df_clean["출판월"] = df_clean["출판일"].astype(str).apply(
            lambda x: re.search(r"(\d{1,2})월", x).group(1) if re.search(r"(\d{1,2})월", x) else "기타"
        )

    # 책소개 결측치 공백 처리
    if "책소개" in df_clean.columns:
        df_clean["책소개"] = df_clean["책소개"].fillna("")
    else:
        df_clean["책소개"] = ""

    return df_clean


@st.cache_data
def load_and_preprocess_data() -> pd.DataFrame:
    """로컬 Yes24 베스트셀러 CSV 데이터를 로드하고 전처리하여 반환합니다.

    Returns:
        전처리가 완료된 pandas DataFrame.
    """
    try:
        df = pd.read_csv("data/yes24_bestsellers.csv")
    except FileNotFoundError:
        return pd.DataFrame()

    return preprocess_data(df)


@st.cache_data
def load_uploaded_data(uploaded_file) -> pd.DataFrame:
    """업로드된 CSV 파일을 읽어서 전처리 후 반환합니다.

    Args:
        uploaded_file: Streamlit file_uploader 객체.

    Returns:
        전처리가 완료된 pandas DataFrame.
    """
    try:
        df = pd.read_csv(uploaded_file)
        return preprocess_data(df)
    except Exception as e:
        st.sidebar.error(f"업로드 데이터 파싱 에러: {e}")
        return pd.DataFrame()


def extract_keywords(texts: pd.Series, top_n: int = 20) -> list:
    """텍스트 시리즈에서 주요 키워드(명사 추정 2글자 이상)를 추출합니다.

    Args:
        texts: 분석할 텍스트 시리즈.
        top_n: 반환할 상위 키워드 수.

    Returns:
        (키워드, 빈도) 튜플 리스트.
    """
    stopwords = {
        "것이", "수 있는", "이 책", "하는", "하는법", "것은", "위한", "때문",
        "그리고", "하지만", "있다", "것이다", "하는것", "하고", "해서",
        "있습니다", "합니다", "입니다", "됩니다", "있다", "없다",
        "이런", "저런", "어떤", "모든", "더욱", "가장", "매우",
        "바로", "때문에", "통해", "대한", "위해", "따라", "까지",
        "하나의", "중요한", "가지", "대한", "관한", "대해",
    }
    word_counter = Counter()
    for text in texts.dropna():
        # 2~6글자 한글 토큰 추출
        tokens = re.findall(r"[가-힣]{2,6}", str(text))
        for token in tokens:
            if token not in stopwords and len(token) >= 2:
                word_counter[token] += 1
    return word_counter.most_common(top_n)


def highlight_text(text: str, query: str) -> str:
    """텍스트에서 검색어를 하이라이트하여 반환합니다.

    Args:
        text: 원본 텍스트.
        query: 검색 키워드.

    Returns:
        하이라이트가 적용된 HTML 문자열.
    """
    if not query or not text:
        return text or ""
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    return pattern.sub(f'<span class="highlight">{query}</span>', str(text))


def prepare_book_context(df: pd.DataFrame, query: str = "") -> str:
    """사용자 질의와 관련된 도서들을 ChromaDB 벡터 검색으로 필터링하여 RAG 컨텍스트 텍스트로 변환합니다.

    ChromaDB 쿼리 중 오류가 발생할 경우 기존의 정규식 기반 키워드 매칭 방식을 폴백(fallback)으로 사용하여 동작합니다.

    Args:
        df: 전처리 완료된 도서 데이터프레임.
        query: 사용자 입력 질문 텍스트.

    Returns:
        도서명, 저자, 평점, 책소개 정보 등이 정리된 문자열.
    """
    if df.empty:
        return "도서 데이터가 없습니다."

    # 0. 가격 및 판매지수 수치 필터링 의도 우선 검사 및 하이브리드 RAG 전환
    try:
        from src.vector_db import apply_numerical_filtering
        filtered_df, filters_desc = apply_numerical_filtering(df, query)
        if filters_desc:
            # 수치 조건이 적용된 경우 상위 15권 추출 및 직접 RAG 컨텍스트 반환
            candidate_df = filtered_df.head(15)
            context_lines = [f"[시스템 안내: 사용자 질문의 의도를 분석하여 다음 수치 범위를 직접 계산 및 정렬한 결과입니다. 필터링 조건: {filters_desc}]"]
            for _, row in candidate_df.iterrows():
                title = row.get("도서명", "제목 없음")
                rank = row.get("순위", "순위 정보 없음")
                author = row.get("저자", "저자 미상")
                publisher = row.get("출판사", "출판사 미상")
                rating = row.get("평점", "평점 없음")
                price = row.get("판매가", "가격 없음")
                sales_index = row.get("판매지수", "지수 없음")
                link = row.get("상세링크", "")

                intro = row.get("책소개", "")
                if pd.isna(intro) or not intro:
                    intro = "책소개 정보 없음"
                else:
                    intro = str(intro).strip()
                    intro = intro[:80] + "..." if len(intro) > 80 else intro

                line = (
                    f"- [순위: {rank}위] {title} | 저자: {author} | 출판사: {publisher} "
                    f"| 평점: {rating} | 판매가: {price}원 | 판매지수: {sales_index} "
                    f"| 상세링크: {link if str(link).startswith('http') else '링크 없음'} | 요약소개: {intro}"
                )
                context_lines.append(line)
            return "\n".join(context_lines)
    except Exception as e:
        st.sidebar.warning(f"⚠️ 수치 범위 분석 중 오류가 발생했습니다. ({e})")

    # 1. ChromaDB 벡터 검색 시도
    try:
        from src.vector_db import query_books
        is_uploaded = st.session_state.get("is_uploaded", False)
        db_path = "data/uploaded_chroma_db" if is_uploaded else "data/chroma_db"
        context = query_books(query=query, df=df, db_path=db_path, n_results=15)
        if context and not context.startswith("도서 검색 처리 중 오류") and not context.startswith("ChromaDB 쿼리 수행 중"):
            return context
    except Exception as e:
        # 벡터 검색 중 오류 시 경고 사이드바 출력 후 기존 키워드 매칭 폴백
        st.sidebar.warning(f"⚠️ 벡터 검색 중 오류가 발생하여 기존 검색 방식으로 대체합니다. ({e})")

    # 2. 폴백 로직: 기존 키워드 매칭 방식
    keywords = re.findall(r"[가-힣a-zA-Z0-9]{2,}", query)
    stopwords = {"추천", "책", "도서", "해줘", "있어", "알려줘", "싶어", "좋은", "최근", "인기", "베스트셀러", "목록"}
    keywords = [kw for kw in keywords if kw not in stopwords]

    matched_df = pd.DataFrame()
    if keywords:
        scores = []
        for idx, row in df.iterrows():
            score = 0
            text_to_search = f"{row.get('도서명', '')} {row.get('책소개', '')} {row.get('저자', '')} {row.get('출판사', '')}"
            for kw in keywords:
                if kw.lower() in text_to_search.lower():
                    if kw.lower() in str(row.get('도서명', '')).lower():
                        score += 3
                    else:
                        score += 1
            scores.append(score)
        
        df_copy = df.copy()
        df_copy["match_score"] = scores
        matched_df = df_copy[df_copy["match_score"] > 0].sort_values(by=["match_score", "판매지수"], ascending=[False, False])

    candidate_df = pd.DataFrame()
    if not matched_df.empty:
        candidate_df = matched_df.head(15)
    else:
        candidate_df = df.sort_values(by="판매지수", ascending=False).head(15)

    context_lines = []
    for _, row in candidate_df.iterrows():
        title = row.get("도서명", "제목 없음")
        rank = row.get("순위", "순위 정보 없음")
        author = row.get("저자", "저자 미상")
        publisher = row.get("출판사", "출판사 미상")
        rating = row.get("평점", "평점 없음")
        price = row.get("판매가", "가격 없음")
        sales_index = row.get("판매지수", "지수 없음")
        link = row.get("상세링크", "")

        intro = row.get("책소개", "")
        if pd.isna(intro) or not intro:
            intro = "책소개 정보 없음"
        else:
            intro = str(intro).strip()
            intro = intro[:80] + "..." if len(intro) > 80 else intro

        line = (
            f"- [순위: {rank}위] {title} | 저자: {author} | 출판사: {publisher} "
            f"| 평점: {rating} | 판매가: {price}원 | 판매지수: {sales_index} "
            f"| 상세링크: {link if link else '링크 없음'} | 요약소개: {intro}"
        )
        context_lines.append(line)

    return "\n".join(context_lines)


def get_groq_recommendation(
    api_key: str,
    model: str,
    messages: list,
    context: str,
) -> str:
    """Groq API를 호출하여 제공된 도서 컨텍스트에 부합하는 도서 추천 답변을 생성합니다.

    Args:
        api_key: Groq API Key.
        model: Groq API에서 사용할 LLM 모델 이름.
        messages: 이전 대화 내역 목록.
        context: 데이터프레임에서 포맷팅된 도서 정보 텍스트.

    Returns:
        Groq API가 생성한 도서 추천 또는 예외 응답 마크다운 텍스트.

    Raises:
        Exception: API Key가 무효하거나 네트워크 통신 장애 등이 발생할 때 예외를 던집니다.
    """
    # API 키 정제 (양끝 공백 및 비-ascii 문자 제거로 인코딩 에러 차단)
    cleaned_api_key = str(api_key).strip()
    cleaned_api_key = re.sub(r'[^\x00-\x7F]+', '', cleaned_api_key)
    client = Groq(api_key=cleaned_api_key)

    # RAG용 시스템 프롬프트 정의
    system_prompt = (
        "당신은 Yes24 베스트셀러 도서 정보를 바탕으로 사용자에게 알맞은 도서를 추천하는 친절하고 전문적인 챗봇 AI입니다.\n"
        "반드시 아래 제공된 도서 목록 데이터에 기반하여 답변해야 합니다. 소설, 요리 등 목록에 없는 책을 임의로 추천하면 안 됩니다.\n\n"
        "**[중요 규칙]**\n"
        "1. 사용자가 요구하는 내용(키워드, 주제, 학습 목적 등)에 부합하는 도서가 아래 도서 목록에 없을 경우, 절대 다른 책을 임의로 지어내지 말고 반드시 \"추천할 도서가 없습니다.\"라고만 명확하게 답변해 주세요. 질문에 '추천할 도서가 없다면 없다고 답변'하라는 지침이 있으므로 철저히 지키십시오.\n"
        "2. 추천 대상 도서에 상세링크 정보가 존재하는 경우, 해당 책의 Yes24 상품 링크로 사용자가 즉시 이동할 수 있도록 마크다운 링크 형식(예: `[Yes24 상품 링크](상세링크_URL)`)으로 답변에 반드시 포함해 주세요. 여러 권을 추천할 때도 각각 상세링크를 포함해야 합니다.\n"
        "3. 사용자가 책 목록 전체나 일부를 요약해 달라고 하거나, 특정 조건의 책(예: 평점이 가장 높은 책, 가장 비싼 책 등)을 묻는 질문에도 제공된 도서 목록 데이터를 기준으로 친절하고 명확한 한국어로 답변해 주세요.\n\n"
        f"[제공된 도서 목록 데이터]\n{context}"
    )

    api_messages = [{"role": "system", "content": system_prompt}]

    # 이전 대화 내역 중 user, assistant 역할만 추가
    for msg in messages:
        if msg["role"] in ["user", "assistant"]:
            api_messages.append({"role": msg["role"], "content": msg["content"]})

    # Groq Chat Completion 생성
    chat_completion = client.chat.completions.create(
        messages=api_messages,
        model=model,
        temperature=0.3,  # 추천의 정확성과 일관성을 위해 낮춤
        max_tokens=2048,
    )

    return chat_completion.choices[0].message.content


# 1. 페이지 기본 설정 및 디자인 테마
st.set_page_config(
    page_title="Yes24 IT/모바일 베스트셀러 대시보드",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Premium UI를 위한 커스텀 CSS 적용
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+KR:wght@300;400;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Outfit', 'Noto Sans KR', sans-serif;
    }
    .main-title {
        font-size: 2.8rem;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #718096;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;
    }
    .metric-card:hover {
        transform: translateY(-2px);
    }
    .book-card {
        background-color: #ffffff;
        border: 1px solid #edf2f7;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;
        border-left: 5px solid #667eea;
    }
    .book-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 0.5rem;
    }
    .book-meta {
        font-size: 0.9rem;
        color: #4a5568;
        margin-bottom: 1rem;
    }
    .badge {
        background-color: #ebf8ff;
        color: #2b6cb0;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }
    .highlight {
        background-color: #fefcbf;
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# 2. 사이드바 파일 업로더 구성
st.sidebar.markdown("### 📂 데이터 업로드")
uploaded_file = st.sidebar.file_uploader(
    "도서 정보 CSV 파일을 업로드하세요 (도서명, 저자, 출판사, 책소개 등 포함)",
    type=["csv"]
)

# 데이터 로드 분기
if uploaded_file is not None:
    df = load_uploaded_data(uploaded_file)
    is_uploaded = True
else:
    df = load_and_preprocess_data()
    is_uploaded = False

# 업로드 상태 세션 저장
st.session_state["is_uploaded"] = is_uploaded

# 데이터 로드 실패 시 유도 안내 및 중단
if df.empty:
    st.warning("📊 분석 및 챗봇에 사용할 도서 데이터가 로드되지 않았습니다.")
    st.info("왼쪽 사이드바에서 도서 CSV 파일을 업로드하거나, 프로젝트 내 'data/yes24_bestsellers.csv' 파일 위치를 확인해 주세요.")
    st.stop()

# 3. 사이드바 네비게이션 구성
st.sidebar.markdown("---")
st.sidebar.markdown("### 📊 네비게이션")
menu = st.sidebar.radio("원하는 페이지를 선택하세요:", ["💡 데이터 분석 (EDA)", "🔍 키워드 통합 검색", "🤖 도서 추천 챗봇"])

st.sidebar.markdown("---")
st.sidebar.markdown("### 📈 수집 데이터 통계")
st.sidebar.write(f"- **총 도서 수**: {len(df)}권")
st.sidebar.write(f"- **상세 책소개 확보**: {df['책소개'].astype(bool).sum()}권")
st.sidebar.write(f"- **평균 평점**: {df['평점'].mean():.2f}점 / 10.0")
st.sidebar.write(f"- **평균 판매가**: {int(df['판매가'].mean()):,}원")

# 사이드바 필터 (검색 페이지용)
if menu == "🔍 키워드 통합 검색":
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🎛️ 검색 필터")
    publishers = ["전체"] + sorted(df["출판사"].dropna().unique().tolist())
    selected_publisher = st.sidebar.selectbox("출판사 선택:", publishers)

# 사이드바 Groq API Key 설정 추가
st.sidebar.markdown("---")
st.sidebar.markdown("### ⚙️ API 설정")
initial_key = st.session_state.get("groq_api_key", "")
groq_api_key = st.sidebar.text_input("Groq API Key 입력:", type="password", value=initial_key, placeholder="gsk_...")
if groq_api_key:
    st.session_state["groq_api_key"] = groq_api_key

# 3. 메인 타이틀 영역
st.markdown('<div class="main-title">Yes24 IT/모바일 베스트셀러 대시보드</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">수집된 Yes24 베스트셀러 데이터를 바탕으로 통계 시각화 및 도서 통합 검색 서비스를 제공합니다.</div>', unsafe_allow_html=True)

# 4. 페이지 전환 및 렌더링
if menu == "💡 데이터 분석 (EDA)":
    st.markdown("### 💡 탐색적 데이터 분석 (EDA)")

    # KPIs (주요 성능 지표)
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h4 style='margin:0;color:#718096;font-size:0.9rem;'>평균 판매가</h4>
            <p style='margin:10px 0 0 0;font-size:1.8rem;font-weight:700;color:#2b6cb0;'>{int(df['판매가'].mean()):,}원</p>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h4 style='margin:0;color:#718096;font-size:0.9rem;'>평균 할인율</h4>
            <p style='margin:10px 0 0 0;font-size:1.8rem;font-weight:700;color:#2f855a;'>{df['할인율'].mean():.1f}%</p>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h4 style='margin:0;color:#718096;font-size:0.9rem;'>최다 리뷰 수</h4>
            <p style='margin:10px 0 0 0;font-size:1.8rem;font-weight:700;color:#d69e2e;'>{int(df['리뷰수'].max()):,}건</p>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <h4 style='margin:0;color:#718096;font-size:0.9rem;'>최고 판매지수</h4>
            <p style='margin:10px 0 0 0;font-size:1.8rem;font-weight:700;color:#b7791f;'>{int(df['판매지수'].max()):,}</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # 탭 구성
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "💰 가격 및 할인율",
        "🏢 출판사 및 저자",
        "📈 판매지수·별점",
        "📅 출판 시계열",
        "🔤 키워드 빈도"
    ])

    with tab1:
        st.subheader("💰 가격 및 할인율 통계")
        c1, c2 = st.columns(2)
        with c1:
            fig_price = px.histogram(
                df, x="판매가", nbins=20,
                title="판매가 분포 (도서 수)",
                labels={"판매가": "판매가 (원)"},
                color_discrete_sequence=["#5a67d8"]
            )
            fig_price.update_layout(yaxis_title="도서 수", bargap=0.05)
            st.plotly_chart(fig_price, use_container_width=True)

        with c2:
            fig_discount = px.histogram(
                df, x="할인율", nbins=15,
                title="할인율 분포 (%)",
                labels={"할인율": "할인율 (%)"},
                color_discrete_sequence=["#48bb78"]
            )
            fig_discount.update_layout(yaxis_title="도서 수", bargap=0.05)
            st.plotly_chart(fig_discount, use_container_width=True)

        # 가격 대비 평점 산점도
        st.subheader("💰 가격 대비 평점 분석")
        price_rating_df = df.dropna(subset=["판매가", "평점"])
        fig_pr = px.scatter(
            price_rating_df, x="판매가", y="평점",
            size="리뷰수", color="판매지수",
            hover_data=["도서명", "출판사"],
            title="판매가 vs 평점 (원 크기: 리뷰 수, 색상: 판매지수)",
            labels={"판매가": "판매가 (원)", "평점": "평점"},
            color_continuous_scale="Viridis",
            size_max=40
        )
        st.plotly_chart(fig_pr, use_container_width=True)

    with tab2:
        st.subheader("🏢 인기 출판사 및 저자 현황")
        c1, c2 = st.columns(2)
        with c1:
            pub_counts = df["출판사"].value_counts().head(10).reset_index()
            pub_counts.columns = ["출판사", "도서 수"]
            fig_pub = px.bar(
                pub_counts, x="도서 수", y="출판사", orientation="h",
                title="도서 등록 수 상위 10대 출판사",
                color="도서 수",
                color_continuous_scale="Viridis"
            )
            fig_pub.update_layout(yaxis={"categoryorder": "total ascending"})
            st.plotly_chart(fig_pub, use_container_width=True)

        with c2:
            valid_authors = df[df["저자"].astype(bool)]["저자"]
            auth_counts = valid_authors.value_counts().head(10).reset_index()
            auth_counts.columns = ["저자", "도서 수"]
            fig_auth = px.bar(
                auth_counts, x="도서 수", y="저자", orientation="h",
                title="도서 등록 수 상위 10대 저자",
                color="도서 수",
                color_continuous_scale="Cividis"
            )
            fig_auth.update_layout(yaxis={"categoryorder": "total ascending"})
            st.plotly_chart(fig_auth, use_container_width=True)

        # 출판사별 평균 판매지수
        st.subheader("🏢 출판사별 평균 판매지수 (상위 15개)")
        pub_sales = (
            df.groupby("출판사")
            .agg(평균판매지수=("판매지수", "mean"), 도서수=("도서명", "count"))
            .reset_index()
            .sort_values("평균판매지수", ascending=True)
            .tail(15)
        )
        fig_pub_sales = px.bar(
            pub_sales, x="평균판매지수", y="출판사", orientation="h",
            color="도서수", color_continuous_scale="Magma",
            title="출판사별 평균 판매지수 (상위 15개, 색상: 도서 수)",
            labels={"평균판매지수": "평균 판매지수", "도서수": "등록 도서 수"}
        )
        st.plotly_chart(fig_pub_sales, use_container_width=True)

    with tab3:
        st.subheader("📈 판매지수, 평점, 리뷰 수 상관 분석")
        c1, c2 = st.columns(2)
        with c1:
            fig_scatter = px.scatter(
                df.dropna(subset=["평점", "리뷰수"]),
                x="평점", y="리뷰수", size="판매지수", color="판매지수",
                title="평점 vs 리뷰 수 (원 크기: 판매지수)",
                labels={"평점": "평점 (10점 만점)", "리뷰수": "리뷰 등록 수 (건)"},
                hover_data=["도서명"],
                color_continuous_scale="Bluered",
                size_max=50
            )
            st.plotly_chart(fig_scatter, use_container_width=True)

        with c2:
            # 상관 히트맵
            numeric_cols = ["판매가", "정가", "할인율", "판매지수", "평점", "리뷰수"]
            corr_df = df[numeric_cols].corr()
            fig_corr = px.imshow(
                corr_df, text_auto=".2f",
                title="수치형 변수 간 상관 계수 히트맵",
                color_continuous_scale="RdBu_r",
                zmin=-1, zmax=1,
                labels={"color": "상관계수"}
            )
            fig_corr.update_layout(width=500, height=500)
            st.plotly_chart(fig_corr, use_container_width=True)

    with tab4:
        st.subheader("📅 출판 시계열 분석")
        c1, c2 = st.columns(2)
        with c1:
            trend_df = df[df["출판연도"] != "기타"].groupby("출판연도").size().reset_index(name="도서 수")
            trend_df = trend_df.sort_values("출판연도")
            fig_line = px.line(
                trend_df, x="출판연도", y="도서 수",
                title="출판연도별 베스트셀러 도서 수 추이",
                markers=True, color_discrete_sequence=["#e53e3e"]
            )
            fig_line.update_layout(xaxis_title="출판연도", yaxis_title="도서 수")
            st.plotly_chart(fig_line, use_container_width=True)

        with c2:
            # 출판월별 분포
            month_df = df[df["출판월"] != "기타"].copy()
            month_df["출판월_int"] = pd.to_numeric(month_df["출판월"], errors="coerce")
            month_order = list(range(1, 13))
            month_counts = month_df["출판월_int"].value_counts().reindex(month_order, fill_value=0).reset_index()
            month_counts.columns = ["출판월", "도서 수"]
            month_counts["출판월"] = month_counts["출판월"].astype(str) + "월"
            fig_month = px.bar(
                month_counts, x="출판월", y="도서 수",
                title="출판월별 베스트셀러 분포",
                color_discrete_sequence=["#805ad5"],
                labels={"출판월": "출판월", "도서 수": "도서 수"}
            )
            st.plotly_chart(fig_month, use_container_width=True)

        # 연도별 평균 가격 추이
        price_trend = (
            df[df["출판연도"] != "기타"]
            .groupby("출판연도")["판매가"]
            .mean()
            .reset_index()
            .sort_values("출판연도")
        )
        fig_price_trend = px.line(
            price_trend, x="출판연도", y="판매가",
            title="출판연도별 평균 판매가 추이",
            markers=True, color_discrete_sequence=["#38a169"]
        )
        fig_price_trend.update_layout(yaxis_title="평균 판매가 (원)")
        st.plotly_chart(fig_price_trend, use_container_width=True)

    with tab5:
        st.subheader("🔤 도서 제목 주요 키워드 분석")
        # 제목 키워드 추출
        title_keywords = extract_keywords(df["도서명"], top_n=25)
        if title_keywords:
            kw_df = pd.DataFrame(title_keywords, columns=["키워드", "빈도"])
            fig_kw = px.bar(
                kw_df, x="빈도", y="키워드", orientation="h",
                title="도서 제목 상위 25개 키워드",
                color="빈도",
                color_continuous_scale="Teal"
            )
            fig_kw.update_layout(yaxis={"categoryorder": "total ascending"})
            st.plotly_chart(fig_kw, use_container_width=True)

        # 책소개 키워드 추출
        st.subheader("🔤 책소개 주요 키워드 분석")
        intro_keywords = extract_keywords(df["책소개"], top_n=25)
        if intro_keywords:
            kw_intro_df = pd.DataFrame(intro_keywords, columns=["키워드", "빈도"])
            fig_kw_intro = px.bar(
                kw_intro_df, x="빈도", y="키워드", orientation="h",
                title="책소개 상위 25개 키워드",
                color="빈도",
                color_continuous_scale="Sunset"
            )
            fig_kw_intro.update_layout(yaxis={"categoryorder": "total ascending"})
            st.plotly_chart(fig_kw_intro, use_container_width=True)

elif menu == "🔍 키워드 통합 검색":
    st.markdown("### 🔍 제목 & 본문 통합 검색")
    st.write("키워드를 입력하면 도서 제목과 본문(책소개)에서 검색을 수행하며, 조건별 정렬 및 상세 정보를 제공합니다.")

    col_search, col_sort = st.columns([3, 1])
    with col_search:
        search_query = st.text_input("검색할 키워드를 입력해 주세요 (예: 파이썬, AI, 클로드, 머신러닝):", "")
    with col_sort:
        sort_by = st.selectbox("정렬 기준:", ["순위 순", "평점 높은 순", "리뷰 많은 순", "판매지수 높은 순"])

    # 정렬 매핑
    sort_mapping = {
        "순위 순": ("순위", True),
        "평점 높은 순": ("평점", False),
        "리뷰 많은 순": ("리뷰수", False),
        "판매지수 높은 순": ("판매지수", False)
    }
    sort_col, ascending_order = sort_mapping[sort_by]
    sorted_df = df.sort_values(by=sort_col, ascending=ascending_order, na_position="last")

    # 출판사 필터 적용
    if "selected_publisher" in dir() and selected_publisher != "전체":
        sorted_df = sorted_df[sorted_df["출판사"] == selected_publisher]

    # 검색 필터링
    if search_query.strip():
        filtered_df = sorted_df[
            sorted_df["도서명"].str.contains(search_query, case=False, na=False) |
            sorted_df["책소개"].str.contains(search_query, case=False, na=False) |
            sorted_df["저자"].str.contains(search_query, case=False, na=False)
        ]
        st.write(f"🔍 **'{search_query}'** 키워드로 총 **{len(filtered_df)}**건의 도서가 검색되었습니다.")
    else:
        filtered_df = sorted_df
        st.write(f"총 **{len(filtered_df)}**개의 전체 도서 목록을 표시합니다.")

    st.markdown("<br>", unsafe_allow_html=True)

    # 검색 결과 카드 렌더링
    if not filtered_df.empty:
        for idx, row in filtered_df.iterrows():
            with st.container():
                # 하이라이트 적용된 도서명
                display_title = highlight_text(row["도서명"], search_query) if search_query.strip() else row["도서명"]

                badge_rank = f"<span class='badge'>🏆 {int(row['순위'])}위</span>"
                badge_price = f"<span class='badge'>💰 {int(row['판매가']):,}원</span>" if not pd.isna(row["판매가"]) else ""
                badge_rating = f"<span class='badge'>⭐ {row['평점']:.1f}점</span>" if not pd.isna(row["평점"]) else ""
                badge_sales = f"<span class='badge'>📈 지수 {int(row['판매지수']):,}</span>" if not pd.isna(row["판매지수"]) else ""
                badge_review = f"<span class='badge'>💬 리뷰 {int(row['리뷰수']):,}건</span>" if not pd.isna(row["리뷰수"]) else ""

                st.markdown(f"""
                <div class="book-card">
                    <div class="book-title">{display_title}</div>
                    <div class="book-meta">
                        {row['저자'] or '저자 미상'} | {row['출판사'] or '출판사 미상'} | {row['출판일'] or '출간일 미상'}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        {badge_rank} {badge_price} {badge_rating} {badge_sales} {badge_review}
                    </div>
                </div>
                """, unsafe_allow_html=True)

                with st.expander("📖 도서 세부 정보 및 책소개 보기"):
                    c_left, c_right = st.columns([3, 1])
                    with c_left:
                        st.markdown("**📝 도서 소개**")
                        if row["책소개"]:
                            display_intro = highlight_text(row["책소개"], search_query) if search_query.strip() else row["책소개"]
                            st.markdown(display_intro, unsafe_allow_html=True)
                        else:
                            st.info("상세 책소개 정보가 수집되지 않은 도서입니다.")
                    with c_right:
                        st.markdown("**📋 상세 정보**")
                        st.write(f"- **정가**: {int(row['정가']):,}원" if not pd.isna(row["정가"]) else "- **정가**: 정보 없음")
                        st.write(f"- **할인율**: {row['할인율']}%" if "할인율" in row else "- **할인율**: 없음")
                        st.write(f"- **리뷰 수**: {int(row['리뷰수']):,}건" if not pd.isna(row["리뷰수"]) else "- **리뷰 수**: 0건")
                        if row["상세링크"]:
                            st.markdown(f"[🔗 Yes24 상품 링크]({row['상세링크']})")

    else:
        st.warning("검색 결과가 없습니다. 다른 키워드로 검색해 보세요.")

elif menu == "🤖 도서 추천 챗봇":
    st.markdown("### 🤖 Groq 기반 AI 도서 추천 챗봇")
    st.write("대시보드에 수집된 베스트셀러 도서 데이터를 기반으로 질문에 부합하는 도서를 추천해 드립니다.")

    # ChromaDB 벡터 DB 초기화 및 빌드 체크
    with st.spinner("📚 한국어 도서 임베딩 모델(TF-IDF) 및 벡터 DB를 초기화하고 있습니다. 최초 실행 시 다소 시간이 걸릴 수 있습니다..."):
        try:
            from src.vector_db import build_vector_db
            if st.session_state.get("is_uploaded", False):
                build_vector_db(df=df, db_path="data/uploaded_chroma_db", force_rebuild=False)
            else:
                build_vector_db(csv_path="data/yes24_bestsellers.csv", db_path="data/chroma_db", force_rebuild=False)
        except Exception as e:
            st.error(f"벡터 데이터베이스 초기화 중 오류가 발생했습니다: {e}")

    # API 키 검증
    api_key_stored = st.session_state.get("groq_api_key", "")

    if not api_key_stored:
        st.warning("⚠️ 사이드바의 **[API 설정]** 영역에서 **Groq API Key**를 입력한 후 챗봇을 이용해 주세요.")
        st.info("Groq API Key는 [Groq Console](https://console.groq.com/keys)에서 무료로 발급받으실 수 있습니다.")
    elif not api_key_stored.startswith("gsk_") or len(api_key_stored) < 20:
        st.error("❌ 입력된 API Key의 형식이 올바르지 않습니다. Groq API Key는 일반적으로 `gsk_`로 시작하는 문자열입니다. 사이드바의 입력란을 다시 확인해 주세요.")
    else:
        # 모델 선택
        selected_model = st.selectbox(
            "사용할 AI 모델 선택:",
            ["llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768"],
            index=0
        )

        # 대화 내용 초기화 버튼
        col_chat_title, col_chat_reset = st.columns([5, 1])
        with col_chat_reset:
            if st.button("🔄 대화 초기화", use_container_width=True):
                st.session_state.messages = [
                    {"role": "assistant", "content": "안녕하세요! Yes24 IT/모바일 베스트셀러 도서 추천 챗봇입니다. 원하시는 주제나 찾고 계신 책에 대해 말씀해 주시면 데이터를 바탕으로 친절히 추천해 드릴게요! 😊"}
                ]
                st.rerun()

        # 세션 메시지 초기화
        if "messages" not in st.session_state:
            st.session_state.messages = [
                {"role": "assistant", "content": "안녕하세요! Yes24 IT/모바일 베스트셀러 도서 추천 챗봇입니다. 원하시는 주제나 찾고 계신 책에 대해 말씀해 주시면 데이터를 바탕으로 친절히 추천해 드릴게요! 😊"}
            ]

        # 대화 이력 표시
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        # 사용자 입력 처리
        if prompt := st.chat_input("어떤 책을 추천받고 싶으신가요? (예: 초보자가 쉽게 읽기 좋은 파이썬 도서 추천해줘)"):
            # 1. 사용자 메시지 추가 및 화면 출력
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            # 2. 어시스턴트 응답 생성 및 출력
            with st.chat_message("assistant"):
                with st.spinner("도서 목록을 검색하고 추천 답변을 생성하고 있습니다..."):
                    context = prepare_book_context(df, prompt)
                    try:
                        response_text = get_groq_recommendation(
                            api_key=api_key_stored,
                            model=selected_model,
                            messages=st.session_state.messages,
                            context=context
                        )
                        st.markdown(response_text)
                        st.session_state.messages.append({"role": "assistant", "content": response_text})
                    except Exception as e:
                        error_msg = f"Groq API 호출 중 오류가 발생했습니다: {e}\nAPI Key 유효성 및 네트워크 환경을 확인해 주세요."
                        st.error(error_msg)
