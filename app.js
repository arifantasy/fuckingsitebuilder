/* ============================================================
   fuckingsitebuilder — a free, Wix-style website builder
   ------------------------------------------------------------
   Everything runs in the browser. Projects live in localStorage,
   and "Export HTML" produces a single self-contained file you can
   host anywhere (GitHub Pages, Netlify, a USB stick...).
   ============================================================ */
"use strict";

/* ---------------- tiny helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2, 9);
const clone = (o) => (typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "style") Object.assign(node.style, v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of Array.isArray(children) ? children : [children]) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
  }
  return node;
}

/* ============================================================
   1. THE PAGE STYLESHEET
   Shared by the editor preview and the exported file, so what you
   see really is what you publish.
   ============================================================ */
const SITE_CSS = `
.page{
  --sf-bg:#ffffff; --sf-text:#111827; --sf-accent:#6366f1;
  --sf-font: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --sf-max: 1080px;
  background: var(--sf-bg); color: var(--sf-text);
  font-family: var(--sf-font); line-height: 1.65; font-size: 17px;
  min-height: 100vh;
}
.page *{ box-sizing: border-box; }
.page .wrap{ max-width: var(--sf-max); margin: 0 auto; padding-inline: 28px; }
.page img{ max-width: 100%; height: auto; display: block; }
.page a{ color: inherit; }
.page h1,.page h2,.page h3,.page h4{ letter-spacing: -.02em; }

.b-heading{ margin:0; padding-block:34px 6px; line-height:1.15; font-weight:800; }
h1.b-heading{ font-size:2.6em; } h2.b-heading{ font-size:2em; }
h3.b-heading{ font-size:1.5em; } h4.b-heading{ font-size:1.2em; }

.b-text{ padding-block:8px; white-space:pre-wrap; }

.b-button{ padding-block:18px; }
.btn{
  display:inline-block; background: var(--sf-accent); color:#fff; text-decoration:none;
  padding:13px 26px; border-radius:10px; font-weight:600; border:0; cursor:pointer;
  transition: filter .14s, transform .06s;
}
.btn:hover{ filter:brightness(1.08); }

.b-hero{ padding-block:96px; background: var(--sf-accent); color:#fff; }
.b-hero .hero-title{ margin:0 0 12px; font-size:3em; font-weight:800; line-height:1.08; }
.b-hero .hero-sub{ margin:0 0 26px; font-size:1.22em; opacity:.92; }
.b-hero .btn{ font-size:1.02em; padding:14px 30px; }

.b-image{ padding-block:14px; margin:0; }
.b-img{ border-radius:12px; }
.b-caption{ margin-top:10px; font-size:.9em; opacity:.7; }

.b-cards{ padding-block:54px; }
.grid{ display:grid; gap:22px; }
.cols-3{ grid-template-columns:repeat(3,1fr); }
.card{
  background: rgba(99,102,241,.07); border:1px solid rgba(99,102,241,.18);
  border-radius:16px; padding:24px;
}
.card-title{ margin:0 0 8px; font-size:1.14em; font-weight:700; }
.card-text{ margin:0; opacity:.85; font-size:.97em; }

.b-gallery{ padding-block:24px; }
.gal-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.gal-grid img{ width:100%; height:220px; object-fit:cover; border-radius:12px; }

.b-video{ padding-block:24px; }
.ratio{ position:relative; padding-top:56.25%; border-radius:14px; overflow:hidden; background:#000; }
.ratio iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.video-empty{ position:absolute; inset:0; display:grid; place-items:center; color:#9ca3af; font-size:.95em; }

.b-divider{ padding-block:22px; }
.b-divider .hr{ display:block; border:0; border-top:2px solid rgba(128,128,128,.35); margin:0 auto; }
.b-spacer{ width:100%; }

.b-footer{ padding-block:40px; margin-top:40px; border-top:1px solid rgba(128,128,128,.25); font-size:.95em; opacity:.8; }

/* ---- navigation ---- */
.b-nav{ padding-block:14px; border-bottom:1px solid rgba(128,128,128,.2); background:var(--sf-bg); }
.nav-inner{ display:flex; align-items:center; gap:20px; }
.nav-logo{ font-weight:800; font-size:1.15em; letter-spacing:-.02em; }
.nav-links{ display:flex; gap:22px; margin-left:auto; font-size:.95em; }
.nav-links a{ text-decoration:none; opacity:.8; }
.nav-links a:hover{ opacity:1; }
.nav-cta{ padding:9px 18px; border-radius:9px; font-size:.9em; }

/* ---- announcement banner ---- */
.b-banner{ padding-block:12px; font-size:.95em; }
.b-banner .wrap{ display:flex; gap:10px; justify-content:center; align-items:center; flex-wrap:wrap; }
.b-banner a{ font-weight:600; }

/* ---- image + text ---- */
.b-split{ padding-block:56px; }
.split-inner{ display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
.split-inner.reverse .split-media{ order:2; }
.split-media img{ width:100%; border-radius:16px; }
.split-body h2{ margin:0 0 12px; font-size:1.9em; }
.split-body p{ margin:0 0 20px; opacity:.85; }

/* ---- call to action ---- */
.b-cta{ padding-block:70px; background:var(--sf-accent); color:#fff; }
.b-cta h2{ margin:0 0 10px; font-size:2.1em; }
.b-cta p{ margin:0 0 24px; font-size:1.1em; opacity:.92; }

/* ---- feature list ---- */
.b-features{ padding-block:54px; }
.feat-title{ margin:0 0 26px; font-size:2em; }
.feat-list{ display:grid; gap:20px; }
.feat{ display:grid; grid-template-columns:auto 1fr; gap:16px; align-items:start; }
.feat-ico{ font-size:1.5em; line-height:1.2; }
.feat h3{ margin:0 0 4px; font-size:1.1em; }
.feat p{ margin:0; opacity:.85; }

/* ---- steps ---- */
.b-steps{ padding-block:54px; }
.steps-title{ margin:0 0 30px; font-size:2em; }
.step{ background:rgba(128,128,128,.07); border:1px solid rgba(128,128,128,.18); border-radius:16px; padding:24px; }
.step-n{ display:inline-grid; place-items:center; width:36px; height:36px; border-radius:50%; background:var(--sf-accent); color:#fff; font-weight:700; margin-bottom:12px; }
.step h3{ margin:0 0 6px; font-size:1.1em; }
.step p{ margin:0; opacity:.85; }

/* ---- stats ---- */
.b-stats{ padding-block:44px; }
.stat{ text-align:center; }
.stat-v{ font-size:2.4em; font-weight:800; color:var(--sf-accent); letter-spacing:-.02em; }
.stat-l{ font-size:.95em; opacity:.8; }

/* ---- pricing ---- */
.b-pricing{ padding-block:56px; }
.pricing-title{ margin:0 0 30px; font-size:2em; text-align:center; }
.price{ position:relative; display:flex; flex-direction:column; border:1px solid rgba(128,128,128,.28); border-radius:18px; padding:26px; }
.price.featured{ border-color:var(--sf-accent); box-shadow:0 12px 40px rgba(99,102,241,.18); }
.price-name{ font-weight:700; font-size:1.05em; }
.price-amt{ margin:8px 0 14px; font-size:2.6em; font-weight:800; letter-spacing:-.03em; }
.price-per{ font-size:.4em; font-weight:600; opacity:.7; }
.price-feats{ list-style:none; padding:0; margin:0 0 20px; display:grid; gap:9px; }
.price-feats li{ position:relative; padding-left:22px; font-size:.95em; opacity:.88; }
.price-feats li::before{ content:"✓"; position:absolute; left:0; color:var(--sf-accent); font-weight:700; }
.price .btn{ margin-top:auto; text-align:center; }
.price-badge{ position:absolute; top:-11px; left:50%; transform:translateX(-50%); background:var(--sf-accent); color:#fff; font-size:.72em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:4px 12px; border-radius:20px; }

/* ---- testimonials ---- */
.b-testimonials{ padding-block:56px; }
.test-title{ margin:0 0 30px; font-size:2em; text-align:center; }
.quote-card{ margin:0; background:rgba(128,128,128,.07); border:1px solid rgba(128,128,128,.16); border-radius:16px; padding:24px; }
.quote-card blockquote{ margin:0 0 16px; font-size:1.02em; }
.quote-card figcaption{ font-size:.9em; }
.quote-card figcaption strong{ display:block; }
.quote-card figcaption span{ opacity:.7; }

/* ---- team ---- */
.b-team{ padding-block:56px; }
.team-title{ margin:0 0 30px; font-size:2em; text-align:center; }
.member{ text-align:center; }
.member img{ width:132px; height:132px; border-radius:50%; object-fit:cover; margin:0 auto 14px; }
.member h3{ margin:0 0 3px; font-size:1.08em; }
.member p{ margin:0; font-size:.92em; opacity:.75; }

/* ---- FAQ ---- */
.b-faq{ padding-block:54px; }
.faq-title{ margin:0 0 24px; font-size:2em; }
.faq-list{ display:grid; gap:10px; }
.faq{ border:1px solid rgba(128,128,128,.25); border-radius:12px; padding:0 18px; }
.faq summary{ display:flex; justify-content:space-between; gap:12px; cursor:pointer; padding:16px 0; font-weight:600; list-style:none; }
.faq summary::-webkit-details-marker{ display:none; }
.faq summary::after{ content:"+"; font-weight:400; opacity:.6; }
.faq[open] summary::after{ content:"–"; }
.faq-a{ padding:0 0 16px; opacity:.85; }

/* ---- pull quote ---- */
.b-quote{ margin:0; padding-block:56px; }
.b-quote blockquote{ margin:0 0 12px; font-size:1.6em; font-weight:600; line-height:1.4; }
.b-quote figcaption{ opacity:.7; }

/* ---- social links ---- */
.b-social{ padding-block:26px; }
.social-row{ display:flex; gap:10px; flex-wrap:wrap; }
.social-row a{ text-decoration:none; border:1px solid rgba(128,128,128,.35); border-radius:20px; padding:7px 16px; font-size:.9em; }

/* ---- contact form ---- */
.b-form{ padding-block:54px; }
.form-box{ max-width:560px; margin:0 auto; }
.form-title{ margin:0 0 20px; font-size:1.8em; text-align:center; }
.cform{ display:grid; gap:12px; }
.cform input,.cform textarea{ width:100%; padding:12px 14px; border:1px solid rgba(128,128,128,.35); border-radius:10px; font:inherit; background:transparent; color:inherit; }
.cform textarea{ min-height:120px; resize:vertical; }
.form-note{ margin:10px 0 0; font-size:.85em; text-align:center; opacity:.65; }

/* ---- map ---- */
.b-map{ padding-block:30px; }
.map-frame{ aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:rgba(128,128,128,.12); }
.map-frame iframe{ display:block; width:100%; height:100%; border:0; }
.map-empty{ display:grid; place-items:center; height:100%; color:#9ca3af; }

/* ---- button group ---- */
.b-buttons{ padding-block:20px; }
.btn-group{ display:flex; gap:12px; flex-wrap:wrap; }
.btn.outline{ background:transparent; border:2px solid var(--sf-accent); color:var(--sf-accent); }

/* ---- custom HTML ---- */
.b-html{ padding-block:24px; }
.html-box{ border:1px dashed rgba(128,128,128,.35); border-radius:12px; padding:16px; min-height:40px; }

/* ---- grid column helpers ---- */
.cols-2{ grid-template-columns:repeat(2,1fr); }
.cols-4{ grid-template-columns:repeat(4,1fr); }

.empty-page{ padding:120px 28px; text-align:center; color:#9ca3af; font-size:1rem; }

@media (max-width:820px){
  .cols-2,.cols-3,.cols-4{ grid-template-columns:1fr; }
  .gal-grid{ grid-template-columns:1fr 1fr; }
  .split-inner{ grid-template-columns:1fr; gap:28px; }
  .split-inner.reverse .split-media{ order:0; }
  .nav-links{ display:none; }
  .b-hero{ padding-block:64px; }
  .b-hero .hero-title{ font-size:2.2em; }
}
`;

