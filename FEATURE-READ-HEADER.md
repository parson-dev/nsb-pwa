# Read Question Header Feature

## Overview

Added a new voice setting that allows users to control whether the question type and subject are read aloud before the question content.

Also simplified the voice settings by making "Pause after header" and "Emphasize key terms" always enabled (removed from UI).

---

## What Changed

### New Setting: "Read question type and subject"

**Location:** Settings → Voice → Advanced Options

**Default:** Enabled (checked)

**Description:** When enabled, the voice will read aloud the question metadata before the question content.

**Example:**
- **Enabled:** "Multiple Choice Biology. What is the powerhouse of the cell?"
- **Disabled:** "What is the powerhouse of the cell?"

### Removed Settings (Now Always On)

**1. Pause after question header**
- Now always enabled
- Always adds a natural pause between question type and content
- Removed from UI to simplify settings

**2. Emphasize key terms**
- Now always enabled
- Always adds pauses after question words, numbers, and acronyms
- Removed from UI to simplify settings

---

## Implementation Details

### State Management

Speech settings remain the same (values are just not user-configurable):
```javascript
const [speechSettings, setSpeechSettings] = useState({
  rate: 0.9,
  pitch: 1.0,
  volume: 0.8,
  pauseAfterHeader: true,    // Always true (no UI control)
  emphasizeKeywords: true,   // Always true (no UI control)
  readHeader: true           // User controllable
});
```

### UI Component

Only one checkbox remains in Advanced Options:
```javascript
<label className="settings-checkbox">
  <input
    type="checkbox"
    checked={speechSettings.readHeader}
    onChange={(e) => setSpeechSettings(prev => ({...prev, readHeader: e.target.checked}))}
  />
  <span className="checkbox-label">
    <strong>Read question type and subject</strong>
    <small>Reads aloud the question type (e.g., "Multiple Choice Biology")</small>
  </span>
</label>
```

### Speech Logic

Logic remains unchanged - still uses `pauseAfterHeader` and `emphasizeKeywords`:
```javascript
// Build full speech text based on settings
let fullSpeechText;
if (speechSettings.readHeader) {
  // Include header in speech
  fullSpeechText = speechSettings.pauseAfterHeader 
    ? `${headerText}. ${speechQuestionText}${choicesText}`
    : `${headerText} ${speechQuestionText}${choicesText}`;
} else {
  // Skip header, only read question and choices
  fullSpeechText = `${speechQuestionText}${choicesText}`;
}
```

---

## User Benefits

### Why This Change?

1. **Simpler UI:** Fewer options = less confusion
2. **Better Defaults:** Pause and emphasis improve speech quality
3. **One Key Choice:** Users only need to decide about reading the header
4. **Cleaner Settings:** Advanced Options section is now minimal

### Use Cases

**Enable "Read Header" when:**
- First time practicing a subject
- Want full context for each question
- Practicing mixed subjects
- Need to know question format

**Disable "Read Header" when:**
- Practicing same subject repeatedly
- Want faster question delivery
- Already know the question format
- Focusing on speed training

---

## Settings Interaction

The new setting works with existing voice settings:

1. **Read Header** (User Controllable)
   - Controls whether header is spoken
   - Only user-facing option in Advanced Options

2. **Pause After Header** (Always On)
   - Automatically adds pause when header is read
   - No longer configurable by user

3. **Emphasize Keywords** (Always On)
   - Automatically adds pauses for better clarity
   - No longer configurable by user

---

## Testing

### Test Cases

1. ✅ **Header enabled:** Verify header is read with pause
2. ✅ **Header disabled:** Verify only question is read
3. ✅ **Keywords emphasized:** Verify pauses after key terms
4. ✅ **Setting persists:** Verify setting saves across questions
5. ✅ **Default state:** Verify enabled by default
6. ✅ **UI simplified:** Verify only one checkbox in Advanced Options

### Manual Testing

1. Open Settings → Voice → Advanced Options
2. Verify only "Read question type and subject" checkbox appears
3. Toggle the setting
4. Start a training session
5. Verify speech includes pauses and emphasis (always)
6. Verify header reading matches toggle state

---

## Files Modified

### Modified Files (1):
- `src/App.js`
  - Added `readHeader: true` to `speechSettings` state
  - Removed UI controls for `pauseAfterHeader` and `emphasizeKeywords`
  - Kept logic for all three settings (two are just always on)

### New Files (1):
- `FEATURE-READ-HEADER.md` (this file)

---

## Backward Compatibility

✅ **Fully backward compatible**

- Default values unchanged (all true)
- Behavior is identical to before
- Just removed UI controls for two settings
- Existing users won't notice any difference

---

## Future Enhancements

Potential improvements:
- Add separate controls for type vs subject
- Add option to read format (Multiple Choice vs Short Answer)
- Add option to read question number
- Add custom header format templates

---

## Commit Message

```
Simplify voice settings and add read header toggle

- Added 'readHeader' option to speechSettings (default: true)
- Added checkbox in Voice settings: "Read question type and subject"
- Removed UI controls for 'pauseAfterHeader' and 'emphasizeKeywords'
- These features are now always enabled for better speech quality
- Simplified Advanced Options to single checkbox
- Updated startQuestionReading to conditionally include header in speech
```

---

## Summary

This update simplifies the voice settings by:
1. Making pause and emphasis always enabled (better defaults)
2. Adding one new user-controllable option (read header)
3. Reducing UI complexity in Advanced Options

The result is a cleaner, simpler settings panel with the most important choice front and center.
