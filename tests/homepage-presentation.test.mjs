import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcePath = new URL('../src/pages/index.astro', import.meta.url);
const stylesPath = new URL('../public/styles.css', import.meta.url);

const source = await readFile(sourcePath, 'utf8');
const styles = await readFile(stylesPath, 'utf8');

test('the actual floating homepage header owns responsive contrast state', () => {
  assert.match(source, /document\.querySelector\('\[data-materialized-header\]'\)/);
  assert.doesNotMatch(source, /data-materialized-header\]:not\(\[data-floating-header\]\)/);
});

test('header contrast treats the hero and blue approach introduction as dark surfaces', () => {
  assert.match(source, /const approachIntro = document\.querySelector\('\.homepage-approach__intro'\)/);
  assert.match(source, /const headerBounds = header\.getBoundingClientRect\(\)/);
  assert.match(source, /const headerLine = headerBounds\.top \+ headerBounds\.height \/ 2/);
  assert.match(source, /const overHero = isHeaderLineWithin\(hero, headerLine\)/);
  assert.match(source, /const overApproachIntro = isHeaderLineWithin\(approachIntro, headerLine\)/);
  assert.match(source, /overHero \|\| overApproachIntro \|\| overDarkApproach/);
});

test('the floating-header CSS honors white lettering on dark state', () => {
  assert.match(styles, /\[data-floating-header\]\.showcase-topbar\[data-on-dark="true"\][^{]*\{[^}]*color:\s*#fff/s);
  assert.match(styles, /\[data-floating-header\]\.showcase-topbar\[data-on-dark="true"\][^{]*nav a[^{]*\{[^}]*color:\s*#fff/s);
});

test('Bizwholistic multilingual proof uses the Polish SVG screenshot and natural voice copy', () => {
  assert.match(source, /title:\s*'Multilingual delivery'/);
  assert.match(source, /text:\s*'The wording feels specific to this firm, not borrowed from a generic template\.'/);
  assert.match(source, /image:\s*'\/assets\/approach-bizwholistic\/bizwholistic-about-polish-svg-elements\.png'/);
  assert.match(source, /text:\s*'A Polish version at the same page position shows that the design and its custom illustrations remain composed across languages\.'/);
  assert.doesNotMatch(source, /title:\s*'Handcrafted SVGs'/);
  assert.doesNotMatch(source, /Copy sounds written for this firm/);
});
