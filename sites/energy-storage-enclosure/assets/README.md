# energy-storage-enclosure assets

Homepage fullscreen hero references (in `content/*/pages/index.json`):

- `/assets/hero-energy-poster.jpg` — **committed** here (minimal valid placeholder; replace with a real still before launch if desired).
- `/assets/hero-energy-video.mp4` — **not committed** on purpose (no fake binaries). Add a short, muted, loop‑friendly landscape MP4 under this folder with that exact name when you want true video playback.

**If the MP4 is missing** (404 on Cloudflare Pages): the theme still renders the hero with **`hero-energy-poster.jpg`** as the full‑bleed background (native `<video poster>` first, then static fill after load error). Deploy is not a blank hero as long as this JPG is present.

**Do not** commit an invalid placeholder MP4 — use a real encoded file for staging/production video.
