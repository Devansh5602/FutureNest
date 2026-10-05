from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / 'index.html', *(ROOT / page / 'index.html' for page in ('about', 'services', 'refer', 'contact'))]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = []
        self.links = []
        self.references = []
        self.headings = 0
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        self.headings += tag == 'h1'
        for key in ('src', 'href'):
            if attrs.get(key):
                self.links.append(attrs[key])
        if attrs.get('srcset'):
            self.links.extend(candidate.strip().split()[0] for candidate in attrs['srcset'].split(','))
        for key in ('aria-controls', 'aria-labelledby', 'aria-describedby', 'for'):
            self.references.extend(attrs.get(key, '').split())


pages = {path: Page(path) for path in PAGES}
errors = []


def check_url(source, value):
    url = urlsplit(value)
    if url.scheme or url.netloc:
        return
    target = ((ROOT if url.path.startswith('/') else source.parent) / unquote(url.path).lstrip('/')).resolve() if url.path else source
    if target.is_dir():
        target /= 'index.html'
    if not target.is_file() or not target.stat().st_size:
        errors.append(f'{source.relative_to(ROOT)}: missing or empty target {value}')
    elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
        errors.append(f'{source.relative_to(ROOT)}: missing fragment {value}')


for path, page in pages.items():
    duplicates = [name for name, count in Counter(page.ids).items() if count > 1]
    if duplicates:
        errors.append(f'{path.relative_to(ROOT)}: duplicate IDs {duplicates}')
    if page.headings < 1:
        errors.append(f'{path.relative_to(ROOT)}: expected an h1, found {page.headings}')
    for reference in page.references:
        if reference not in page.ids:
            errors.append(f'{path.relative_to(ROOT)}: missing accessible reference {reference}')
    for link in page.links:
        check_url(path, link)

for path in (ROOT / 'css').rglob('*.css'):
    for value in re.findall(r'url\(\s*[\'"]?([^\'"\)]+)[\'"]?\s*\)', path.read_text()):
        check_url(path, value.strip())

if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print(f'Passed: {len(pages)} pages, local links, assets, fragments, unique IDs, and accessible references.')
