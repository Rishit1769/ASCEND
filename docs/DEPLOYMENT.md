# Deployment

## Build

```bash
npm run build
```

This runs `next build` (Turbopack), which:
1. Compiles TypeScript
2. Bundles client-side code
3. Pre-renders static pages
4. Generates `.next/` output directory

## Production Server

```bash
npm run start
```

Runs `next start` on port 3000 (default).

## Environment Variables

No environment variables are required for the MVP. The application uses:

- `localStorage` for persistence (client-side only)
- No API calls
- No authentication
- No external services

## Vercel Deployment

### Recommended Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` (project root) |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install` |
| **Output Directory** | `.next` (auto-detected) |
| **Node.js Version** | 18+ (auto-detected via `.nvmrc`) |

### Vercel Configuration

The project includes a `vercel.json` with:

- **Cache headers** for static assets (GLB models, textures, JS chunks)
- **Region**: `iad1` (US East)

### Environment Variables

No environment variables are needed for the MVP.

### Build Notes

- The build uses **Turbopack** (Next.js 16 default bundler)
- Static assets total ~46MB in `public/` (all git-tracked)
- Largest single GLB: 7.1MB (`pine_roots.glb`)
- Build output: ~2.2MB in `.next/static/chunks/`
- Server build: ~5.2MB in `.next/server/`

### Troubleshooting

If the Vercel build fails:

1. **Check Node version**: Ensure Vercel uses Node 18+ (`.nvmrc` specifies 20)
2. **Check build logs**: Look for memory issues with large GLB processing
3. **Check chunk loading**: Verify dynamic imports resolve correctly
4. **Check asset serving**: Verify GLB files are accessible at their public paths

### Asset Paths

All assets in `public/` are served at their relative paths:

| Asset | Runtime Path |
|-------|-------------|
| `public/environment/waternormals.jpg` | `/environment/waternormals.jpg` |
| `public/environment/coast_rocks_01.glb` | `/environment/coast_rocks_01.glb` |
| `public/models/armored_king.glb` | `/models/armored_king.glb` |
| `public/environment/kloofendal_48d_partly_cloudy_2k.hdr` | `/environment/kloofendal_48d_partly_cloudy_2k.hdr` |

### Git Tracking

All required assets are tracked by Git:

```bash
git ls-files public/ | wc -l  # Should show 29 files
```

Do NOT add `public/environment/` or `public/models/` to `.gitignore`.

## Asset Pipeline

Before building, assets must be fetched and optimized:

```bash
# Step 1: Download CC0 assets from Poly Haven
npm run assets:fetch

# Step 2: Optimize (LOD generation, texture compression)
npm run assets:build

# Step 3: Fetch HDRI + water normals
npm run assets:realism
```

### Asset Sources

| Asset | Source | License |
|-------|--------|---------|
| Environment models (9 GLBs) | Poly Haven | CC0 |
| HDRI sky | Poly Haven (Kloofendal) | CC0 |
| Water normals | Three.js examples | MIT |
| Forest floor textures | Poly Haven | CC0 |

## Performance Considerations

### Bundle Size

- Next.js code splitting ensures only the current page's code is loaded
- Three.js and R3F are large libraries (~500KB+ gzipped combined)
- Dynamic imports for Dashboard and GameScene reduce initial bundle

### Caching

- Static assets in `public/` are served with Next.js default caching headers
- GLB models are large (1–7MB each) — CDN caching via `vercel.json` headers
- HDR sky is ~2MB — consider lazy loading

## Monitoring

No monitoring or analytics is configured for the MVP. For production, consider:
- Error tracking (Sentry, LogRocket)
- Performance monitoring (Web Vitals)
- Usage analytics (Plausible, PostHog)

## Security

- No authentication system
- No API endpoints
- No user data leaves the browser (localStorage only)
- All assets are CC0/MIT licensed
- No secrets or API keys in the codebase
