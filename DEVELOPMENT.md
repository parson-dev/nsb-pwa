# Development Guide

## Project Structure

```
nsb-pwa/
├── public/              # Static assets
│   ├── index.html      # HTML template
│   ├── manifest.json   # PWA manifest
│   └── sw.js           # Service worker
├── src/
│   ├── App.js          # Main application component
│   ├── answerChecker.js # AI answer validation
│   ├── index.js        # React entry point
│   ├── index.css       # Global styles
│   ├── ms-questions-tagged.json  # Middle School questions
│   └── hs-questions-tagged.json  # High School questions
├── scripts/
│   └── classify-questions.js     # Question classification tool
└── .github/workflows/
    └── deploy.yml      # GitHub Actions deployment

```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test

# Question classification
npm run classify:test      # Test with 10 sample questions
npm run classify:ms        # Classify Middle School questions
npm run classify:hs        # Classify High School questions
npm run classify:all       # Classify all questions
npm run classify:resume    # Resume interrupted classification
```

## Key Components

### App.js
Main React component containing:
- Question selection and filtering logic
- Training session state management
- UI rendering and event handling
- Statistics tracking
- Voice settings and TTS integration

### answerChecker.js
AI-powered answer validation:
- Uses Transformers.js (`Xenova/all-MiniLM-L6-v2` model)
- Semantic similarity checking
- Cosine similarity calculation
- Fallback to string similarity
- Browser caching for performance

### classify-questions.js
Question classification script:
- Tags questions with semantic labels
- Uses Transformers.js for zero-shot classification
- Supports resume functionality
- Batch processing with progress tracking

## State Management

The app uses React hooks for state:
- `useState` for component state
- `useEffect` for side effects (TTS, keyboard listeners)
- `useCallback` for memoized functions

Key state variables:
- `selectedLevel` - MS or HS
- `selectedSubjects` - Array of subject filters
- `selectedTags` - Array of semantic tag filters
- `questions` - Filtered question pool
- `currentQuestion` - Active question
- `sessionStats` - Performance metrics
- `detailedHistory` - Per-question records

## Adding New Features

1. **New Filter Category**:
   - Add to `getTagsByCategory()` in App.js
   - Update UI in Advanced Filters section
   - Add to `categorizeTag()` helper

2. **New Question Field**:
   - Update question JSON structure
   - Modify `getFilteredQuestions()` logic
   - Update CSV export in `downloadStats()`

3. **New Voice Setting**:
   - Add state variable
   - Add UI control in Settings panel
   - Integrate with `speakQuestion()` function

## Testing

### Local Testing
1. Run `npm start`
2. Open http://localhost:3000
3. Test features in browser DevTools
4. Check console for errors/warnings

### Production Build Testing
1. Run `npm run build`
2. Serve build folder: `npx serve -s build`
3. Test at http://localhost:3000
4. Verify PWA installation works

### AI Model Testing
1. Enable auto-check in settings
2. Answer questions (both correct and incorrect)
3. Check browser console for model loading logs
4. Verify confidence scores are reasonable
5. Test with various answer formats

## Deployment

### GitHub Pages (Automatic)
1. Push to `main` branch
2. GitHub Actions runs automatically
3. Deploys to `gh-pages` branch
4. Available at configured homepage URL

### Manual Deployment
Not recommended - use GitHub Actions workflow

## Troubleshooting

### Model Won't Load
- Check browser console for errors
- Verify network connection (first load requires download)
- Check browser cache (DevTools → Application → Cache Storage)
- Try clearing cache and refreshing

### Build Fails
- Run `npm ci` to clean install dependencies
- Check `package-lock.json` is in sync
- Verify Node.js version (18+)
- Check for TypeScript/ESLint errors

### Questions Not Filtering
- Verify JSON structure matches expected format
- Check console for filter logic errors
- Ensure tags exist in question data
- Test with simpler filter combinations

## Performance Optimization

### Current Optimizations
- Lazy loading of AI model
- Browser caching for model files
- Memoized filter functions
- CSS hardware acceleration
- Service worker for offline support

### Future Improvements
- Virtual scrolling for large question lists
- Web Workers for classification
- IndexedDB for question storage
- Progressive image loading

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full |
| Safari  | 15+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## Dependencies

### Production
- `react` (18.2.0) - UI framework
- `react-dom` (18.2.0) - React DOM rendering
- `react-scripts` (5.0.1) - CRA build tools
- `@xenova/transformers` (2.17.2) - Browser AI

### Development
- `gh-pages` (6.1.0) - GitHub Pages deployment

## Environment Variables

No environment variables required. All configuration is in:
- `package.json` - Build settings, homepage
- `public/manifest.json` - PWA configuration
- `.github/workflows/deploy.yml` - CI/CD settings

## Code Style

- Use functional components with hooks
- Prefer `const` over `let`
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small
- Use async/await over promises

## Git Workflow

1. Work on feature branches
2. Test locally before committing
3. Push to GitHub
4. GitHub Actions handles deployment
5. Verify deployment at GitHub Pages URL
