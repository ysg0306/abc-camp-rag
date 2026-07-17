"""ChromaDB 벡터 데이터베이스와 Pure-Python TF-IDF 임베딩을 결합한 Yes24 도서 RAG 검색 엔진 모듈.

이 모듈은 Windows 환경의 C++ 딥러닝 패키지(PyTorch/ONNX) 로딩 에러를 우회하기 위해,
자체 구현한 TF-IDF 임베딩 함수를 ChromaDB에 주입하여
실제 `data/chroma_db` 경로에 물리 데이터베이스(SQLite3 및 벡터 인덱스) 파일들을 생성하고 관리합니다.
"""

import os
import re
import math
from collections import Counter
import pandas as pd
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings


class SimpleTfidfEmbeddingFunction(EmbeddingFunction):
    """Pure-Python TF-IDF 방식을 기반으로 작동하는 ChromaDB용 커스텀 임베딩 함수 클래스."""

    def __init__(self, corpus_texts: list, vocab_size_limit: int = 1000):
        """전체 말뭉치(Corpus)를 바탕으로 단어 사전과 IDF 가중치를 빌드합니다.

        Args:
            corpus_texts: 사전을 구성할 전체 도서 텍스트 목록.
            vocab_size_limit: 임베딩 벡터 차원을 제한할 최대 단어 수 (기본값 1000).
        """
        self.stopwords = {
            "추천", "책", "도서", "해줘", "있어", "알려줘", "싶어", "좋은", "최근", "인기", 
            "베스트셀러", "목록", "방법", "기준", "내용", "정보", "관련", "소개", "이유",
            "것이", "수있는", "이책", "하는", "하는법", "것은", "위한", "때문", "그리고", 
            "하지만", "있다", "것이다", "하고", "해서", "있습니다", "합니다", "입니다",
            "됩니다", "없다", "이런", "저런", "어떤", "모든", "더욱", "가장", "매우", 
            "바로", "때문에", "통해", "대한", "위해", "따라", "까지", "하나의", "중요한",
            "가지", "관한", "대해", "대해서"
        }
        
        # 1단계: 전체 문서 토큰화 및 단어 빈도 계산
        tokenized_docs = [self._tokenize(txt) for txt in corpus_texts]
        doc_frequency = Counter()
        for tokens in tokenized_docs:
            for tok in set(tokens):
                doc_frequency[tok] += 1

        # 2단계: 빈도순 상위 단어로 어휘 사전(Vocab) 및 차원 수 제한
        most_common_words = [word for word, _ in doc_frequency.most_common(vocab_size_limit)]
        self.vocab = {word: idx for idx, word in enumerate(most_common_words)}
        self.vector_dim = len(self.vocab)

        # 3단계: IDF 계산 (Smooth IDF)
        num_docs = len(corpus_texts)
        self.idf = {}
        for word in self.vocab:
            df = doc_frequency[word]
            self.idf[word] = math.log((num_docs + 1) / (df + 1)) + 1.0

    def _tokenize(self, text: str) -> list:
        """텍스트에서 2글자 이상의 영숫자 및 한글 단어를 추출하고 불용어를 여과합니다."""
        if not text:
            return []
        tokens = re.findall(r"[가-힣a-zA-Z0-9]{2,}", text.lower())
        return [tok for tok in tokens if tok not in self.stopwords]

    def __call__(self, input: Documents) -> Embeddings:
        """입력 문서 리스트에 대해 정규화된 TF-IDF 임베딩 벡터 목록을 계산해 리턴합니다.

        Args:
            input: 임베딩 처리할 문장 텍스트 리스트.

        Returns:
            고정된 차원(vector_dim)을 지니는 L2 정규화된 실수 벡터 목록 (list[list[float]]).
        """
        embeddings = []
        for text in input:
            tokens = self._tokenize(text)
            tf = Counter(tokens)
            
            # 빈 벡터 생성 (차원 수 고정)
            vector = [0.0] * self.vector_dim
            squared_sum = 0.0

            # TF-IDF 값 산출
            for word, freq in tf.items():
                if word in self.vocab:
                    word_idx = self.vocab[word]
                    tf_idf_val = freq * self.idf[word]
                    vector[word_idx] = tf_idf_val
                    squared_sum += tf_idf_val ** 2

            # 코사인 거리 최적화를 위한 L2 정규화 적용 (크기를 1.0으로 고정)
            norm = math.sqrt(squared_sum)
            if norm > 0.0:
                vector = [val / norm for val in vector]

            embeddings.append(vector)
        return embeddings


