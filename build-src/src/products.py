"""Builds the product sites (allocivo.brightyard.in, xessly.brightyard.in) from the main site's product sections.
Each site is a folder under sites/ with real pages, its own header and footer, and its own copy of the API,
so each can be its own Cloudflare Pages project. Run by build.py after index.html is written."""
import os, re, shutil

MAIN = 'https://brightyard.in/'
PRODUCTS = {
    'allocivo': {
        'name': 'Allocivo', 'key': 'al', 'mark': 'mk-al', 'host': 'https://allocivo.brightyard.in/',
        'desc': 'Allocivo: AI agents that turn hotel workforce availability into action. Spots rooms at risk, moves the work to the right person and gets a supervisor\'s OK.',
        'cta': ('Book a demo', 'demo/'),
        'pages': [
            ('', 'Overview', ['prodhero', 's3', 'note', 'al-value'], 'Allocivo | AI agents for hotel operations'),
            ('how-it-works/', 'How it works', ['al-problem', 'al-how', 'al-uses'], 'How it works | Allocivo'),
            ('integrations/', 'Integrations', ['al-systems'], 'Integrations | Allocivo'),
            ('demo/', 'Book a demo', ['al-demo'], 'Book a demo | Allocivo'),
        ],
        'band': ('Show us how your hotel works.', 'Thirty minutes with our team. We\'ll explore where better coordination could help, and say so if it won\'t.'),
        'blurb': 'Real-time workforce orchestration for hotels.',
    },
    'xessly': {
        'name': 'Xessly', 'key': 'xs', 'mark': 'mk-xs', 'host': 'https://xessly.brightyard.in/',
        'desc': 'Xessly: AI agents that find, fix and prove website and app accessibility issues, in your code or CMS.',
        'cta': ('Request early access', 'early-access/'),
        'pages': [
            ('', 'Overview', ['prodhero', 's3', 'note', 'xs-problem', 'xs-routes'], 'Xessly | AI agents for website accessibility'),
            ('agent-flow/', 'Agent flow', ['xs-how'], 'Agent flow | Xessly'),
            ('where-fixes-land/', 'Where fixes land', ['xs-where'], 'Where fixes land | Xessly'),
            ('early-access/', 'Early access', ['xs-access', 'xs-faq'], 'Early access | Xessly'),
        ],
        'band': ('Let the agents take your accessibility backlog.', 'Early access is open for teams with a live website or app. Tell us where it runs.'),
        'blurb': 'AI agents that make websites and apps accessible.',
    },
}
VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'use', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'stop', 'wbr', 'col'}


def page_blocks(html, pid):
    """Direct children of <section id="p-..."> as {name: html}."""
    a = html.index('<section class="page" id="%s"' % pid)
    out, depth, start = [], 0, None
    for m in re.finditer(r'<(/?)([a-zA-Z0-9-]+)([^>]*?)(/?)>', html[a:]):
        close, tag, attrs, selfc = m.groups(); tag = tag.lower(); pos = a + m.start()
        if tag in VOID or selfc:
            continue
        if not close:
            depth += 1
            if depth == 2: start = (pos, attrs)
        else:
            if depth == 2: out.append((start[1], html[start[0]:a + m.end()]))
            depth -= 1
            if depth == 0: break
    named = {}
    for attrs, h in out:
        idm = re.search(r'\bid="([^"]+)"', attrs)
        if idm: named[idm.group(1)] = h
        elif 'prodhero' in attrs: named['prodhero'] = h
        elif 'data-story' in attrs: named['s3'] = h
        else: named['note'] = h
    return named


def rewrite_links(h, slug, IDS):
    """#/allocivo/al-demo -> /demo/#al-demo ; the other product -> its subdomain ; anything else -> the main site."""
    def sub(m):
        target = m.group(1); parts = target.split('/'); pid = parts[0]; anchor = parts[1] if len(parts) > 1 else ''
        if pid in PRODUCTS:
            base = '/' if pid == slug else PRODUCTS[pid]['host']
            if not anchor: return 'href="%s"' % base
            path = IDS[pid].get(anchor, '')
            return 'href="%s%s#%s"' % (base, path, anchor)
        return 'href="%s#/%s"' % (MAIN, target)
    return re.sub(r'href="#/([^"]*)"', sub, h)


