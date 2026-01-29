import React, { useState, useEffect, useCallback } from 'react';
import MSQuestions from './ms-questions-tagged.json';
import HSQuestions from './hs-questions-tagged.json';
import { checkAnswer, preloadModel } from './answerChecker';

// Generic Settings Menu Component
function SettingsMenu({ 
  settingsOpen, 
  setSettingsOpen,
  availableVoices, 
  selectedVoice, 
  setSelectedVoice, 
  speechSettings, 
  setSpeechSettings,
  autoCheckEnabled,
  setAutoCheckEnabled,
  autoCheckThreshold,
  setAutoCheckThreshold,
  modelReady,
  modelLoading
}) {
  const [activeTab, setActiveTab] = useState('voice');

  const tabs = [
    { id: 'voice', label: 'Voice', icon: '🎤' },
    { id: 'autocheck', label: 'Auto-Check', icon: '🤖' },
    // Future tabs can be added here
    // { id: 'display', label: 'Display', icon: '�' },
    // { id: 'gameplay', label: 'Gameplay', icon: '🎮' },
  ];

  return (
    <div className={`settings-menu ${settingsOpen ? 'open' : ''}`}>
      <button 
        className="settings-toggle-button"
        onClick={() => setSettingsOpen(!settingsOpen)}
      >
        ⚙️ Settings
      </button>
      
      <div className="settings-panel">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="settings-content">
          {activeTab === 'voice' && (
            <VoiceSettings
              availableVoices={availableVoices}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              speechSettings={speechSettings}
              setSpeechSettings={setSpeechSettings}
            />
          )}
          
          {activeTab === 'autocheck' && (
            <AutoCheckSettings
              autoCheckEnabled={autoCheckEnabled}
              setAutoCheckEnabled={setAutoCheckEnabled}
              autoCheckThreshold={autoCheckThreshold}
              setAutoCheckThreshold={setAutoCheckThreshold}
              modelReady={modelReady}
              modelLoading={modelLoading}
            />
          )}
          
          {/* Future settings panels can be added here */}
        </div>
      </div>
    </div>
  );
}