/* ============================================================
   2. ASSETS & DEFAULTS
   ============================================================ */
const IMG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='#6366f1'/><stop offset='1' stop-color='#a855f7'/>" +
      "</linearGradient></defs>" +
      "<rect width='1200' height='700' fill='url(#g)'/>" +
      "<text x='600' y='365' font-family='sans-serif' font-size='48' fill='white' " +
      "opacity='.92' text-anchor='middle'>Your image</text></svg>"
  );

const FONTS = [
  { label: "System", value: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: "Serif", value: 'Georgia, "Times New Roman", serif' },
  { label: "Mono", value: '"SFMono-Regular", Consolas, "Courier New", monospace' },
  { label: "Rounded", value: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif' },
];

const THEME_DEFAULT = {
  title: "My Site",
  bg: "#ffffff",
  text: "#111827",
  accent: "#6366f1",
  font: FONTS[0].value,
  max: 1080,
};

/* ---------------- inline-edit helper ---------------- */
let EDITING = true; // false while generating the export
function editable(node, key, placeholder) {
  node.dataset.field = key;
  if (placeholder) node.dataset.ph = placeholder;
  if (EDITING) node.setAttribute("contenteditable", "true");
  return node;
}

function embedUrl(url) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return "https://www.youtube.com/embed/" + yt[1];
  const vim = url.match(/vimeo\.com\/(\d+)/);
  if (vim) return "https://player.vimeo.com/video/" + vim[1];
  return url;
}

/* ============================================================
   3. BLOCK DEFINITIONS
   Each block: metadata + the fields the inspector should show +
   a render() that returns a DOM node.
   ============================================================ */
