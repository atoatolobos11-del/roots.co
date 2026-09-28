# Credits

## Photography

All catalogue photography in `public/images/photos/` is **CC0 1.0 Universal**
(public domain dedication). No attribution is legally required; it is recorded
here as good practice, and because knowing the provenance makes the selection
auditable.

Sources were discovered through the [Openverse](https://openverse.org) API,
filtered to `license=cc0`, then reviewed as a contact sheet before selection.
Stock sources reuse generic titles ("Fashion Clothes", "Sneakers Shoes"), so
each candidate was identified by its rendered content, not its title.

Regenerate with:

```bash
npm i -D sharp
node scripts/fetch-photos.mjs
```

The selection is pinned by index in `scripts/photo-sources.json`, so re-running
never silently swaps in different photography. Per-file provenance lives in
`scripts/photo-credits.json`.

| File | Source | Credit |
| --- | --- | --- |
| `structured-leather-tote.jpg` | StockSnap | [Pablo Merchán Montes](https://unsplash.com) via Openverse |
| `brown-leather-satchel.jpg` | Rawpixel | CC0 |
| `checked-tailored-suit.jpg` | Rawpixel | CC0 |
| `quilted-puffer.jpg` | Rawpixel | CC0 |
| `wool-coat-rail.jpg`, `hero-rail.jpg` | Rawpixel | CC0 |
| `tailored-trouser-detail.jpg` | Rawpixel | CC0 |
| `tan-leather-brogues.jpg` | StockSnap | CC0 |
| `leather-shoes-knitwear.jpg` | StockSnap | CC0 |
| `white-court-sneakers.jpg` | StockSnap | CC0 |
| `canvas-low-tops.jpg` | StockSnap | CC0 |
| `garment-dyed-tee.jpg`, `weekend-capsule.jpg` | StockSnap | CC0 |
| `plaid-oxford-shirt.jpg` | StockSnap | CC0 |
| `rose-ribbed-knit.jpg` | Rawpixel | CC0 |
| `blush-merino-detail.jpg` | Rawpixel | CC0 |
| `poplin-shirt-rail.jpg` | Rawpixel | CC0 |
| `linen-dress-rail.jpg` | StockSnap | CC0 |
| `straight-leg-denim.jpg` | StockSnap | CC0 |
| `tapered-jeans-boots.jpg` | StockSnap | CC0 |
| `pastel-capsule.jpg` | StockSnap | CC0 |
| `banner-satchel.jpg` | Rawpixel | CC0 |
| `banner-puffer.jpg` | Rawpixel | CC0 |
| `banner-tote.jpg` | StockSnap | CC0 |
| `collection-tailoring.jpg` | Rawpixel | CC0 |
| `collection-dresses.jpg` | StockSnap | CC0 |
| `collection-knitwear.jpg` | StockSnap | CC0 |
| `collection-shoes.jpg` | StockSnap | CC0 |
| `collection-denim.jpg` | StockSnap | CC0 |

## Generated artwork

Everything under `public/images/` that is **not** in `photos/` is original
vector artwork produced by `scripts/generate-assets.mjs` — garment
illustrations, the Sale tile and the favicon. Regenerate with:

```bash
npm run generate:assets
```

## Typeface

Inter, self-hosted from `public/fonts/`, under the [SIL Open Font License
1.1](https://openfontlicense.org/).
