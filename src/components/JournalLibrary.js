import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const JournalLibrary = ({ entries, onDeleteEntry, onUpdateEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [minWords, setMinWords] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editedContent, setEditedContent] = useState({});

  const moodOptions = [
    { value: 'all', label: 'All Moods', emoji: '📚' },
    { value: 'excited', label: 'Excited', emoji: '😄' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😔' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
    { value: 'grateful', label: 'Grateful', emoji: '🤗' },
    { value: 'celebrating', label: 'Celebrating', emoji: '🥳' },
    { value: 'thoughtful', label: 'Thoughtful', emoji: '🤔' },
    { value: 'confident', label: 'Confident', emoji: '😎' },
    { value: 'vulnerable', label: 'Vulnerable', emoji: '🥺' }
  ];

  const getValidDate = (dateInput) => {
    if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
      // Firebase Timestamp
      return dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      // Firebase Timestamp with seconds
      return new Date(dateInput.seconds * 1000);
    } else if (dateInput) {
      // Regular date string or Date object
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? new Date() : date;
    } else {
      // Fallback to current date
      return new Date();
    }
  };

  const formatDate = (timestamp) => {
    let date;
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp) {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    return isNaN(date.getTime()) ? 'Recent Entry' : date.toLocaleDateString();
  };

  const getWordCount = (entry) => {
    return Object.values(entry.entries || {}).join(' ').split(/\s+/).filter(word => word.length > 0).length;
  };

  // Extract all unique moods for filter options
  const uniqueMoods = useMemo(() => {
    const moods = [...new Set(entries.map(entry => entry.mood?.label).filter(Boolean))];
    return moods.sort();
  }, [entries]);

  // Extract tags (simplified - could be enhanced with actual tagging system)
  const extractTags = (entry) => {
    const text = Object.values(entry.entries || {}).join(' ').toLowerCase();
    const tagWords = ['work', 'family', 'health', 'travel', 'exercise', 'meditation', 'goals', 'gratitude', 'stress', 'happiness'];
    return tagWords.filter(tag => text.includes(tag));
  };

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries.filter(entry => {
      // Mood filter
      if (selectedMoodFilter !== 'all' && entry.mood?.label !== selectedMoodFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const entryText = Object.values(entry.entries || {}).join(' ').toLowerCase();
        const moodText = (entry.mood?.label || '').toLowerCase();
        if (!entryText.includes(searchLower) && !moodText.includes(searchLower)) {
          return false;
        }
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const entryDate = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp || entry.date);
        if (dateRange.start && entryDate < new Date(dateRange.start)) return false;
        if (dateRange.end && entryDate > new Date(dateRange.end)) return false;
      }

      // Word count filter
      if (minWords && getWordCount(entry) < parseInt(minWords)) {
        return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const entryTags = extractTags(entry);
        if (!selectedTags.some(tag => entryTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return (a.timestamp?.toDate?.() || new Date(a.timestamp || a.date)) - (b.timestamp?.toDate?.() || new Date(b.timestamp || b.date));
        case 'date-desc':
          return (b.timestamp?.toDate?.() || new Date(b.timestamp || b.date)) - (a.timestamp?.toDate?.() || new Date(a.timestamp || a.date));
        case 'mood':
          return (a.mood?.label || '').localeCompare(b.mood?.label || '');
        case 'energy':
          return (b.energy || 0) - (a.energy || 0);
        case 'word-count':
          return getWordCount(b) - getWordCount(a);
        default:
          return 0;
      }
    });

    return filtered;
  }, [entries, selectedMoodFilter, searchQuery, sortBy, dateRange, minWords, selectedTags]);

  const getEntryPreview = (entries) => {
    if (!entries || Object.keys(entries).length === 0) return "No content";
    
    const firstEntry = Object.values(entries)[0];
    if (firstEntry.length <= 120) return firstEntry;
    
    // Truncate at word boundary to prevent cutting words in half
    const truncated = firstEntry.substring(0, 120);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 80 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const getAnsweredQuestions = (entries) => {
    return Object.keys(entries || {}).length;
  };

  const exportToText = () => {
    const content = filteredAndSortedEntries.map(entry => {
      const date = formatDate(entry.timestamp || entry.date);
      const mood = entry.mood ? `${entry.mood.emoji} ${entry.mood.label}` : 'No mood';
      const energy = entry.energy ? `Energy: ${entry.energy}/5` : 'No energy';
      const entryText = Object.values(entry.entries || {}).join('\n\n');
      const wordCount = getWordCount(entry);
      
      return `Date: ${date}
Mood: ${mood}
${energy}
Words: ${wordCount}

${entryText}

---`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `journal-entries-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printSingleEntry = (entry) => {
    const date = formatDate(entry.timestamp || entry.date);
    const mood = entry.mood ? `${entry.mood.emoji} ${entry.mood.label}` : 'No mood';
    const energy = entry.energyLevel ? `Energy: ${entry.energyLevel}/5` : 'No energy level';
    const wordCount = getWordCount(entry);
    
    const questionTitles = {
      1: "How are you feeling today?",
      2: "What are you grateful for?",
      3: "What did you learn today?",
      4: "What challenges did you face?",
      5: "What are your wins for today?",
      6: "How did you connect with others?",
      7: "What are you excited about tomorrow?"
    };
    
    const entryText = Object.entries(entry.entries || {}).map(([questionId, answer]) => {
      return `${questionTitles[questionId] || `Question ${questionId}`}\n${answer}`;
    }).join('\n\n');
    
    const content = `MINDFUL JOURNAL ENTRY

Date: ${date}
Mood: ${mood}
${energy}
Words: ${wordCount}

${entryText}`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Journal Entry - ${date}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .meta { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .content { white-space: pre-wrap; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>📖 Mindful Journal Entry</h1>
          <div class="meta">${content.split('\n\n')[0]}</div>
          <div class="content">${content.split('\n\n').slice(1).join('\n\n')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEdit = (entry, index) => {
    setEditingEntry(index);
    // Ensure we copy all the current entry content properly
    const currentEntries = entry.entries || {};
    setEditedContent({ ...currentEntries });
    setExpandedEntry(index);
    setOpenMenuIndex(null);
  };

  const handleSaveEdit = async (entry, index) => {
    try {
      if (onUpdateEntry) {
        const updatedEntry = {
          ...entry,
          entries: editedContent,
          updatedAt: new Date()
        };
        await onUpdateEntry(entry.id || index, updatedEntry);
      }
      setEditingEntry(null);
      setEditedContent({});
    } catch (error) {
      console.error('Error saving edited entry:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditedContent({});
  };

  const handleContentChange = (questionId, value) => {
    setEditedContent(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuIndex(null);
    };
    
    if (openMenuIndex !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuIndex]);

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <span className="text-6xl sm:text-8xl mb-4 sm:mb-6 block">📖</span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2 flex-wrap">
            <span>✨</span>
            No Journal Entries Yet
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex items-center justify-center gap-2 flex-wrap px-4">
            <span>🌱</span>
            Start your journaling journey by creating your first entry.
          </p>
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 sm:p-6 max-w-md mx-auto border border-indigo-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-700 flex items-center justify-center gap-2 flex-wrap">
              <span>💡</span>
              Regular journaling can help improve mental clarity, emotional well-being, and personal growth.
              <span>🧠💖</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span className="text-2xl sm:text-4xl">📚</span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">📖 Journal Library</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2 flex-wrap">
          <span>✨</span>
          <span>Your personal collection of reflections and thoughts.</span>
          <span className="font-semibold text-indigo-600">{entries.length}</span> 
          <span>entries found.</span>
          <span>📝</span>
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Mood Filter */}
          <div className="relative">
            <select
              value={selectedMoodFilter}
              onChange={(e) => setSelectedMoodFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
            >
              {moodOptions.map(mood => (
                <option key={mood.value} value={mood.value}>
                  {mood.emoji} {mood.label}
                </option>
              ))}
            </select>
            <FunnelIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="date-desc">📅 Newest First</option>
              <option value="date-asc">📅 Oldest First</option>
              <option value="mood">😊 By Mood</option>
              <option value="energy">⚡ By Energy</option>
              <option value="word-count">📝 By Length</option>
            </select>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              showAdvancedSearch 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔧 Advanced
          </button>

          {filteredAndSortedEntries.length > 0 && (
            <button
              onClick={exportToText}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              📤 Export
            </button>
          )}
        </div>

        {showAdvancedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📝 Min Words</label>
              <input
                type="number"
                placeholder="e.g., 50"
                value={minWords}
                onChange={(e) => setMinWords(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredAndSortedEntries.length !== entries.length && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredAndSortedEntries.length} of {entries.length} entries
        </div>
      )}

      {/* Entries Grid */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <span>😔</span>
            No entries match your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedEntries.map((entry, index) => (
            <div 
              key={index} 
              onClick={() => setExpandedEntry(expandedEntry === index ? null : index)}
              className={`bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                expandedEntry === index ? 'ring-2 ring-indigo-200 border-indigo-300' : ''
              }`}
            >
              {/* Entry Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-4 mb-2">
                      <span className="text-lg sm:text-xl">📅</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {formatDate(entry.timestamp || entry.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                      {entry.mood && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.mood.emoji}</span>
                          <span>{entry.mood.label}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>⭐</span>
                        <span>{getAnsweredQuestions(entry.entries)} questions answered</span>
                      </div>
                      {entry.energyLevel && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < entry.energyLevel ? 'bg-indigo-500' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span>⚡ Energy</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Expand/Collapse Indicator */}
                    <div className="text-gray-400">
                      {expandedEntry === index ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </div>
                    
                    {/* Three-dot menu */}
                    <div className="relative">
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIndex(openMenuIndex === index ? null : index);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="More options"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuIndex === index && (
                      <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(entry, index);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Edit Entry</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printSingleEntry(entry);
                            setOpenMenuIndex(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <PrinterIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">Print Entry</span>
                        </button>

                        {onDeleteEntry && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
                                onDeleteEntry(entry.id || index);
                              }
                              setOpenMenuIndex(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors border-t border-gray-100"
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600">Delete Entry</span>
                          </button>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
                
                {/* Preview */}
                {expandedEntry !== index && (
                  <div className="mt-3 text-gray-600">
                    <span className="text-xs sm:text-sm text-gray-500 italic">💭 </span>
                    <span className="text-xs sm:text-sm leading-relaxed break-words">
                      {getEntryPreview(entry.entries)}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {expandedEntry === index && (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6" onClick={(e) => e.stopPropagation()}>
                  {/* Edit/Save buttons when editing */}
                  {editingEntry === index && (
                    <div className="flex justify-end gap-3 mb-4 pb-4 border-b border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span>❌</span>
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(entry, index);
                        }}
                        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span>💾</span>
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}

                  {Object.entries(entry.entries || {}).map(([questionId, answer]) => {
                    // You might want to store question titles with entries in the future
                    const questionTitles = {
                      1: "How are you feeling today?",
                      2: "What are you grateful for?",
                      3: "What did you learn today?",
                      4: "What challenges did you face?",
                      5: "What are your wins for today?",
                      6: "How did you connect with others?",
                      7: "What are you excited about tomorrow?"
                    };
                    
                    const currentContent = editingEntry === index 
                      ? (editedContent[questionId] !== undefined ? editedContent[questionId] : answer)
                      : answer;
                    
                    return (
                      <div key={questionId} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {questionTitles[questionId] || `Question ${questionId}`}
                        </h4>
                        {editingEntry === index ? (
                          <textarea
                            value={currentContent}
                            onChange={(e) => handleContentChange(questionId, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical min-h-[100px]"
                            placeholder="Enter your thoughts..."
                          />
                        ) : (
                          <p className="text-gray-700 leading-relaxed">{answer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalLibrary;
