# Changelog

All notable changes to the National Science Bowl Training PWA.

## [Latest] - 2025-01-28

### Added
- **Advanced Filters**: 24 semantic tags across 4 categories (Knowledge Type, Cognitive Level, Math Subtopics, Science Subtopics)
  - Collapsible filter UI with category organization
  - Tag-based question filtering combined with subject filters
  - All 18,131 questions classified using Transformers.js AI
  
- **Auto-Check Feature**: AI-powered answer validation using Transformers.js
  - Semantic similarity checking for short answer questions
  - Exact letter matching for multiple choice
  - Uses `Xenova/all-MiniLM-L6-v2` model (~23MB)
  - Browser-native with caching for performance
  - Confidence scoring (high/medium/low)
  - Fallback to string similarity if model fails
  
- **Download Statistics**: Export detailed session data to CSV
  - Per-question records with timestamps
  - Buzz times, answers, correctness, auto-check results
  - Comprehensive question metadata
  - Export prompt on session exit

- **Voice Settings Enhancements**:
  - "Read question type and subject" toggle
  - Pause after header (always enabled)
  - Emphasize key terms (always enabled)
  
- **UX Improvements**:
  - Optional question limit input
  - No-repeat logic for questions within session
  - Session exit prompt with download option
  - "Session Statistics" label update
  - iOS Safari stats rendering fix with hardware acceleration

### Fixed
- iOS Safari session stats not updating (React state batching issue)
- Model loading retry logic (removed blocking `loadingFailed` flag)
- npm ci warnings in GitHub Actions (set CI=false)
- Package-lock.json sync issues
- Transformers.js browser compatibility (switched to @xenova/transformers)

### Technical
- Switched from `@huggingface/transformers` to `@xenova/transformers` for browser compatibility
- Browser caching enabled for AI models
- GitHub Actions workflow updated to Node.js v4
- Memory optimization for builds (4GB heap)
- Classification scripts for question tagging

## Dependencies
- React 18.2.0
- @xenova/transformers 2.17.2
- react-scripts 5.0.1
- gh-pages 6.1.0 (dev)

## Deployment
- GitHub Pages: https://parson-dev.github.io/nsb-pwa
- Auto-deploy on push to main branch
- Service Worker for offline support
