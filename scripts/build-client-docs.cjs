#!/usr/bin/env node
/**
 * Build client-facing HTML docs from markdown sources.
 * Style: docs/client/assets/client-docs.css (diagram palette).
 *
 * Usage: node scripts/build-client-docs.mjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(DOCS, 'client');

const NAV = [
  {
    title: 'Start here',
    items: [
      { id: 'index', label: 'Documentation Hub', file: null },
      { id: 'quick-start', label: 'Quick Start', src: 'QUICK_START.md' },
      { id: 'getting-started', label: 'Getting Started', src: 'GETTING_STARTED.md' },
      { id: 'installation', label: 'Installation', src: 'INSTALLATION.md' },
    ],
  },
  {
    title: 'Product guides',
    items: [
      { id: 'admin-guide', label: 'Admin Guide', src: 'ADMIN_GUIDE.md' },
      { id: 'admin-manual', label: 'Admin Manual', src: 'ADMIN_MANUAL.md' },
      { id: 'customization', label: 'Customization', src: 'CUSTOMIZATION.md' },
      { id: 'payment-setup', label: 'Payment Setup', src: 'PAYMENT_SETUP.md' },
      { id: 'social-auth', label: 'Social Auth', src: 'SOCIAL_AUTH_SETUP.md' },
      { id: 'local-ai', label: 'Local AI Setup', src: 'LOCAL_AI_SETUP.md' },
      { id: '3d-presentation', label: '3D Platform & Roadmap', src: '3D_PLATFORM_PRESENTATION.md' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { id: 'architecture', label: 'Architecture', src: 'ARCHITECTURE.md' },
      { id: 'backend-api', label: 'Backend API', src: 'BACKEND_API.md' },
      { id: 'backend-diagram', label: 'Backend Diagram', href: '../BACKEND_ARCHITECTURE_DIAGRAM.html' },
      { id: 'faq', label: 'FAQ', src: 'FAQ.md' },
      { id: 'troubleshooting', label: 'Troubleshooting', src: 'TROUBLESHOOTING.md' },
      { id: 'support', label: 'Support', src: 'SUPPORT.md' },
    ],
  },
];

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableRows = [];
  let h2Count = 0;

  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  const flushTable = () => {
    if (!inTable || !tableRows.length) return;
    out.push('<table>');
    tableRows.forEach((row, idx) => {
      const tag = idx === 0 ? 'th' : 'td';
      if (idx === 1 && row.every((c) => /^:?-+:?$/.test(c.trim()))) return;
      out.push('<tr>' + row.map((c) => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>');
    });
    out.push('</table>');
    tableRows = [];
    inTable = false;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      closeLists();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        out.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        inCode = false;
        codeBuf = [];
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    if (line.includes('|') && line.trim().startsWith('|')) {
      closeLists();
      const cells = line.split('|').slice(1, -1);
      if (!inTable) inTable = true;
      tableRows.push(cells);
      i++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (/^---+$/.test(line.trim())) {
      closeLists();
      out.push('<hr>');
      i++;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      closeLists();
      const level = h[1].length;
      let title = h[2].replace(/^⚙️\s*/, '').replace(/^🔐\s*/, '').replace(/^📦\s*/, '').replace(/^💻\s*/, '').replace(/^🎬\s*/, '').replace(/^🌍\s*/, '').replace(/^🚀\s*/, '').replace(/^⚡\s*/, '').replace(/^💡\s*/, '');
      title = title.replace(/^\d+\.\s+/, '');
      if (level === 1) {
        // skip duplicate H1 — page header uses it
        i++;
        continue;
      }
      if (level === 2) {
        h2Count++;
        out.push(`<h2 id="s${h2Count}"><span class="n">${h2Count}</span>${inline(title)}</h2>`);
      } else {
        out.push(`<h${level}>${inline(title)}</h${level}>`);
      }
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      closeLists();
      const quote = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      const body = quote.join(' ').replace(/\*\*/g, '');
      let cls = 'card blue';
      if (/⚠️|warning|security|never/i.test(body)) cls = 'card orange';
      if (/✅|success|tip|💡/i.test(body)) cls = 'card green';
      if (/❌|error|fatal/i.test(body)) cls = 'card red';
      out.push(`<div class="${cls}"><div class="card-title">Note</div><p>${inline(quote.join(' '))}</p></div>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushTable();
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushTable();
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (!line.trim()) {
      closeLists();
      i++;
      continue;
    }

    closeLists();
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }

  closeLists();
  flushTable();
  return out.join('\n');
}

function extractTitleLead(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let title = 'Documentation';
  let lead = '';
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)/);
    if (m) {
      title = m[1].replace(/^[^\w]+/, '').trim();
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const l = lines[j].trim();
        if (!l || l.startsWith('#') || l.startsWith('```') || l.startsWith('|') || l.startsWith('---')) continue;
        if (l.startsWith('>')) {
          lead = l.replace(/^>\s?/, '').replace(/\*\*/g, '');
          break;
        }
        lead = l.replace(/\*\*/g, '');
        break;
      }
      break;
    }
  }
  return { title, lead };
}

