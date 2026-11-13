#!/usr/bin/env python3
"""Site build: assembles index.html, assets/ and functions/ for brightyard.in, then sites/allocivo and sites/xessly.
Run from anywhere:  python3 build-src/build.py   (see build-src/README.md)"""
import re, os, shutil, json
V2 = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(V2)   # the repository root, one level up
rd = lambda p: open(os.path.join(V2, p)).read()
def wr(p, s):
    p = os.path.join(REPO, p); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(s)

body = rd('old/body.html')
old_full = os.popen('cd %s && git show 56db1cb:index.html' % REPO).read()
tail = old_full[old_full.index('<template id="tpl-al">'):old_full.index('<script>', old_full.index('<template id="tpl-xs">'))]
sig_html = old_full[old_full.index('<div class="dock" id="dock">'):old_full.index('<!-- Blueprint master data')]
sig_html = sig_html.replace('<div class="card bpplan" id="bpplan" aria-live="polite"></div>', '<div class="card bpplan" id="bpplan"></div>').replace('Signals we pick up will appear here', 'Topics Yardie spots will appear here').replace('<div class="glf">Press <kbd>1</kbd> to <kbd>9</kbd> to jump &middot; <kbd>Esc</kbd> to close</div>', '<div class="glf">Press <kbd>1</kbd> to <kbd>9</kbd> to jump &middot; <kbd>Esc</kbd> to close &middot; <button type="button" class="glk" id="glk" aria-pressed="true">Single-key shortcuts: on</button></div>').replace("Type a sentence or two about what isn't working. We'll sketch an indicative plan and timeline right here in your browser. Nothing is sent unless you choose to send it.", "Tell Yardie what isn't working. It briefs its agents and sketches an indicative plan right here in your browser. Nothing is sent unless you choose to send it.")
master = json.dumps(json.load(open(os.path.join(V2, 'src/master.json'))), ensure_ascii=False, separators=(',', ':'))
assert '</' not in master

# ---------- home hero ----------
a = body.index('<div class="hero" id="hero">'); b = body.index('<div class="logos"')
old_hero = body[a:b]
minis = re.search(r'(<div class="mini c1 rv">.*</div>)\n</div>\n</div>\n</div>', old_hero, re.S).group(1).replace(' rv"', '"').replace(' rv ', ' ')
minis = re.sub(r' style="--d:\d+ms"', '', minis)
lead = re.search(r'<p class="lead rv" id="seg-p"[^>]*>(.*?)</p>', old_hero, re.S).group(1)
hero = '''<div class="hero3" id="hero" data-dark>
<div class="h3-stage" role="img" aria-label="Animated Brightyard logo above a moving field of dots, with signals flowing into it."><canvas id="hero-c"></canvas></div>
<div class="wrap h3-in">
<div class="h3-copy">
<span class="h3-kick"><i class="live"></i>Built by AI agents. Reviewed by engineers.</span>
<h1 class="split">Built for <mark>what happens next.</mark></h1>
<p class="lead" id="seg-p">%s</p>
<div class="acts"><a class="btn pri mag" id="seg-b" href="#/contact"><span>Talk to an engineer</span><span class="arrow">&rarr;</span></a><a class="btn out" href="#/work">See our work</a></div>
<p class="micro">No sales deck. A senior engineer replies within one business day.</p>
<div class="segs"><span>I'm with a</span><button class="sg on" data-s="all">Growing company</button><button class="sg" data-s="startup">Startup</button><button class="sg" data-s="enterprise">Enterprise</button><button class="sg" data-s="public">Public sector</button></div>
</div>
</div>
<div class="h3-meta"><button type="button" class="h3-pause" id="hero-pause" aria-pressed="false">Pause animation</button></div>
<a class="h3-scroll" href="#/home/bpgen" aria-label="Scroll to the blueprint generator"><i></i>Scroll</a>
</div>

''' % lead
body = body[:a] + hero + body[b:]

# ---------- services gallery ----------
a = body.index('<div class="sec"><div class="wrap">\n<div class="head"><span class="eyebrow rv">What we do</span>')
b = body.index('<div class="sec alt"><div class="wrap">\n<div class="head"><span class="eyebrow rv">Our products</span>')
blk = body[a:b]
head = re.search(r'(<div class="head">.*?</div>)\n<div class="bento">', blk, re.S).group(1)
cards = re.findall(r'^(<a class="card b\d rv.*</a>)$', blk, re.M)
assert len(cards) == 6, len(cards)
out = []
for i, c in enumerate(cards):
    c = re.sub(r'class="card b\d rv', 'class="card hs-card' + (' wide' if i == 5 else ''), c, 1)
    c = re.sub(r' style="--d:\d+ms"', '', c, 1)
    if i < 5: c = re.sub(r'(<a [^>]*>)', r'\1<span class="hs-n" aria-hidden="true">0%d</span>' % (i + 1), c, 1)
    out.append(c)
