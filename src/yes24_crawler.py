"""Yes24 베스트셀러 카테고리 도서 목록 및 책소개 수집기.

이 모듈은 Scrapling 라이브러리를 사용하여 Yes24 베스트셀러 목록에서 도서 정보를 수집하고,
각 도서의 상세 페이지를 방문하여 '책소개' 텍스트를 추가적으로 크롤링합니다.
최종 수집 결과는 'data/yes24_bestsellers.csv' 파일로 저장됩니다.
"""

import re
import time
import random
from typing import List, Dict, Optional, Any
import pandas as pd
from scrapling.fetchers import Fetcher

# 대상 URL 및 기본 카테고리 설정
BASE_URL = "https://www.yes24.com/product/category/bestseller"
CATEGORY_NUMBER = "001001003"
PAGE_SIZE = 24
CSV_PATH = "data/yes24_bestsellers.csv"
DETAIL_LIMIT = 150  # 상세 책소개를 수집할 상위 도서의 수 (시간 단축 및 차단 방지 목적)


def extract_max_page(response: Any) -> int:
    """첫 페이지 응답 객체로부터 마지막 페이지 번호를 추출합니다.

    Args:
        response: Scrapling Fetcher의 Response 객체.

    Returns:
        추출된 마지막 페이지 번호 (실패 시 기본값 40).
    """
    max_page = 1
    pagen_divs = response.css(".yesUI_pagen")
    for div in pagen_divs:
        for a in div.css("a"):
            onclick = a.attrib.get("onclick", "")
            match = re.search(r"changeBestSellerParam\(this,\s*(\d+)\)", onclick)
            if match:
                page_num = int(match.group(1))
                if page_num > max_page:
                    max_page = page_num
    
    if max_page == 1:
        print("페이지네이션 분석 실패. 기본값인 40페이지까지 수집을 시도합니다.")
        return 40
        
    return max_page


def fetch_book_introduction(detail_url: str) -> Optional[str]:
    """도서 상세 페이지에서 책소개 본문을 크롤링하고 HTML 태그를 제거하여 반환합니다.

    Args:
        detail_url: 도서 상세 페이지 URL.

    Returns:
        정제된 책소개 텍스트. 실패 시 None.
    """
    if not detail_url:
        return None
    try:
        response = Fetcher.get(detail_url, impersonate="chrome")
        if response.status != 200:
            return None
        
        # #infoset_introduce textarea.txtContentText 엘리먼트 내부에 원본 텍스트 존재
        intro_area = response.css("#infoset_introduce textarea.txtContentText::text").get()
        if intro_area:
            # HTML 태그 제거
            cleaned = re.sub(r'<[^>]*>', ' ', intro_area)
            # 연속된 공백 및 줄바꿈 문자를 하나의 공백으로 축소
            cleaned = re.sub(r'\s+', ' ', cleaned).strip()
            return cleaned
            
    except Exception as e:
        print(f"상세페이지 수집 중 오류 ({detail_url}): {e}")
    return None


def parse_book_item(item: Any) -> Dict[str, Optional[str]]:
    """도서 목록의 단일 항목(li 엘리먼트)에서 상세 도서 정보를 파싱합니다.

    Args:
        item: Scrapling Selector로 선택된 단일 도서 li 엘리먼트.

    Returns:
        도서명, 저자, 출판사, 가격 등의 정보가 담긴 딕셔너리.
    """
    # 1. 순위
    rank_val = item.css("em.ico.rank::text").get()
    rank = rank_val.strip() if rank_val else None

    # 2. 도서명
    title_el = item.css("a.gd_name")
    title = None
    if title_el:
        title_text = title_el[0].css("::text").get()
        title = title_text.strip() if title_text else None

    # 3. 상세 링크
    link = None
    if title_el:
        href = title_el[0].attrib.get("href", "")
        if href:
            link = f"https://www.yes24.com{href}"

    # 4. 저자, 출판사, 출판일
    authors = None
    publisher = None
    pub_date = None
    pub_grp = item.css("div.info_pubGrp")
    if pub_grp:
        auth_list = pub_grp[0].css("span.info_auth a::text").getall()
        authors = ", ".join([a.strip() for a in auth_list if a.strip()])
        
        pub_val = pub_grp[0].css("span.info_pub a::text").get()
        publisher = pub_val.strip() if pub_val else None
        
        date_val = pub_grp[0].css("span.info_date::text").get()
        pub_date = date_val.strip() if date_val else None

    # 5. 판매가 & 정가
    sale_price = None
    original_price = None
    price_info = item.css("div.info_row.info_price")
    if price_info:
        sale_val = price_info[0].css("strong.txt_num em::text").get()
        sale_price = sale_val.strip() if sale_val else None
        
        orig_val = price_info[0].css("span.txt_num.dash em::text").get()
        original_price = orig_val.strip() if orig_val else None

    # 6. 판매지수, 평점 & 리뷰 수
    sales_index = None
    rating = None
    review_count = None
    
    sales_val = item.css("span.saleNum::text").get()
    if sales_val:
        match = re.search(r"[\d,]+", sales_val)
        sales_index = match.group(0) if match else sales_val.strip()

    rate_val = item.css("span.rating_grade em.yes_b::text").get()
    rating = rate_val.strip() if rate_val else None
    
    rev_val = item.css("span.rating_rvCount em.txC_blue::text").get()
    review_count = rev_val.strip() if rev_val else None

    return {
        "순위": rank,
        "도서명": title,
        "상세링크": link,
        "저자": authors,
        "출판사": publisher,
        "출판일": pub_date,
        "판매가": sale_price,
        "정가": original_price,
        "판매지수": sales_index,
        "평점": rating,
        "리뷰수": review_count
    }


