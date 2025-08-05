import re
from urllib.parse import urlparse, unquote

def is_valid_csv_url(url: str) -> bool:
    """Check if the URL is valid and points to a potential CSV file."""
    try:
        parsed = urlparse(url)
        return all([parsed.scheme, parsed.netloc]) and (
            url.endswith('.csv') or 
            'github.com' in parsed.netloc or
            'raw.githubusercontent.com' in parsed.netloc
        )
    except Exception:
        return False

def convert_github_url_to_raw(url: str) -> str:
    """Convert GitHub blob URL to raw content URL."""
    if 'github.com' in url and '/blob/' in url:
        # Convert URL to raw format
        url = url.replace('github.com', 'raw.githubusercontent.com')
        url = url.replace('/blob/', '/')
    return url

def extract_csv_filename(url: str) -> str:
    """Extract filename from URL, fallback to default if not found."""
    try:
        path = unquote(urlparse(url).path)
        match = re.search(r'[^/]+\.csv$', path)
        if match:
            return match.group(0)
    except Exception:
        pass
    return 'downloaded_data.csv'