# 메모리 캐시용 전역 임베딩 함수 인스턴스
_global_embedding_fn = None


def get_embedding_function_instance(csv_path: str = None, df: pd.DataFrame = None) -> SimpleTfidfEmbeddingFunction:
    """CSV 파일 경로 또는 DataFrame 데이터를 바탕으로 전역 SimpleTfidfEmbeddingFunction 싱글톤 인스턴스를 획득합니다.

    Args:
        csv_path: 수집된 도서 CSV 파일 경로.
        df: 전처리 완료된 도서 DataFrame. 만약 df가 전달되면 csv_path보다 우선하여 사용됩니다.

    Returns:
        SimpleTfidfEmbeddingFunction 임베딩 함수 인스턴스. 데이터가 없으면 None을 반환합니다.
    """
    global _global_embedding_fn
    # 업로드되는 데이터가 매번 다를 수 있으므로, df가 제공되는 경우에는 매번 새로운 인스턴스를 빌드하고,
    # csv_path 기반 기본 모드일 때만 _global_embedding_fn 싱글톤 캐시를 활용하도록 설계합니다.
    if df is not None:
        corpus_texts = []
        for idx, row in df.iterrows():
            title = str(row.get("도서명", "")).strip()
            author = str(row.get("저자", "")).strip()
            publisher = str(row.get("출판사", "")).strip()
            intro = str(row.get("책소개", "")).strip() if not pd.isna(row.get("책소개")) else ""
            document_text = f"도서명: {title}\n저자: {author}\n출판사: {publisher}\n책소개: {intro}"
            corpus_texts.append(document_text)
        return SimpleTfidfEmbeddingFunction(corpus_texts, vocab_size_limit=1000)

    if _global_embedding_fn is not None:
        return _global_embedding_fn

    if csv_path is None or not os.path.exists(csv_path):
        return None

    df_local = pd.read_csv(csv_path)
    corpus_texts = []
    for idx, row in df_local.iterrows():
        title = str(row.get("도서명", "")).strip()
        author = str(row.get("저자", "")).strip()
        publisher = str(row.get("출판사", "")).strip()
        intro = str(row.get("책소개", "")).strip() if not pd.isna(row.get("책소개")) else ""
        document_text = f"도서명: {title}\n저자: {author}\n출판사: {publisher}\n책소개: {intro}"
        corpus_texts.append(document_text)

    _global_embedding_fn = SimpleTfidfEmbeddingFunction(corpus_texts, vocab_size_limit=1000)
    return _global_embedding_fn


