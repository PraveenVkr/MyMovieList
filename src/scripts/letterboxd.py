# src/scripts/letterboxd.py
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup as BS
import sys
import time
import threading
from getMovies import getMagnet
from webdriver_manager.chrome import ChromeDriverManager

class TimeoutError(Exception):
    pass

def run_with_timeout(func, args, timeout_duration):
    """Run a function with a timeout using threading"""
    result = [None]
    exception = [None]
    
    def target():
        try:
            result[0] = func(*args)
        except Exception as e:
            exception[0] = e
    
    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()
    thread.join(timeout_duration)
    
    if thread.is_alive():
        # Thread is still running, timeout occurred
        raise TimeoutError(f"Operation timed out after {timeout_duration} seconds")
    
    if exception[0]:
        raise exception[0]
    
    return result[0]

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

        # Limit to first 20 movies
        limited_movies = movie_elements[:20]
        print(f"Found {len(movie_elements)} movies, processing first {len(limited_movies)}", flush=True)

        processed_count = 0
        start_time = time.time()
        
        for i, movie in enumerate(limited_movies):
            # Check total timeout (2 minutes = 120 seconds)
            if time.time() - start_time > 120:
                print(f"Total timeout reached (2 minutes). Processed {processed_count} movies.", flush=True)
                break
                
            try:
                title = movie.find('img')['alt']
                print(f"Processing movie {i+1}/{len(limited_movies)}: {title}", flush=True)
                
                try:
                    # Use threading-based timeout for cross-platform compatibility
                    run_with_timeout(getMagnet, (title,), 15)
                    processed_count += 1
                except TimeoutError:
                    print(f"⏰ Timeout for {title} (15s), moving to next movie", flush=True)
                except Exception as magnet_error:
                    print(f"🔥 Error getting magnet for {title}: {magnet_error}", flush=True)
                    
            except Exception as e:
                print(f"Error with movie entry {i+1}: {e}", flush=True)
                continue

        print(f"Completed processing {processed_count} movies in {time.time() - start_time:.1f} seconds", flush=True)

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