gal = '<div class="sec hsec" id="svc-gallery">\n<div class="wrap">' + head + '</div>\n<div class="hs" data-hscroll><div class="hs-track">\n' + '\n'.join(out) + '\n</div></div>\n<div class="hs-prog" aria-hidden="true"><i></i></div>\n</div>\n\n'
body = body[:a] + gal + body[b:]

# ---------- product stories ----------
def story(body, key, label, skip):
    a = body.index('<div class="deck dk-%s' % key)
    m = re.compile(r'</div>\n</div>\n<p class="fine"[^>]*>(Presentation uses.*?)</p>\n</div></div>', re.S).search(body, a)
    deck = body[a:m.start()]
    slides = re.findall(r'<section class="sl( cen)?" aria-roledescription="slide" aria-label="Slide \d+ of \d+">\n(.*?)\n</section>', deck, re.S)
    assert len(slides) == 10, len(slides)
    lis = ''.join('<li class="s3-step" data-i="%d">\n%s\n</li>\n' % (i, s[1]) for i, s in enumerate(slides))
    note = m.group(1).replace('Presentation uses', 'Story uses').replace(' Use the controls to pause or move between slides.', '')
    html = ('</div></div>\n\n<section class="s3 %s" data-story="%s" data-dark aria-label="%s">\n<div class="s3-pin">\n'
            '<div class="s3-stage" aria-hidden="true"><canvas></canvas></div>\n<div class="wrap s3-in"><ol class="s3-steps">\n%s</ol></div>\n'
            '<div class="s3-rail"></div>\n<span class="s3-note">Illustrative demo data</span>\n<a class="s3-skip" href="%s">Skip the story</a>\n</div>\n</section>\n'
            '<div class="wrap"><p class="fine" style="margin-top:14px">%s</p></div>') % (key, key, label, lis, skip, note)
    return body[:a].rstrip() + '\n' + html + body[m.end():]
body = story(body, 'al', 'Allocivo story: the problem and the solution, in ten steps', '#/allocivo/al-problem')
body = story(body, 'xs', 'Xessly story: the problem and the agent-run solution, in ten steps', '#/xessly/xs-problem')
body = body.replace('<div class="prodhero al">', '<div class="prodhero al" data-dark>').replace('<div class="prodhero xs">', '<div class="prodhero xs" data-dark>')
body = body.replace('<div class="ph">', '<div class="ph" data-dark>')
body = body.replace('<div id="prog"></div><div id="cur"></div>', '<div id="prog"></div>')
body = body.replace('<body>\n', '')

head_html = '''<!DOCTYPE html>
<html lang="en" class="anim">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Brightyard | Software built for what happens next</title>
<meta name="description" content="Brightyard designs, builds and runs software for teams that can't afford downtime, and makes Allocivo and Xessly.">
<meta name="theme-color" content="#0B0A24">
<link rel="canonical" href="https://brightyard.in/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Brightyard">
<meta property="og:url" content="https://brightyard.in/">
<meta property="og:title" content="Brightyard | Built for what happens next">
<meta property="og:description" content="Software designed, built and run by AI agents, reviewed by engineers. Describe your problem and get a 3D blueprint with a plan and dates in seconds.">
<meta property="og:image" content="https://brightyard.in/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Brightyard: Built for what happens next.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
<noscript><style>.rv,.split .w>span{opacity:1!important;transform:none!important}#pre{display:none!important}.s3-step{position:static!important;opacity:1!important;transform:none!important}.s3-pin{height:auto!important}.s3-stage{display:none}</style></noscript>
</head>
<body>
<div id="pre" aria-hidden="true"><div class="pre-in"><div class="pre-g"><i class="y"></i><i></i><i class="y"></i><i></i><i class="y"></i><i></i><i></i><i class="y"></i><i></i></div><span id="pre-n">000</span></div></div>
<div id="pt" aria-hidden="true"><i></i><i></i></div>
'''
foot = '''
<script type="application/json" id="bp-master">%s</script>
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script src="vendor/lenis.min.js"></script>
<script src="assets/js/blueprint-engine.js"></script>
<script src="assets/js/blueprint-brief.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
''' % master
import re as _re
_by = lambda t: _re.sub(r'\bBrightYard\b', 'Brightyard', t)   # one spelling everywhere; the logo is drawn separately
wr('index.html', _by(head_html + body + tail + '\n' + sig_html.rstrip() + '\n' + foot))

# ---------- css ----------
css = rd('src/fonts.css') + rd('old/old.css') + '\n/* ===== signature layer: dock, yard menu, blueprint lens, blueprint panel ===== */\n' + rd('old/sig.css') + rd('src/new.css') + rd('src/glass.css')
wr('assets/css/site.css', css)