def build_vector_db(
    csv_path: str = "data/yes24_bestsellers.csv",
    df: pd.DataFrame = None,
    db_path: str = "data/chroma_db",
    collection_name: str = "yes24_bestsellers",
    force_rebuild: bool = False,
) -> bool:
    """ChromaDB를 연동하여 CSV 데이터 또는 DataFrame을 임베딩 함수와 함께 실제 로컬 DB 파일로 인덱싱해 저장합니다.

    Args:
        csv_path: 수집된 도서 CSV 파일 경로.
        df: 직접 전달된 도서 메타데이터 DataFrame. csv_path가 없거나 df가 유효하면 이를 우선 사용합니다.
        db_path: 로컬 벡터 DB 디렉토리 경로.
        collection_name: 사용할 크로마 컬렉션 명칭.
        force_rebuild: True 설정 시 기존 컬렉션을 삭제하고 강제 재구축합니다.

    Returns:
        성공적으로 파일 인덱스가 저장 완료되면 True를 반환합니다.
    """
    if df is not None:
        target_df = df
    elif csv_path and os.path.exists(csv_path):
        target_df = pd.read_csv(csv_path)
    else:
        print(f"오류: 유효한 DataFrame이 없거나 존재하지 않는 csv_path('{csv_path}')입니다.")
        return False

    if target_df.empty:
        print("경고: CSV 도서 데이터가 비어 있습니다.")
        return False

    # 1단계: 커스텀 TF-IDF 임베딩 함수 인스턴스 준비
    embedding_fn = get_embedding_function_instance(csv_path=csv_path, df=target_df)
    if embedding_fn is None:
        return False

    # 2단계: ChromaDB 클라이언트 연결 및 데이터베이스 생성
    os.makedirs(db_path, exist_ok=True)
    client = chromadb.PersistentClient(path=db_path)

    # 강제 재구축 처리
    if force_rebuild:
        try:
            client.delete_collection(collection_name)
        except Exception:
            pass

    # 컬렉션 생성 (커스텀 임베딩 함수 주입)
    # HNSW 인덱스의 거리 기준을 코사인 유사도(cosine)로 지정하여 정확성 극대화
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )

    # 이미 동일 개수의 데이터 파일이 생성되어 있는지 체크
    if not force_rebuild and collection.count() > 0:
        if abs(collection.count() - len(target_df)) <= 5:
            print(f"이미 ChromaDB 벡터 데이터베이스 파일이 성공적으로 생성되어 있습니다. (데이터 수: {collection.count()}개)")
            return True

    print(f"ChromaDB 벡터 데이터베이스 파일 생성을 시작합니다... (대상: {len(target_df)}권)")

    ids = []
    documents = []
    metadatas = []

    for idx, row in target_df.iterrows():
        doc_id = str(row.get("상세링크")) if not pd.isna(row.get("상세링크")) and str(row.get("상세링크")).strip() != "" else f"book_idx_{idx}"
        title = str(row.get("도서명", "")).strip()
        author = str(row.get("저자", "")).strip()
        publisher = str(row.get("출판사", "")).strip()
        intro = str(row.get("책소개", "")).strip() if not pd.isna(row.get("책소개")) else ""
        
        # 임베딩할 문서
        document_text = f"도서명: {title}\n저자: {author}\n출판사: {publisher}\n책소개: {intro}"
        
        # 메타데이터 추출
        meta = {
            "순위": int(row.get("순위")) if not pd.isna(row.get("순위")) else idx + 1,
            "도서명": title,
            "상세링크": doc_id,
            "저자": author if author else "저자 미상",
            "출판사": publisher if publisher else "출판사 미상",
            "출판일": str(row.get("출판일", "")) if not pd.isna(row.get("출판일")) else "",
            "평점": float(row.get("평점")) if not pd.isna(row.get("평점")) else -1.0,
            "리뷰수": int(row.get("리뷰수")) if not pd.isna(row.get("리뷰수")) else 0,
            "책소개": intro[:2000]
        }

        # 가격 정보 가공
        for col_price in ["판매가", "정가"]:
            val = row.get(col_price)
            if not pd.isna(val):
                cleaned_val = str(val).replace(",", "")
                try:
                    meta[col_price] = int(float(cleaned_val))
                except ValueError:
                    meta[col_price] = 0
            else:
                meta[col_price] = 0

        # 판매지수 변환
        sales_val = row.get("판매지수")
        if not pd.isna(sales_val):
            cleaned_sales = str(sales_val).replace(",", "")
            try:
                meta["판매지수"] = int(float(cleaned_sales))
            except ValueError:
                meta["판매지수"] = 0
        else:
            meta["판매지수"] = 0

        ids.append(doc_id)
        documents.append(document_text)
        metadatas.append(meta)

    # 100개 청크 단위로 분할하여 실제 DB 파일에 기록
    chunk_size = 100
    for i in range(0, len(ids), chunk_size):
        collection.add(
            ids=ids[i:i+chunk_size],
            documents=documents[i:i+chunk_size],
            metadatas=metadatas[i:i+chunk_size]
        )
        print(f"파일 쓰기 진행 상황: {min(i + chunk_size, len(ids))} / {len(ids)} 완료")

    print(f"ChromaDB 파일 생성 완료! 저장 경로: {db_path}")
    return True