def build(REPO):
    html = open(os.path.join(REPO, 'index.html')).read()
    head_src = html[:html.index('</head>')]
    sprite = html[html.index('<svg width="0" height="0" style="position:absolute" aria-hidden="true">'):]
    sprite = sprite[:sprite.index('</svg>') + 6]
    tpls = ''.join(re.findall(r'<template id="tpl-(?:al|xs)">.*?</template>', html, re.S))
    assert tpls.count('<template') == 2
    styles = re.findall(r'<link rel="(?:stylesheet|preload)"[^>]+>', head_src)
    ALL = {slug: page_blocks(html, 'p-' + slug) for slug in PRODUCTS}
    IDS = {}
    for slug, cfg in PRODUCTS.items():
        IDS[slug] = {}
        for path, _, names, _ in cfg['pages']:
            for n in names:
                for i in re.findall(r'\bid="([^"]+)"', ALL[slug].get(n, '')): IDS[slug].setdefault(i, path)
    for slug, cfg in PRODUCTS.items():
        out = os.path.join(REPO, 'sites', slug)
        if os.path.isdir(out): shutil.rmtree(out)
        os.makedirs(out)
        blocks = ALL[slug]
        nav_items = [(p, label) for p, label, _, _ in cfg['pages'] if p != cfg['cta'][1]]
        for path, label, names, title in cfg['pages']:
            missing = [n for n in names if n not in blocks]
            assert not missing, (slug, missing, list(blocks))
            body = ''.join(rewrite_links(blocks[n], slug, IDS) for n in names)
            if path != cfg['cta'][1]:
                body += ('<div class="sec"><div class="wrap"><div class="band rv"><div><h2>%s</h2><p>%s</p></div>'
                         '<a class="btn lime mag" href="/%s">%s <span class="arrow">&rarr;</span></a></div></div></div>') % (cfg['band'][0], cfg['band'][1], cfg['cta'][1], cfg['cta'][0])
            url = cfg['host'] + path
            nav = ''.join('<a class="l%s" href="/%s"%s>%s</a>' % (' on' if p == path else '', p, ' aria-current="page"' if p == path else '', l) for p, l in nav_items)
            other = [o for o in PRODUCTS if o != slug][0]; O = PRODUCTS[other]
            head = ('<!doctype html>\n<html lang="en" data-product="%s" data-assets="/">\n<head>\n<meta charset="utf-8">\n'
                    '<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>%s</title>\n'
                    '<meta name="description" content="%s">\n<meta name="theme-color" content="#0B0A24">\n'
                    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="canonical" href="%s">\n'
                    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="%s">\n<meta property="og:url" content="%s">\n'
                    '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta name="twitter:card" content="summary">\n'
                    '%s\n</head>\n') % (slug, title, cfg['desc'], url, cfg['name'], url, title, cfg['desc'],
                                         '\n'.join(s.replace('href="assets/', 'href="/assets/') for s in styles))
            page = (head + '<body class="prod-site prod-%s">\n<div id="pt" aria-hidden="true"><i></i><i></i></div>\n%s\n'
                    '<div id="prog"></div>\n<a class="skip" href="#main">Skip to content</a>\n'
                    '<header id="hdr"><div class="wrap nav">\n'
                    '<a class="logo plogo" href="/" aria-label="%s home"><svg class="mk" aria-hidden="true"><use href="#%s"/></svg><span>%s<small>by Brightyard</small></span></a>\n'
                    '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">&#9776;</button>\n'
                    '<nav class="menu" id="menu" aria-label="Main">%s<a class="btn pri" href="/%s">%s</a></nav>\n</div></header>\n'
                    '<main id="main">\n<section class="page on" id="p-%s" data-title="%s">\n%s\n</section>\n</main>\n'
                    '<footer><div class="wrap"><div class="fg pfg">\n'
                    '<div><a class="logo" href="/"><svg class="mk" aria-hidden="true"><use href="#%s"/></svg><span>%s</span></a>'
                    '<p style="margin-top:16px;max-width:300px;color:var(--mute)">%s A <a class="ul-link" href="%s">Brightyard</a> product.</p></div>\n'
                    '<div><h4>%s</h4><ul>%s<li><a href="/%s">%s</a></li></ul></div>\n'
                    '<div><h4>Brightyard</h4><ul><li><a href="%s">About Brightyard</a></li><li><a href="%s">%s</a></li><li><a href="%s#/contact">Contact</a></li></ul></div>\n'
                    '</div><div class="legal"><span>&copy; <span id="yr">2026</span> Brightyard. All rights reserved.</span><span><a href="%s#/privacy">Privacy policy</a></span></div></div></footer>\n'
                    '<script src="/vendor/gsap.min.js"></script>\n<script src="/vendor/ScrollTrigger.min.js"></script>\n<script src="/vendor/lenis.min.js"></script>\n'
                    '<script src="/assets/js/app.js"></script>\n</body>\n</html>\n') % (
                cfg['key'], sprite, cfg['name'], cfg['mark'], cfg['name'], nav, cfg['cta'][1], cfg['cta'][0],
                slug, title, body, cfg['mark'], cfg['name'], cfg['blurb'], MAIN,
                cfg['name'], ''.join('<li><a href="/%s">%s</a></li>' % (p, l) for p, l in nav_items), cfg['cta'][1], cfg['cta'][0],
                MAIN, O['host'], O['name'] + ', our other product', MAIN, MAIN)
            page = page.replace('<main id="main">', tpls + '\n<main id="main">', 1)
            d = os.path.join(out, path); os.makedirs(d, exist_ok=True)
            open(os.path.join(d, 'index.html'), 'w').write(page)
        # a real "not found" page, so mistyped addresses don't quietly show the overview
        home = open(os.path.join(out, 'index.html')).read()
        m0 = home.index('<main id="main">'); m1 = home.index('</main>') + len('</main>')
        nf = ('<main id="main">\n<section class="page on" id="p-%s" data-title="Page not found | %s">\n'
              '<div class="prodhero %s" data-dark><div class="wrap"><div class="phl">'
              '<h1>We couldn\'t find that page.</h1>'
              '<div class="acts"><a class="btn pri" href="/">Go to the %s overview</a><a class="btn out" href="/%s">%s</a></div>'
              '</div></div></div>\n</section>\n</main>') % (slug, cfg['name'], cfg['key'], cfg['name'], cfg['cta'][1], cfg['cta'][0])
        nfp = home[:m0] + nf + home[m1:]
        nfp = re.sub(r'<title>.*?</title>', '<title>Page not found | %s</title>' % cfg['name'], nfp, 1)
        nfp = nfp.replace('<link rel="canonical" href="%s">' % cfg['host'], '<meta name="robots" content="noindex">')
        nfp = nfp.replace(' class="l on" href="/" aria-current="page"', ' class="l" href="/"')
        open(os.path.join(out, '404.html'), 'w').write(nfp)
        # shared files: styles, scripts, fonts, vendor, icon, and the API
        for sub in ('assets/css', 'assets/js', 'assets/fonts', 'vendor', 'functions'):
            shutil.copytree(os.path.join(REPO, sub), os.path.join(out, sub))
        shutil.copy(os.path.join(REPO, 'logos', slug + '-mark.svg'), os.path.join(out, 'favicon.svg'))
        open(os.path.join(out, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\n\nSitemap: %ssitemap.xml\n' % cfg['host'])
        open(os.path.join(out, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            ''.join('  <url><loc>%s%s</loc></url>\n' % (cfg['host'], p) for p, _, _, _ in cfg['pages']) + '</urlset>\n')
    print('product sites ok')