const BLOCKS = {
  heading: {
    label: "Heading",
    icon: "H",
    defaults: { text: "A clear, bold headline", level: "h2", align: "left", size: "", color: "" },
    fields: [
      { key: "text", type: "textarea", label: "Text" },
      { key: "level", type: "select", label: "Size", options: ["h1", "h2", "h3", "h4"] },
      { key: "align", type: "align", label: "Align" },
      { key: "size", type: "number", label: "Custom size (px)", placeholder: "auto" },
      { key: "color", type: "color", label: "Color" },
    ],
    render(p) {
      return editable(
        el(p.level || "h2", {
          class: "b-heading wrap",
          text: p.text,
          style: { textAlign: p.align || "left", color: p.color || "", fontSize: p.size ? p.size + "px" : "" },
        }),
        "text",
        "Heading"
      );
    },
  },

  text: {
    label: "Text",
    icon: "¶",
    defaults: { text: "Write something here. Click to edit it right on the page.", align: "left", size: "", color: "" },
    fields: [
      { key: "text", type: "textarea", label: "Text" },
      { key: "align", type: "align", label: "Align" },
      { key: "size", type: "number", label: "Font size (px)", placeholder: "auto" },
      { key: "color", type: "color", label: "Color" },
    ],
    render(p) {
      return editable(
        el("div", {
          class: "b-text wrap",
          text: p.text,
          style: { textAlign: p.align || "left", color: p.color || "", fontSize: p.size ? p.size + "px" : "" },
        }),
        "text",
        "Write some text…"
      );
    },
  },

  button: {
    label: "Button",
    icon: "→",
    defaults: { label: "Click me", href: "#", align: "left", bg: "", color: "", radius: "" },
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "href", type: "text", label: "Link (URL)" },
      { key: "align", type: "align", label: "Align" },
      { key: "bg", type: "color", label: "Background" },
      { key: "color", type: "color", label: "Text color" },
      { key: "radius", type: "number", label: "Corner radius (px)" },
    ],
    render(p) {
      const a = el("a", {
        class: "btn",
        href: p.href || "#",
        text: p.label,
        style: {
          background: p.bg || "",
          color: p.color || "",
          borderRadius: p.radius !== "" && p.radius != null ? p.radius + "px" : "",
        },
      });
      editable(a, "label", "Button");
      return el("div", { class: "b-button" }, [el("div", { class: "wrap", style: { textAlign: p.align || "left" } }, [a])]);
    },
  },

  image: {
    label: "Image",
    icon: "▣",
    defaults: { src: IMG_PLACEHOLDER, alt: "", caption: "", width: 100, radius: 12, align: "center" },
    fields: [
      { key: "src", type: "image", label: "Image" },
      { key: "alt", type: "text", label: "Alt text" },
      { key: "caption", type: "text", label: "Caption" },
      { key: "width", type: "number", label: "Width (%)", min: 10, max: 100 },
      { key: "radius", type: "number", label: "Corner radius (px)" },
      { key: "align", type: "align", label: "Align" },
    ],
    render(p) {
      const img = el("img", {
        class: "b-img",
        src: p.src || IMG_PLACEHOLDER,
        alt: p.alt || "",
        style: { width: (p.width || 100) + "%", borderRadius: (p.radius ?? 12) + "px", margin: "0 auto" },
      });
      const kids = [img];
      if (p.caption) kids.push(editable(el("figcaption", { class: "b-caption", text: p.caption }), "caption", "Caption"));
      return el("figure", { class: "b-image" }, [
        el("div", { class: "wrap", style: { textAlign: p.align || "center" } }, kids),
      ]);
    },
  },

  hero: {
    label: "Hero",
    icon: "★",
    defaults: {
      title: "Build a website that's truly yours",
      subtitle: "Drag, drop, and publish — no code, no cost.",
      buttonLabel: "Get started",
      buttonHref: "#",
      align: "center",
      bg: "",
      color: "#ffffff",
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "subtitle", type: "textarea", label: "Subtitle" },
      { key: "buttonLabel", type: "text", label: "Button label" },
      { key: "buttonHref", type: "text", label: "Button link" },
      { key: "align", type: "align", label: "Align" },
      { key: "bg", type: "color", label: "Background" },
      { key: "color", type: "color", label: "Text color" },
    ],
    render(p) {
      const wrap = el("div", { class: "wrap" }, [
        editable(el("h1", { class: "hero-title", text: p.title }), "title", "Hero title"),
        editable(el("p", { class: "hero-sub", text: p.subtitle }), "subtitle", "Subtitle"),
      ]);
      if (p.buttonLabel) {
        const a = el("a", { class: "btn", href: p.buttonHref || "#", text: p.buttonLabel });
        editable(a, "buttonLabel", "Button");
        wrap.appendChild(a);
      }
      return el("section", {
        class: "b-hero",
        style: { background: p.bg || "", color: p.color || "", textAlign: p.align || "center" },
      }, [wrap]);
    },
  },

  cards: {
    label: "Card grid",
    icon: "▤",
    defaults: {
      cards: [
        { title: "Fast", text: "Everything happens instantly, right in your browser." },
        { title: "Free", text: "No subscriptions, no locked features, no watermarks." },
        { title: "Yours", text: "Export clean HTML and host it anywhere you like." },
      ],
    },
    fields: [
      {
        key: "cards",
        type: "list",
        label: "Cards",
        itemLabel: "Card",
        itemFields: [
          { key: "title", type: "text", label: "Title" },
          { key: "text", type: "textarea", label: "Text" },
        ],
      },
    ],
    render(p) {
      const grid = el("div", { class: "grid cols-3" });
      (p.cards || []).forEach((c) => {
        grid.appendChild(
          el("div", { class: "card" }, [
            el("h3", { class: "card-title", text: c.title }),
            el("p", { class: "card-text", text: c.text }),
          ])
        );
      });
      return el("section", { class: "b-cards" }, [el("div", { class: "wrap" }, [grid])]);
    },
  },

  gallery: {
    label: "Gallery",
    icon: "⊞",
    defaults: {
      images: [
        { src: IMG_PLACEHOLDER, alt: "" },
        { src: IMG_PLACEHOLDER, alt: "" },
        { src: IMG_PLACEHOLDER, alt: "" },
      ],
    },
    fields: [
      {
        key: "images",
        type: "list",
        label: "Images",
        itemLabel: "Image",
        itemFields: [
          { key: "src", type: "image", label: "Image" },
          { key: "alt", type: "text", label: "Alt text" },
        ],
      },
    ],
    render(p) {
      const grid = el("div", { class: "gal-grid" });
      (p.images || []).forEach((im) => {
        grid.appendChild(el("img", { src: im.src || IMG_PLACEHOLDER, alt: im.alt || "" }));
      });
      return el("section", { class: "b-gallery" }, [el("div", { class: "wrap" }, [grid])]);
    },
  },

  video: {
    label: "Video",
    icon: "▶",
    defaults: { url: "" },
    fields: [{ key: "url", type: "text", label: "YouTube / Vimeo / MP4 URL" }],
    render(p) {
      const src = embedUrl(p.url);
      const inner = src
        ? el("iframe", { src, allowfullscreen: "true", loading: "lazy", title: "video" })
        : el("div", { class: "video-empty", text: "Paste a video URL in the panel →" });
      return el("section", { class: "b-video" }, [el("div", { class: "wrap" }, [el("div", { class: "ratio" }, [inner])])]);
    },
  },

  divider: {
    label: "Divider",
    icon: "—",
    defaults: { thickness: 2, width: 100, color: "" },
    fields: [
      { key: "thickness", type: "number", label: "Thickness (px)", min: 1, max: 20 },
      { key: "width", type: "number", label: "Width (%)", min: 5, max: 100 },
      { key: "color", type: "color", label: "Color" },
    ],
    render(p) {
      return el("div", { class: "b-divider" }, [
        el("div", { class: "wrap" }, [
          el("hr", {
            class: "hr",
            style: {
              width: (p.width || 100) + "%",
              borderTopWidth: (p.thickness || 2) + "px",
              borderTopColor: p.color || "",
            },
          }),
        ]),
      ]);
    },
  },

  spacer: {
    label: "Spacer",
    icon: "↕",
    defaults: { height: 48 },
    fields: [{ key: "height", type: "number", label: "Height (px)", min: 4, max: 400 }],
    render(p) {
      return el("div", { class: "b-spacer", style: { height: (p.height || 48) + "px" } });
    },
  },

  footer: {
    label: "Footer",
    icon: "▬",
    defaults: { text: "© " + new Date().getFullYear() + " My Site · Made with fuckingsitebuilder", align: "center" },
    fields: [
      { key: "text", type: "text", label: "Text" },
      { key: "align", type: "align", label: "Align" },
    ],
    render(p) {
      const wrap = editable(el("div", { class: "wrap", text: p.text }), "text", "Footer text");
      return el("footer", { class: "b-footer", style: { textAlign: p.align || "center" } }, [wrap]);
    },
  },

  /* ---------------- navigation ---------------- */
  nav: {
    label: "Navigation",
    icon: "☰",
    defaults: {
      logo: "My Site",
      links: [
        { label: "Home", href: "#" },
        { label: "Features", href: "#" },
        { label: "Pricing", href: "#" },
      ],
      ctaLabel: "Get started",
      ctaHref: "#",
      bg: "",
      color: "",
    },
    fields: [
      { key: "logo", type: "text", label: "Logo / brand" },
      { key: "links", type: "list", label: "Links", itemLabel: "Link", itemFields: [
        { key: "label", type: "text", label: "Label" },
        { key: "href", type: "text", label: "URL" },
      ] },
      { key: "ctaLabel", type: "text", label: "Button label" },
      { key: "ctaHref", type: "text", label: "Button link" },
      { key: "bg", type: "color", label: "Background" },
      { key: "color", type: "color", label: "Text color" },
    ],
    render(p) {
      const inner = el("div", { class: "wrap nav-inner" }, [
        editable(el("div", { class: "nav-logo", text: p.logo }), "logo", "Brand"),
        el("div", { class: "nav-links" }, (p.links || []).map((l) => el("a", { href: l.href || "#", text: l.label }))),
      ]);
      if (p.ctaLabel) {
        const a = el("a", { class: "btn nav-cta", href: p.ctaHref || "#", text: p.ctaLabel });
        editable(a, "ctaLabel", "Button");
        inner.appendChild(a);
      }
      return el("nav", { class: "b-nav", style: { background: p.bg || "", color: p.color || "" } }, [inner]);
    },
  },

  /* ---------------- announcement banner ---------------- */
  banner: {
    label: "Announcement",
    icon: "◉",
    defaults: {
      text: "🎉 Free forever — no credit card required.",
      linkLabel: "Learn more",
      linkHref: "#",
      align: "center",
      bg: "#111827",
      color: "#ffffff",
    },
    fields: [
      { key: "text", type: "text", label: "Text" },
      { key: "linkLabel", type: "text", label: "Link label" },
      { key: "linkHref", type: "text", label: "Link URL" },
      { key: "align", type: "align", label: "Align" },
      { key: "bg", type: "color", label: "Background" },
      { key: "color", type: "color", label: "Text color" },
    ],
    render(p) {
      const justify = p.align === "left" ? "flex-start" : p.align === "right" ? "flex-end" : "center";
      const wrap = el("div", { class: "wrap", style: { justifyContent: justify } }, [
        editable(el("span", { text: p.text }), "text", "Announcement"),
      ]);
      if (p.linkLabel) {
        const a = el("a", { href: p.linkHref || "#", text: p.linkLabel });
        editable(a, "linkLabel", "Link");
        wrap.appendChild(a);
      }
      return el("div", { class: "b-banner", style: { background: p.bg || "", color: p.color || "" } }, [wrap]);
    },
  },

  /* ---------------- image + text ---------------- */
  split: {
    label: "Image + text",
    icon: "◧",
    defaults: {
      image: IMG_PLACEHOLDER,
      title: "A section that tells your story",
      text: "Pair a picture with a short paragraph. Tick “Image on the right” to flip it around.",
      buttonLabel: "Learn more",
      buttonHref: "#",
      reverse: false,
      bg: "",
    },
    fields: [
      { key: "image", type: "image", label: "Image" },
      { key: "title", type: "text", label: "Title" },
      { key: "text", type: "textarea", label: "Text" },
      { key: "buttonLabel", type: "text", label: "Button label" },
      { key: "buttonHref", type: "text", label: "Button link" },
      { key: "reverse", type: "toggle", label: "Image on the right" },
      { key: "bg", type: "color", label: "Background" },
    ],
    render(p) {
      const media = el("div", { class: "split-media" }, [el("img", { src: p.image || IMG_PLACEHOLDER, alt: "" })]);
      const body = el("div", { class: "split-body" }, [
        editable(el("h2", { text: p.title }), "title", "Title"),
        editable(el("p", { text: p.text }), "text", "Text"),
      ]);
      if (p.buttonLabel) {
        const a = el("a", { class: "btn", href: p.buttonHref || "#", text: p.buttonLabel });
        editable(a, "buttonLabel", "Button");
        body.appendChild(a);
      }
      const inner = el("div", { class: "wrap split-inner" + (p.reverse ? " reverse" : "") }, [media, body]);
      return el("section", { class: "b-split", style: { background: p.bg || "" } }, [inner]);
    },
  },

  /* ---------------- call to action ---------------- */
  cta: {
    label: "Call to action",
    icon: "⚑",
    defaults: {
      title: "Ready to get started?",
      text: "It only takes a minute — and it stays free.",
      buttonLabel: "Start now",
      buttonHref: "#",
      align: "center",
      bg: "",
      color: "#ffffff",
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "text", type: "textarea", label: "Text" },
      { key: "buttonLabel", type: "text", label: "Button label" },
      { key: "buttonHref", type: "text", label: "Button link" },
      { key: "align", type: "align", label: "Align" },
      { key: "bg", type: "color", label: "Background" },
      { key: "color", type: "color", label: "Text color" },
    ],
    render(p) {
      const wrap = el("div", { class: "wrap" }, [
        editable(el("h2", { text: p.title }), "title", "Title"),
        editable(el("p", { text: p.text }), "text", "Text"),
      ]);
      if (p.buttonLabel) {
        const a = el("a", { class: "btn", href: p.buttonHref || "#", text: p.buttonLabel });
        editable(a, "buttonLabel", "Button");
        wrap.appendChild(a);
      }
      return el("section", { class: "b-cta", style: { background: p.bg || "", color: p.color || "", textAlign: p.align || "center" } }, [wrap]);
    },
  },

  /* ---------------- feature list ---------------- */
  features: {
    label: "Feature list",
    icon: "✓",
    defaults: {
      title: "Everything you need",
      items: [
        { icon: "⚡", title: "Fast", text: "Instant preview as you type — no rebuilding." },
        { icon: "🎨", title: "Flexible", text: "Colors, fonts and layout are all editable." },
        { icon: "🚀", title: "Publish anywhere", text: "Export one HTML file and you're live." },
      ],
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "items", type: "list", label: "Items", itemLabel: "Feature", itemFields: [
        { key: "icon", type: "text", label: "Icon (emoji)" },
        { key: "title", type: "text", label: "Title" },
        { key: "text", type: "textarea", label: "Text" },
      ] },
    ],
    render(p) {
      const list = el("div", { class: "feat-list" }, (p.items || []).map((it) =>
        el("div", { class: "feat" }, [
          el("span", { class: "feat-ico", text: it.icon || "✓" }),
          el("div", {}, [el("h3", { text: it.title }), el("p", { text: it.text })]),
        ])
      ));
      const kids = [];
      if (p.title) kids.push(editable(el("h2", { class: "feat-title", text: p.title }), "title", "Title"));
      kids.push(list);
      return el("section", { class: "b-features" }, [el("div", { class: "wrap" }, kids)]);
    },
  },

  /* ---------------- steps ---------------- */
  steps: {
    label: "Steps",
    icon: "①",
    defaults: {
      title: "How it works",
      items: [
        { title: "Drag a block", text: "Pick from the panel on the left." },
        { title: "Type your content", text: "Click any text to edit it in place." },
        { title: "Export & publish", text: "Download your HTML and host it." },
      ],
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "items", type: "list", label: "Steps", itemLabel: "Step", itemFields: [
        { key: "title", type: "text", label: "Title" },
        { key: "text", type: "textarea", label: "Text" },
      ] },
    ],
    render(p) {
      const items = p.items || [];
      const cards = items.map((it, i) =>
        el("div", { class: "step" }, [
          el("span", { class: "step-n", text: String(i + 1) }),
          el("h3", { text: it.title }),
          el("p", { text: it.text }),
        ])
      );
      const cols = items.length >= 3 ? "cols-3" : "cols-2";
      const kids = [];
      if (p.title) kids.push(editable(el("h2", { class: "steps-title", text: p.title }), "title", "Title"));
      kids.push(el("div", { class: "grid " + cols }, cards));
      return el("section", { class: "b-steps" }, [el("div", { class: "wrap" }, kids)]);
    },
  },

  /* ---------------- stats ---------------- */
  stats: {
    label: "Stats",
    icon: "⌗",
    defaults: {
      items: [
        { value: "12k+", label: "Websites built" },
        { value: "100%", label: "Free forever" },
        { value: "0", label: "Lines of code needed" },
      ],
    },
    fields: [
      { key: "items", type: "list", label: "Stats", itemLabel: "Stat", itemFields: [
        { key: "value", type: "text", label: "Value" },
        { key: "label", type: "text", label: "Label" },
      ] },
    ],
    render(p) {
      const items = p.items || [];
      const cols = items.length >= 4 ? "cols-4" : items.length === 3 ? "cols-3" : "cols-2";
      const grid = el("div", { class: "grid " + cols }, items.map((it) =>
        el("div", { class: "stat" }, [
          el("div", { class: "stat-v", text: it.value }),
          el("div", { class: "stat-l", text: it.label }),
        ])
      ));
      return el("section", { class: "b-stats" }, [el("div", { class: "wrap" }, [grid])]);
    },
  },

  /* ---------------- pricing ---------------- */
  pricing: {
    label: "Pricing",
    icon: "$",
    defaults: {
      title: "Simple, honest pricing",
      items: [
        { name: "Starter", price: "$0", period: "/mo", features: ["1 website", "Drag & drop editor", "HTML export"], cta: "Start free", featured: false },
        { name: "Pro", price: "$12", period: "/mo", features: ["Unlimited websites", "Custom domains", "Priority support"], cta: "Choose Pro", featured: true },
        { name: "Team", price: "$29", period: "/mo", features: ["Everything in Pro", "5 seats", "Shared templates"], cta: "Choose Team", featured: false },
      ],
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "items", type: "list", label: "Plans", itemLabel: "Plan", itemFields: [
        { key: "name", type: "text", label: "Name" },
        { key: "price", type: "text", label: "Price" },
        { key: "period", type: "text", label: "Period" },
        { key: "features", type: "lines", label: "Features (one per line)" },
        { key: "cta", type: "text", label: "Button label" },
        { key: "featured", type: "toggle", label: "Highlight this plan" },
      ] },
    ],
    render(p) {
      const plans = (p.items || []).map((it) => {
        const card = el("div", { class: "price" + (it.featured ? " featured" : "") });
        if (it.featured) card.appendChild(el("span", { class: "price-badge", text: "Popular" }));
        card.appendChild(el("div", { class: "price-name", text: it.name }));
        card.appendChild(el("div", { class: "price-amt" }, [
          el("span", { text: it.price }),
          el("span", { class: "price-per", text: it.period }),
        ]));
        card.appendChild(el("ul", { class: "price-feats" }, (it.features || []).map((f) => el("li", { text: f }))));
        card.appendChild(el("a", { class: "btn", href: "#", text: it.cta || "Choose" }));
        return card;
      });
      const cols = plans.length >= 3 ? "cols-3" : "cols-2";
      return el("section", { class: "b-pricing" }, [
        el("div", { class: "wrap" }, [
          editable(el("h2", { class: "pricing-title", text: p.title }), "title", "Title"),
          el("div", { class: "grid " + cols }, plans),
        ]),
      ]);
    },
  },

  /* ---------------- testimonials ---------------- */
  testimonials: {
    label: "Testimonials",
    icon: "❝",
    defaults: {
      title: "What people say",
      items: [
        { quote: "I built my whole portfolio in an afternoon.", name: "Ada L.", role: "Designer" },
        { quote: "Finally a builder with no paywall at the end.", name: "Sam R.", role: "Founder" },
        { quote: "The export is clean, readable HTML.", name: "Priya K.", role: "Developer" },
      ],
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "items", type: "list", label: "Quotes", itemLabel: "Quote", itemFields: [
        { key: "quote", type: "textarea", label: "Quote" },
        { key: "name", type: "text", label: "Name" },
        { key: "role", type: "text", label: "Role" },
      ] },
    ],
    render(p) {
      const items = p.items || [];
      const cards = items.map((it) =>
        el("figure", { class: "quote-card" }, [
          el("blockquote", { text: "\u201C" + it.quote + "\u201D" }),
          el("figcaption", {}, [el("strong", { text: it.name }), el("span", { text: it.role })]),
        ])
      );
      const cols = items.length >= 3 ? "cols-3" : "cols-2";
      return el("section", { class: "b-testimonials" }, [
        el("div", { class: "wrap" }, [
          editable(el("h2", { class: "test-title", text: p.title }), "title", "Title"),
          el("div", { class: "grid " + cols }, cards),
        ]),
      ]);
    },
  },

  /* ---------------- team ---------------- */
  team: {
    label: "Team",
    icon: "☺",
    defaults: {
      title: "Meet the team",
      items: [
        { photo: IMG_PLACEHOLDER, name: "Alex Rivera", role: "Founder" },
        { photo: IMG_PLACEHOLDER, name: "Jamie Chen", role: "Design" },
        { photo: IMG_PLACEHOLDER, name: "Morgan Blake", role: "Engineering" },
      ],
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "items", type: "list", label: "People", itemLabel: "Person", itemFields: [
        { key: "photo", type: "image", label: "Photo" },
        { key: "name", type: "text", label: "Name" },
        { key: "role", type: "text", label: "Role" },
      ] },
    ],
    render(p) {
      const items = p.items || [];
      const cards = items.map((it) =>
        el("div", { class: "member" }, [
          el("img", { src: it.photo || IMG_PLACEHOLDER, alt: it.name || "" }),
          el("h3", { text: it.name }),
          el("p", { text: it.role }),
        ])
      );
      const cols = items.length >= 3 ? "cols-3" : "cols-2";
      return el("section", { class: "b-team" }, [
        el("div", { class: "wrap" }, [
          editable(el("h2", { class: "team-title", text: p.title }), "title", "Title"),
          el("div", { class: "grid " + cols }, cards),
        ]),
      ]);
    },
  },

  /* ---------------- FAQ ---------------- */
  faq: {
    label: "FAQ",
    icon: "?",
    defaults: {
      title: "Frequently asked questions",
      items: [
        { q: "Is it really free?", a: "Yes — there is no account, no subscription and no paywall." },
        { q: "Can I use my own domain?", a: "Export the HTML file and host it wherever you like." },
        { q: "Do I need to write code?", a: "Not at all. Just drag, drop and type." },
      ],
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "items", type: "list", label: "Questions", itemLabel: "Question", itemFields: [
        { key: "q", type: "text", label: "Question" },
        { key: "a", type: "textarea", label: "Answer" },
      ] },
    ],
    render(p) {
      const list = el("div", { class: "faq-list" }, (p.items || []).map((it) =>
        el("details", { class: "faq" }, [
          el("summary", { text: it.q }),
          el("div", { class: "faq-a", text: it.a }),
        ])
      ));
      return el("section", { class: "b-faq" }, [
        el("div", { class: "wrap" }, [
          editable(el("h2", { class: "faq-title", text: p.title }), "title", "Title"),
          list,
        ]),
      ]);
    },
  },

  /* ---------------- pull quote ---------------- */
  quote: {
    label: "Pull quote",
    icon: "❞",
    defaults: {
      text: "Design is not just what it looks like. Design is how it works.",
      cite: "— Steve Jobs",
      align: "center",
    },
    fields: [
      { key: "text", type: "textarea", label: "Quote" },
      { key: "cite", type: "text", label: "Attribution" },
      { key: "align", type: "align", label: "Align" },
    ],
    render(p) {
      return el("figure", { class: "b-quote", style: { textAlign: p.align || "center" } }, [
        el("div", { class: "wrap" }, [
          editable(el("blockquote", { text: p.text }), "text", "Quote"),
          editable(el("figcaption", { text: p.cite }), "cite", "— Name"),
        ]),
      ]);
    },
  },

  /* ---------------- social links ---------------- */
  social: {
    label: "Social links",
    icon: "❖",
    defaults: {
      align: "center",
      items: [
        { label: "Twitter", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "LinkedIn", href: "#" },
      ],
    },
    fields: [
      { key: "align", type: "align", label: "Align" },
      { key: "items", type: "list", label: "Links", itemLabel: "Link", itemFields: [
        { key: "label", type: "text", label: "Label" },
        { key: "href", type: "text", label: "URL" },
      ] },
    ],
    render(p) {
      const justify = p.align === "left" ? "flex-start" : p.align === "right" ? "flex-end" : "center";
      const row = el("div", { class: "social-row", style: { justifyContent: justify } },
        (p.items || []).map((it) => el("a", { href: it.href || "#", text: it.label })));
      return el("div", { class: "b-social" }, [el("div", { class: "wrap" }, [row])]);
    },
  },

  /* ---------------- contact form ---------------- */
  form: {
    label: "Contact form",
    icon: "✉",
    defaults: {
      title: "Get in touch",
      buttonLabel: "Send message",
      action: "",
      note: "Paste a form endpoint (e.g. Formspree) in the panel to receive submissions.",
    },
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "buttonLabel", type: "text", label: "Button label" },
      { key: "action", type: "text", label: "Form action URL", placeholder: "https://formspree.io/f/…" },
      { key: "note", type: "text", label: "Note under the form" },
    ],
    render(p) {
      const f = el("form", { class: "cform", method: "post" });
      if (p.action) f.setAttribute("action", p.action);
      f.appendChild(el("input", { type: "text", placeholder: "Your name", name: "name" }));
      f.appendChild(el("input", { type: "email", placeholder: "Your email", name: "email" }));
      f.appendChild(el("textarea", { placeholder: "Your message", name: "message" }));
      f.appendChild(el("button", { class: "btn", type: p.action ? "submit" : "button", text: p.buttonLabel || "Send" }));
      const box = el("div", { class: "form-box" }, [
        editable(el("h2", { class: "form-title", text: p.title }), "title", "Title"),
        f,
      ]);
      if (p.note) box.appendChild(el("p", { class: "form-note", text: p.note }));
      return el("section", { class: "b-form" }, [el("div", { class: "wrap" }, [box])]);
    },
  },

  /* ---------------- map ---------------- */
  map: {
    label: "Map",
    icon: "◎",
    defaults: { query: "Eiffel Tower, Paris" },
    fields: [{ key: "query", type: "text", label: "Place to show", placeholder: "City, address or landmark" }],
    render(p) {
      const q = (p.query || "").trim();
      const inner = q
        ? el("iframe", { src: "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed", loading: "lazy", title: "map" })
        : el("div", { class: "map-empty", text: "Enter a place name in the panel →" });
      return el("section", { class: "b-map" }, [el("div", { class: "wrap" }, [el("div", { class: "map-frame" }, [inner])])]);
    },
  },

  /* ---------------- button group ---------------- */
  buttons: {
    label: "Button group",
    icon: "⇉",
    defaults: {
      align: "center",
      items: [
        { label: "Get started", href: "#", variant: "solid" },
        { label: "Learn more", href: "#", variant: "outline" },
      ],
    },
    fields: [
      { key: "align", type: "align", label: "Align" },
      { key: "items", type: "list", label: "Buttons", itemLabel: "Button", itemFields: [
        { key: "label", type: "text", label: "Label" },
        { key: "href", type: "text", label: "URL" },
        { key: "variant", type: "select", label: "Style", options: ["solid", "outline"] },
      ] },
    ],
    render(p) {
      const justify = p.align === "left" ? "flex-start" : p.align === "right" ? "flex-end" : "center";
      const group = el("div", { class: "btn-group", style: { justifyContent: justify } },
        (p.items || []).map((it) => el("a", {
          class: "btn" + (it.variant === "outline" ? " outline" : ""),
          href: it.href || "#",
          text: it.label,
        })));
      return el("div", { class: "b-buttons" }, [el("div", { class: "wrap" }, [group])]);
    },
  },

  /* ---------------- custom HTML ---------------- */
  html: {
    label: "Custom HTML",
    icon: "<>",
    defaults: {
      code: "<div style='padding:20px;border:2px dashed #888;border-radius:12px;text-align:center'>Paste any HTML in the panel →</div>",
    },
    fields: [{ key: "code", type: "html", label: "HTML" }],
    render(p) {
      const box = el("div", { class: "html-box" });
      box.innerHTML = p.code || "";
      return el("section", { class: "b-html" }, [el("div", { class: "wrap" }, [box])]);
    },
  },
};

