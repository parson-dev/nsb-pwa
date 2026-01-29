# GitHub Repository Replacement Guide

## Overview
This guide helps you replace your existing GitHub repository with the cleaned-up version.

## Current Status
- ✅ 27 files removed (old docs, Python scripts, untagged questions)
- ✅ 3 new documentation files (CHANGELOG.md, DEVELOPMENT.md, updated README.md)
- ✅ All dependencies verified and in use
- ✅ GitHub Actions workflow updated (CI=false)
- ✅ ~8MB space saved

## Option 1: Force Push (Clean History)

**⚠️ WARNING: This will erase all commit history**

```bash
# 1. Ensure you're on the right branch
git status

# 2. Stage all changes
git add -A

# 3. Commit the cleanup
git commit -m "Major cleanup: Remove redundant docs, old scripts, consolidate documentation"

# 4. Force push to main (or your branch)
git push origin main --force

# Or if you're on a feature branch:
git push origin feature/auto-check-answers --force
```

## Option 2: Normal Push (Keep History)

**Recommended: Preserves commit history**

```bash
# 1. Check current status
git status

# 2. Stage all changes
git add -A

# 3. Commit the cleanup
git commit -m "Major cleanup: Remove redundant docs, old scripts, consolidate documentation

- Removed 20 redundant markdown documentation files
- Removed 5 old Python CLI scripts
- Removed 2 untagged question JSON files (~8MB)
- Created CHANGELOG.md with consolidated feature history
- Created DEVELOPMENT.md with developer guide
- Updated README.md with latest features
- Updated GitHub Actions workflow (CI=false)
- All dependencies verified and in use"

# 4. Push to your branch
git push origin feature/auto-check-answers

# 5. Create pull request to main (if needed)
# Or merge locally and push to main
```

## Option 3: New Repository (Fresh Start)

**If you want a completely fresh repo:**

```bash
# 1. Remove git history
rm -rf .git

# 2. Initialize new repo
git init

# 3. Add all files
git add -A

# 4. Initial commit
git commit -m "Initial commit: NSB Training PWA with AI features"

# 5. Create new GitHub repo (via GitHub web interface)
# Then connect and push:
git remote add origin https://github.com/yourusername/nsb-pwa.git
git branch -M main
git push -u origin main
```

## What's Included in Cleanup

### Removed (27 files)
- 20 redundant markdown docs
- 5 old Python CLI scripts
- 2 untagged question files

### Kept (Essential files only)
- Source code (src/)
- Public assets (public/)
- Scripts (scripts/)
- Configuration (package.json, .github/)
- Documentation (README.md, CHANGELOG.md, DEVELOPMENT.md)

## After Pushing

1. **Verify GitHub Actions**
   - Go to Actions tab in GitHub
   - Check that workflow runs successfully
   - Verify deployment to GitHub Pages

2. **Test Deployed App**
   - Visit your GitHub Pages URL
   - Test all features:
     - Question filtering
     - Advanced filters
     - Auto-check feature
     - Download stats
     - Voice settings
   - Test PWA installation

3. **Update Repository Settings** (if needed)
   - Description: "National Science Bowl Training PWA with AI-powered answer checking"
   - Topics: `pwa`, `react`, `science-bowl`, `ai`, `transformers`, `education`
   - Enable Issues (if you want)
   - Enable Discussions (optional)

## Recommended: Option 2 (Normal Push)

I recommend **Option 2** because:
- ✅ Preserves commit history
- ✅ Shows development progression
- ✅ Easier to review changes
- ✅ Can revert if needed
- ✅ Professional commit message

## Files Summary

### Documentation (4 files)
- `README.md` - User guide and features
- `CHANGELOG.md` - Version history
- `DEVELOPMENT.md` - Developer guide
- `CLEANUP-SUMMARY.md` - This cleanup summary

### Source Code (6 files)
- `src/App.js` - Main component
- `src/answerChecker.js` - AI validation
- `src/index.js` - Entry point
- `src/index.css` - Styles
- `src/ms-questions-tagged.json` - MS questions
- `src/hs-questions-tagged.json` - HS questions

### Configuration (4 files)
- `package.json` - Dependencies
- `package-lock.json` - Lock file
- `.github/workflows/deploy.yml` - CI/CD
- `public/manifest.json` - PWA config

### Scripts (2 files)
- `scripts/classify-questions.js` - Classification tool
- `scripts/README-CLASSIFICATION.md` - Classification docs

**Total: 16 essential files + standard config files**

## Questions?

If you encounter issues:
1. Check git status: `git status`
2. Check branch: `git branch`
3. Check remote: `git remote -v`
4. Check uncommitted changes: `git diff`

## Next Steps After Push

1. Delete this guide: `rm GITHUB-REPLACEMENT-GUIDE.md CLEANUP-SUMMARY.md`
2. Commit: `git commit -am "Remove cleanup guides"`
3. Push: `git push`
4. Enjoy your clean repository! 🎉