def query_books(
    query: str,
    csv_path: str = "data/yes24_bestsellers.csv",
    df: pd.DataFrame = None,
    db_path: str = "data/chroma_db",
    collection_name: str = "yes24_bestsellers",
    n_results: int = 15,
) -> str:
    """ChromaDB 로컬 데이터베이스 파일을 읽어 질의어와 코사인 거리가 가까운 상위 N개 도서를 획득해 포맷팅합니다.

    Args:
        query: 사용자 자연어 검색 질의.
        csv_path: 도서 CSV 파일 경로.
        df: 직접 전달된 도서 메타데이터 DataFrame. csv_path 대신 우선 사용 가능합니다.
        db_path: 로컬 DB 디렉토리 경로.
        collection_name: 사용할 컬렉션 명칭.
        n_results: 반환 결과 수.

    Returns:
        RAG 프롬프트 컨텍스트에 바로 공급할 수 있도록 요약 정렬된 도서 정보 마크다운 문자열.
    """
    try:
        embedding_fn = get_embedding_function_instance(csv_path=csv_path, df=df)
        if embedding_fn is None:
            return "임베딩 사전 초기화에 실패했습니다."

        client = chromadb.PersistentClient(path=db_path)
        collection = client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

        if collection.count() == 0:
            return "벡터 데이터베이스에 저장된 도서 파일 데이터가 없습니다."

        # 크로마 인덱스에서 코사인 거리 쿼리 실행
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )

        if not results or not results["metadatas"] or len(results["metadatas"][0]) == 0:
            return "질문과 관련된 도서를 찾을 수 없습니다."

        context_lines = []
        for metadata in results["metadatas"][0]:
            title = metadata.get("도서명", "제목 없음")
            rank = metadata.get("순위", "정보 없음")
            author = metadata.get("저자", "저자 미상")
            publisher = metadata.get("출판사", "출판사 미상")
            rating = metadata.get("평점", -1.0)
            price = metadata.get("판매가", 0)
            sales_index = metadata.get("판매지수", 0)
            link = metadata.get("상세링크", "")

            rating_str = f"{rating}점" if float(rating) != -1.0 else "평점 없음"
            price_str = f"{price:,}" if price > 0 else "가격 없음"
            sales_str = f"{sales_index:,}" if sales_index > 0 else "지수 없음"

            intro = metadata.get("책소개", "")
            if not intro:
                intro = "책소개 정보 없음"
            else:
                intro = str(intro).strip()
                intro = intro[:80] + "..." if len(intro) > 80 else intro

            line = (
                f"- [순위: {rank}위] {title} | 저자: {author} | 출판사: {publisher} "
                f"| 평점: {rating_str} | 판매가: {price_str}원 | 판매지수: {sales_str} "
                f"| 상세링크: {link if link.startswith('http') else '링크 없음'} | 요약소개: {intro}"
            )
            context_lines.append(line)

        return "\n".join(context_lines)

    except Exception as e:
        return f"ChromaDB 쿼리 수행 중 파일 조회 실패 오류: {e}"