// Voice Settings Panel Component
function VoiceSettings({ 
  availableVoices, 
  selectedVoice, 
  setSelectedVoice, 
  speechSettings, 
  setSpeechSettings 
}) {
  if (availableVoices.length === 0) {
    return (
      <div className="settings-section">
        <div className="no-voices-message">
          <p>🔇 No voices available</p>
          <p className="help-text">Speech synthesis is not supported in this browser or no voices are installed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="setting-group">
        <h4>Voice Selection</h4>
        <div className="voice-selector-section">
          <label>Choose Voice:</label>
          <select 
            value={selectedVoice?.name || ''} 
            onChange={(e) => {
              const voice = availableVoices.find(v => v.name === e.target.value);
              setSelectedVoice(voice);
            }}
            className="settings-select"
          >
            {availableVoices.map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="setting-group">
        <h4>Speech Controls</h4>
        <div className="speech-controls-grid">
          <div className="control-item">
            <label>Speed: {speechSettings.rate.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechSettings.rate}
              onChange={(e) => setSpeechSettings(prev => ({...prev, rate: parseFloat(e.target.value)}))}
              className="settings-slider"
            />
          </div>
          
          <div className="control-item">
            <label>Pitch: {speechSettings.pitch.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechSettings.pitch}
              onChange={(e) => setSpeechSettings(prev => ({...prev, pitch: parseFloat(e.target.value)}))}
              className="settings-slider"
            />
          </div>
          
          <div className="control-item">
            <label>Volume: {speechSettings.volume.toFixed(1)}</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={speechSettings.volume}
              onChange={(e) => setSpeechSettings(prev => ({...prev, volume: parseFloat(e.target.value)}))}
              className="settings-slider"
            />
          </div>
        </div>
      </div>

      <div className="setting-group">
        <h4>Advanced Options</h4>
        <div className="settings-checkboxes">
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
        </div>
      </div>

      <div className="setting-group">
        <button 
          type="button" 
          className="test-voice-button"
          onClick={() => {
            if ('speechSynthesis' in window && selectedVoice) {
              const testUtterance = new SpeechSynthesisUtterance("This is a test of the selected voice settings.");
              testUtterance.voice = selectedVoice;
              testUtterance.rate = speechSettings.rate;
              testUtterance.pitch = speechSettings.pitch;
              testUtterance.volume = speechSettings.volume;
              speechSynthesis.speak(testUtterance);
            }
          }}
        >
          🔊 Test Voice Settings
        </button>
      </div>
    </div>
  );
}

// Auto-Check Settings Panel Component
function AutoCheckSettings({
  autoCheckEnabled,
  setAutoCheckEnabled,
  autoCheckThreshold,
  setAutoCheckThreshold,
  modelReady,
  modelLoading
}) {
  return (
    <div className="settings-section">
      <div className="setting-group">
        <h4>🤖 Automatic Answer Checking</h4>
        <p className="help-text" style={{ marginBottom: '16px', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
          Uses AI to automatically check if your answers are semantically correct, 
          even if they don't match exactly. Works for both multiple choice and short answer questions!
        </p>
        
        <div className="settings-checkboxes">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={autoCheckEnabled}
              onChange={(e) => setAutoCheckEnabled(e.target.checked)}
            />
            <span className="checkbox-label">
              <strong>Enable Auto-Check</strong>
              <small>
                {modelLoading && '⏳ Loading AI model...'}
                {!modelLoading && modelReady && '✅ Model ready'}
                {!modelLoading && !modelReady && '⚠️ Model not loaded'}
              </small>
            </span>
          </label>
        </div>
      </div>

      {autoCheckEnabled && (
        <div className="setting-group">
          <h4>Sensitivity</h4>
          <div className="control-item">
            <label>
              Similarity Threshold: {(autoCheckThreshold * 100).toFixed(0)}%
              <small style={{ display: 'block', color: '#666', fontSize: '12px', marginTop: '4px' }}>
                Higher = stricter matching
              </small>
            </label>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={autoCheckThreshold}
              onChange={(e) => setAutoCheckThreshold(parseFloat(e.target.value))}
              className="settings-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '4px' }}>
              <span>Lenient (50%)</span>
              <span>Strict (95%)</span>
            </div>
          </div>
        </div>
      )}

      <div className="setting-group">
        <div className="info-box">
          <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            <strong>How it works:</strong> The AI compares the meaning of your answer with the correct answer 
            using semantic embeddings. Model size: ~23MB (downloads once, cached locally).
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [level, setLevel] = useState('MS');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // Advanced filtering by tags
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false); // Toggle for advanced filters section
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [buzzed, setBuzzed] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(''); // Number of questions to practice
  const [askedQuestions, setAskedQuestions] = useState([]); // Track asked questions to avoid repeats
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correct: 0,
    buzzTimes: [],
    detailedHistory: [] // Track per-question details
  });

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechSettings, setSpeechSettings] = useState({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    pauseAfterHeader: true,
    emphasizeKeywords: true,
    readHeader: true
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isReading, setIsReading] = useState(false);

  const [speechStartTime, setSpeechStartTime] = useState(null);
  
  // Auto-check feature state
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);
  const [autoCheckThreshold, setAutoCheckThreshold] = useState(0.75);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [autoCheckResult, setAutoCheckResult] = useState(null);

  // Load available voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        setAvailableVoices(englishVoices);
        
        // Auto-select a good default voice
        if (!selectedVoice && englishVoices.length > 0) {
          const defaultVoice = englishVoices.find(voice => 
            voice.name.includes('Natural') || 
            voice.name.includes('Enhanced') ||
            voice.name.includes('Premium') ||
            voice.localService
          ) || englishVoices[0];
          setSelectedVoice(defaultVoice);
        }
      };
      
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  // Preload model when auto-check is enabled
  useEffect(() => {
    if (autoCheckEnabled && !modelReady && !modelLoading) {
      setModelLoading(true);
      preloadModel()
        .then((success) => {
          setModelReady(success);
          setModelLoading(false);
        })
        .catch(() => {
          setModelLoading(false);
        });
    }
  }, [autoCheckEnabled, modelReady, modelLoading]);

  // Get current question data based on level
  const getCurrentQuestionData = () => {
    return level === 'MS' ? MSQuestions : HSQuestions;
  };

  // Get unique subjects from questions
  const getSubjects = () => {
    const questionData = getCurrentQuestionData();
    const subjects = [...new Set(questionData.map(q => q.subject))].sort();
    return subjects;
  };

  // Filter questions based on selected subjects and tags
  const getFilteredQuestions = () => {
    const questionData = getCurrentQuestionData();
    return questionData.filter(q => {
      // Filter by subject
      if (!selectedSubjects.includes(q.subject)) return false;
      
      // Filter by tags (if any selected)
      if (selectedTags.length > 0) {
        // Question must have at least one of the selected tags
        return selectedTags.some(tag => q.tags?.includes(tag));
      }
      
      return true;
    });
  };

  // Get all available tags from filtered questions
  const getAvailableTags = () => {
    const questionData = getCurrentQuestionData();
    const filteredBySubject = questionData.filter(q => 
      selectedSubjects.includes(q.subject)
    );
    
    const allTags = new Set();
    filteredBySubject.forEach(q => {
      if (q.tags) {
        q.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    return Array.from(allTags).sort();
  };

  // Categorize tags by type
  const categorizeTag = (tag) => {
    const knowledgeTypes = ['factual', 'conceptual', 'computational', 'analytical'];
    const cognitiveTypes = ['recall', 'application', 'synthesis'];
    const mathSubtopics = ['algebra', 'geometry', 'statistics', 'probability', 'calculus', 'number-theory'];
    
    if (knowledgeTypes.includes(tag)) return 'knowledge';
    if (cognitiveTypes.includes(tag)) return 'cognitive';
    if (mathSubtopics.includes(tag)) return 'math-subtopic';
    return 'science-subtopic';
  };

  // Get tags organized by category
  const getTagsByCategory = () => {
    const availableTags = getAvailableTags();
    const categories = {
      knowledge: [],
      cognitive: [],
      'math-subtopic': [],
      'science-subtopic': []
    };
    
    availableTags.forEach(tag => {
      const category = categorizeTag(tag);
      categories[category].push(tag);
    });
    
    return categories;
  };

  // Handle tag selection
  const handleTagChange = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Handle subject selection
  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  // Start training session
  const startTraining = () => {
    if (selectedSubjects.length === 0) return;
    setGameStarted(true);
    loadNextQuestion();
  };

  // Load a random question from filtered set
  const loadNextQuestion = () => {
    const filteredQuestions = getFilteredQuestions();
    if (filteredQuestions.length === 0) return;
    
    // Filter out already asked questions
    const availableQuestions = filteredQuestions.filter(
      q => !askedQuestions.includes(q.question)
    );
    
    let selectedQuestion;
    
    // If all questions have been asked, reset the pool
    if (availableQuestions.length === 0) {
      setAskedQuestions([]);
      // Use all filtered questions again
      selectedQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      setAskedQuestions([selectedQuestion.question]);
    } else {
      // Pick a random question from available ones
      selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      setAskedQuestions(prev => [...prev, selectedQuestion.question]);
    }
    
    setCurrentQuestion(selectedQuestion);
    setUserAnswer('');
    setBuzzed(false);
    setShowAnswer(false);
    setDisplayedText('');
    setIsReading(true);
    setAutoCheckResult(null); // Reset auto-check result for new question

    setSpeechStartTime(null);
    
    // Start the question reading process
    startQuestionReading(selectedQuestion);
  };

  // Start reading question with typewriter effect
  const startQuestionReading = (question) => {
    // Format text for speech and display
    const headerText = `${question.type} ${question.subject} (${question.format})`;
    let questionText = question.question;
    
    // For multiple choice, add choices to speech with natural pauses and phonetic handling
    let choicesText = '';
    if (question.choices) {
      const choicesList = Object.entries(question.choices)
        .map(([letter, option]) => {
          // Handle phonetic pronunciations in choices for speech
          const speechOption = option.replace(/(\w+)\s*\[([^\]]+)\]/g, '$2');
          return `${letter}) ${speechOption}`;
        })
        .join(', '); // Add comma and space for natural pauses
      choicesText = ` ${choicesList}`;
    }
    
    // Create separate text for speech with phonetic replacements
    let speechQuestionText = questionText;
    
    // Handle phonetic pronunciations for speech
    // Replace "word [FOH-net-ik]" with just "FOH-net-ik" for better speech synthesis
    speechQuestionText = speechQuestionText.replace(/(\w+)\s*\[([^\]]+)\]/g, '$2');
    
    // Add emphasis to key scientific terms if enabled
    if (speechSettings.emphasizeKeywords) {
      speechQuestionText = speechQuestionText
        .replace(/\b(calculate|determine|identify|what|which|how|why)\b/gi, '$1,')
        .replace(/\b(\d+\.?\d*)\b/g, '$1,')
        .replace(/\b([A-Z]{2,})\b/g, '$1,');
    }
    
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
    
    // For display, only show question and choices (header is already visible)
    let fullDisplayText = question.question;
    if (question.choices) {
      const choicesDisplay = Object.entries(question.choices)
        .map(([letter, option]) => `${letter}) ${option}`)
        .join('\n');
      fullDisplayText += `\n\n${choicesDisplay}`;
    }
    
    // Start speech synthesis
    if ('speechSynthesis' in window && selectedVoice) {
      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      utterance.rate = speechSettings.rate;
      utterance.pitch = speechSettings.pitch;
      utterance.volume = speechSettings.volume;
      utterance.voice = selectedVoice;
      
      // Track when speech actually starts
      utterance.onstart = () => {
        const startTime = Date.now();
        setSpeechStartTime(startTime);
        
        // Start typewriter effect
        startTypewriterEffect(fullDisplayText, utterance);
      };
      
      // Handle speech end
      utterance.onend = () => {
        setIsReading(false);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback if no speech synthesis
      const startTime = Date.now();
      setSpeechStartTime(startTime);
      setDisplayedText(fullDisplayText);
      setIsReading(false);
    }
  };

  // Typewriter effect synchronized with speech
  const startTypewriterEffect = (text, utterance) => {
    const words = text.split(' ');
    let currentIndex = 0;
    
    // Calculate timing based on speech rate (words per minute)
    const baseWPM = 150; // Average speaking rate
    const adjustedWPM = baseWPM * speechSettings.rate;
    const msPerWord = (60 / adjustedWPM) * 1000;
    
    const typeInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const displayText = words.slice(0, currentIndex + 1).join(' ');
        setDisplayedText(displayText);
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setDisplayedText(text); // Ensure full text is shown
        setIsReading(false);
      }
    }, msPerWord);
    
    // Store interval reference to clear it when user buzzes
    window.currentTypewriterInterval = typeInterval;
    
    // Clean up interval if component unmounts or question changes
    return () => clearInterval(typeInterval);
  };



  // Handle buzz in
  const handleBuzz = useCallback(() => {
    if (buzzed) return;
    setBuzzed(true);
    setIsReading(false);
    
    // Stop speech if speaking
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop typewriter effect and show full text
    if (window.currentTypewriterInterval) {
      clearInterval(window.currentTypewriterInterval);
    }
    
    // Show full question text immediately
    if (currentQuestion) {
      let fullDisplayText = currentQuestion.question;
      if (currentQuestion.choices) {
        const choicesDisplay = Object.entries(currentQuestion.choices)
          .map(([letter, option]) => `${letter}) ${option}`)
          .join('\n');
        fullDisplayText += `\n\n${choicesDisplay}`;
      }
      setDisplayedText(fullDisplayText);
    }
    
    // Record buzz time from when speech started (more accurate)
    const buzzTime = speechStartTime ? (Date.now() - speechStartTime) / 1000 : 0;
    setStats(prev => ({
      ...prev,
      buzzTimes: [...prev.buzzTimes, buzzTime]
    }));
  }, [buzzed, speechStartTime, currentQuestion]);

  // Submit answer
  const submitAnswer = async () => {
    // Only proceed if user has actually provided an answer
    if (!userAnswer || !userAnswer.trim()) {
      return; // Don't submit if no answer provided
    }
    
    // If auto-check is enabled and model is ready, check the answer automatically
    if (autoCheckEnabled && modelReady) {
      setAutoCheckResult({ checking: true });
      
      try {
        // For multiple choice, do exact letter matching instead of semantic similarity
        if (currentQuestion.choices) {
          // Extract just the letter from the correct answer (e.g., "Z) HEAD" -> "Z")
          const correctLetter = currentQuestion.answer.match(/^([WXYZ])\)/)?.[1];
          const isCorrect = userAnswer === correctLetter;
          
          // Create a result object that matches the checkAnswer format
          const result = {
            isCorrect: isCorrect,
            similarity: isCorrect ? 1.0 : 0.0,
            confidence: isCorrect ? 'high' : 'high', // Always high confidence for exact match
            method: 'exact-match'
          };
          
          setAutoCheckResult(result);
        } else {
          // For short answer, use semantic similarity
          const result = await checkAnswer(userAnswer, currentQuestion.answer, autoCheckThreshold);
          setAutoCheckResult(result);
        }
        
        // Don't auto-advance - let user review and click "Next Question"
      } catch (error) {
        console.error('Auto-check failed:', error);
        setAutoCheckResult(null);
        setShowAnswer(true);
      }
    } else {
      // Manual checking mode
      setShowAnswer(true);
      setAutoCheckResult(null);
    }
  };

  // Mark answer as correct/incorrect and move to next
  const handleAnswerResult = (isCorrect) => {
    // Get the current buzz time for this question
    const currentBuzzTime = stats.buzzTimes.length > 0 
      ? stats.buzzTimes[stats.buzzTimes.length - 1] 
      : 0;
    
    // Calculate the new question count (after this answer)
    const newQuestionsAnswered = stats.questionsAnswered + 1;
    
    // Create detailed record for this question
    const questionRecord = {
      questionNumber: newQuestionsAnswered,
      timestamp: new Date().toISOString(),
      level: level,
      subject: currentQuestion.subject,
      type: currentQuestion.type,
      format: currentQuestion.format,
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: userAnswer,
      isCorrect: isCorrect,
      buzzTime: currentBuzzTime,
      autoCheckUsed: autoCheckResult !== null,
      autoCheckConfidence: autoCheckResult?.confidence || null,
      autoCheckSimilarity: autoCheckResult?.similarity || null
    };
    
    // Update stats first
    setStats(prev => ({
      questionsAnswered: prev.questionsAnswered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      buzzTimes: prev.buzzTimes,
      detailedHistory: [...prev.detailedHistory, questionRecord]
    }));
    
    // Check if we've reached the question limit
    // If so, we'll let the useEffect below handle the exit
    if (questionLimit && newQuestionsAnswered >= parseInt(questionLimit)) {
      return; // Don't load next question
    }
    
    // Add a small delay to ensure stats update is rendered before loading next question
    // This fixes iOS Safari rendering issues where stats don't update visually
    setTimeout(() => {
      loadNextQuestion();
    }, 100);
  };

  // Download stats as CSV
  const downloadStats = useCallback(() => {
    if (stats.detailedHistory.length === 0) {
      alert('No data to download yet. Answer some questions first!');
      return;
    }

    // Create CSV content
    const headers = [
      'Question #',
      'Timestamp',
      'Level',
      'Subject',
      'Type',
      'Format',
      'Question',
      'Correct Answer',
      'Your Answer',
      'Result',
      'Buzz Time (s)',
      'Auto-Check Used',
      'Confidence',
      'Similarity %'
    ];

    const rows = stats.detailedHistory.map(record => [
      record.questionNumber,
      record.timestamp,
      record.level,
      record.subject,
      record.type,
      record.format,
      `"${record.question.replace(/"/g, '""')}"`, // Escape quotes in question text
      `"${record.correctAnswer.replace(/"/g, '""')}"`,
      `"${record.userAnswer.replace(/"/g, '""')}"`,
      record.isCorrect ? 'Correct' : 'Incorrect',
      record.buzzTime.toFixed(2),
      record.autoCheckUsed ? 'Yes' : 'No',
      record.autoCheckConfidence || 'N/A',
      record.autoCheckSimilarity ? (record.autoCheckSimilarity * 100).toFixed(1) : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.setAttribute('href', url);
    link.setAttribute('download', `nsb-training-stats-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [stats.detailedHistory]);

  // Exit training
  const exitTraining = useCallback(() => {
    // Stop speech if speaking
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Prompt to download stats if there's data
    if (stats.detailedHistory.length > 0) {
      const shouldDownload = window.confirm(
        `You answered ${stats.questionsAnswered} question${stats.questionsAnswered !== 1 ? 's' : ''} with ${Math.round((stats.correct / stats.questionsAnswered) * 100)}% accuracy.\n\nWould you like to download your session statistics?`
      );
      
      if (shouldDownload) {
        downloadStats();
      }
    }
    
    setGameStarted(false);
    setCurrentQuestion(null);
    setAskedQuestions([]);
    setStats({
      questionsAnswered: 0,
      correct: 0,
      buzzTimes: [],
      detailedHistory: []
    });
  }, [stats, downloadStats]);

  // Check if question limit reached and trigger exit
  useEffect(() => {
    if (gameStarted && questionLimit && stats.questionsAnswered >= parseInt(questionLimit) && stats.questionsAnswered > 0) {
      // Small delay to ensure UI updates before showing exit dialog
      const timer = setTimeout(() => {
        exitTraining();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stats.questionsAnswered, questionLimit, gameStarted, exitTraining]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && gameStarted && !buzzed) {
        handleBuzz();
      }
      if (e.key === 'Escape' && gameStarted) {
        exitTraining();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, buzzed, handleBuzz, exitTraining]);

  // Add typewriter cursor class management
  useEffect(() => {
    const questionTextElement = document.querySelector('.question-text');
    if (questionTextElement) {
      if (isReading) {
        questionTextElement.classList.remove('complete');
      } else {
        questionTextElement.classList.add('complete');
      }
    }
  }, [isReading]);

  // Keyboard support for multiple choice questions
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (buzzed && currentQuestion?.choices && !showAnswer) {
        const key = e.key.toUpperCase();
        if (['W', 'X', 'Y', 'Z'].includes(key) && currentQuestion.choices[key]) {
          setUserAnswer(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [buzzed, currentQuestion, showAnswer]);

  if (!gameStarted) {
    return (
      <div className="container">
        <div className="header">
          <h1>🧪 National Science Bowl Training</h1>
          <p>Practice buzzer skills and knowledge...</p>
        </div>

        <div className="setup-panel">
          <div className="level-selector">
            <h3>Select Level:</h3>
            <div>
              <label>
                <input
                  type="radio"
                  value="MS"
                  checked={level === 'MS'}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setSelectedSubjects([]); // Reset subjects when level changes
                  }}
                />
                <span>Middle School ({MSQuestions.length} questions)</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="HS"
                  checked={level === 'HS'}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setSelectedSubjects([]); // Reset subjects when level changes
                  }}
                />
                <span>High School ({HSQuestions.length} questions)</span>
              </label>
            </div>
          </div>

          <h3>Select Subjects:</h3>
          <div className="subject-grid">
            {getSubjects().map(subject => (
              <label key={subject} className="subject-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                />
                <span>{subject}</span>
              </label>
            ))}
          </div>

          {/* Advanced Filters Section */}
          {selectedSubjects.length > 0 && (
            <div className="advanced-filters-section">
              <button 
                className="advanced-filters-toggle"
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              >
                <span className="toggle-icon">{advancedFiltersOpen ? '▼' : '▶'}</span>
                <span className="toggle-text">Advanced Filters</span>
                {selectedTags.length > 0 && (
                  <span className="active-filters-badge">{selectedTags.length} active</span>
                )}
              </button>

              {advancedFiltersOpen && (
                <div className="advanced-filters-content">
                  <p className="filters-help-text">
                    Filter questions by knowledge type, cognitive level, or specific subtopics
                  </p>

                  {(() => {
                    const tagsByCategory = getTagsByCategory();
                    const hasKnowledge = tagsByCategory.knowledge.length > 0;
                    const hasCognitive = tagsByCategory.cognitive.length > 0;
                    const hasMathSubtopics = tagsByCategory['math-subtopic'].length > 0;
                    const hasScienceSubtopics = tagsByCategory['science-subtopic'].length > 0;

                    return (
                      <>
                        {hasKnowledge && (
                          <div className="tag-category">
                            <h4>Knowledge Type</h4>
                            <div className="tag-grid">
                              {tagsByCategory.knowledge.map(tag => (
                                <label key={tag} className="tag-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                  />
                                  <span className="tag-label">{tag}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {hasCognitive && (
                          <div className="tag-category">
                            <h4>Cognitive Level</h4>
                            <div className="tag-grid">
                              {tagsByCategory.cognitive.map(tag => (
                                <label key={tag} className="tag-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                  />
                                  <span className="tag-label">{tag}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {hasMathSubtopics && (
                          <div className="tag-category">
                            <h4>Math Subtopics</h4>
                            <div className="tag-grid">
                              {tagsByCategory['math-subtopic'].map(tag => (
                                <label key={tag} className="tag-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                  />
                                  <span className="tag-label">{tag}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {hasScienceSubtopics && (
                          <div className="tag-category">
                            <h4>Science Subtopics</h4>
                            <div className="tag-grid">
                              {tagsByCategory['science-subtopic'].map(tag => (
                                <label key={tag} className="tag-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                  />
                                  <span className="tag-label">{tag}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedTags.length > 0 && (
                          <div className="filter-actions">
                            <button 
                              className="clear-filters-button"
                              onClick={clearTagFilters}
                            >
                              Clear All Filters
                            </button>
                            <div className="filtered-count">
                              {getFilteredQuestions().length} questions match your filters
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <div className="question-limit-section">
            <h3>Number of Questions (Optional):</h3>
            <input
              type="number"
              className="question-limit-input"
              placeholder="Leave blank for unlimited"
              min="1"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(e.target.value)}
            />
          </div>

          <button 
            className="start-button"
            onClick={startTraining}
            disabled={selectedSubjects.length === 0}
          >
            {selectedSubjects.length === 0 ? 'Select subjects to start' : `Start Training (${selectedSubjects.length} subjects)`}
          </button>
        </div>
        
        {/* Settings Menu - Fixed Bottom */}
        <SettingsMenu 
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          availableVoices={availableVoices}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          speechSettings={speechSettings}
          setSpeechSettings={setSpeechSettings}
          autoCheckEnabled={autoCheckEnabled}
          setAutoCheckEnabled={setAutoCheckEnabled}
          autoCheckThreshold={autoCheckThreshold}
          setAutoCheckThreshold={setAutoCheckThreshold}
          modelReady={modelReady}
          modelLoading={modelLoading}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🧪 NSB Training</h1>
        <p>
          <span className="desktop-only">Press ENTER to buzz in • W/X/Y/Z for multiple choice • ESC to exit</span>
          <span className="mobile-only">Tap BUZZ IN button • Tap choices • Tap Exit to quit</span>
        </p>
      </div>

      {currentQuestion && (
        <div className="question-panel">
          <div className="question-header">
            #{stats.questionsAnswered + 1} • {currentQuestion.type} • {currentQuestion.subject} • 
            <span className={`format-badge ${currentQuestion.format.toLowerCase().replace(' ', '-')}`}>
              {currentQuestion.format === 'Multiple Choice' ? '🔤 Multiple Choice' : '✏️ Short Answer'}
            </span>
          </div>
          
          <div className="question-text">
            {displayedText}
          </div>







          {!buzzed ? (
            <button className="buzz-button" onClick={handleBuzz}>
              🔔 BUZZ IN
            </button>
          ) : (
            <div>
              {currentQuestion.choices ? (
                // Multiple Choice - Show clickable options
                <div className="multiple-choice-answer-options">
                  <h4>Select your answer:</h4>
                  <div className="choice-buttons">
                    {Object.entries(currentQuestion.choices).map(([letter, option]) => (
                      <button
                        key={letter}
                        className={`choice-button ${userAnswer === letter ? 'selected' : ''}`}
                        onClick={() => setUserAnswer(letter)}
                      >
                        <span className="choice-letter">{letter})</span>
                        <span className="choice-text">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Short Answer - Show text input
                <input
                  type="text"
                  className="answer-input"
                  placeholder="Enter your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                />
              )}
              
              {!showAnswer && !autoCheckResult ? (
                <button 
                  className="submit-button" 
                  onClick={submitAnswer}
                  disabled={!userAnswer}
                >
                  {autoCheckEnabled && modelReady ? '🤖 Auto-Check Answer' : 'Submit Answer'}
                </button>
              ) : autoCheckResult?.checking ? (
                <div className="auto-check-loading">
                  <div className="loading-spinner"></div>
                  <p>Checking your answer...</p>
                </div>
              ) : autoCheckResult && !showAnswer ? (
                <div>
                  <div className={`auto-check-result ${autoCheckResult.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="result-header">
                      {autoCheckResult.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                      <span className="confidence-badge">{autoCheckResult.confidence} confidence</span>
                    </div>
                    <div className="result-details">
                      <p><strong>Your Answer:</strong> {
                        currentQuestion.choices && userAnswer 
                          ? `${userAnswer}) ${currentQuestion.choices[userAnswer]}`
                          : userAnswer
                      }</p>
                      <p><strong>Correct Answer:</strong> {currentQuestion.answer}</p>
                      <p className="similarity-score">
                        Similarity: {(autoCheckResult.similarity * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <button 
                    className="next-button"
                    onClick={() => handleAnswerResult(autoCheckResult.isCorrect)}
                  >
                    Next Question →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="answer-reveal">
                    <strong>Correct Answer:</strong> {currentQuestion.answer}
                    <br />
                    <br />
                    <strong>Your Answer:</strong> {
                      currentQuestion.choices && userAnswer 
                        ? `${userAnswer}) ${currentQuestion.choices[userAnswer]}`
                        : userAnswer || '(no answer)'
                    }
                  </div>
                  
                  <div className="button-group">
                    <button 
                      className="submit-button correct"
                      onClick={() => handleAnswerResult(true)}
                    >
                      ✓ Correct
                    </button>
                    <button 
                      className="submit-button incorrect"
                      onClick={() => handleAnswerResult(false)}
                    >
                      ✗ Incorrect
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="stats" key={`stats-${stats.questionsAnswered}-${stats.correct}`}>
        <h3>Session Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.questionsAnswered}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.correct}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {stats.questionsAnswered > 0 ? Math.round((stats.correct / stats.questionsAnswered) * 100) : 0}%
            </div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {stats.buzzTimes.length > 0 ? (stats.buzzTimes.reduce((a, b) => a + b, 0) / stats.buzzTimes.length).toFixed(2) : '0.00'}s
            </div>
            <div className="stat-label">Avg Buzz Time</div>
          </div>
        </div>
        
        <button className="exit-button" onClick={exitTraining}>
          Exit Training
        </button>
      </div>
      
      {/* Settings Menu - Fixed Bottom */}
      <SettingsMenu 
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        availableVoices={availableVoices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        speechSettings={speechSettings}
        setSpeechSettings={setSpeechSettings}
        autoCheckEnabled={autoCheckEnabled}
        setAutoCheckEnabled={setAutoCheckEnabled}
        autoCheckThreshold={autoCheckThreshold}
        setAutoCheckThreshold={setAutoCheckThreshold}
        modelReady={modelReady}
        modelLoading={modelLoading}
      />
    </div>
  );
}

export default App;