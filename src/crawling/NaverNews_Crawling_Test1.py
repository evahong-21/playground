import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import urllib.parse
import html
import time
import re
import json

def craw_naver_news(query):
    news_list = []
    
    # URL 수정: search.navercom -> search.naver.com
    encoded_query = urllib.parse.quote(query)
    url = f"https://search.naver.com/search.naver?where=news&query={encoded_query}"
    
    # User-Agent 헤더를 더 상세하게 설정
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    print(f"\n=====페이지 크롤링중....=====")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"응답 상태코드: {response.status_code}")

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 스크립트 태그에서 뉴스 데이터 찾기
            script_tags = soup.find_all('script')
            news_data = None
            
            for script in script_tags:
                if script.string and 'news_result' in script.string:
                    script_content = script.string
                    # JavaScript 객체에서 뉴스 데이터 추출
                    try:
                        # news_result 객체 찾기
                        start_idx = script_content.find('news_result')
                        if start_idx != -1:
                            # 중괄호 매칭으로 객체 추출
                            brace_count = 0
                            start_brace = script_content.find('{', start_idx)
                            if start_brace != -1:
                                for i, char in enumerate(script_content[start_brace:]):
                                    if char == '{':
                                        brace_count += 1
                                    elif char == '}':
                                        brace_count -= 1
                                        if brace_count == 0:
                                            json_str = script_content[start_brace:start_brace + i + 1]
                                            try:
                                                news_data = json.loads(json_str)
                                                break
                                            except:
                                                continue
                    except:
                        continue
                    
                    if news_data:
                        break
            
            # 대안: 정규식을 사용해서 뉴스 정보 추출
            if not news_data:
                print("JSON 파싱 실패, 정규식으로 뉴스 정보 추출 시도...")
                
                # 제목, 링크, 언론사, 날짜 정보를 정규식으로 추출
                title_pattern = r'"title":"([^"]+)"'
                link_pattern = r'"titleHref":"([^"]+)"'
                press_pattern = r'"title":"([^"]+)","titleHref":"https://media\.naver\.com'
                content_pattern = r'"content":"([^"]+)"'
                
                titles = re.findall(title_pattern, response.text)
                links = re.findall(link_pattern, response.text)
                contents = re.findall(content_pattern, response.text)
                
                # HTML 엔티티 디코딩
                import html
                
                news_count = 0
                for i in range(min(len(titles), len(links), 10)):  # 최대 10개
                    title = html.unescape(titles[i]) if i < len(titles) else "제목없음"
                    link = html.unescape(links[i]) if i < len(links) else ""
                    content = html.unescape(contents[i]) if i < len(contents) else "내용없음"
                    
                    # 뉴스 링크인지 확인 (광고나 다른 링크 제외)
                    if 'news.naver.com' in link or 'newsis.com' in link or 'yna.co.kr' in link:
                        news_count += 1
                        
                        # 언론사 정보 추출 (링크에서)
                        press = "언론사 정보 없음"
                        if 'newsis.com' in link:
                            press = "뉴시스"
                        elif 'yna.co.kr' in link:
                            press = "연합뉴스"
                        
                        news_data_item = {
                            'title': title,
                            'press': press,
                            'date': "시간 정보 없음",
                            'summary': content[:200] + "..." if len(content) > 200 else content,
                            'content': content,
                            'link': link
                        }
                        news_list.append(news_data_item)

                        print(f"\n{news_count}번 기사")
                        print(f"제목 : {title}")
                        print(f"언론사 : {press}")
                        print(f"요약 : {content[:100]}...")
                        print(f"내용 : {content}...")
                        print(f"링크 : {link}")
                        print("-" * 50)
                        
                        if news_count >= 10:  # 최대 10개만
                            break
            
            # 추가 시도: BeautifulSoup으로 기본 뉴스 아이템 찾기
            if not news_list:
                print("정규식 추출도 실패, BeautifulSoup으로 기본 검색 시도...")
                
                # 다양한 선택자 시도
                possible_selectors = [
                    'div.group_news ul.list_news li',
                    'div.news_wrap',
                    'li.bx',
                    'div.total_wrap div.news_area',
                    'div.api_subject_bx div.news_wrap'
                ]
                
                for selector in possible_selectors:
                    items = soup.select(selector)
                    if items:
                        print(f"선택자 '{selector}'로 {len(items)}개 아이템 발견")
                        
                        for idx, item in enumerate(items[:5], 1):  # 최대 5개만
                            try:
                                # 링크가 있는 a 태그 찾기
                                link_tag = item.find('a', href=True)
                                if link_tag and link_tag.get('href'):
                                    title = link_tag.get_text(strip=True)
                                    link = link_tag.get('href')
                                    
                                     # 내용 추출 시도
                                    content_elem = item.find(class_=['dsc_txt_wrap', 'news_dsc', 'dsc', 'content'])
                                    content = content_elem.get_text(strip=True) if content_elem else "내용 추출 불가"
                                    
                                    if title and 'http' in link:
                                        news_data_item = {
                                            'title': title,
                                            'press': "언론사 정보 없음",
                                            'date': "시간 정보 없음",
                                            'summary': content[:200] + "..." if len(content) > 200 else content,
                                            'content': content,
                                            'link': link
                                        }
                                        news_list.append(news_data_item)
                                        
                                        print(f"\n{len(news_list)}번 기사")
                                        print(f"제목 : {title}")
                                        print(f"내용 : {content}")
                                        print(f"링크 : {link}")
                                        print("-" * 50)
                            except Exception as e:
                                print(f"아이템 처리 중 오류: {e}")
                                continue
                        
                        if news_list:
                            break
            
            # 마지막 시도: 모든 a 태그에서 뉴스 링크 찾기
            if not news_list:
                print("모든 a 태그에서 뉴스 링크 검색...")
                all_links = soup.find_all('a', href=True)
                news_count = 0
                
                for link_tag in all_links:
                    href = link_tag.get('href', '')
                    text = link_tag.get_text(strip=True)
                    
                    # 뉴스 링크 패턴 확인
                    if re.match(r'https://(n\.)?news\.naver\.com/article/\d+/', href) \
                        or 'newsis.com' in href \
                        or 'yna.co.kr' in href:
                        news_count += 1
                        
                        press = "언론사 정보 없음"
                        if 'newsis.com' in href:
                            press = "뉴시스"
                        elif 'yna.co.kr' in href or 'yonhapnews.co.kr' in href:
                            press = "연합뉴스"
                        
                        # 부모 요소에서 내용 추출 시도
                        parent = link_tag.parent
                        content = "내용 추출 불가"
                        if parent:
                            content_candidates = parent.find_all(string=True)
                            content_text = ' '.join([t.strip() for t in content_candidates if t.strip() and t.strip() != text])
                            if content_text:
                                #content = content_text[:300] + "..." if len(content_text) > 300 else content_text
                                content = content_text
                        
                        print(f"\n{news_count}번 기사 링크 접근 중: {href}")
                        content = get_full_article_content(href, headers)
                        time.sleep(1.0)


                        news_data_item = {
                            'title': text,
                            'press': press,
                            'date': "시간 정보 없음",
                            'summary': content[:200] + "..." if len(content) > 200 else content,
                            'content': content,
                            'link': href
                        }
                        news_list.append(news_data_item)
                        
                        print(f"\n{news_count}번 기사")
                        print(f"제목 : {text}")
                        print(f"언론사 : {press}")
                        print(f"내용 : {content}")
                        print(f"링크 : {href}")
                        print("-" * 50)
                        
                        if news_count >= 10:
                            break
            
            return news_list
            
        else:
            print(f"페이지 요청 실패 : {response.status_code}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"네트워크 오류 발생: {e}")
        return []
    except Exception as e:
        print(f"예상치 못한 오류 발생: {e}")
        return []


def get_full_article_content(link, headers):
    try:
        resp = requests.get(link, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            return f"본문 요청 실패: 상태 코드 {resp.status_code}"
        
        article_soup = BeautifulSoup(resp.text, 'html.parser')
        domain = urllib.parse.urlparse(link).netloc
        
        # 1. 연합뉴스
        if 'yna.co.kr' in domain or 'yonhapnews.co.kr' in domain:
            script_tag = article_soup.find("script", {"id": "contentJsonData"})
            if script_tag and script_tag.string:
                try:
                    json_text = script_tag.string
                    json_start = json_text.find("JSON.stringify(")
                    if json_start != -1:
                        json_start += len("JSON.stringify(")
                        json_end = json_text.find(");", json_start)
                        json_str = json_text[json_start:json_end].strip()
                        json_data = json.loads(json_str)
                        body = html.unescape(json_data.get("BODY", "")).strip()
                        return body if body else "본문 없음 (스크립트 BODY 비어있음)"
                except Exception as e:
                    return f"본문 추출 실패 (스크립트 JSON 파싱 오류): {str(e)}"

        # 2. 뉴시스
        elif 'newsis.com' in domain:
            content_article = article_soup.find('article')
            if content_article:
                for br in content_article.find_all('br'):
                    br.replace_with('\n')
                return content_article.get_text(separator='\n', strip=True)
            return "본문 추출 실패: 뉴시스에서 <article> 태그 없음"


        # 3. 네이버 뉴스
        elif 'news.naver.com' in domain:
            content_div = article_soup.select_one('div#dic_area')
            if content_div:
                return content_div.get_text(separator='\n', strip=True)
            return "본문 추출 실패: 네이버 뉴스에서 div#dic_area 없음"

        # 4. 기타 도메인: fallback selector
        else:
            selectors = [
                'div#dic_area', 'div.article_txt', 'div#articeBody',
                'div.news_end_body', 'div#article-view-content-div',
                'div.news_view', 'div.article-body'
            ]
            for sel in selectors:
                content_div = article_soup.select_one(sel)
                if content_div and content_div.get_text(strip=True):
                    return content_div.get_text(separator='\n', strip=True)

        return "본문 추출 실패: 지원되지 않는 도메인 또는 구조 불일치"
    
    except Exception as e:
        return f"본문 요청 예외: {str(e)}"


 

def save_to_csv(news_list, filename=None):
    if not news_list:
        print("저장할 데이터가 없습니다.")
        return
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"naver_news_{timestamp}.csv"
    df = pd.DataFrame(news_list)
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    print(f"데이터가 {filename}에 저장되었습니다.")

if __name__ == "__main__":
    query = '이재명 정책'
    print(f"검색어: {query}")
    result = craw_naver_news(query)
    if result:
        print(f"\n총 {len(result)}개의 뉴스를 수집했습니다.")

        save_to_csv(result)
    else:
        print("수집된 뉴스가 없습니다.")
