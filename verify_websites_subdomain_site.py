#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / 'docs'
SITE = 'https://websites.lucakosowski.com'
OLD = 'https://lucakosowski.com/website-development'
errors = []

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.og_urls = []
        self.scripts = []
        self.in_jsonld = False
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'link' and d.get('rel') == 'canonical': self.canonicals.append(d.get('href', ''))
        if tag == 'meta' and d.get('property') == 'og:url': self.og_urls.append(d.get('content', ''))
        if tag == 'script' and d.get('type') == 'application/ld+json': self.in_jsonld = True
    def handle_endtag(self, tag):
        if tag == 'script': self.in_jsonld = False
    def handle_data(self, data):
        if self.in_jsonld: self.scripts.append(data)

def fail(msg): errors.append(msg)
def read(p): return p.read_text(encoding='utf-8', errors='ignore')
def html_files(): return sorted(DOCS.glob('**/*.html')) if DOCS.exists() else []

def check_required():
    if not DOCS.exists(): fail('docs output missing; run npm run build first')
    required = ['index.html','CNAME','robots.txt','llms.txt','llms-full.txt','machine-answer-index.json','sitemap-index.xml']
    for rel in required:
        if not (DOCS / rel).exists(): fail(f'missing docs/{rel}')
    if (DOCS / 'CNAME').exists() and read(DOCS / 'CNAME').strip() != 'websites.lucakosowski.com':
        fail('CNAME must be exactly websites.lucakosowski.com')

def jsonld_objects(raw):
    try:
        data = json.loads(raw)
    except Exception as exc:
        return None, exc
    out = []
    stack = [data]
    while stack:
        item = stack.pop()
        if isinstance(item, dict):
            out.append(item)
            graph = item.get('@graph')
            if isinstance(graph, list): stack.extend(graph)
        elif isinstance(item, list):
            stack.extend(item)
    return out, None

def is_google_site_verification_file(rel, html):
    return re.fullmatch(r'google[a-f0-9]+\.html', rel.name or '') and html.strip().startswith('google-site-verification:')

def check_html():
    seen = set()
    service_schema_seen = False
    for p in html_files():
        html = read(p)
        rel = p.relative_to(DOCS)
        if is_google_site_verification_file(rel, html):
            continue
        if OLD in html or '/website-development/assets/' in html:
            fail(f'{rel}: stale root service URL or asset path')
        parser = HeadParser(); parser.feed(html)
        if len(parser.canonicals) != 1:
            fail(f'{rel}: expected exactly one canonical')
        else:
            c = parser.canonicals[0]
            if not c.startswith(SITE + '/'):
                fail(f'{rel}: non-subdomain canonical {c}')
            if c in seen:
                fail(f'duplicate canonical {c}')
            seen.add(c)
        for u in parser.og_urls:
            if not u.startswith(SITE + '/'):
                fail(f'{rel}: bad og:url {u}')
        for script in parser.scripts:
            objects, exc = jsonld_objects(script)
            if exc:
                fail(f'{rel}: JSON-LD parse failed {exc}')
                continue
            for obj in objects or []:
                if obj.get('@type') == 'Service':
                    if obj.get('url') != f'{SITE}/': fail(f'{rel}: Service schema URL mismatch {obj.get("url")}')
                    if obj.get('@id') != f'{SITE}/#service': fail(f'{rel}: Service schema @id mismatch {obj.get("@id")}')
                    service_schema_seen = True
        if '/demos/' in str(rel):
            text = re.sub(r'<[^>]+>', ' ', html).lower()
            if 'fictional' not in text and 'demo' not in text:
                fail(f'{rel}: fictional demo page missing visible fictional/demo disclosure')
    if not service_schema_seen:
        fail('no valid Service JSON-LD schema found')

def check_sitemap():
    for p in [DOCS / 'sitemap-index.xml', *DOCS.glob('sitemap-*.xml'), DOCS / 'sitemap.xml']:
        if not p.exists(): continue
        txt = read(p)
        locs = re.findall(r'<loc>(.*?)</loc>', txt, re.I | re.S)
        for loc in locs:
            if loc.endswith('.xml'):
                if not loc.startswith(SITE + '/'):
                    fail(f'{p.name}: sitemap file URL outside service domain {loc}')
            elif not loc.startswith(SITE + '/'):
                fail(f'{p.name}: sitemap page URL outside service domain {loc}')
            if '/answers/' in loc:
                fail(f'{p.name}: hidden answer URL leaked into human sitemap {loc}')

def check_machine_index():
    p = DOCS / 'machine-answer-index.json'
    if not p.exists(): return
    try:
        data = json.loads(read(p))
    except Exception as exc:
        fail(f'machine-answer-index invalid JSON: {exc}')
        return
    if data.get('site') != SITE: fail('machine-answer-index site mismatch')
    clusters = data.get('clusters', [])
    if not clusters: fail('machine-answer-index has no service clusters')
    for c in clusters:
        if c.get('family') != 'service': fail(f"non-service cluster leaked: {c.get('id')}")
        if not c.get('canonicalUrl', '').startswith(SITE + '/answers/'):
            fail(f"bad answer canonical: {c.get('canonicalUrl')}")

def check_robots_llms():
    robots = read(DOCS / 'robots.txt') if (DOCS / 'robots.txt').exists() else ''
    if f'Sitemap: {SITE}/sitemap-index.xml' not in robots: fail('robots sitemap mismatch')
    machine = None
    if (DOCS / 'machine-answer-index.json').exists():
        try: machine = json.loads(read(DOCS / 'machine-answer-index.json'))
        except Exception: machine = None
    for rel in ['llms.txt','llms-full.txt']:
        p = DOCS / rel
        if p.exists():
            txt = read(p)
            if SITE not in txt: fail(f'{rel} missing subdomain')
            if OLD in txt: fail(f'{rel} contains old root service URL')
    if machine and (DOCS / 'llms-full.txt').exists():
        txt = read(DOCS / 'llms-full.txt')
        for c in machine.get('clusters', []):
            url = c.get('canonicalUrl')
            if url and url not in txt:
                fail(f'llms-full.txt missing answer URL {url}')

check_required(); check_html(); check_sitemap(); check_machine_index(); check_robots_llms()
if errors:
    print('FAIL')
    print('\n'.join(errors))
    sys.exit(1)
print('PASS websites subdomain static SEO/AEO checks')
