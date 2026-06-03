#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / 'docs'
SITE = 'https://websites.lucakosowski.com'
OLD = 'https://lucakosowski.com/website-development'
PERSON_ID = 'https://lucakosowski.com/#person'
EXPECTED_PERSON_SAME_AS = ['https://lucakosowski.com/']
GOATCOUNTER_ENDPOINT = 'https://websites.goatcounter.com/count'
GOATCOUNTER_SRC = '//gc.zgo.at/count.js'
CONTACT_TRACKING = {
    'approach/index.html': [
        ('mailto:hello@lucakosowski.com', 'contact-email-approach', 'Contact email click — approach'),
        ('https://www.linkedin.com/in/luca-kosowski/', 'contact-linkedin-approach', 'Contact LinkedIn click — approach'),
    ],
    'contact/index.html': [
        ('mailto:hello@lucakosowski.com', 'contact-email-service-contact', 'Contact email click — service contact'),
        ('https://www.linkedin.com/in/luca-kosowski/', 'contact-linkedin-service-contact', 'Contact LinkedIn click — service contact'),
    ],
}
errors = []

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.og_urls = []
        self.scripts = []
        self.script_attrs = []
        self.in_jsonld = False
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'link' and d.get('rel') == 'canonical': self.canonicals.append(d.get('href', ''))
        if tag == 'meta' and d.get('property') == 'og:url': self.og_urls.append(d.get('content', ''))
        if tag == 'script':
            self.script_attrs.append(d)
            if d.get('type') == 'application/ld+json': self.in_jsonld = True
    def handle_endtag(self, tag):
        if tag == 'script': self.in_jsonld = False
    def handle_data(self, data):
        if self.in_jsonld: self.scripts.append(data)

def fail(msg): errors.append(msg)
def read(p): return p.read_text(encoding='utf-8', errors='ignore')
def html_files(): return sorted(DOCS.glob('**/*.html')) if DOCS.exists() else []

def check_required():
    if not DOCS.exists(): fail('docs output missing; run npm run build first')
    required = ['index.html','approach/index.html','contact/index.html','CNAME','robots.txt','llms.txt','llms-full.txt','machine-answer-index.json','sitemap-index.xml']
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

def all_jsonld_objects(path):
    parser = HeadParser(); parser.feed(read(path))
    out = []
    for script in parser.scripts:
        objects, exc = jsonld_objects(script)
        if exc:
            fail(f'{path.relative_to(DOCS)}: JSON-LD parse failed {exc}')
            continue
        out.extend(objects or [])
    return out

def objects_of_type(path, type_name):
    matches = []
    for obj in all_jsonld_objects(path):
        typ = obj.get('@type')
        types = typ if isinstance(typ, list) else [typ]
        if type_name in types:
            matches.append(obj)
    return matches

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
        goatcounter_scripts = [
            attrs for attrs in parser.script_attrs
            if attrs.get('data-goatcounter') == GOATCOUNTER_ENDPOINT and attrs.get('src') == GOATCOUNTER_SRC
        ]
        if len(goatcounter_scripts) != 1:
            fail(f'{rel}: expected exactly one GoatCounter script for {GOATCOUNTER_ENDPOINT}')
        elif 'async' not in goatcounter_scripts[0]:
            fail(f'{rel}: GoatCounter script must be async')
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

def has_anchor_with_attrs(html, href, attrs):
    for match in re.finditer(r'<a\b[^>]*>', html, re.I):
        tag = match.group(0)
        if f'href="{href}"' not in tag:
            continue
        if all(f'{key}="{value}"' in tag for key, value in attrs.items()):
            return True
    return False


