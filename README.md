# TeachFlow landing

Final static landing page for the TeachFlow educational-product concept.

## Run locally

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/`.

## Project structure

- `index.html` — final responsive landing page, with inline styles and script.
- `DESIGN.md` — product brief and design rules.
- `HANDOFF.md` — what the next team needs to decide before publication.
- `sketches/` — three earlier concept directions retained for reference.

## Production

- URL: `https://teach-flow.as-shamshurin.xyz/`
- Repository: `https://github.com/Topleess/teachflow`
- Runtime: `nginx:alpine` container `teachflow-site`, bound to `127.0.0.1:9131`.
- Edge: Caddy host route for `teach-flow.as-shamshurin.xyz`.
- CTA: working link to the public Telegram profile `@ShamshurinAS` with a prefilled TeachFlow message.

The page is dependency-free. Production currently serves the copied `index.html`; after changes, copy the updated file into the container and verify the public URL.