const PALETTE = [
  { group: "Basics", items: ["heading", "text", "button", "buttons", "image", "quote", "divider", "spacer"] },
  { group: "Sections", items: ["nav", "banner", "hero", "split", "cta", "features", "steps", "stats"] },
  { group: "Showcase", items: ["cards", "pricing", "testimonials", "team", "gallery", "video", "faq", "social"] },
  { group: "Utility", items: ["form", "map", "html", "footer"] },
];

/* ============================================================
   4. STATE
   ============================================================ */
const STORAGE_KEY = "fuckingsitebuilder.project.v1";

function defaultDoc() {
  const mk = (type, over) => ({ id: uid(), type, props: Object.assign(clone(BLOCKS[type].defaults), over || {}) });
  return {
    theme: clone(THEME_DEFAULT),
    blocks: [
      mk("nav"),
      mk("hero"),
      mk("heading", { text: "Why fuckingsitebuilder", align: "center" }),
      mk("text", { text: "A genuinely free website builder that runs entirely in your browser. No accounts, no paywalls — just drag blocks, type your words, and export a clean HTML file.", align: "center" }),
      mk("cards"),
      mk("image", { caption: "Swap this for your own photo" }),
      mk("button", { label: "Start building", align: "center" }),
      mk("divider", { width: 50 }),
      mk("footer"),
    ],
  };
}

