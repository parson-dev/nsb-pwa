# National Science Bowl Training PWA

A Progressive Web App for practicing National Science Bowl questions with buzzer simulation.

## Features

- 🧪 Practice with real NSB questions (Middle School & High School)
- 🔔 Buzzer simulation with accurate timing from speech start
- 📱 Installable PWA (Add to Home Screen)
- 🎯 Subject filtering with visual selection
- 📊 Real-time statistics with animated counters
- 🗣️ Text-to-speech question reading with typewriter effect
- 🔤 Multiple Choice questions with proper formatting and choices
- ✏️ Short Answer questions for written responses
- ⌨️ Keyboard shortcuts (Enter to buzz, ESC to exit)
- 🎨 Modern, polished UI with gradient backgrounds
- 📱 Optimized mobile experience with touch-friendly controls
- ✨ Smooth animations and visual feedback
- 🌙 Dark mode support (system preference)
- ♿ Accessibility features and reduced motion support
- ⚙️ Advanced voice settings with tabbed interface

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

1. **Select Level**: Choose Middle School or High School (shows question count)
2. **Choose Subjects**: Select one or more subjects to practice
3. **Start Training**: Click "Start Training" to begin
4. **Listen & Read**: Question is read aloud with typewriter text effect
5. **Buzz In**: Press ENTER or click "BUZZ IN" when ready to answer
6. **Answer**: 
   - **Multiple Choice**: View formatted choices, type your letter answer
   - **Short Answer**: Type your written response
7. **Self-Grade**: Mark if your answer was correct/incorrect
8. **Continue**: View real-time statistics and continue with next question

## Question Types

- **🔤 Multiple Choice**: Questions with W) X) Y) Z) options displayed clearly
- **✏️ Short Answer**: Open-ended questions requiring written responses
- **📊 Statistics**: Track accuracy, reaction times, and progress by question type

## PWA Installation

- **Desktop**: Click the install icon in the address bar
- **Mobile**: Use "Add to Home Screen" from browser menu

## Question Data

Questions are stored in `src/questions.json`. Currently includes Middle School questions. Add High School questions by creating additional JSON files and updating the App component.

## Keyboard Shortcuts

- **Enter**: Buzz in during question
- **Escape**: Exit training session

## Technologies

- React 18
- Progressive Web App (PWA)
- Web Speech API
- GitHub Pages deployment