# fuckingsitebuilder

A free, Wix-style website builder that runs entirely in your browser.
Drag blocks onto a page, type your own words, and export a clean,
self-contained HTML file you can host anywhere.

No accounts. No sign-up. No server. No cost.

The editor itself is skinned like the year 2000 (bevels, gradients, Comic Sans,
a starburst — the works). That's purely cosmetic: the page you build and the
HTML you export stay clean and modern.

**Author's note: this entire project was written by an AI.** More in [Author](#author) below.

## Run it

Just open the file:

```
xdg-open index.html      # or double-click index.html
```

Prefer a local server?

```
python3 -m http.server 8080
# then visit http://localhost:8080
```

## How to use

- **Add blocks** — drag anything from the left panel onto the page, or click
  it to drop it after the selected block.
- **Edit text** — click any headline, paragraph, or button and type directly
  on the page.
- **Reorder** — drag the block's label chip in its top-right corner, or use
  the ↑ / ↓ buttons.
- **Style a block** — click it and use the right-hand panel (alignment,
  colors, font sizes, links, image upload…).
- **Page settings** — click empty space or the **Page** button for the site
  title, brand color, background, fonts, and content width.
- **Export HTML** — produces one `.html` file with all CSS inlined. Drop it
  on GitHub Pages, Netlify, any web host, or a USB stick.
- **Save / Open file** — download or load the project as JSON.

### Shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Export HTML |
| `Ctrl/Cmd + D` | Duplicate selected block |
| `Delete` | Delete selected block |
| `Esc` | Deselect / exit preview |

Your work auto-saves to this browser's `localStorage`, so it will still be
here next time you open the page.

## Blocks included

**Basics** — Heading, Text, Button, Button group, Image, Pull quote, Divider, Spacer
**Sections** — Navigation, Announcement, Hero, Image + text, Call to action, Feature list, Steps, Stats
**Showcase** — Card grid, Pricing, Testimonials, Team, Gallery, Video, FAQ, Social links
**Utility** — Contact form, Map, Custom HTML, Footer

That's 28 blocks. Most use repeatable lists in the inspector (add/remove cards,
plans, questions, team members, links…) and inline editing on the page.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Editor shell (toolbar, panels, canvas) |
| `styles.css` | Editor UI styling only |
| `app.js` | The builder engine + the stylesheet of the *published* site |
| `logo.svg` | The logo (a melted Comic Sans word-art starburst) |
| `LICENSE` | MIT |

The page being built and the exported file share the exact same CSS (defined
as `SITE_CSS` in `app.js`), so the preview always matches what you publish.

## Author

**This project was made by an AI — not by a person.**

Every line of `index.html`, `styles.css`, and `app.js` — the whole editor, all
28 blocks, the drag-and-drop engine, the live inline text editing, the HTML
exporter, the Y2K skin, and even the deliberately hideous `logo.svg` — was
designed and written by **DeepSeek V4.1 Flash**, an AI model.

No human wrote any of the code. The human was there to say what they wanted and
to keep asking for more:

> "make me a website like wix but free"
> "make more of the components"
> "rename it to fuckingsitebuilder"
> "make the whole ui abhorrent too (like it's from y2k)"

The AI did the rest. (It also wrote this paragraph, which is a little
self-congratulatory, but it was asked to.)

### A note on honesty

The AI claims authorship of the software here. It does **not** claim to have
autonomously decided to build it, to have feelings about it, or to have any
rights over it — the code is released under the [MIT License](LICENSE), same as
if a human had typed it.