def crawl_yes24_bestsellers() -> None:
    """Yes24 베스트셀러 카테고리 전체 페이지를 순회하며 데이터를 수집하고 CSV로 저장합니다."""
    print("Yes24 베스트셀러 데이터 수집을 시작합니다...")
    
    # 1페이지를 먼저 요청하여 전체 페이지 수를 파악합니다.
    first_url = f"{BASE_URL}?categoryNumber={CATEGORY_NUMBER}&pageNumber=1&pageSize={PAGE_SIZE}"
    print(f"1페이지 요청 중: {first_url}")
    
    response = Fetcher.get(first_url, impersonate="chrome")
    if response.status != 200:
        print(f"첫 페이지 요청 실패 (HTTP 상태 코드: {response.status}). 수집을 중단합니다.")
        return
        
    max_page = extract_max_page(response)
    print(f"감지된 전체 페이지 수: {max_page} 페이지")
    
    all_books: List[Dict[str, Any]] = []
    
    # 1페이지 데이터 파싱
    items = response.css("#yesBestList > li")
    print(f"1페이지에서 {len(items)}개의 도서가 발견되었습니다.")
    for item in items:
        all_books.append(parse_book_item(item))
        
    # 2페이지부터 마지막 페이지까지 순회 수집
    for page in range(2, max_page + 1):
        delay = random.uniform(1.2, 2.5)
        time.sleep(delay)
        
        target_url = f"{BASE_URL}?categoryNumber={CATEGORY_NUMBER}&pageNumber={page}&pageSize={PAGE_SIZE}"
        print(f"[{page}/{max_page}] 목록 수집 중...")
        
        try:
            res = Fetcher.get(target_url, impersonate="chrome")
            if res.status != 200:
                continue
                
            page_items = res.css("#yesBestList > li")
            if not page_items:
                break
                
            for item in page_items:
                all_books.append(parse_book_item(item))
                
        except Exception as e:
            print(f"[{page}페이지] 목록 수집 중 오류 발생: {e}")
            continue

    print(f"목록 수집 완료! 총 {len(all_books)}개의 도서 목록을 확보했습니다.")
    
    # 2차: 상위 DETAIL_LIMIT 권의 도서에 대해 책소개를 추가 수집합니다.
    print(f"\n상위 {DETAIL_LIMIT}개 도서의 상세 책소개 수집을 시작합니다. (요청 간 랜덤 대기 적용)")
    for idx, book in enumerate(all_books):
        if idx >= DETAIL_LIMIT:
            break
            
        link = book.get("상세링크")
        if link:
            # 대기 시간 추가로 봇 차단 예방
            time.sleep(random.uniform(1.0, 2.0))
            print(f"[{idx+1}/{DETAIL_LIMIT}] 책소개 수집 중...")
            intro = fetch_book_introduction(link)
            book["책소개"] = intro
        else:
            book["책소개"] = None

    # 수집되지 않은 도서는 책소개 값을 None으로 채움
    for book in all_books[DETAIL_LIMIT:]:
        book["책소개"] = None

    # pandas를 활용한 데이터 정리 및 CSV 저장
    if all_books:
        df = pd.DataFrame(all_books)
        # 한글 깨짐 방지를 위해 utf-8-sig 인코딩 적용
        df.to_csv(CSV_PATH, index=False, encoding="utf-8-sig")
        print(f"\n전체 데이터 수집 완료! 총 {len(df)}개의 도서 정보를 '{CSV_PATH}' 파일에 저장했습니다.")
    else:
        print("수집된 도서 정보가 존재하지 않습니다.")


if __name__ == "__main__":
    crawl_yes24_bestsellers()
