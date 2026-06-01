# Stitch → Next.js (Alexandria)

Source project from [Google Stitch](https://stitch.withgoogle.com):

| Field | Value |
| --- | --- |
| Project ID | `9486157200915130447` |
| Title | NextGen Social Network |
| Design system | Alexandria — High-End Editorial |

## Screens mapped to routes

| Stitch screen | Route |
| --- | --- |
| Alexandria Desktop - Discovery Dashboard | `/` |
| Alexandria Desktop - Web App Feed | `/curations` |

Raw HTML exports (for reference) live in `.stitch-export/` after running the fetch script.

## Re-export from Stitch

1. Enable Stitch MCP in Cursor (`~/.cursor/mcp.json` already points at `https://stitch.googleapis.com/mcp`).
2. Set `STITCH_API_KEY` (or use the same key as `X-Goog-Api-Key` in that config).
3. Run:

```bash
STITCH_API_KEY=your-key npm run stitch:export
```

## Mobile screens (not yet ported)

These exist in the Stitch project but are hidden in the canvas:

- Home Feed - Social Layout (`0aa76df7…`)
- User Profile (`805f5a0e…`)

Add routes under `app/` when you want responsive mobile layouts.

## Design tokens

Colors and fonts are defined in `app/globals.css` (`@theme`). They match the Stitch `designTheme` for this project.
