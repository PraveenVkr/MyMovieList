# src/scripts/letterboxd.py
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup as BS
import sys
import time
import json
import redis
import hashlib
from getMovies import getMagnet
from webdriver_manager.chrome import ChromeDriverManager

# Connect to Redis
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def get_magnet_cache_key(movie_name):
    """Generate cache key for individual movie magnet link"""
    search_term = movie_name.strip().lower()
    return f"magnet:{hashlib.md5(search_term.encode()).hexdigest()}"

def get_cached_magnet(movie_name):
    """Check if movie magnet link is cached"""
    try:
        cache_key = get_magnet_cache_key(movie_name)
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            cached_data = json.loads(cached_result)
            return {
                'title': movie_name,
                'magnetLink': cached_data.get('magnet_link'),
                'found': bool(cached_data.get('magnet_link')),
                'status': 'cached'
            }
        return None
    except Exception as e:
        print(f"Error checking cache for {movie_name}: {e}", flush=True)
        return None

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

        # Extract all movie titles first
        movie_titles = []
        for movie in movie_elements[:20]:  # Limit to 20
            try:
                img = movie.find('img')
                if img:
                    title = img.get('alt', '').strip()
                    if title:
                        movie_titles.append(title)
            except Exception as e:
                continue

        print(f"Found {len(movie_titles)} movies to process", flush=True)

        # FIRST PASS: Check cache for all movies
        print("🔍 First pass: Checking cache for all movies...", flush=True)
        cached_movies = []
        uncached_movies = []
        
        for i, title in enumerate(movie_titles):
            print(f"Checking cache {i+1}/{len(movie_titles)}: {title}", flush=True)
            
            cached_result = get_cached_magnet(title)
            if cached_result:
                print(f"MOVIE_RESULT: {json.dumps(cached_result)}", flush=True)
                cached_movies.append(title)
            else:
                uncached_movies.append(title)

        print(f"✅ Cache check complete: {len(cached_movies)} cached, {len(uncached_movies)} need fetching", flush=True)

        # SECOND PASS: Fetch uncached movies online
        if uncached_movies:
            print(f"🌐 Second pass: Fetching {len(uncached_movies)} movies online...", flush=True)
            
            processed_count = 0
            start_time = time.time()
            
            for i, title in enumerate(uncached_movies):
                # Check total timeout (2 minutes = 120 seconds)
                if time.time() - start_time > 120:
                    print(f"Total timeout reached (2 minutes). Processed {processed_count} uncached movies.", flush=True)
                    break
                    
                try:
                    print(f"Processing movie {i+1}/{len(uncached_movies)}: {title}", flush=True)
                    
                    # Get magnet link (this will cache it automatically)
                    import io
                    import contextlib
                    
                    old_stdout = sys.stdout
                    sys.stdout = captured_output = io.StringIO()
                    
                    try:
                        getMagnet(title)
                        magnet_output = captured_output.getvalue()
                        
                        # Parse magnet link from output
                        magnet_link = None
                        if '→' in magnet_output and 'magnet:' in magnet_output:
                            magnet_link = magnet_output.split('→')[-1].strip()
                        
                        # Create movie result object
                        movie_result = {
                            'title': title,
                            'magnetLink': magnet_link,
                            'found': magnet_link is not None,
                            'status': 'fetched'
                        }
                        
                        # Output result
                        print(f"MOVIE_RESULT: {json.dumps(movie_result)}", flush=True)
                        processed_count += 1
                        
                    except Exception as magnet_error:
                        # Still output the movie even if error occurred
                        movie_result = {
                            'title': title,
                            'magnetLink': None,
                            'found': False,
                            'status': 'error',
                            'error': str(magnet_error)
                        }
                        print(f"MOVIE_RESULT: {json.dumps(movie_result)}", flush=True)
                        print(f"🔥 Error getting magnet for {title}: {magnet_error}", flush=True)
                        processed_count += 1
                        
                    finally:
                        sys.stdout = old_stdout
                        
                except Exception as e:
                    print(f"Error with movie {title}: {e}", flush=True)
                    continue

            print(f"Completed fetching {processed_count} uncached movies in {time.time() - start_time:.1f} seconds", flush=True)
        else:
            print("🎉 All movies were cached! No online fetching needed.", flush=True)

        total_processed = len(cached_movies) + len(uncached_movies)
        print(f"📊 Final summary: {total_processed} total movies processed", flush=True)

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