# ---------- js ----------
s1 = rd('old/script1.js'); s1 = s1[:s1.index('/* ---------- auto-running decks ---------- */')] + s1[s1.index('/* ---------- product forms ---------- */'):]
s6 = rd('old/script6.js'); s6 = s6[:s6.index('/* ---------- 1. Brief to blueprint')] + rd('src/bpui.js') + '\n' + s6[s6.index('/* ---------- 2. Blueprint lens ---------- */'):]
assert "['.hero','hero',0]" in s6; s6 = s6.replace("['.hero','hero',0]", "['.hero3','hero',0],['.s3-step.on','story step',0]")
_guard = lambda js: 'try{\n' + js + '\n}catch(e){console.error(e)}'
app = '/* Brightyard site script. Sections: settings and forms, menus, live demos, signature layer, core. */\n' + '\n'.join(_guard(x) for x in [rd('old/script0.js').replace("formEndpoint: '',", "formEndpoint: '/api/contact',").replace("contactEmail: 'hello@brightyard.in'", "contactEmail: 'hello@brightyard.in',\n  api: true,           // false = never call /api (the blueprint dialog then offers link, print and email instead)\n  productSites: { allocivo: 'https://allocivo.brightyard.in/', xessly: 'https://xessly.brightyard.in/' }   // {} = keep product pages on this site"), s1, rd('old/script3.js'), s6, rd('src/lead.js'), rd('src/core.js'), rd('src/a11y.js'), rd('src/megamenu.js')])
wr('assets/js/app.js', app)
wr('assets/js/blueprint-engine.js', rd('src/engine.js'))
# 3D scenes: rebundle when esbuild is available (npm install in build-src), otherwise keep the committed bundle
os.system('cd %s && python3 resplice.py >/dev/null' % V2)
if os.path.exists(os.path.join(V2, 'node_modules/.bin/esbuild')):
    assert os.system('cd %s && node_modules/.bin/esbuild src/scenes.js --bundle --format=iife --global-name=BYScenes --minify --outfile=%s --log-level=warning' % (V2, os.path.join(REPO, 'assets/js/scenes.js'))) == 0
else:
    print('esbuild not installed: keeping the committed assets/js/scenes.js')
if os.path.isdir(os.path.join(V2, 'node_modules/gsap')):
    os.makedirs(os.path.join(REPO, 'vendor'), exist_ok=True)
    for src, dst in [('node_modules/gsap/dist/gsap.min.js', 'gsap.min.js'), ('node_modules/gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'), ('node_modules/lenis/dist/lenis.min.js', 'lenis.min.js')]:
        shutil.copy(os.path.join(V2, src), os.path.join(REPO, 'vendor', dst))
os.makedirs(os.path.join(REPO, 'src'), exist_ok=True)
shutil.copy(os.path.join(V2, 'src/scenes.js'), os.path.join(REPO, 'src/scenes.js'))
print('built', len(head_html + body), 'bytes html')

# ---- Cloudflare Pages Functions: copy handlers and generate ES modules of the engine, brief builder and master data
FN = os.path.join(REPO, 'functions')
if os.path.isdir(FN): shutil.rmtree(FN)
shutil.copytree(os.path.join(V2, 'src/functions'), FN)
wr('assets/js/blueprint-brief.js', rd('src/brief.js'))
assert os.system('cd %s && node tools/build-functions.mjs' % REPO) == 0
for f in ('schema.sql', 'wrangler.example.toml'):
    shutil.copy(os.path.join(V2, 'src', f), os.path.join(REPO, f))
print('functions ok')

# ---- self-hosted fonts (from the @fontsource npm packages, SIL OFL 1.1)
FS = os.path.join(V2, 'node_modules')
if os.path.isdir(os.path.join(FS, '@fontsource-variable/inter')):
    os.makedirs(os.path.join(REPO, 'assets/fonts'), exist_ok=True)
    for pkg, f in [('@fontsource-variable/inter', 'inter-latin-wght-normal.woff2'), ('@fontsource-variable/inter', 'inter-latin-ext-wght-normal.woff2'),
                   ('@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff2'), ('@fontsource/instrument-serif', 'instrument-serif-latin-ext-400-italic.woff2')]:
        shutil.copy(os.path.join(FS, pkg, 'files', f), os.path.join(REPO, 'assets/fonts', f))
    shutil.copy(os.path.join(FS, '@fontsource-variable/inter/LICENSE'), os.path.join(REPO, 'assets/fonts/LICENSE-Inter.txt'))
    shutil.copy(os.path.join(FS, '@fontsource/instrument-serif/LICENSE'), os.path.join(REPO, 'assets/fonts/LICENSE-InstrumentSerif.txt'))
print('fonts ok')

# ---- product subdomain sites (sites/allocivo, sites/xessly)
import importlib.util as _iu
_sp = _iu.spec_from_file_location('products', os.path.join(V2, 'src/products.py')); _pm = _iu.module_from_spec(_sp); _sp.loader.exec_module(_pm); _pm.build(REPO)
