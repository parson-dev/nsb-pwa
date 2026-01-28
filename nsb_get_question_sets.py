import os
import sys
import argparse

import requests

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def main():
    parser = argparse.ArgumentParser(
        description="""\
Script to download sample questions used at the regional National Science Bowl competitions.

Sample sets are available in PDF format, for the following school level:

    (MS) from https://science.osti.gov/wdts/nsb/Regional-Competitions/Resources/MS-Sample-Questions
    (HS) from https://science.osti.gov/wdts/nsb/Regional-Competitions/Resources/HS-Sample-Questions
""",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '-l', '--level',
        choices=['MS', 'HS'],
        required=True,
        help='choose the school level: "MS" for Middle School or "HS" for High School'
    )
    args = parser.parse_args()
    # Map level to a specific URL segment
    page_url = "https://science.osti.gov/wdts/nsb/Regional-Competitions/Resources/{level}-Sample-Questions".format(level=args.level)
    # Map level to a specific <a href />
    target_a = "/-/media/wdts/nsb/pdf/{level}-Sample-Questions/".format(level=args.level)

    a = []
    try:
        page_response = requests.get(page_url, headers=HEADERS)
        page_response.raise_for_status()
        soup = BeautifulSoup(page_response.text, "html.parser")
        a = soup.find_all("a", href=True)
    except Exception as e:
        print(f"Failed to open {page_url}: {e}")
        sys.exit(1)

    for link in a:
        href = link["href"]
        if not (href.lower().endswith(".pdf") and href.startswith(target_a)):
            continue

        file_url = urljoin(page_url, href)
        output_d = os.path.join(os.path.curdir, args.level, os.path.basename(os.path.dirname(file_url)))
        output_f = os.path.join(output_d, os.path.basename(file_url))
        print(f"Downloading {file_url} to {output_f}")

        try:
            file_response = requests.get(file_url, headers=HEADERS)
            file_response.raise_for_status()
            os.makedirs(output_d, exist_ok=True)
            with open(output_f, "wb") as f:
                f.write(file_response.content)
        except Exception as e:
            print(f"Failed to download {file_url}: {e}")
            # skip file...

    print("\nFinished!")

if __name__ == "__main__":
    main()