function renderNav(activeId) {
  return NAV.map((group) => {
    const links = group.items.map((item) => {
      const href = item.href
        ? item.href
        : item.id === 'index'
          ? 'index.html'
          : `${item.id}.html`;
      const cls = item.id === activeId ? 'nav-link active' : 'nav-link';
      return `<a class="${cls}" href="${href}">${item.label}</a>`;
    }).join('\n');
    return `<div class="nav-group"><div class="nav-group-title">${group.title}</div>${links}</div>`;
  }).join('\n');
}

function pageShell({ title, lead, body, activeId, badges = [] }) {
  const badgeHtml = badges.map((b) => `<span class="badge ${b.tone}">${b.label}</span>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} — Angular 3D E-Commerce</title>
<link rel="stylesheet" href="assets/client-docs.css">
</head>
<body>
<button type="button" class="mobile-toggle" id="navToggle">Menu</button>
<div class="layout">
<aside class="sidebar" id="sidebar">
  <a class="sidebar-brand" href="index.html">Angular 3D E-Commerce</a>
  <div class="sidebar-tag">Client documentation</div>
  ${renderNav(activeId)}
</aside>
<main class="main">
  <header class="page-header">
    <h1>${escapeHtml(title)}</h1>
    ${lead ? `<p class="lead">${escapeHtml(lead)}</p>` : ''}
    ${badgeHtml ? `<div class="badges">${badgeHtml}</div>` : ''}
  </header>
  <article class="content">
${body}
  </article>
  <p class="footer-note">Buyer-facing docs · Markdown sources remain in <code>docs/*.md</code> · Visual theme matches architecture diagrams.</p>
</main>
</div>
<script>
document.getElementById('navToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
});
</script>
</body>
</html>
`;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function buildIndex() {
  const cards = [
    { href: 'quick-start.html', icon: '⚡', tone: 'cyan', title: 'Quick Start', desc: 'Run the stack in under 10 minutes.' },
    { href: 'getting-started.html', icon: '1', tone: 'blue', title: 'Getting Started', desc: 'Environment, SSR, and deployment options.' },
    { href: 'installation.html', icon: '2', tone: 'green', title: 'Installation', desc: 'Full install, Docker, and security checklist.' },
    { href: 'admin-manual.html', icon: '🛡', tone: 'purple', title: 'Admin Manual', desc: 'Products, orders, SEO, integrations.' },
    { href: 'payment-setup.html', icon: '💳', tone: 'pink', title: 'Payments', desc: 'Stripe, LiqPay, and PayPal setup.' },
    { href: 'customization.html', icon: '🎨', tone: 'orange', title: 'Customization', desc: 'Themes, 3D viewer, i18n branding.' },
    { href: 'backend-api.html', icon: 'API', tone: 'blue', title: 'Backend API', desc: 'REST endpoints and auth guards.' },
    { href: '../BACKEND_ARCHITECTURE_DIAGRAM.html', icon: '⚙', tone: 'cyan', title: 'Backend Diagram', desc: 'Interactive NestJS architecture map.' },
    { href: 'faq.html', icon: '?', tone: 'yellow', title: 'FAQ', desc: 'Common questions and answers.' },
    { href: 'troubleshooting.html', icon: '🔧', tone: 'red', title: 'Troubleshooting', desc: 'SSR, 3D, and connectivity fixes.' },
    { href: 'support.html', icon: '✉', tone: 'green', title: 'Support', desc: 'How to get help after purchase.' },
    { href: 'local-ai.html', icon: '🤖', tone: 'purple', title: 'Local AI', desc: 'Optional local 3D generation setup.' },
    { href: '3d-presentation.html', icon: '💎', tone: 'purple', title: '3D & AI Showcase', desc: 'Technical features and future roadmap.' },
  ];

  const grid = cards.map((c) => `
    <a class="hub-card" href="${c.href}">
      <span class="icon badge ${c.tone}">${c.icon}</span>
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Documentation — Angular 3D E-Commerce</title>
<link rel="stylesheet" href="assets/client-docs.css">
</head>
<body>
<button type="button" class="mobile-toggle" id="navToggle">Menu</button>
<div class="layout">
<aside class="sidebar" id="sidebar">
  <a class="sidebar-brand" href="index.html">Angular 3D E-Commerce</a>
  <div class="sidebar-tag">Client documentation</div>
  ${renderNav('index')}
</aside>
<main class="main" style="max-width:none;padding:0">
  <div class="hub-hero">
    <h1>Documentation Hub</h1>
    <p>Premium guides for buyers and integrators — same visual language as the architecture diagrams. Open any card or use the sidebar.</p>
    <div class="badges" style="justify-content:center;margin-top:1rem">
      <span class="badge cyan">NestJS</span>
      <span class="badge blue">Angular 17</span>
      <span class="badge green">PostgreSQL</span>
      <span class="badge purple">Three.js</span>
      <span class="badge pink">Cloudinary</span>
    </div>
  </div>
  <div class="hub-grid">${grid}</div>
  <p class="footer-note" style="max-width:1100px;margin:0 auto 2rem;padding:0 1.5rem">
    Internal engineering docs (AI constitution, refactoring board, token contracts) stay in <code>docs/</code> as Markdown and are not part of this buyer hub.
  </p>
</main>
</div>
<script>
document.getElementById('navToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
});
</script>
</body>
</html>`;
}

function main() {
  ensureDir(OUT);
  ensureDir(path.join(OUT, 'assets'));

  // CSS already written; keep it
  const cssSrc = path.join(OUT, 'assets', 'client-docs.css');
  if (!fs.existsSync(cssSrc)) {
    console.error('Missing client-docs.css — aborting');
    process.exit(1);
  }

  fs.writeFileSync(path.join(OUT, 'index.html'), buildIndex(), 'utf8');
  console.log('Wrote index.html');

  const badgeMap = {
    'quick-start': [{ tone: 'cyan', label: 'Setup' }],
    'getting-started': [{ tone: 'blue', label: 'Setup' }, { tone: 'purple', label: 'SSR' }],
    installation: [{ tone: 'green', label: 'Setup' }, { tone: 'orange', label: 'Security' }],
    'admin-guide': [{ tone: 'purple', label: 'Admin' }],
    'admin-manual': [{ tone: 'purple', label: 'Admin' }],
    customization: [{ tone: 'orange', label: 'Theming' }],
    'payment-setup': [{ tone: 'pink', label: 'Payments' }],
    'social-auth': [{ tone: 'blue', label: 'Auth' }],
    'local-ai': [{ tone: 'purple', label: 'AI / 3D' }],
    '3d-presentation': [{ tone: 'purple', label: 'AI / 3D' }],
    architecture: [{ tone: 'cyan', label: 'Architecture' }],
    'backend-api': [{ tone: 'blue', label: 'API' }],
    faq: [{ tone: 'yellow', label: 'FAQ' }],
    troubleshooting: [{ tone: 'red', label: 'Support' }],
    support: [{ tone: 'green', label: 'Support' }],
  };

  for (const group of NAV) {
    for (const item of group.items) {
      if (!item.src) continue;
      const srcPath = path.join(DOCS, item.src);
      if (!fs.existsSync(srcPath)) {
        console.warn('Skip missing', item.src);
        continue;
      }
      const md = fs.readFileSync(srcPath, 'utf8');
      const { title, lead } = extractTitleLead(md);
      const body = mdToHtml(md);
      const html = pageShell({
        title,
        lead,
        body,
        activeId: item.id,
        badges: badgeMap[item.id] || [],
      });
      const outPath = path.join(OUT, `${item.id}.html`);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('Wrote', path.relative(ROOT, outPath));
    }
  }

  console.log('\nClient docs ready → docs/client/index.html');
}

main();
