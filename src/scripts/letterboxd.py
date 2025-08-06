# src/scripts/letterboxd.py - Simple movie name extraction
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup as BS
import sys
import time
import json
from webdriver_manager.chrome import ChromeDriverManager

def letterboxdList(url):
    try:
        print(f"Processing Letterboxd list: {url}", flush=True)
        
        # Set headless Chrome
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        driver.get(url)
        time.sleep(3)  # Wait for page to load
        html = driver.page_source
        driver.quit()

        page = BS(html, 'html.parser')
        movie_elements = page.find_all('li', {'class': 'poster-container'})

        if not movie_elements:
            print("No movie posters found.", flush=True)
            return

        # Extract all movie titles
        movie_titles = []
        for i, movie in enumerate(movie_elements[:20]):  # Limit to 20
            try:
                img = movie.find('img')
                if img:
                    title = img.get('alt', '').strip()
                    if title:
                        movie_titles.append(title)
                        print(f"MOVIE_NAME: {json.dumps({'title': title, 'index': i})}", flush=True)
            except Exception as e:
                continue

        print(f"Found {len(movie_titles)} movies total", flush=True)

    except Exception as e:
        print(f"Error processing Letterboxd list: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python letterboxd.py <list-URL>")
        sys.exit(1)
    else:
        letterboxdList(sys.argv[1])