let doc = load() || defaultDoc();
const ui = { selected: null, preview: false, device: "desktop" };

let undoStack = [];
let redoStack = [];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.blocks)) return null;
    parsed.theme = Object.assign(clone(THEME_DEFAULT), parsed.theme || {});
    return parsed;
  } catch (e) {
    return null;
  }
}

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      flashStatus("Saved");
    } catch (e) {
      flashStatus("Storage full", "#fca5a5");
    }
  }, 350);
}

function flashStatus(msg, color) {
  const s = $("#status");
  s.textContent = msg;
  s.style.color = color || "#6ee7b7";
  s.style.opacity = 1;
  clearTimeout(flashStatus._t);
  flashStatus._t = setTimeout(() => (s.style.opacity = 0), 1400);
}

/* ---------------- history ---------------- */
function beginChange() {
  undoStack.push(JSON.stringify(doc));
  if (undoStack.length > 120) undoStack.shift();
  redoStack = [];
  updateToolbar();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(JSON.stringify(doc));
  doc = JSON.parse(undoStack.pop());
  ensureSelectionValid();
  renderApp();
  save();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(JSON.stringify(doc));
  doc = JSON.parse(redoStack.pop());
  ensureSelectionValid();
  renderApp();
  save();
}
function ensureSelectionValid() {
  if (!doc.blocks.some((b) => b.id === ui.selected)) ui.selected = null;
}
function updateToolbar() {
  $("#btnUndo").disabled = undoStack.length === 0;
  $("#btnRedo").disabled = redoStack.length === 0;
}

