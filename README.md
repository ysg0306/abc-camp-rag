# ABC-RAG (Yes24 베스트셀러 분석 시스템)

예스24 베스트셀러 데이터를 수집하고, 벡터 데이터베이스에 저장하여 RAG(Retrieval-Augmented Generation) 기반 도서 분석 시스템을 구축하는 프로젝트입니다.

## 주요 기능

### 1. Yes24 베스트셀러 크롤러
- 예스24 베스트셀러 목록 자동 수집
- 도서 상세 정보 추출 (제목, 저자, 가격, 평점, 리뷰 등)
- CSV 형식으로 데이터 저장

### 2. 벡터 데이터베이스 (ChromaDB)
- 수집된 도서 정보를 벡터로 변환
- 의미 기반 검색 지원
- RAG 파이프라인 구축

### 3. 웹 애플리케이션 (Flask)
- 직관적인 사용자 인터페이스
- 도서 검색 및 분석 기능
- 실시간 데이터 조회

### 4. 대시보드 생성
- **Excel 대시보드**: 도서 통계 및 시각화
- **PowerPoint 보고서**: 프레젠테이션용 자동 보고서 생성

## 프로젝트 구조

```
ABC-RAG/
├── src/
│   ├── app.py                    # Flask 웹 애플리케이션
│   ├── yes24_crawler.py          # Yes24 크롤러
│   ├── vector_db.py              # 벡터 데이터베이스 관리
│   ├── create_excel_dashboard.py # Excel 대시보드 생성
│   └── create_pptx.js            # PowerPoint 생성
├── data/
│   └── yes24_bestsellers.csv     # 수집된 베스트셀러 데이터
├── requirements.txt              # Python 의존성
├── package.json                  # Node.js 의존성
└── .gitignore                    # Git 제외 규칙
```

## 설치 및 실행

### 사전 요구사항
- Python 3.8+
- Node.js 14+
- pip, npm

### 설치

```bash
# Python 의존성 설치
pip install -r requirements.txt

# Node.js 의존성 설치
npm install
```

### 실행

```bash
# 웹 애플리케이션 실행
python src/app.py

# 크롤러 실행
python src/yes24_crawler.py

# Excel 대시보드 생성
python src/create_excel_dashboard.py

# PowerPoint 생성
node src/create_pptx.js
```

## 데이터 수집

크롤러는 예스24 베스트셀러 페이지에서 다음 정보를 수집합니다:

| 항목 | 설명 |
|------|------|
| 제목 | 도서 제목 |
| 저자 | 저자 이름 |
| 출판사 | 출판사 정보 |
| 가격 | 판매 가격 |
| 평점 | 사용자 평점 |
| 리뷰 수 | 리뷰 개수 |
| 카테고리 | 도서 분류 |

수집된 데이터는 `data/yes24_bestsellers.csv`에 저장됩니다.

## 대시보드

### Excel 대시보드
- 도서별 판매량 비교 차트
- 카테고리별 분포 분석
- 가격대별 도서 분포
- 평점 분포 분석

### PowerPoint 보고서
- 자동 보고서 생성
- 주요 통계 요약
- 차트 및 그래프 삽입

## 기술 스택

- **Backend**: Python, Flask
- **Database**: ChromaDB (벡터 데이터베이스)
- **Frontend**: HTML, CSS, JavaScript
- **데이터 처리**: Pandas, NumPy
- **크롤링**: BeautifulSoup, Requests
- **Office 생성**: openpyxl (Excel), pptxgenjs (PowerPoint)

## 라이선스

이 프로젝트는 학습 및 연구 목적으로 제작되었습니다.
