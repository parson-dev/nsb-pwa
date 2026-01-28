# Download Session Stats Feature

## Overview

Added ability to download detailed per-question statistics at the end of a training session. The display shows aggregate stats during the session, but the download includes comprehensive per-question data.

---

## What's New

### During Session (Display):
- **Aggregate stats** shown in real-time:
  - Total questions answered
  - Total correct
  - Accuracy percentage
  - Average buzz time

### After Session (Download):
- **Detailed per-question data** in CSV format:
  - Question number
  - Timestamp
  - Level (MS/HS)
  - Subject
  - Question type
  - Format (Multiple Choice/Short Answer)
  - Full question text
  - Correct answer
  - Your answer
  - Result (Correct/Incorrect)
  - Buzz time
  - Auto-check usage
  - Confidence level
  - Similarity percentage

---

## How to Use

1. **Start a training session**
2. **Answer questions** as usual
3. **Click "📥 Download Stats"** button (appears after first question)
4. **CSV file downloads** automatically with filename: `nsb-training-stats-YYYY-MM-DDTHH-MM-SS.csv`

---

## CSV Format

### Headers:
```
Question #, Timestamp, Level, Subject, Type, Format, Question, Correct Answer, 
Your Answer, Result, Buzz Time (s), Auto-Check Used, Confidence, Similarity %
```

### Example Row:
```
1, 2025-01-21T10:30:45.123Z, MS, Biology, Multiple Choice, Multiple Choice, 
"What is the powerhouse of the cell?", "W) Mitochondria", "W) Mitochondria", 
Correct, 3.45, Yes, high, 100.0
```

---

## Implementation Details

### State Management

Added `detailedHistory` array to stats:
```javascript
const [stats, setStats] = useState({
  questionsAnswered: 0,
  correct: 0,
  buzzTimes: [],
  detailedHistory: [] // NEW: Track per-question details
});
```

### Question Record Structure

Each question creates a detailed record:
```javascript
{
  questionNumber: 1,
  timestamp: "2025-01-21T10:30:45.123Z",
  level: "MS",
  subject: "Biology",
  type: "Multiple Choice",
  format: "Multiple Choice",
  question: "What is the powerhouse of the cell?",
  correctAnswer: "W) Mitochondria",
  userAnswer: "W) Mitochondria",
  isCorrect: true,
  buzzTime: 3.45,
  autoCheckUsed: true,
  autoCheckConfidence: "high",
  autoCheckSimilarity: 1.0
}
```

### Download Function

```javascript
const downloadStats = useCallback(() => {
  // Create CSV from detailedHistory
  // Generate filename with timestamp
  // Trigger browser download
}, [stats.detailedHistory]);
```

### UI Changes

**Before:**
```
[Exit Training]
```

**After:**
```
[Exit Training]
[📥 Download Stats] (only shows if questions answered > 0)
```

---

## Benefits

### For Users:
✅ **Detailed analysis** - Review every question after session
✅ **Track progress** - Compare sessions over time
✅ **Identify patterns** - See which subjects/types are challenging
✅ **Study tool** - Review questions you got wrong
✅ **Performance metrics** - Analyze buzz times and accuracy

### For Analysis:
✅ **CSV format** - Easy to open in Excel, Google Sheets, etc.
✅ **Timestamped** - Track when you practiced
✅ **Complete data** - All question details preserved
✅ **Auto-check insights** - See confidence and similarity scores
✅ **Exportable** - Share with coaches or study groups

---

## Use Cases

### 1. Post-Session Review
- Download stats after each session
- Review questions you got wrong
- Study the correct answers

### 2. Progress Tracking
- Download stats from multiple sessions
- Compare accuracy over time
- Track improvement in specific subjects

### 3. Weakness Identification
- Sort by subject to find weak areas
- Filter by incorrect answers
- Focus study on problem topics

### 4. Buzz Time Analysis
- Identify questions where you buzzed too early/late
- Optimize buzzing strategy
- Track buzz time improvement

### 5. Auto-Check Validation
- Review auto-check confidence levels
- Verify similarity scores
- Understand AI decision-making

---

## Technical Details

### CSV Generation
- Properly escapes quotes in text fields
- Handles special characters
- UTF-8 encoding
- Compatible with Excel and Google Sheets

### File Naming
- Format: `nsb-training-stats-YYYY-MM-DDTHH-MM-SS.csv`
- Example: `nsb-training-stats-2025-01-21T10-30-45.csv`
- Unique timestamp prevents overwrites

### Data Validation
- Checks if data exists before download
- Shows alert if no questions answered
- Button only appears after first question

---

## Files Modified

### Modified Files (2):
- `src/App.js`
  - Added `detailedHistory` to stats state
  - Updated `handleAnswerResult` to track detailed records
  - Added `downloadStats` function
  - Added download button to UI
  - Updated `exitTraining` to reset detailedHistory

- `src/index.css`
  - Added `.download-button` styling
  - Added `.button-group` styling

### New Files (1):
- `FEATURE-DOWNLOAD-STATS.md` (this file)

---

## Testing Checklist

- [x] Download button appears after first question
- [x] Download button hidden before first question
- [x] CSV file downloads with correct filename
- [x] CSV contains all expected columns
- [x] Question text properly escaped
- [x] Timestamps in ISO format
- [x] Auto-check data included when used
- [x] Buzz times recorded correctly
- [x] File opens in Excel/Google Sheets
- [x] No console errors

---

## Future Enhancements

Potential improvements:
- Add JSON export option
- Include session summary at top of CSV
- Add charts/graphs in download
- Export to Google Sheets directly
- Email stats to yourself
- Compare multiple sessions
- Filter by subject before download
- Add notes field for each question

---

## Commit Message

```
Add download stats feature with detailed per-question data

- Added detailedHistory array to track per-question records
- Updated handleAnswerResult to capture comprehensive question data
- Added downloadStats function to generate CSV export
- Added download button to stats section (shows after first question)
- CSV includes: question details, answers, results, buzz times, auto-check data
- Filename format: nsb-training-stats-YYYY-MM-DDTHH-MM-SS.csv
- Added styling for download button (green gradient)
- Properly escapes CSV data for Excel/Sheets compatibility
```

---

## Summary

This feature transforms the training app from a practice tool into a comprehensive learning platform. Users can now:

1. **Practice** with real-time aggregate stats
2. **Download** detailed per-question data
3. **Analyze** performance in spreadsheets
4. **Track** progress over multiple sessions
5. **Improve** by reviewing mistakes

The CSV export makes it easy to identify patterns, track improvement, and focus study efforts on weak areas. Perfect for serious competitors who want data-driven training! 📊
