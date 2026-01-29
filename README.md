# National Science Bowl Training PWA

A Progressive Web App for practicing National Science Bowl questions with buzzer simulation, AI-powered answer checking, and advanced filtering.

## Features

### Core Training
- 🧪 **18,131+ Questions**: Real NSB questions (Middle School & High School)
- 🔔 **Buzzer Simulation**: Accurate timing from speech start
- 🗣️ **Text-to-Speech**: Question reading with typewriter effect
- 🔤 **Multiple Choice**: Formatted questions with W) X) Y) Z) options
- ✏️ **Short Answer**: Open-ended written responses
- ⌨️ **Keyboard Shortcuts**: Enter to buzz, ESC to exit

### AI-Powered Features
- 🤖 **Auto-Check Answers**: AI semantic similarity checking using Transformers.js
  - Automatic grading for short answer questions
  - Confidence scoring (high/medium/low)
  - Works offline after initial model download (~23MB)
- 🏷️ **Smart Filtering**: 24 semantic tags across 4 categories
  - Knowledge Type (Factual, Conceptual, Procedural, Metacognitive)
  - Cognitive Level (Remember, Understand, Apply, Analyze, Evaluate, Create)
  - Math Subtopics (Algebra, Geometry, Calculus, etc.)
  - Science Subtopics (Biology, Chemistry, Physics, Earth Science)

### Statistics & Export
- 📊 **Real-Time Stats**: Animated counters with accuracy tracking
- 📥 **Download Data**: Export detailed session statistics to CSV
- ⏱️ **Buzz Timing**: Track reaction times and performance
- 🎯 **Subject Filtering**: Visual subject selection with question counts

### User Experience
- 📱 **PWA**: Installable, works offline
- 🎨 **Modern UI**: Gradient backgrounds, smooth animations
- 🌙 **Dark Mode**: System preference support
- ♿ **Accessible**: Reduced motion support, keyboard navigation
- 📱 **Mobile Optimized**: Touch-friendly controls, iOS Safari compatible
- ⚙️ **Voice Settings**: Customizable speech rate, pitch, and reading options

## Setup for GitHub Pages

1. **Create a new repository on GitHub**
   - Name it something like `nsb-training-pwa`
   - Make it public

2. **Update package.json homepage**
   ```json
   "homepage": "https://yourusername.github.io/nsb-training-pwa"
   ```

3. **Initialize git and push**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/nsb-training-pwa.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy on push to main

5. **Access your PWA**
   - Visit: `https://yourusername.github.io/nsb-training-pwa`
   - Install via "Add to Home Screen"

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Usage

1. **Select Level**: Choose Middle School or High School
2. **Choose Subjects**: Select one or more subjects to practice
3. **Advanced Filters** (Optional): Click to expand and filter by:
   - Knowledge type (Factual, Conceptual, etc.)
   - Cognitive level (Remember, Understand, Apply, etc.)
   - Math/Science subtopics
4. **Set Question Limit** (Optional): Limit number of questions in session
5. **Start Training**: Click "Start Training" to begin
6. **Listen & Read**: Question is read aloud with typewriter text effect
7. **Buzz In**: Press ENTER or click "BUZZ IN" when ready to answer
8. **Answer**: 
   - **Multiple Choice**: View formatted choices, type your letter answer
   - **Short Answer**: Type your written response
9. **Auto-Check** (Optional): Enable in settings for automatic answer validation
10. **Self-Grade**: Mark if your answer was correct/incorrect (or use auto-check)
11. **Continue**: View real-time statistics and continue with next question
12. **Exit**: Download session statistics as CSV when ending session

## Question Types

- **🔤 Multiple Choice**: Questions with W) X) Y) Z) options displayed clearly
- **✏️ Short Answer**: Open-ended questions requiring written responses
- **📊 Statistics**: Track accuracy, reaction times, and progress by question type

## PWA Installation

- **Desktop**: Click the install icon in the address bar
- **Mobile**: Use "Add to Home Screen" from browser menu

## Question Data

Questions are stored in:
- `src/ms-questions-tagged.json` - Middle School questions with AI tags
- `src/hs-questions-tagged.json` - High School questions with AI tags

All 18,131 questions have been classified with semantic tags using Transformers.js.

To re-classify questions:
```bash
npm run classify:all
```

## Keyboard Shortcuts

- **Enter**: Buzz in during question
- **Escape**: Exit training session

## Technologies

- React 18.2
- Progressive Web App (PWA)
- Web Speech API
- Transformers.js (@xenova/transformers) - Browser-native AI
- GitHub Pages deployment with GitHub Actions

## Browser Compatibility

- Chrome/Edge: Full support
- Safari: Full support (iOS 15+)
- Firefox: Full support
- Offline support via Service Worker