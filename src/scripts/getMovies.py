# src/scripts/getMovies.py
from bs4 import BeautifulSoup as BS
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import urllib.parse
import sys
import redis
import json
import hashlib

sys.stdout.reconfigure(encoding='utf-8')

# Connect to Redis
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def get_cache_key(movie_name, quality=''):
    """Generate a unique cache key for the movie"""
    search_term = f"{movie_name} {quality}".strip().lower()
    return f"magnet:{hashlib.md5(search_term.encode()).hexdigest()}"

def getMagnet(movieName, quality=''):
    try:
        # Check cache first
        cache_key = get_cache_key(movieName, quality)
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            cached_data = json.loads(cached_result)
            if cached_data['magnet_link']:
                print(f"{movieName} → {cached_data['magnet_link']} (cached)")
            else:
                print(f"❌ No magnet found for: {movieName} (cached)")
            return
        
        # If not in cache, scrape
        encoded_query = urllib.parse.quote(movieName + ' ' + quality)
        search_url = f'https://thepiratebay.org/search/{encoded_query}/0/99/0'

        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        driver.set_page_load_timeout(10)
        
        driver.get(search_url)
        html = driver.page_source
        driver.quit()

        soup = BS(html, 'html.parser')
        magnet = soup.find('a', href=lambda h: h and h.startswith('magnet:'))

        # Cache the result (even if no magnet found)
        cache_data = {
            'movie_name': movieName,
            'magnet_link': magnet['href'] if magnet else None,
            'search_url': search_url
        }
        
        # Cache for 24 hours (86400 seconds)
        redis_client.setex(cache_key, 86400, json.dumps(cache_data))

        if magnet:
            print(f"{movieName} → {magnet['href']}")
        else:
            print(f"❌ No magnet found for: {movieName}")

    except Exception as e:
        print(f"🔥 Error for {movieName}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python getMovies.py <movie-name>")
        sys.exit(1)
    else:
        movie_name = sys.argv[1]
        getMagnet(movie_name)
