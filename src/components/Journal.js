import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  CalendarIcon,
  HeartIcon,
  LightBulbIcon,
  StarIcon,
  FlagIcon,
  AcademicCapIcon,
  UsersIcon,
  TrophyIcon,
  ClockIcon,
  SunIcon
} from '@heroicons/react/24/outline';

// Debounce utility function
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

const journalQuestions = [
  {
    id: 1,
    title: "How are you feeling today? 🌟",
    subtitle: "Take a moment to check in with yourself",
    icon: HeartIcon,
    type: "mood",
    prompts: [
      "💭 What emotions am I experiencing right now?",
      "🎯 What's contributing to how I feel today?",
      "🤲 How can I honor these feelings?"
    ]
  },
  {
    id: 2,
    title: "What are you grateful for? 🙏",
    subtitle: "Focus on the positive aspects of your life",
    icon: StarIcon,
    type: "gratitude",
    prompts: [
      "⭐ Three things I'm grateful for today are...",
      "👥 Someone who made my day better was...",
      "✨ A small moment that brought me joy was..."
    ]
  },
  {
    id: 3,
    title: "What did you learn today? 📚",
    subtitle: "Reflect on your growth and discoveries",
    icon: AcademicCapIcon,
    type: "learning",
    prompts: [
      "🔍 Something new I discovered today...",
      "💪 A skill I practiced or improved...",
      "💡 An insight I gained about myself or others..."
    ]
  },
  {
    id: 4,
    title: "What challenges did you face? ⛰️",
    subtitle: "Acknowledge your struggles and how you handled them",
    icon: FlagIcon,
    type: "challenges",
    prompts: [
      "🚧 The biggest challenge I faced today was...",
      "🛠️ How I handled it was...",
      "🎓 What I learned from this challenge..."
    ]
  },
  {
    id: 5,
    title: "What are your wins for today? 🏆",
    subtitle: "Celebrate your accomplishments, big and small",
    icon: TrophyIcon,
    type: "wins",
    prompts: [
      "🎉 Something I accomplished today that I'm proud of...",
      "🎯 A goal I made progress on...",
      "✅ A habit I successfully maintained..."
    ]
  },
  {
    id: 6,
    title: "How did you connect with others? 💝",
    subtitle: "Reflect on your relationships and social interactions",
    icon: UsersIcon,
    type: "relationships",
    prompts: [
      "💬 A meaningful conversation I had today...",
      "❤️ How I showed kindness to someone...",
      "🌱 A relationship I nurtured today..."
    ]
  },
  {
    id: 7,
    title: "What are you excited about tomorrow? 🌅",
    subtitle: "Set positive intentions for the future",
    icon: SunIcon,
    type: "future",
    prompts: [
      "🎈 Something I'm looking forward to tomorrow...",
      "🎯 One thing I want to focus on tomorrow...",
      "😊 How I want to feel tomorrow..."
    ]
  }
];

