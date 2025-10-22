# Files to Upload to Render

## Required Files (Must Upload)

These 5 files are **absolutely required** for deployment:

### 1. `src/server-remote.ts`
**Why**: The actual server code with Express + SSE transport
**Size**: ~10 KB
**Contains**: All 5 MCP tools, API client, Express routes

### 2. `package.json`
**Why**: Dependencies and build scripts
**Size**: ~1 KB
**Contains**:
- Dependencies: Express, MCP SDK, Axios, Zod
- Scripts: `npm run start:remote`, `npm run build`

### 3. `package-lock.json`
**Why**: Locked dependency versions (ensures consistent builds)
**Size**: ~100 KB
**Contains**: Exact versions of all dependencies

### 4. `tsconfig.json`
**Why**: TypeScript compiler configuration
**Size**: ~0.5 KB
**Contains**: Build settings, module resolution

### 5. `render.yaml`
**Why**: Render deployment configuration (auto-configures everything)
**Size**: ~0.5 KB
**Contains**: Build commands, environment variables, health check

## Optional Files (Good to Include)

### 6. `.gitignore`
**Why**: Prevents committing secrets and build artifacts
**Size**: ~0.3 KB

### 7. `README.md`
**Why**: Documentation for GitHub repo
**Size**: ~10 KB

### 8. `DEPLOYMENT.md`
**Why**: Detailed deployment guide
**Size**: ~15 KB

## Files NOT Needed (Don't Upload)

❌ `dist/` folder - Render builds this
❌ `node_modules/` folder - Render installs this
❌ `.env` file - Use environment variables instead
❌ `src/index.ts` - Local version only
❌ `test-*.js` or `test-*.py` - Testing files
❌ Config files like `~/.cogniz/config.json` - Not for remote

## File Tree for Deployment

```
cogniz-mcp-server/
├── src/
│   └── server-remote.ts          ✅ REQUIRED
├── package.json                   ✅ REQUIRED
├── package-lock.json              ✅ REQUIRED
├── tsconfig.json                  ✅ REQUIRED
├── render.yaml                    ✅ REQUIRED
├── .gitignore                     ⚠️  RECOMMENDED
├── README.md                      ⚠️  RECOMMENDED
├── DEPLOYMENT.md                  ⚠️  OPTIONAL
└── QUICK_DEPLOY.md                ⚠️  OPTIONAL
```

## Quick Checklist

Before deploying to Render, verify you have:

- [ ] `src/server-remote.ts` exists
- [ ] `package.json` has `"start:remote": "node dist/server-remote.js"` script
- [ ] `package-lock.json` exists (run `npm install` to create)
- [ ] `tsconfig.json` exists
- [ ] `render.yaml` exists
- [ ] `.gitignore` exists (to prevent uploading secrets)
- [ ] GitHub repo created
- [ ] All files committed and pushed

## Environment Variables (Set in Render Dashboard)

These are **NOT in files** - you set them in Render's web interface:

1. `COGNIZ_API_KEY` = `mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse`
2. `COGNIZ_BASE_URL` = `https://cogniz.online` (optional, has default)
3. `COGNIZ_PROJECT_ID` = `default` (optional, has default)

## Total Size

All required files: **~112 KB**
With optional docs: **~138 KB**

Very lightweight deployment! 🚀

## What Render Does Automatically

When you push these files, Render will:

1. ✅ Detect Node.js project (from `package.json`)
2. ✅ Read `render.yaml` for configuration
3. ✅ Run `npm install` (creates `node_modules/`)
4. ✅ Run `npm run build` (creates `dist/`)
5. ✅ Run `npm run start:remote` (starts server)
6. ✅ Assign a public URL
7. ✅ Set up SSL certificate (HTTPS)
8. ✅ Configure health checks
9. ✅ Start monitoring

You just need to push the 5 required files! Everything else is automatic.
