import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s = open('src/scenes.js').read(); i = s.index('\n/* ====================================================================== */\n/* YARDIE')
open('src/scenes.js', 'w').write(s[:i].rstrip() + '\n' + open('src/buddy-part.js').read() + open('src/model-part.js').read())
b = open('src/bpui.js').read(); a = b.index('  /* ---------- holographic result'); c = b.index('  function reveal(bp,t){')
open('src/bpui.js', 'w').write(b[:a] + open('src/model-ui.js').read().replace('/* ---------- solution model', '/* ---------- holographic result: solution model') + b[c:])
print('spliced')