/* ============================================================
   5. RENDERING
   ============================================================ */
function applyThemeTo(page) {
  const t = doc.theme;
  page.style.setProperty("--sf-bg", t.bg);
  page.style.setProperty("--sf-text", t.text);
  page.style.setProperty("--sf-accent", t.accent);
  page.style.setProperty("--sf-font", t.font);
  page.style.setProperty("--sf-max", (t.max || 1080) + "px");
}

function renderApp() {
  renderCanvas();
  renderInspector();
  updateToolbar();
}

function renderCanvas() {
  const host = $("#canvasHost");
  const canvas = $("#canvas");
  const sx = host.scrollLeft, sy = host.scrollTop;

  canvas.className = "device-" + ui.device + (ui.preview ? " preview" : "");
  canvas.innerHTML = "";

  const page = el("div", { class: "page" });
  applyThemeTo(page);

  if (!doc.blocks.length) {
    page.appendChild(el("div", { class: "empty-page", text: "Your page is empty — drag a block from the left to begin." }));
  }

  doc.blocks.forEach((b, index) => page.appendChild(blockWrap(b, index)));
  canvas.appendChild(page);

  host.scrollLeft = sx;
  host.scrollTop = sy;
}

function blockWrap(b, index) {
  const def = BLOCKS[b.type];
  const wrap = el("div", {
    class: "blk-wrap" + (ui.selected === b.id ? " selected" : ""),
    dataset: { id: b.id, type: b.type, index: String(index) },
    draggable: "true",
  });

  wrap.appendChild(def.render(b.props));

  const bar = el("div", { class: "blk-bar" }, [
    el("span", { class: "blk-name", text: def.label, title: "Drag to reorder" }),
    el("button", { class: "blk-act", title: "Move up", onclick: (e) => { e.stopPropagation(); moveBy(b.id, -1); } }, "↑"),
    el("button", { class: "blk-act", title: "Move down", onclick: (e) => { e.stopPropagation(); moveBy(b.id, 1); } }, "↓"),
    el("button", { class: "blk-act", title: "Duplicate", onclick: (e) => { e.stopPropagation(); duplicateBlock(b.id); } }, "⧉"),
    el("button", { class: "blk-act danger", title: "Delete", onclick: (e) => { e.stopPropagation(); deleteBlock(b.id); } }, "✕"),
  ]);
  wrap.appendChild(bar);

  // selection (never rebuilds the canvas, so the text caret survives)
  wrap.addEventListener("mousedown", (e) => {
    if (ui.preview) return;
    if (e.target.closest(".blk-bar")) return;
    select(b.id);
  });

  // dragging: only armed when the grab handle was pressed
  const handle = bar.firstChild;
  handle.addEventListener("mousedown", () => (wrap.dataset.handle = "1"));
  wrap.addEventListener("dragstart", (e) => {
    if (ui.preview || !wrap.dataset.handle) { e.preventDefault(); return; }
    dragData = { kind: "move", id: b.id };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "move");
  });
  wrap.addEventListener("dragend", () => {
    delete wrap.dataset.handle;
    dragData = null;
    clearDropMarks();
  });

  return wrap;
}

function select(id) {
  if (ui.selected === id) return;
  ui.selected = id;
  updateSelectionClasses();
  renderInspector();
}

function updateSelectionClasses() {
  $$("#canvas .blk-wrap").forEach((w) => w.classList.toggle("selected", w.dataset.id === ui.selected));
}

/* ---------------- palette ---------------- */
function renderPalette() {
  const box = $("#palette");
  box.innerHTML = "";
  PALETTE.forEach((grp) => {
    box.appendChild(el("h4", { text: grp.group }));
    grp.items.forEach((type) => {
      const def = BLOCKS[type];
      const item = el("div", {
        class: "pal-item",
        dataset: { type },
        draggable: "true",
        onclick: () => addBlock(type),
      }, [el("span", { class: "pal-ico", text: def.icon }), el("span", { text: def.label })]);

      item.addEventListener("dragstart", (e) => {
        dragData = { kind: "new", type };
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", type);
      });
      item.addEventListener("dragend", () => { dragData = null; clearDropMarks(); });
      box.appendChild(item);
    });
  });
  box.appendChild(
    el("p", {
      class: "pal-hint",
      text: "Drag a block onto the page, or click to add it after the selected block. Click any block to edit its text and settings.",
    })
  );
}