const moodOptions = [
  { emoji: '😄', label: 'Excited', color: 'bg-yellow-100 text-yellow-800' },
  { emoji: '😊', label: 'Happy', color: 'bg-green-100 text-green-800' },
  { emoji: '😌', label: 'Peaceful', color: 'bg-blue-100 text-blue-800' },
  { emoji: '😐', label: 'Neutral', color: 'bg-gray-100 text-gray-800' },
  { emoji: '😔', label: 'Sad', color: 'bg-purple-100 text-purple-800' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-red-100 text-red-800' },
  { emoji: '😴', label: 'Tired', color: 'bg-indigo-100 text-indigo-800' },
  { emoji: '🤗', label: 'Grateful', color: 'bg-pink-100 text-pink-800' },
  { emoji: '🥳', label: 'Celebrating', color: 'bg-orange-100 text-orange-800' },
  { emoji: '🤔', label: 'Thoughtful', color: 'bg-teal-100 text-teal-800' },
  { emoji: '😎', label: 'Confident', color: 'bg-cyan-100 text-cyan-800' },
  { emoji: '🥺', label: 'Vulnerable', color: 'bg-rose-100 text-rose-800' }
];

const energyLevels = [
  { level: 1, label: '😴 Very Low', color: 'bg-red-500', emoji: '😴' },
  { level: 2, label: '😐 Low', color: 'bg-orange-500', emoji: '😐' },
  { level: 3, label: '😊 Medium', color: 'bg-yellow-500', emoji: '😊' },
  { level: 4, label: '🚀 High', color: 'bg-green-500', emoji: '🚀' },
  { level: 5, label: '⚡ Very High', color: 'bg-blue-500', emoji: '⚡' }
];

const Journal = ({ onSaveEntry, currentUser }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [journalData, setJournalData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: null,
    energyLevel: 3,
    entries: {}
  });
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saving', 'saved', 'error'

  const currentQuestion = journalQuestions[currentStep];

  // Auto-save functionality with debounce
  const debouncedAutoSave = useCallback(
    debounce(async (data) => {
      if (!currentUser?.uid) return;
      
      // Only auto-save if there's meaningful content
      const hasContent = Object.values(data.entries).some(entry => entry && entry.trim().length > 10);
      if (!hasContent) return;

      try {
        setAutoSaving(true);
        setAutoSaveStatus('saving');
        
        const draftEntry = {
          ...data,
          userId: currentUser.uid,
          timestamp: new Date(),
          type: 'draft',
          isDraft: true
        };
        
        // Store draft in localStorage for immediate recovery
        localStorage.setItem(`journal_draft_${currentUser.uid}`, JSON.stringify(draftEntry));
        
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 3000);
        
      } catch (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      } finally {
        setAutoSaving(false);
      }
    }, 2000), // 2 second delay
    [currentUser?.uid]
  );

  // Load draft on component mount
  useEffect(() => {
    if (currentUser?.uid) {
      const savedDraft = localStorage.getItem(`journal_draft_${currentUser.uid}`);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const today = new Date().toISOString().split('T')[0];
          
          // Only load draft if it's from today
          if (draft.date === today) {
            setJournalData(draft);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [currentUser?.uid]);

  // Auto-save when data changes
  useEffect(() => {
    debouncedAutoSave(journalData);
  }, [journalData, debouncedAutoSave]);

  const handleNext = () => {
    if (currentStep < journalQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (questionId, value) => {
    setJournalData(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [questionId]: value
      }
    }));
  };

  const handleMoodSelect = (mood) => {
    setJournalData(prev => ({
      ...prev,
      mood: mood
    }));
  };

  const handleEnergySelect = (level) => {
    setJournalData(prev => ({
      ...prev,
      energyLevel: level
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    
    try {
      // Validate that we have content to save
      const hasContent = Object.values(journalData.entries).some(entry => entry && entry.trim().length > 0);
      
      if (!hasContent) {
        throw new Error('Please write at least one journal entry before saving.');
      }
      
      const entry = {
        ...journalData,
        userId: currentUser.uid,
        timestamp: new Date(),
        type: 'journal',
        isDraft: false
      };
      
      console.log('Saving final journal entry:', entry);
      await onSaveEntry(entry);
      
      // Clear draft from localStorage after successful save
      localStorage.removeItem(`journal_draft_${currentUser.uid}`);
      
      // Reset form only if save was successful
      setShowSummary(false);
      setCurrentStep(0);
      setJournalData({
        date: new Date().toISOString().split('T')[0],
        mood: null,
        energyLevel: 3,
        entries: {}
      });
      
    } catch (error) {
      console.error('Error in handleSave:', error);
      setSaveError(error.message || 'Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear all your progress? This cannot be undone.')) {
      localStorage.removeItem(`journal_draft_${currentUser.uid}`);
      setJournalData({
        date: new Date().toISOString().split('T')[0],
        mood: null,
        energyLevel: 3,
        entries: {}
      });
      setCurrentStep(0);
      setShowSummary(false);
    }
  };

  const progress = ((currentStep + 1) / journalQuestions.length) * 100;

  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">📖</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📝 Journal Summary</h2>
            <p className="text-sm sm:text-base text-gray-600">Review your reflections for today ✨</p>
          </div>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {/* Mood & Energy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span>😊</span>
                  Today's Mood
                </h3>
                {journalData.mood ? (
                  <div className={`inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-sm ${journalData.mood.color}`}>
                    <span className="text-xl sm:text-2xl">{journalData.mood.emoji}</span>
                    <span className="font-semibold text-base sm:text-lg">{journalData.mood.label}</span>
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm sm:text-base">No mood selected</div>
                )}
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-yellow-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span>⚡</span>
                  Energy Level
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  {energyLevels.map((energy) => (
                    <div
                      key={energy.level}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        energy.level <= journalData.energyLevel ? energy.color + ' text-white' : 'bg-gray-200'
                      }`}
                    >
                      {energy.level <= journalData.energyLevel && energy.emoji}
                    </div>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                  <span className="text-lg">{energyLevels[journalData.energyLevel - 1]?.emoji}</span>
                  <span className="font-medium text-gray-700">
                    {energyLevels[journalData.energyLevel - 1]?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Journal Entries */}
            {Object.entries(journalData.entries).map(([questionId, entry]) => {
              const question = journalQuestions.find(q => q.id === parseInt(questionId));
              if (!entry || !question) return null;
              
              return (
                <div key={questionId} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <question.icon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">{question.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{entry}</p>
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {saveError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => {
                setShowSummary(false);
                setSaveError('');
              }}
              disabled={saving}
              className={`px-4 sm:px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                saving 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <span>✏️</span>
              Edit Entry
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 sm:px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">💾 Saving...</span>
                  <span className="sm:hidden">💾 Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span className="hidden sm:inline">Save Journal Entry</span>
                  <span className="sm:hidden">Save Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-5 border-b border-indigo-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>📝</span>
                Question {currentStep + 1} of {journalQuestions.length}
              </span>
              {/* Auto-save status indicator */}
              {autoSaveStatus && (
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  autoSaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' :
                  autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="animate-spin w-3 h-3 border border-yellow-600 border-t-transparent rounded-full"></div>
                      <span>💾 Auto-saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <span>✅</span>
                      <span>Draft saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <span>❌</span>
                      <span>Save failed</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                <span>📅</span>
                <span className="hidden sm:inline">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </span>
              {/* Clear draft button */}
              {Object.values(journalData.entries).some(entry => entry && entry.trim().length > 0) && (
                <button
                  onClick={handleClearDraft}
                  className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Clear Draft</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-600">
              {Math.round(progress)}% Complete ✨
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 hover:scale-110">
              <currentQuestion.icon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">{currentQuestion.subtitle}</p>
          </div>

          {/* Special handling for mood question */}
          {currentQuestion.type === 'mood' && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">😊 How are you feeling?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(mood)}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
                      journalData.mood?.label === mood.label
                        ? 'border-indigo-500 bg-indigo-50 transform scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">{mood.emoji}</div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700">{mood.label}</div>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Energy Level</h3>
              <div className="flex items-center justify-center gap-3 mb-6">
                {energyLevels.map((energy) => (
                  <button
                    key={energy.level}
                    onClick={() => handleEnergySelect(energy.level)}
                    className={`relative w-14 h-14 rounded-full transition-all hover:scale-110 flex items-center justify-center text-white font-bold shadow-lg ${
                      energy.level <= journalData.energyLevel ? energy.color : 'bg-gray-200'
                    }`}
                    title={energy.label}
                  >
                    <span className="text-lg">{energy.emoji}</span>
                    {energy.level <= journalData.energyLevel && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-lg">{energyLevels[journalData.energyLevel - 1]?.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {energyLevels[journalData.energyLevel - 1]?.label}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Writing prompts */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reflection Prompts</h3>
            <div className="grid gap-3 mb-6">
              {currentQuestion.prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LightBulbIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{prompt}</span>
                </div>
              ))}
            </div>

            <textarea
              value={journalData.entries[currentQuestion.id] || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              placeholder="Share your thoughts here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 shadow-sm hover:shadow-md'
              }`}
            >
              <span>⬅️</span>
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {currentStep === journalQuestions.length - 1 ? (
                <>
                  <span>📋</span>
                  Review & Save
                </>
              ) : (
                <>
                  Next
                  <span>➡️</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal; 