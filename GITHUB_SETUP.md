# GitHub Repository Setup - IMPORTANT!

## The Problem

Render is looking in the wrong directory because the GitHub repo structure is incorrect.

**Error message shows**:
```
/opt/render/project/src/tsconfig.json
```

This means Render thinks the project root is at `/opt/render/project/src/` instead of `/opt/render/project/`.

## Correct Repository Structure

Your GitHub repo should look like this at the ROOT level:

```
cogniz-mcp-server/              ← Repo name
├── .gitignore                  ← At repo root
├── package.json                ← At repo root
├── package-lock.json           ← At repo root
├── tsconfig.json               ← At repo root
├── render.yaml                 ← At repo root
├── README.md                   ← At repo root
└── src/                        ← Folder at repo root
    ├── index.ts                ← Source files inside src/
    └── server-remote.ts        ← Source files inside src/
```

**NOT like this** (nested):
```
cogniz-mcp-server/              ← Repo name
└── cogniz-mcp-server/          ← WRONG! Extra nesting
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── server-remote.ts
```

## How to Set Up Correctly

### Option 1: Fresh Start (Recommended)

1. **Create new GitHub repo**:
   - Go to https://github.com/new
   - Name: `cogniz-mcp-server`
   - **DO NOT** initialize with README
   - Click "Create repository"

2. **Navigate to the correct folder**:
   ```bash
   cd "C:\Users\Savannah Babette\skills\cogniz-memory-skills\cogniz-mcp-server"
   ```

3. **Verify you're in the right place** (should see package.json):
   ```bash
   ls
   # Should show: package.json, tsconfig.json, src/, etc.
   ```

4. **Initialize git** (if not already done):
   ```bash
   git init
   ```

5. **Add files from THIS directory** (not a subdirectory):
   ```bash
   git add .gitignore
   git add package.json
   git add package-lock.json
   git add tsconfig.json
   git add render.yaml
   git add src/server-remote.ts
   git add README.md
   ```

6. **Commit**:
   ```bash
   git commit -m "Initial commit - Cogniz Remote MCP Server"
   ```

7. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/cogniz-mcp-server.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Fix Existing Repo

If you already pushed to GitHub with wrong structure:

1. **Delete the repo** on GitHub
2. **Follow Option 1** above

OR

1. **Clone the repo**:
   ```bash
   cd "C:\Users\Savannah Babette\skills"
   git clone https://github.com/YOUR-USERNAME/cogniz-mcp-server.git temp-clone
   ```

2. **Check the structure**:
   ```bash
   cd temp-clone
   ls
   ```

3. **If you see nested folders**, move files up:
   ```bash
   # If you see: cogniz-mcp-server/cogniz-mcp-server/package.json
   # Move everything up one level:
   mv cogniz-mcp-server/* .
   rmdir cogniz-mcp-server
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Fix directory structure"
   git push origin main
   ```

## Verify Correct Structure on GitHub

After pushing, go to your GitHub repo in the browser:

**Correct** ✅:
```
https://github.com/YOUR-USERNAME/cogniz-mcp-server

Files at root level:
✅ package.json
✅ tsconfig.json
✅ render.yaml
✅ src/
   └── server-remote.ts
```

**Wrong** ❌:
```
https://github.com/YOUR-USERNAME/cogniz-mcp-server

Files you see:
❌ cogniz-mcp-server/
   └── package.json
```

## How to Tell What's Wrong

Look at the GitHub repo URL paths:

**Correct**:
- `https://github.com/user/cogniz-mcp-server/blob/main/package.json` ✅
- `https://github.com/user/cogniz-mcp-server/blob/main/src/server-remote.ts` ✅

**Wrong** (extra nesting):
- `https://github.com/user/cogniz-mcp-server/blob/main/cogniz-mcp-server/package.json` ❌
- `https://github.com/user/cogniz-mcp-server/blob/main/cogniz-mcp-server/src/server-remote.ts` ❌

## After Fixing Structure

1. **Delete the Render service** (if it exists)
2. **Create new Render service**:
   - Click "New +" → "Web Service"
   - Connect the GitHub repo
   - Render should now find files correctly

3. **Render will look in the right place**:
   ```
   /opt/render/project/package.json        ✅
   /opt/render/project/tsconfig.json       ✅
   /opt/render/project/src/server-remote.ts ✅
   ```

   NOT:
   ```
   /opt/render/project/src/tsconfig.json   ❌ (what's happening now)
   ```

## Quick Check Command

Run this in your local folder:

```bash
cd "C:\Users\Savannah Babette\skills\cogniz-memory-skills\cogniz-mcp-server"
cat package.json | head -1
```

Should show: `{`

If you get "No such file", you're in the wrong directory!

## Alternative: Tell Render the Root Directory

If you MUST keep the nested structure, update `render.yaml`:

```yaml
services:
  - type: web
    name: cogniz-mcp-server
    env: node
    rootDir: cogniz-mcp-server    # Add this line
    buildCommand: npm install && npm run build
    startCommand: npm run start:remote
```

**But this is NOT recommended** - just fix the structure instead.

## Summary

The error `/opt/render/project/src/tsconfig.json` means:

1. ❌ Render thinks project root is at `/opt/render/project/src/`
2. ✅ It should be at `/opt/render/project/`

**Fix**: Make sure GitHub repo has files at the root level, not nested in a subdirectory.

**Check on GitHub**: You should see `package.json` when you open the repo, not a folder name.