/* ---------------- inspector ---------------- */
function renderInspector() {
  const panel = $("#inspector");
  panel.innerHTML = "";
  const blk = doc.blocks.find((b) => b.id === ui.selected);
  if (!blk) { panel.appendChild(pageSettingsPanel()); return; }

  const def = BLOCKS[blk.type];
  panel.appendChild(el("div", { class: "insp-title" }, [el("span", { text: def.label + " block" })]));

  def.fields.forEach((f) => {
    panel.appendChild(buildField(f, blk.props[f.key], (val, rerender) => {
      beginChange();
      blk.props[f.key] = val;
      renderCanvas();
      if (rerender) renderInspector();
      save();
    }));
  });

  panel.appendChild(el("div", { class: "divider" }));
  panel.appendChild(
    el("div", { class: "list-head", style: { marginBottom: "8px" } }, [el("span", { text: "Block actions" })])
  );
  const row = el("div", { class: "seg" }, [
    el("button", { class: "seg-btn", onclick: () => moveBy(blk.id, -1) }, "↑ Up"),
    el("button", { class: "seg-btn", onclick: () => moveBy(blk.id, 1) }, "↓ Down"),
    el("button", { class: "seg-btn", onclick: () => duplicateBlock(blk.id) }, "Duplicate"),
    el("button", { class: "seg-btn", style: { color: "#fca5a5" }, onclick: () => deleteBlock(blk.id) }, "Delete"),
  ]);
  panel.appendChild(row);
}

function pageSettingsPanel() {
  const panel = el("div");
  panel.appendChild(el("div", { class: "insp-title" }, [el("span", { text: "Page settings" })]));

  const setTheme = (key, val) => {
    beginChange();
    doc.theme[key] = val;
    renderCanvas();
    save();
  };

  panel.appendChild(buildField({ key: "title", type: "text", label: "Browser tab title" }, doc.theme.title, (v) => setTheme("title", v)));
  panel.appendChild(buildField({ key: "accent", type: "color", label: "Accent / brand color" }, doc.theme.accent, (v) => setTheme("accent", v || THEME_DEFAULT.accent)));
  panel.appendChild(buildField({ key: "bg", type: "color", label: "Page background" }, doc.theme.bg, (v) => setTheme("bg", v || "#ffffff")));
  panel.appendChild(buildField({ key: "text", type: "color", label: "Body text color" }, doc.theme.text, (v) => setTheme("text", v || "#111827")));

  const fontField = buildField({ key: "font", type: "select", label: "Font", options: FONTS.map((f) => f.value) }, doc.theme.font, (v) => setTheme("font", v));
  panel.appendChild(fontField);

  panel.appendChild(buildField({ key: "max", type: "number", label: "Content width (px)", min: 600, max: 1600 }, doc.theme.max, (v) => setTheme("max", v || 1080)));

  panel.appendChild(el("div", { class: "divider" }));
  panel.appendChild(el("p", { class: "insp-note", text: "Tip: click any block on the page to edit its own settings. Nothing here is required — the defaults look good already." }));
  return panel;
}

/* ---------------- field controls ---------------- */
function buildField(f, value, onChange) {
  const row = el("div", { class: "field" });
  if (f.type !== "color" && f.type !== "toggle")
    row.appendChild(el("label", { class: "field-label", text: f.label || f.key }));
  // Let callers override whether the inspector should rebuild.
  // Value edits keep it false (so the focused input survives); only
  // structural changes like adding/removing list items set it true.
  const change = (v, rerender) => onChange(v, rerender === undefined ? f.type === "list" : rerender);

  switch (f.type) {
    case "textarea": {
      const t = el("textarea", { class: "input", rows: 3 });
      t.value = value ?? "";
      t.oninput = () => change(t.value);
      row.appendChild(t);
      break;
    }
    case "number": {
      const n = el("input", { class: "input", type: "number", min: f.min, max: f.max, placeholder: f.placeholder || "" });
      n.value = value ?? "";
      n.oninput = () => change(n.value === "" ? "" : Number(n.value));
      row.appendChild(n);
      break;
    }
    case "color": {
      const wrapRow = el("div", { class: "color-row" }, [
        el("label", { class: "field-label", text: f.label || f.key, style: { flex: "1", margin: "0" } }),
        el("button", { class: "mini", title: "Clear", onclick: () => change("") }, "×"),
        el("input", { class: "color", type: "color", value: value || "#000000", oninput: (e) => change(e.target.value) }),
      ]);
      row.appendChild(wrapRow);
      break;
    }
    case "select": {
      const s = el("select", { class: "input" }, f.options.map((o) => el("option", { value: o, text: labelForOption(f, o) })));
      s.value = value ?? f.options[0];
      s.onchange = () => change(s.value);
      row.appendChild(s);
      break;
    }
    case "align": {
      const seg = el("div", { class: "seg" });
      ["left", "center", "right"].forEach((a) => {
        const btn = el("button", { class: "seg-btn" + ((value || "left") === a ? " on" : "") }, a[0].toUpperCase() + a.slice(1));
        btn.onclick = () => {
          Array.from(seg.children).forEach((c) => c.classList.remove("on"));
          btn.classList.add("on");
          change(a);
        };
        seg.appendChild(btn);
      });
      row.appendChild(seg);
      break;
    }
    case "image": {
      const wrapRow = el("div", { class: "imgrow" }, [
        el("input", { class: "input", type: "text", value: value || "", placeholder: "Image URL", oninput: (e) => change(e.target.value) }),
        el("button", { class: "mini", title: "Upload an image", onclick: () => pickImage((dataUrl) => { change(dataUrl); }) }, "Upload"),
      ]);
      row.appendChild(wrapRow);
      break;
    }
    case "list":
      row.appendChild(buildListField(f, value, change));
      break;
    case "lines": {
      const t = el("textarea", { class: "input", rows: 4 });
      t.value = (value || []).join("\n");
      t.oninput = () =>
        change(t.value.split("\n").map((s) => s.trim()).filter((s) => s.length));
      row.appendChild(t);
      break;
    }
    case "toggle": {
      const id = "tg_" + uid();
      const cb = el("input", { type: "checkbox", id });
      cb.checked = !!value;
      cb.onchange = () => change(cb.checked);
      row.appendChild(el("label", { class: "toggle", for: id }, [cb, el("span", { text: f.label || f.key })]));
      break;
    }
    case "html": {
      const t = el("textarea", { class: "input code", rows: 7, spellcheck: "false" });
      t.value = value ?? "";
      t.oninput = () => change(t.value);
      row.appendChild(t);
      break;
    }
    default: {
      const t = el("input", { class: "input", type: "text", value: value ?? "", placeholder: f.placeholder || "" });
      t.oninput = () => change(t.value);
      row.appendChild(t);
    }
  }
  return row;
}

function labelForOption(f, o) {
  if (f.key === "font") {
    const m = FONTS.find((x) => x.value === o);
    if (m) return m.label;
  }
  if (f.key === "variant") return o.charAt(0).toUpperCase() + o.slice(1);
  return o;
}

function buildListField(f, value, change) {
  const list = Array.isArray(value) ? value : [];
  const box = el("div");

  list.forEach((item, i) => {
    const card = el("div", { class: "list-item" });
    card.appendChild(
      el("div", { class: "list-head" }, [
        el("span", { text: (f.itemLabel || "Item") + " " + (i + 1) }),
        el("button", { class: "mini", title: "Remove", onclick: () => { const nv = clone(list); nv.splice(i, 1); change(nv); } }, "✕"),
      ])
    );
    f.itemFields.forEach((sub) => {
      card.appendChild(
        buildField(sub, item[sub.key], (v, rerender) => {
          const nv = clone(list);
          nv[i] = Object.assign({}, nv[i], { [sub.key]: v });
          change(nv, rerender); // false while typing → the input keeps focus
        })
      );
    });
    box.appendChild(card);
  });

  box.appendChild(
    el("button", {
      class: "mini add",
      onclick: () => {
        const nv = clone(list);
        const item = {};
        f.itemFields.forEach((s) => (item[s.key] = ""));
        nv.push(item);
        change(nv);
      },
    }, "+ Add")
  );
  return box;
}

/* ---------------- image upload (resized, so storage stays small) ---------------- */
function pickImage(cb) {
  const input = el("input", { type: "file", accept: "image/*" });
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    resizeImage(file, 1400, 0.82).then(cb).catch(() => flashStatus("Couldn't read image", "#fca5a5"));
  };
  input.click();
}

