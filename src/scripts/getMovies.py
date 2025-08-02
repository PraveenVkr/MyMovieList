# src/scripts/getMovies.py
from bs4 import BeautifulSoup as BS
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import urllib.parse
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

def getMagnet(movieName, quality=''):
    try:
        encoded_query = urllib.parse.quote(movieName + ' ' + quality)
        search_url = f'https://thepiratebay.org/search/{encoded_query}/0/99/0'

        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
        # Set page load timeout
        driver.set_page_load_timeout(10)
        
        driver.get(search_url)
        html = driver.page_source
        driver.quit()

        soup = BS(html, 'html.parser')
        magnet = soup.find('a', href=lambda h: h and h.startswith('magnet:'))

        if magnet:
            print(f"{movieName} → {magnet['href']}", flush=True)
        else:
            print(f"❌ No magnet found for: {movieName}", flush=True)

    except Exception as e:
        print(f"🔥 Error for {movieName}: {e}", flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python getMovies.py <movie-name>")
        sys.exit(1)
    else:
        movie_name = sys.argv[1]
        getMagnet(movie_name)