def apply_numerical_filtering(
    df: pd.DataFrame,
    query: str,
) -> tuple[pd.DataFrame, str]:
    """자연어 질문에서 가격 및 판매지수 등의 수치 제한과 정렬 요구를 추출하여 데이터프레임을 필터링합니다.

    Args:
        df: 탐색 대상 도서 메타데이터가 담긴 pandas DataFrame.
        query: 사용자가 입력한 대화형 검색 질의 문자열.

    Returns:
        필터링 및 정렬 조건이 반영된 DataFrame과 적용된 수치 범위 규칙에 관한 요약 설명 텍스트의 튜플.
    """
    filtered_df = df.copy()
    filters_desc = []
    sort_by = None
    ascending = True

    # 1. 가격 극값(가장 비싼 / 가장 싼) 파싱
    if any(k in query for k in ["가장 비싼", "제일 비싼", "최고가", "최고 가격", "가장 가격이 높은"]):
        sort_by = "판매가"
        ascending = False
        filters_desc.append("정렬: 가격 높은 순")
    elif any(k in query for k in ["가장 싼", "제일 싼", "가장 저렴한", "제일 저렴한", "최저가", "최저 가격"]):
        sort_by = "판매가"
        ascending = True
        filters_desc.append("정렬: 가격 낮은 순")

    # 2. 판매지수 극값(가장 인기 / 많이 팔린) 파싱
    if any(k in query for k in ["가장 인기", "제일 인기", "최다 판매", "가장 많이 팔린", "가장 잘 파는", "최고 인기"]):
        sort_by = "판매지수"
        ascending = False
        filters_desc.append("정렬: 판매지수(인기) 높은 순")

    # 3. 가격 수치 범위 파싱 (예: 2만원 이하, 2만5천원 이하, 15000원 이상 등)
    # 한글 '만', '천' 결합 표현 및 일반 정수 표현 추출
    price_pattern = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:(?:만\s*(\d+(?:\.\d+)?)?\s*천?)|\s*만)?\s*원?\s*(이하|이상|미만|초과|대|정도의?)",
        query
    )
    if price_pattern:
        match_str = price_pattern.group(0)
        val_main = float(price_pattern.group(1))
        val_sub_str = price_pattern.group(2)
        direction = price_pattern.group(3)

        val = 0
        if "만" in match_str:
            val += val_main * 10000
            if val_sub_str:
                val += float(val_sub_str) * 1000
        else:
            val = val_main

        val = int(val)

        # 가격 데이터 타입 정제 후 연산
        filtered_df["판매가_정제"] = filtered_df["판매가"].apply(
            lambda x: int(str(x).replace(",", "")) if pd.notna(x) and str(x).strip() != "" else 0
        )

        if "이하" in direction or "미만" in direction:
            filtered_df = filtered_df[filtered_df["판매가_정제"] <= val]
            filters_desc.append(f"가격: {val:,}원 이하")
        elif "이상" in direction or "초과" in direction:
            filtered_df = filtered_df[filtered_df["판매가_정제"] >= val]
            filters_desc.append(f"가격: {val:,}원 이상")
        elif "대" in direction:
            range_start = (val // 10000) * 10000
            range_end = range_start + 10000
            filtered_df = filtered_df[
                (filtered_df["판매가_정제"] >= range_start) & (filtered_df["판매가_정제"] < range_end)
            ]
            filters_desc.append(f"가격: {range_start:,}원 이상 {range_end:,}원 미만")

    # 4. 판매지수 범위 파싱 (예: 판매지수 1만 이상, 지수 5000 이상)
    sales_pattern = re.search(
        r"(?:판매)?지수\s*(\d+(?:\.\d+)?)\s*(?:만)?\s*(이하|이상|미만|초과)",
        query
    )
    if sales_pattern:
        match_str = sales_pattern.group(0)
        val_str = sales_pattern.group(1)
        direction = sales_pattern.group(2)
        
        val = float(val_str)
        if "만" in match_str:
            val = int(val * 10000)
        else:
            val = int(val)

        # 판매지수 데이터 타입 정제 후 연산
        filtered_df["판매지수_정제"] = filtered_df["판매지수"].apply(
            lambda x: int(str(x).replace(",", "")) if pd.notna(x) and str(x).strip() != "" else 0
        )

        if "이하" in direction or "미만" in direction:
            filtered_df = filtered_df[filtered_df["판매지수_정제"] <= val]
            filters_desc.append(f"판매지수: {val:,} 이하")
        elif "이상" in direction or "초과" in direction:
            filtered_df = filtered_df[filtered_df["판매지수_정제"] >= val]
            filters_desc.append(f"판매지수: {val:,} 이상")

    # 5. 정렬 기준 및 최종 컬럼 반환
    if sort_by:
        # 정렬 대상 데이터 정제
        if sort_by == "판매가":
            filtered_df["판매가_정제"] = filtered_df["판매가"].apply(
                lambda x: int(str(x).replace(",", "")) if pd.notna(x) and str(x).strip() != "" else 0
            )
            filtered_df = filtered_df.sort_values(by="판매가_정제", ascending=ascending)
        elif sort_by == "판매지수":
            filtered_df["판매지수_정제"] = filtered_df["판매지수"].apply(
                lambda x: int(str(x).replace(",", "")) if pd.notna(x) and str(x).strip() != "" else 0
            )
            filtered_df = filtered_df.sort_values(by="판매지수_정제", ascending=ascending)
    else:
        # 범위 필터가 주어졌으나 정렬 조건이 명시 안된 경우, 기본 인기순(판매지수 내림차순) 정렬
        if filters_desc:
            filtered_df["판매지수_정제"] = filtered_df["판매지수"].apply(
                lambda x: int(str(x).replace(",", "")) if pd.notna(x) and str(x).strip() != "" else 0
            )
            filtered_df = filtered_df.sort_values(by="판매지수_정제", ascending=False)

    return filtered_df, ", ".join(filters_desc)


if __name__ == "__main__":
    # 스크립트 실행으로 실제 data/chroma_db 아래에 SQLite 물리 데이터베이스 생성 및 저장 처리
    print("Yes24 도서 ChromaDB 물리 파일 생성 및 적재를 시작합니다.")
    build_vector_db(force_rebuild=True)
    
    print("\n[ChromaDB 물리 인덱스 질의 조회 테스트]")
    test_q = "초보자를 위한 파이썬 프로그래밍 책 추천"
    context = query_books(query=test_q, n_results=3)
    print(f"질문: {test_q}")
    print(f"결과:\n{context}")