function resizeImage(file, max, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        const scale = Math.min(1, max / Math.max(w, h));
        w = Math.round(w * scale); h = Math.round(h * scale);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   6. BLOCK OPERATIONS
   ============================================================ */
function addBlock(type, index) {
  beginChange();
  const b = { id: uid(), type, props: clone(BLOCKS[type].defaults) };
  if (index == null) {
    const sel = doc.blocks.findIndex((x) => x.id === ui.selected);
    index = sel >= 0 ? sel + 1 : doc.blocks.length;
  }
  doc.blocks.splice(index, 0, b);
  ui.selected = b.id;
  renderApp();
  save();
}

function moveBy(id, dir) {
  const i = doc.blocks.findIndex((b) => b.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= doc.blocks.length) return;
  beginChange();
  const [b] = doc.blocks.splice(i, 1);
  doc.blocks.splice(j, 0, b);
  renderApp();
  save();
}

function moveBlock(id, index) {
  const from = doc.blocks.findIndex((b) => b.id === id);
  if (from < 0) return;
  beginChange();
  const [b] = doc.blocks.splice(from, 1);
  if (index > from) index--;
  index = Math.max(0, Math.min(index, doc.blocks.length));
  doc.blocks.splice(index, 0, b);
  ui.selected = id;
  renderApp();
  save();
}

function duplicateBlock(id) {
  const i = doc.blocks.findIndex((b) => b.id === id);
  if (i < 0) return;
  beginChange();
  const copy = clone(doc.blocks[i]);
  copy.id = uid();
  doc.blocks.splice(i + 1, 0, copy);
  ui.selected = copy.id;
  renderApp();
  save();
}

function deleteBlock(id) {
  const i = doc.blocks.findIndex((b) => b.id === id);
  if (i < 0) return;
  beginChange();
  doc.blocks.splice(i, 1);
  ui.selected = null;
  renderApp();
  save();
}

/* ---------------- drag & drop reordering ---------------- */
let dragData = null;

function clearDropMarks() {
  $$("#canvas .blk-wrap").forEach((w) => w.classList.remove("drop-above", "drop-below"));
}

function dropIndex(e) {
  const wraps = $$("#canvas .blk-wrap");
  for (let i = 0; i < wraps.length; i++) {
    const r = wraps[i].getBoundingClientRect();
    if (e.clientY < r.top + r.height / 2) return i;
  }
  return wraps.length;
}

function showDropMark(index) {
  clearDropMarks();
  const wraps = $$("#canvas .blk-wrap");
  if (!wraps.length) return;
  if (index < wraps.length) wraps[index].classList.add("drop-above");
  else wraps[wraps.length - 1].classList.add("drop-below");
}

function wireCanvasDnD() {
  const canvas = $("#canvas");
  canvas.addEventListener("dragover", (e) => {
    if (!dragData) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = dragData.kind === "new" ? "copy" : "move";
    showDropMark(dropIndex(e));
  });
  canvas.addEventListener("dragleave", (e) => {
    if (e.target === canvas) clearDropMarks();
  });
  canvas.addEventListener("drop", (e) => {
    if (!dragData) return;
    e.preventDefault();
    const idx = dropIndex(e);
    const data = dragData;
    dragData = null;
    clearDropMarks();
    if (data.kind === "new") addBlock(data.type, idx);
    else moveBlock(data.id, idx);
  });
}

/* ============================================================
   7. INLINE EDITING & GLOBAL EVENTS
   ============================================================ */
function wireEditing() {
  const canvas = $("#canvas");

  // one undo snapshot per focus session
  document.addEventListener("focusin", (e) => {
    if (e.target.closest("#inspector") || e.target.closest("#canvas")) beginChange();
  });

  canvas.addEventListener("input", (e) => {
    const node = e.target.closest("[data-field]");
    if (!node) return;
    const wrap = node.closest(".blk-wrap");
    if (!wrap) return;
    const blk = doc.blocks.find((b) => b.id === wrap.dataset.id);
    if (!blk) return;
    blk.props[node.dataset.field] = node.textContent;
    save();
  });

  canvas.addEventListener("click", (e) => {
    if (!ui.preview) {
      const a = e.target.closest("a");
      if (a) e.preventDefault();
      return;
    }
  });

  // don't let the contact form navigate away while editing
  canvas.addEventListener("submit", (e) => {
    if (!ui.preview) e.preventDefault();
  });

  canvas.addEventListener("mousedown", (e) => {
    if (ui.preview) return;
    if (e.target === canvas || e.target.id === "page" || e.target.classList.contains("page")) {
      ui.selected = null;
      updateSelectionClasses();
      renderInspector();
    }
  });
}

/* ============================================================
   8. EXPORT
   ============================================================ */
function buildExportHTML() {
  EDITING = false;
  const page = el("div", { class: "page" });
  applyThemeTo(page);
  doc.blocks.forEach((b) => page.appendChild(BLOCKS[b.type].render(b.props)));

  page.querySelectorAll("[contenteditable]").forEach((n) => n.removeAttribute("contenteditable"));
  page.querySelectorAll("[data-field]").forEach((n) => n.removeAttribute("data-field"));
  page.querySelectorAll("[data-ph]").forEach((n) => n.removeAttribute("data-ph"));
  page.querySelectorAll("[draggable]").forEach((n) => n.removeAttribute("draggable"));

  EDITING = true;

  const title = doc.theme.title || "My Site";
  return (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n" +
    "<meta charset=\"utf-8\" />\n" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" +
    "<title>" + escapeText(title) + "</title>\n" +
    "<style>\n" + SITE_CSS + "\nhtml,body{margin:0;padding:0;}\n" + "</style>\n" +
    "</head>\n<body>\n" + page.outerHTML + "\n</body>\n</html>\n"
  );
}

function escapeText(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function download(filename, text, type) {
  const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function slug(s) {
  return (s || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "site";
}

/* ============================================================
   9. TOOLBAR / INIT
   ============================================================ */
function setDevice(device) {
  ui.device = device;
  $$("#deviceGrp .tbtn").forEach((b) => b.classList.toggle("on", b.dataset.device === device));
  const canvas = $("#canvas");
  canvas.className = "device-" + device + (ui.preview ? " preview" : "");
}

function togglePreview() {
  ui.preview = !ui.preview;
  EDITING = !ui.preview;
  document.body.classList.toggle("preview", ui.preview);
  $("#btnPreview").classList.toggle("on", ui.preview);
  if (ui.preview) { ui.selected = null; }
  renderApp();
}

function newSite() {
  if (!confirm("Start a new site? Your current design will be replaced (Undo can bring it back).")) return;
  beginChange();
  doc = defaultDoc();
  ui.selected = null;
  renderApp();
  save();
  flashStatus("New site");
}

function importJSON() {
  const file = $("#fileImport").files && $("#fileImport").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.blocks)) throw new Error("bad file");
      beginChange();
      parsed.theme = Object.assign(clone(THEME_DEFAULT), parsed.theme || {});
      doc = parsed;
      ui.selected = null;
      renderApp();
      save();
      flashStatus("Project loaded");
    } catch (err) {
      flashStatus("Invalid project file", "#fca5a5");
    }
    $("#fileImport").value = "";
  };
  reader.readAsText(file);
}

function wireToolbar() {
  $("#btnUndo").onclick = undo;
  $("#btnRedo").onclick = redo;
  $("#btnPreview").onclick = togglePreview;
  $("#btnNew").onclick = newSite;
  $("#btnPage").onclick = () => { ui.selected = null; updateSelectionClasses(); renderInspector(); };
  $("#btnExportHtml").onclick = () => {
    download(slug(doc.theme.title) + ".html", buildExportHTML(), "text/html;charset=utf-8");
    flashStatus("Exported HTML");
  };
  $("#btnExportJson").onclick = () => {
    download(slug(doc.theme.title) + ".fuckingsitebuilder.json", JSON.stringify(doc, null, 2), "application/json");
    flashStatus("Saved project file");
  };
  $("#btnImport").onclick = () => $("#fileImport").click();
  $("#fileImport").onchange = importJSON;

  $$("#deviceGrp .tbtn").forEach((b) => (b.onclick = () => setDevice(b.dataset.device)));

  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const editing = document.activeElement && document.activeElement.isContentEditable;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      download(slug(doc.theme.title) + ".html", buildExportHTML(), "text/html;charset=utf-8");
    } else if (e.key === "Escape") {
      if (ui.preview) togglePreview();
      else { ui.selected = null; updateSelectionClasses(); renderInspector(); }
    } else if (e.key === "Delete" && ui.selected && !editing) {
      e.preventDefault();
      deleteBlock(ui.selected);
    } else if (mod && e.key.toLowerCase() === "d" && ui.selected) {
      e.preventDefault();
      duplicateBlock(ui.selected);
    }
  });
}

function init() {
  const style = el("style", { id: "site-css" });
  style.textContent = SITE_CSS;
  document.head.appendChild(style);

  renderPalette();
  wireToolbar();
  wireCanvasDnD();
  wireEditing();
  setDevice("desktop");
  renderApp();
  updateToolbar();
}

init();