def check_contact_click_tracking():
    contact_page = DOCS / 'contact/index.html'
    home_page = DOCS / 'index.html'
    if home_page.exists():
        home_html = read(home_page)
        if '<section id="contact"' in home_html:
            fail('index.html: redundant inline contact section should not remain after dedicated contact page')
        for stale_event in ['contact-email-home', 'contact-linkedin-home']:
            if stale_event in home_html:
                fail(f'index.html: stale inline contact click event remains: {stale_event}')
    if contact_page.exists():
        html = read(contact_page)
        text = re.sub(r'<[^>]+>', ' ', html)
        for expected in ['Contact Luca for your new website', 'Start with a direct message', 'No form']:
            if expected not in text:
                fail(f'contact/index.html: missing expected contact page copy: {expected}')
        for forbidden in ['Direct website inquiry', 'What to send', 'A useful first message is short', 'just the context for the website you need']:
            if forbidden in text:
                fail(f'contact/index.html: forbidden contact page copy remains: {forbidden}')
        if 'showcase-topbar--static' not in html or 'href="/"' not in html:
            fail('contact/index.html: missing static return banner/navigation')
    for rel, expected_links in CONTACT_TRACKING.items():
        path = DOCS / rel
        if not path.exists():
            fail(f'{rel}: missing page for contact click tracking check')
            continue
        html = read(path)
        for href, event_name, title in expected_links:
            if event_name.startswith('/'):
                fail(f'{rel}: GoatCounter event path must not start with slash: {event_name}')
            required_attrs = {
                'data-goatcounter-click': event_name,
                'data-goatcounter-title': title,
            }
            if not has_anchor_with_attrs(html, href, required_attrs):
                fail(f'{rel}: contact link {href} missing GoatCounter click tracking event {event_name}')


def check_person_schema_contract():
    """Regression gate for service Person stitching and scoped identity facts."""
    index = DOCS / 'index.html'
    if not index.exists():
        return
    people = objects_of_type(index, 'Person')
    if len(people) != 1:
        fail(f'index.html: expected exactly one Person JSON-LD node, found {len(people)}')
        return
    person = people[0]
    if person.get('@id') != PERSON_ID:
        fail(f"index.html: Person @id mismatch {person.get('@id')}")
    same_as = person.get('sameAs')
    if same_as != EXPECTED_PERSON_SAME_AS:
        fail(f'index.html: service Person.sameAs must be {EXPECTED_PERSON_SAME_AS}, found {same_as}')
    forbidden_same_as = {'https://medium.com/@KappaK', 'https://www.youtube.com/@krabbykappa'}
    if isinstance(same_as, list) and forbidden_same_as & set(same_as):
        fail('index.html: service Person.sameAs contains stale Medium/YouTube handles')
    knows_about = person.get('knowsAbout')
    if not isinstance(knows_about, list) or len(knows_about) < 4:
        fail(f'index.html: service Person.knowsAbout must contain at least four scoped topics, found {knows_about}')
    else:
        required = {'Website creation', 'Static websites', 'Digital marketing services', 'Multilingual communication'}
        missing = sorted(required - set(knows_about))
        if missing:
            fail(f'index.html: service Person.knowsAbout missing required topics {missing}')
    services = objects_of_type(index, 'Service')
    if not services:
        fail('index.html: missing Service JSON-LD node')
    for service in services:
        provider = service.get('provider')
        if not isinstance(provider, dict) or provider.get('@id') != PERSON_ID:
            fail(f"index.html: Service.provider must reference {PERSON_ID}, found {provider}")
    root_index = ROOT.parent / 'Astro Portfolio/docs/index.html'
    if root_index.exists():
        root_people = objects_of_type(root_index, 'Person')
        if root_people and root_people[0].get('@id') != person.get('@id'):
            fail(f"cross-domain Person @id mismatch: root {root_people[0].get('@id')} vs service {person.get('@id')}")

check_required(); check_html(); check_sitemap(); check_machine_index(); check_robots_llms(); check_contact_click_tracking(); check_person_schema_contract()
if errors:
    print('FAIL')
    print('\n'.join(errors))
    sys.exit(1)
print('PASS websites subdomain static SEO/AEO checks')
