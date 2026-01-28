# Auto-Check Feature (Experimental)

## Overview
This experimental feature uses AI to automatically check if written answers are semantically correct, even if they don't match the exact wording of the correct answer.

## How It Works
- Uses Transformers.js with the `all-MiniLM-L6-v2` model for semantic similarity
- Compares the meaning of answers using embeddings
- Model size: ~23MB (downloads once, cached in browser)
- Works offline after initial download

## Features
- **Toggle on/off**: Enable/disable in Settings → Auto-Check tab
- **Adjustable threshold**: Set how strict the matching should be (50-95%)
- **Confidence levels**: Shows high/medium/low confidence in results
- **Fallback**: Uses string similarity if model fails to load
- **Works for all questions**: Both multiple choice and short answer questions

## Usage
1. Open Settings (⚙️ button at bottom)
2. Go to "Auto-Check" tab
3. Enable "Enable Auto-Check"
4. Wait for model to load (⏳ → ✅)
5. Adjust threshold if needed (default 75%)
6. Answer short answer questions normally
7. Click "🤖 Auto-Check Answer" instead of "Submit Answer"
8. See instant feedback with similarity score

## Testing the Feature

### To test this feature:
```bash
# You're already on the feature branch
npm start
```

### To compare with the original version:
```bash
# Switch back to main branch
git checkout main
npm start
```

### To switch back to the feature:
```bash
git checkout feature/auto-check-answers
npm start
```

## Rollback Instructions

### If you don't like the feature:
```bash
# Switch back to main (without the feature)
git checkout main

# Optional: Delete the feature branch
git branch -D feature/auto-check-answers
```

### If you like the feature:
```bash
# Merge it into main
git checkout main
git merge feature/auto-check-answers
```

## Performance Notes
- First load: ~23MB download (one-time)
- Subsequent loads: Instant (cached)
- Answer checking: ~100-500ms per answer
- No impact when disabled

## Known Limitations
- Requires modern browser with WebAssembly support
- May struggle with very technical/specific terminology
- Confidence levels are estimates, not guarantees

## Technical Details
- **Library**: @xenova/transformers
- **Model**: Xenova/all-MiniLM-L6-v2
- **Method**: Cosine similarity of sentence embeddings
- **Fallback**: Levenshtein distance for string comparison
- **Bundle size impact**: +198KB gzipped

## Future Improvements
- [ ] Add option to use different models
- [ ] Show explanation of why answer was marked correct/incorrect
- [ ] Allow manual override of auto-check results
- [ ] Add statistics on auto-check accuracy
- [ ] Support for multiple choice questions
