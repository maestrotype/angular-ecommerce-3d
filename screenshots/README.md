# Visual Assets Placement

Place your screenshots and videos in these folders according to the guidelines.

## 📁 Folder Structure

```
screenshots/
├── desktop/          # Desktop version screenshots (1920x1080)
├── mobile/           # Mobile version screenshots (375x812)
└── admin/            # Admin panel screenshots (1920x1080)

preview-images/
├── themeforest/      # ThemeForest previews (590x300)
└── templatemonster/  # TemplateMonster previews (800x600)

demo-video/
├── raw/              # Source files for video
└── final/            # Final exported video files
```

## 📖 Full Guide

See [VISUAL_ASSETS_GUIDE.md](../docs/VISUAL_ASSETS_GUIDE.md) for:
- Detailed requirements
- Naming conventions
- Tools recommendations
- Best practices
- Optimization tips

## Capture automatically

With backend + frontend running (`npm start` + `npm run backend:start:dev`):

```bash
npm run screenshots:capture
```

Admin dashboard / products / sections (optional):

```bash
ADMIN_SCREENSHOT_EMAIL=... ADMIN_SCREENSHOT_PASSWORD=... npm run screenshots:capture
```

Output: `screenshots/desktop/`, `screenshots/mobile/`, `screenshots/admin/`.
Then `npm run pack:marketplace` to put PNGs into the buyer zip if those folders exist.

Set `SCREENSHOT_BASE_URL` if not using default `http://localhost:4200`.
Full seller steps: [marketing-assets/LISTING_PACK.md](../marketing-assets/LISTING_PACK.md).

## ✅ Checklist

### Screenshots (25 files)
- [ ] 10 desktop screenshots
- [ ] 5 mobile screenshots  
- [ ] 10 admin screenshots

### Preview Images (listing)
- [ ] CodeCanyon / Gumroad gallery (use `desktop/` + `admin/` first)
- [ ] Optional TemplateMonster preview if you list there later

### Demo Video (1 file)
- [ ] 2-3 minute demo video (1080p MP4)
- [ ] Video thumbnail

**Total**: ~33 files, ~40-65 MB

---

For questions, refer to the main guide.
