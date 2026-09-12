# Deployment

## Build

```bash
npm run build
```

This runs `next build`, which:
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

## Deployment Targets

### Vercel (Recommended)

Next.js is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

No `vercel.json` is needed — Next.js defaults work.

### Static Export

The app can be exported as static files:

```bash
next build --export
```

**Note**: The 3D scene requires client-side JavaScript. Static export works but all rendering happens in the browser.

### Docker

No Dockerfile exists. To create one:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

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

### Asset Optimization

The `optimize-environment.mjs` script uses glTF Transform to:
1. Deduplicate meshes and materials
2. Weld vertices
3. Simplify geometry (LOD generation)
4. Compress textures to WebP (via sharp)
5. Apply meshopt quantization

Both high-detail and LOD variants are generated for each model.

## Performance Considerations

### Bundle Size

- Next.js code splitting ensures only the current page's code is loaded
- Three.js and R3F are large libraries (~500KB+ gzipped combined)
- Dynamic imports for Dashboard and GameScene reduce initial bundle

### Caching

- Static assets in `public/` are served with Next.js default caching headers
- GLB models are large (1–5MB each) — consider CDN caching for production
- HDR sky is ~2MB — consider lazy loading

### CDN

For production deployment, consider:
- Serving `public/environment/` assets from a CDN
- Using Next.js `images` config for image optimization
- Enabling Brotli compression

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
