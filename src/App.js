import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  BookOpenIcon,
  UserCircleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PencilIcon,
  ArchiveBoxIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  auth, 
  registerUser, 
  loginUser, 
  logoutUser, 
  addJournalEntry,
  getUserJournalEntries,
  deleteJournalEntry,
  updateJournalEntry,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  changeUserEmail
} from './firebase';
import Journal from './components/Journal';
import JournalLibrary from './components/JournalLibrary';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'write', 'library', 'profile', 'analytics', 'goals'
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    avatar: '',
    status: 'active',
    theme: 'light',
    notifications: true
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileTab, setProfileTab] = useState('profile'); // 'profile', 'password', 'email', 'account'
  
  // Advanced features state
  const [currentTheme, setCurrentTheme] = useState('light'); // 'light', 'dark', 'auto'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [writingGoals, setWritingGoals] = useState({
    dailyGoal: 1, // entries per day
    weeklyGoal: 5, // entries per week
    wordGoal: 100 // words per entry
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState('week'); // 'week', 'month', 'year'
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Motivational quotes array - Powerful thoughts
  const motivationalQuotes = [
    { text: "Your thoughts become your words, your words become your actions.", author: "Gandhi" },
    { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Life isn't about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "You must be the change you wish to see in the world.", author: "Gandhi" },
    { text: "Yesterday is history, tomorrow is mystery, today is a gift.", author: "Eleanor Roosevelt" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "In the midst of winter, I found there was an invincible summer.", author: "Albert Camus" },
    { text: "You have been assigned this mountain to show others it can be moved.", author: "Mel Robbins" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    { text: "The greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
    { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
    { text: "A ship in harbor is safe, but that is not what ships are built for.", author: "John A. Shedd" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Dream it. Believe it. Build it.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
    { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
    { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
    { text: "The difference between ordinary and extraordinary is that little 'extra'.", author: "Jimmy Johnson" },
    { text: "You don't have to be great to get started, but you have to get started to be great.", author: "Les Brown" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
    { text: "You are confined only by the walls you build yourself.", author: "Andrew Murphy" },
    { text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.", author: "Meister Eckhart" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
  ];

  // Auto-rotate quotes every 30 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        (prevIndex + 1) % motivationalQuotes.length
      );
    }, 10000); // 10 seconds

    return () => clearInterval(quoteInterval);
  }, [motivationalQuotes.length]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        await loadJournalEntries(user.uid);
        await loadUserProfile(user.uid);
      } else {
        setJournalEntries([]);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load profile data when profile modal opens
  useEffect(() => {
    if (showProfile && userProfile) {
      setProfileData({
        name: userProfile.name || currentUser?.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        avatar: userProfile.avatar || '',
        status: userProfile.status || 'active',
        theme: userProfile.theme || 'light',
        notifications: userProfile.notifications !== undefined ? userProfile.notifications : true
      });
    }
  }, [showProfile, userProfile, currentUser]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('click', handleClickOutside, true);
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  }, [showMobileMenu]);

  // Load journal entries for specific user from Firestore
  const loadJournalEntries = async (userId) => {
    try {
      console.log('Loading journal entries for user:', userId);
      const entries = await getUserJournalEntries(userId);
      setJournalEntries(entries);
      console.log('Journal entries loaded successfully:', entries.length);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  // Delete journal entry
  const handleDeleteJournalEntry = async (entryId) => {
    try {
      console.log('Deleting journal entry:', entryId);
      
      // If entryId is a number (index), find the actual entry ID
      let actualEntryId = entryId;
      if (typeof entryId === 'number') {
        const entry = journalEntries[entryId];
        actualEntryId = entry?.id;
        if (!actualEntryId) {
          throw new Error('Entry ID not found');
        }
      }
      
      await deleteJournalEntry(actualEntryId);
      
      console.log('Journal entry deleted successfully');
      
      // Reload journal entries
      if (currentUser?.uid) {
        await loadJournalEntries(currentUser.uid);
      }
      
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setAuthError('Failed to delete journal entry. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setAuthError('');
      }, 5000);
    }
  };

  // Update journal entry
  const handleUpdateJournalEntry = async (entryId, updatedEntry) => {
    try {
      console.log('Updating journal entry:', entryId);
      
      // If entryId is a number (index), find the actual entry ID
      let actualEntryId = entryId;
      if (typeof entryId === 'number') {
        const entry = journalEntries[entryId];
        actualEntryId = entry?.id;
        if (!actualEntryId) {
          throw new Error('Entry ID not found');
        }
      }
      
      await updateJournalEntry(actualEntryId, updatedEntry);
      
      console.log('Journal entry updated successfully');
      
      // Reload journal entries
      if (currentUser?.uid) {
        await loadJournalEntries(currentUser.uid);
      }
      
    } catch (error) {
      console.error('Error updating journal entry:', error);
      setAuthError('Failed to update journal entry. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setAuthError('');
      }, 5000);
      
      throw error; // Re-throw to let the component handle it
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading user profile for:', userId);
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
      if (profile) {
        setProfileData({
          name: profile.name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          phone: profile.phone || '',
          avatar: profile.avatar || '',
          status: profile.status || 'active',
          theme: profile.theme || 'light',
          notifications: profile.notifications !== false
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    if (formData.password !== formData.confirmPassword) {
      setAuthError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData.email, formData.password, formData.name);
      console.log('User registered successfully');
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(getFirebaseErrorMessage(error.code) || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      await loginUser(formData.email, formData.password);
      console.log('User signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(getFirebaseErrorMessage(error.code) || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setJournalEntries([]);
      setUserProfile(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSaveJournalEntry = async (journalData) => {
    try {
      console.log('Saving journal entry:', journalData);
      
      // Validate that we have a user
      if (!currentUser || !currentUser.uid) {
        throw new Error('No authenticated user found');
      }
      
      // Validate journal data
      if (!journalData || Object.keys(journalData.entries || {}).length === 0) {
        throw new Error('No journal content to save');
      }
      
      const entryId = await addJournalEntry(currentUser.uid, journalData);
      console.log('Journal entry saved successfully with ID:', entryId);
      
      // Reload journal entries to show the new entry
      await loadJournalEntries(currentUser.uid);
      setCurrentView('dashboard');
      
      // Show success message (you can add a toast notification here later)
      console.log('Journal entry saved and page updated successfully');
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // Add user-facing error notification
      setAuthError('Failed to save journal entry. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setAuthError('');
      }, 5000);
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

    const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate streak - consecutive days with journal entries
  const calculateStreak = () => {
    if (journalEntries.length === 0) return 0;

    // Sort entries by date (most recent first)
    const sortedEntries = [...journalEntries].sort((a, b) => {
      const dateA = getValidDate(a.timestamp || a.date);
      const dateB = getValidDate(b.timestamp || b.date);
      return dateB - dateA;
    });

    // Group entries by date
    const entriesByDate = {};
    sortedEntries.forEach(entry => {
      const date = getValidDate(entry.timestamp || entry.date);
      const dateStr = date.toDateString();
      entriesByDate[dateStr] = true;
    });

    let streak = 0;
    let currentDate = new Date();
    
    // Check if today has an entry, if not start from yesterday
    if (!entriesByDate[currentDate.toDateString()]) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days backwards
    while (entriesByDate[currentDate.toDateString()]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Calculate entries from this week
  const calculateThisWeekEntries = () => {
    if (journalEntries.length === 0) return 0;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    return journalEntries.filter(entry => {
      const entryDate = getValidDate(entry.timestamp || entry.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    }).length;
  };

  // Helper function to get valid date from various formats
  const getValidDate = (dateInput) => {
    if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
      return dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      return new Date(dateInput.seconds * 1000);
    } else if (dateInput) {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? new Date() : date;
    } else {
      return new Date();
    }
  };

  // Calculate stats
  const currentStreak = calculateStreak();
  const thisWeekEntries = calculateThisWeekEntries();

  // Advanced Analytics Functions
  const getMoodTrends = () => {
    if (journalEntries.length === 0) return {};
    
    const moodCounts = {};
    const moodByDate = {};
    
    journalEntries.forEach(entry => {
      if (entry.mood) {
        const moodLabel = entry.mood.label;
        const date = getValidDate(entry.timestamp || entry.date);
        const dateStr = date.toDateString();
        
        // Count mood occurrences
        moodCounts[moodLabel] = (moodCounts[moodLabel] || 0) + 1;
        
        // Track mood by date
        moodByDate[dateStr] = moodLabel;
      }
    });
    
    return { moodCounts, moodByDate };
  };

  const getWritingPatterns = () => {
    if (journalEntries.length === 0) return {};
    
    const patterns = {
      totalWords: 0,
      averageWords: 0,
      longestEntry: 0,
      shortestEntry: Infinity,
      writingDays: {},
      timeDistribution: {}
    };
    
    journalEntries.forEach(entry => {
      const entryText = Object.values(entry.entries || {}).join(' ');
      const wordCount = entryText.split(/\s+/).filter(word => word.length > 0).length;
      const date = getValidDate(entry.timestamp || entry.date);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      
      patterns.totalWords += wordCount;
      patterns.longestEntry = Math.max(patterns.longestEntry, wordCount);
      patterns.shortestEntry = Math.min(patterns.shortestEntry, wordCount);
      
      // Track writing by day of week
      patterns.writingDays[dayOfWeek] = (patterns.writingDays[dayOfWeek] || 0) + 1;
      
      // Track writing by time of day
      const timeSlot = hour < 6 ? 'night' : 
                     hour < 12 ? 'morning' : 
                     hour < 18 ? 'afternoon' : 'evening';
      patterns.timeDistribution[timeSlot] = (patterns.timeDistribution[timeSlot] || 0) + 1;
    });
    
    patterns.averageWords = Math.round(patterns.totalWords / journalEntries.length);
    if (patterns.shortestEntry === Infinity) patterns.shortestEntry = 0;
    
    return patterns;
  };

  const getWeeklyProgress = () => {
    const weeks = {};
    const now = new Date();
    
    for (let i = 0; i < 12; i++) { // Last 12 weeks
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + (i * 7)));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekEntries = journalEntries.filter(entry => {
        const entryDate = getValidDate(entry.timestamp || entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks[weekKey] = {
        entries: weekEntries.length,
        mood: getMostCommonMood(weekEntries),
        totalWords: weekEntries.reduce((total, entry) => {
          const words = Object.values(entry.entries || {}).join(' ').split(/\s+/).length;
          return total + words;
        }, 0)
      };
    }
    
    return weeks;
  };

  const getMostCommonMood = (entries) => {
    const moodCounts = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood.label] = (moodCounts[entry.mood.label] || 0) + 1;
      }
    });
    
    return Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, null
    );
  };

  const getInsights = () => {
    const insights = [];
    const moodTrends = getMoodTrends();
    const patterns = getWritingPatterns();
    
    // Mood insights
    if (moodTrends.moodCounts) {
      const topMood = Object.keys(moodTrends.moodCounts).reduce((a, b) => 
        moodTrends.moodCounts[a] > moodTrends.moodCounts[b] ? a : b
      );
      insights.push({
        type: 'mood',
        title: '🌟 Your Most Common Mood',
        content: `You've been feeling "${topMood}" most often in your recent entries.`,
        emoji: '😊'
      });
    }
    
    // Writing pattern insights
    if (patterns.averageWords > 150) {
      insights.push({
        type: 'writing',
        title: '📝 Detailed Writer',
        content: `You write an average of ${patterns.averageWords} words per entry - that's thorough reflection!`,
        emoji: '✍️'
      });
    }
    
    // Streak insights
    if (currentStreak >= 7) {
      insights.push({
        type: 'streak',
        title: '🔥 Amazing Consistency',
        content: `You've maintained a ${currentStreak}-day writing streak. Keep it up!`,
        emoji: '🏆'
      });
    }
    
    return insights;
  };

  // Calculate advanced stats
  const moodTrends = getMoodTrends();
  const writingPatterns = getWritingPatterns();
  const weeklyProgress = getWeeklyProgress();
  const insights = getInsights();

  // Theme functions
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Close mobile menu when view changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [currentView]);

  // Search and filter functions
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      Object.values(entry.entries || {}).some(text => 
        text.toLowerCase().includes(searchQuery.toLowerCase())
      ) || 
      (entry.mood?.label || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Format date helper function
  const formatDate = (dateInput) => {
    let date;
    
    // Handle different date formats
    if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
      // Firebase Timestamp
      date = dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      // Firebase Timestamp with seconds
      date = new Date(dateInput.seconds * 1000);
    } else if (dateInput) {
      // Regular date string or Date object
      date = new Date(dateInput);
    } else {
      // Fallback to current date
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Recent Entry';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Export functions
  const exportToJSON = () => {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindful-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Create a printable version
    const printContent = journalEntries.map(entry => {
      const date = formatDate(entry.timestamp || entry.date);
      const mood = entry.mood ? `${entry.mood.emoji} ${entry.mood.label}` : 'No mood recorded';
      const energy = entry.energy ? `Energy: ${entry.energy}/5` : 'No energy recorded';
      const entryText = Object.values(entry.entries || {}).join('\n\n');
      
      return `
Date: ${date}
Mood: ${mood}
${energy}

${entryText}

---
      `;
    }).join('\n');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Mindful Journal Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <h1>📖 Mindful Journal Export</h1>
          <pre>${printContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');

    try {
      console.log('Updating profile with data:', profileData);
      console.log('Current user:', currentUser?.uid);
      
      if (!currentUser?.uid) {
        throw new Error('No user logged in');
      }

      await updateUserProfile(currentUser.uid, profileData);
      await loadUserProfile(currentUser.uid);
      setProfileError('✅ Profile updated successfully!');
      setTimeout(() => setProfileError(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.message);
      
      if (error.code === 'permission-denied') {
        setProfileError('Permission denied. Please check your account permissions.');
      } else if (error.code === 'not-found') {
        setProfileError('Profile not found. Creating new profile...');
        // Try to create the profile if it doesn't exist
        try {
          await updateUserProfile(currentUser.uid, {
            ...profileData,
            email: currentUser.email,
            createdAt: new Date()
          });
          setProfileError('✅ Profile created successfully!');
          setTimeout(() => setProfileError(''), 3000);
        } catch (createError) {
          setProfileError('Failed to create profile. Please contact support.');
        }
      } else {
        setProfileError(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setProfileError('New passwords do not match');
      setProfileLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setProfileError('Password must be at least 6 characters long');
      setProfileLoading(false);
      return;
    }

    try {
      await changeUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      setProfileError('');
      setProfileError('✅ Password changed successfully!');
      setTimeout(() => setProfileError(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setProfileError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setProfileError('New password is too weak');
      } else {
        setProfileError('Failed to change password. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');

    if (emailData.newEmail !== emailData.confirmEmail) {
      setProfileError('New emails do not match');
      setProfileLoading(false);
      return;
    }

    if (!emailData.newEmail.includes('@')) {
      setProfileError('Please enter a valid email address');
      setProfileLoading(false);
      return;
    }

    try {
      await changeUserEmail(emailData.currentPassword, emailData.newEmail);
      setEmailData({
        currentPassword: '',
        newEmail: '',
        confirmEmail: ''
      });
      setShowEmailChange(false);
      setProfileError('✅ Email changed successfully!');
      setTimeout(() => setProfileError(''), 3000);
      // Reload user profile to get updated email
      await loadUserProfile(currentUser.uid);
    } catch (error) {
      console.error('Error changing email:', error);
      if (error.code === 'auth/wrong-password') {
        setProfileError('Current password is incorrect');
      } else if (error.code === 'auth/email-already-in-use') {
        setProfileError('This email is already in use by another account');
      } else if (error.code === 'auth/invalid-email') {
        setProfileError('Please enter a valid email address');
      } else {
        setProfileError('Failed to change email. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span>📖</span>
            Loading your journal...
            <span>✨</span>
          </p>
        </div>
      </div>
    );
  }

  // Authentication form for non-logged-in users
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4 py-8">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl max-w-md w-full">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl sm:text-3xl">📝</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <span>📖</span>
              Mindful Journal
            </h1>
            <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center gap-2 flex-wrap">
              <span>✨</span>
              Your space for reflection and growth
              <span>🌱</span>
            </p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex mb-4 sm:mb-6">
            <button
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
                setFormData({ email: '', password: '', confirmPassword: '', name: '' });
              }}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 text-center rounded-l-lg transition duration-200 flex items-center justify-center gap-1 text-sm sm:text-base ${
                authMode === 'signin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>🔑</span>
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setAuthError('');
                setFormData({ email: '', password: '', confirmPassword: '', name: '' });
              }}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 text-center rounded-r-lg transition duration-200 flex items-center justify-center gap-1 text-sm sm:text-base ${
                authMode === 'signup'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>✨</span>
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {authError}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}>
            {authMode === 'signup' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 sm:py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">{authMode === 'signin' ? '🔐 Signing in...' : '⚡ Creating account...'}</span>
                  <span className="sm:hidden">{authMode === 'signin' ? '🔐 Signing in...' : '⚡ Creating...'}</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? '🔑' : '✨'}</span>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p className="flex items-center justify-center gap-1">
              <span>🔒</span>
              Your thoughts are securely stored and private
              <span>💝</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard for logged-in users
  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
      currentTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob ${
          currentTheme === 'dark' ? 'bg-purple-600 opacity-10' : 'bg-purple-300 opacity-20'
        }`}></div>
        <div className={`absolute -top-4 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${
          currentTheme === 'dark' ? 'bg-blue-600 opacity-10' : 'bg-yellow-300 opacity-20'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${
          currentTheme === 'dark' ? 'bg-pink-600 opacity-10' : 'bg-pink-300 opacity-20'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000 ${
          currentTheme === 'dark' ? 'bg-indigo-600 opacity-5' : 'bg-blue-300 opacity-10'
        }`}></div>
      </div>

      {/* Modern Header with Enhanced Glass Effect */}
      <div className={`relative backdrop-blur-xl shadow-lg border-b sticky top-0 z-50 transition-colors duration-300 ${
        currentTheme === 'dark' 
          ? 'bg-gray-900/90 border-gray-700/30' 
          : 'bg-white/90 border-white/30'
      }`}>
        <div className={`absolute inset-0 ${
          currentTheme === 'dark' 
            ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30' 
            : 'bg-gradient-to-r from-purple-50/50 to-indigo-50/50'
        }`}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Logo clicked, navigating to dashboard');
                // Close mobile menu if open
                if (showMobileMenu) {
                  setShowMobileMenu(false);
                }
                // Navigate to dashboard
                setTimeout(() => {
                  setCurrentView('dashboard');
                }, 0);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200 cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/20 active:scale-95 relative z-20"
              type="button"
              title="Go to Dashboard"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 pointer-events-none">
                <span className="text-xl pointer-events-none">📖</span>
              </div>
              <div className="pointer-events-none">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Mindful Journal
                </h1>
                <p className={`text-xs transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Your digital wellness companion</p>
              </div>
            </button>

            {/* Quick Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('write');
                  }}
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl hover:scale-110 relative overflow-hidden active:scale-95"
                  title="Write Journal Entry"
                  type="button"
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  <span className="relative text-lg group-hover:scale-110 transition-transform">✏️</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('library');
                  }}
                  className="p-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl hover:scale-110 relative overflow-hidden active:scale-95"
                  title="View Journal Library"
                  type="button"
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  <span className="relative text-lg group-hover:scale-110 transition-transform">📚</span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('analytics');
                  }}
                  className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl hover:scale-110 relative overflow-hidden active:scale-95"
                  title="View Analytics"
                  type="button"
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  <span className="relative text-lg group-hover:scale-110 transition-transform">📊</span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('goals');
                  }}
                  className="p-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl hover:scale-110 relative overflow-hidden active:scale-95"
                  title="Writing Goals"
                  type="button"
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  <span className="relative text-lg group-hover:scale-110 transition-transform">🎯</span>
                </button>
              </div>

              {/* Mobile Hamburger Menu - Visible only on mobile */}
              <div className="md:hidden relative mobile-menu-container">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMobileMenu(!showMobileMenu);
                  }}
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl relative overflow-hidden active:scale-95"
                  title="Menu"
                  type="button"
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  <div className="relative w-5 h-5 flex flex-col justify-center items-center">
                    <div className={`w-4 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-0.5' : 'mb-1'}`}></div>
                    <div className={`w-4 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'opacity-0' : 'mb-1'}`}></div>
                    <div className={`w-4 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-0.5' : ''}`}></div>
                  </div>
                </button>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobileMenu(false);
                      }}
                    ></div>
                    
                    {/* Menu Content */}
                    <div className={`absolute right-0 top-12 w-56 backdrop-blur-xl rounded-2xl shadow-2xl border z-50 overflow-hidden transition-colors duration-300 ${
                      currentTheme === 'dark' 
                        ? 'bg-gray-900/95 border-gray-700/30' 
                        : 'bg-white/95 border-white/30'
                    }`}>
                      <div className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentView('write');
                            setShowMobileMenu(false);
                          }}
                          className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 group ${
                            currentTheme === 'dark' 
                              ? 'hover:bg-purple-900/50 active:bg-purple-900/70' 
                              : 'hover:bg-purple-50 active:bg-purple-100'
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-lg">✏️</span>
                          </div>
                          <div className="text-left">
                            <div className={`font-semibold transition-colors duration-300 ${
                              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>Write Entry</div>
                            <div className={`text-sm transition-colors duration-300 ${
                              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Start journaling</div>
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentView('library');
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-indigo-50 transition-all duration-200 group active:bg-indigo-100"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-lg">📚</span>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">Library</div>
                            <div className="text-sm text-gray-500">Browse entries</div>
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentView('analytics');
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-green-50 transition-all duration-200 group active:bg-green-100"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-lg">📊</span>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">Analytics</div>
                            <div className="text-sm text-gray-500">View insights</div>
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentView('goals');
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-yellow-50 transition-all duration-200 group active:bg-yellow-100"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">Goals</div>
                            <div className="text-sm text-gray-500">Track progress</div>
                          </div>
                        </button>

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTheme();
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group active:bg-gray-100"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-lg group-hover:rotate-180 transition-transform duration-300">
                              {currentTheme === 'light' ? '🌙' : '☀️'}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">Theme</div>
                            <div className="text-sm text-gray-500">
                              Switch to {currentTheme === 'light' ? 'dark' : 'light'} mode
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle - Desktop Only */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleTheme();
                }}
                className="hidden md:block p-2.5 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 text-gray-600 rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
                title="Toggle Theme"
                type="button"
              >
                <span className="text-lg group-hover:scale-110 transition-transform group-hover:rotate-180 duration-300">
                  {currentTheme === 'light' ? '🌙' : '☀️'}
                </span>
              </button>
              
              {/* User Profile */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setShowProfile(true);
                }}
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform duration-200 cursor-pointer shadow-lg hover:shadow-xl relative overflow-hidden group active:scale-95"
                title="Open Profile Settings"
                type="button"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="Profile" className="relative w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <UserCircleIcon className="relative w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 mobile-container">
        {/* Conditional View Rendering */}
        {currentView === 'write' && (
          <Journal 
            onSaveEntry={handleSaveJournalEntry}
            currentUser={currentUser}
          />
        )}

        {currentView === 'library' && (
          <JournalLibrary 
            entries={journalEntries}
            onBack={() => setCurrentView('dashboard')}
            onDeleteEntry={handleDeleteJournalEntry}
            onUpdateEntry={handleUpdateJournalEntry}
          />
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-colors duration-300 ${
              currentTheme === 'dark' 
                ? 'bg-gray-800/80 border-gray-700/20' 
                : 'bg-white/80 border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📊</span>
                  Analytics Dashboard
                </h1>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('dashboard');
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:scale-105 transition-transform active:scale-95"
                  type="button"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <p className="text-gray-600">Discover insights from your mindfulness journey</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{journalEntries.length}</div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✍️</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{writingPatterns.totalWords || 0}</div>
                    <div className="text-sm text-gray-600">Total Words</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📈</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{writingPatterns.averageWords || 0}</div>
                    <div className="text-sm text-gray-600">Avg Words/Entry</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Trends */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>😊</span>
                Mood Trends
              </h2>
              {journalEntries.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Recent Moods</h3>
                      <div className="space-y-2">
                        {journalEntries.slice(0, 5).map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                              {(() => {
                                let date;
                                if (entry.timestamp && typeof entry.timestamp === 'object' && entry.timestamp.toDate) {
                                  date = entry.timestamp.toDate();
                                } else if (entry.timestamp && typeof entry.timestamp === 'object' && entry.timestamp.seconds) {
                                  date = new Date(entry.timestamp.seconds * 1000);
                                } else if (entry.date) {
                                  date = new Date(entry.date);
                                } else {
                                  date = new Date();
                                }
                                return isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString();
                              })()}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{entry.mood?.emoji || '😐'}</span>
                              <span className="text-sm font-medium">{entry.mood?.label || 'Neutral'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Mood Distribution</h3>
                      <div className="space-y-2">
                        {Object.entries(
                          journalEntries.reduce((acc, entry) => {
                            const mood = entry.mood?.label || 'Neutral';
                            acc[mood] = (acc[mood] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([mood, count]) => (
                          <div key={mood} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{mood}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full" 
                                  style={{width: `${(count / journalEntries.length) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-3">📊</span>
                  <p className="text-gray-600">Write entries to see mood trends</p>
                </div>
              )}
            </div>

            {/* Writing Patterns */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>✍️</span>
                Writing Patterns
              </h2>
              {journalEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{writingPatterns.totalWords || 0}</div>
                    <div className="text-sm text-gray-600">Total Words Written</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{writingPatterns.averageWords || 0}</div>
                    <div className="text-sm text-gray-600">Average Words/Entry</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{journalEntries.length}</div>
                    <div className="text-sm text-gray-600">Entries This Month</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-3">✍️</span>
                  <p className="text-gray-600">Write entries to see writing patterns</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                Insights & Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{insight.emoji}</span>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{insight.content}</p>
                  </div>
                ))}
                {insights.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <span className="text-4xl block mb-3">🌱</span>
                    <p className="text-gray-600">Write more entries to unlock personalized insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'goals' && (
          <div className="space-y-6">
            {/* Goals Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🎯</span>
                  Goals & Achievements
                </h1>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('dashboard');
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:scale-105 transition-transform active:scale-95"
                  type="button"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <p className="text-gray-600">Track your progress and celebrate milestones</p>
            </div>

            {/* Current Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{currentStreak}</div>
                  <div className="text-sm text-gray-600 mb-2">Day Streak</div>
                  <div className="text-xs text-purple-600">
                    Goal: 7 days {currentStreak >= 7 ? '✅' : `(${7 - currentStreak} to go)`}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{thisWeekEntries}</div>
                  <div className="text-sm text-gray-600 mb-2">This Week</div>
                  <div className="text-xs text-blue-600">
                    Goal: 5 entries {thisWeekEntries >= 5 ? '✅' : `(${5 - thisWeekEntries} to go)`}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{writingPatterns.averageWords || 0}</div>
                  <div className="text-sm text-gray-600 mb-2">Avg Words</div>
                  <div className="text-xs text-green-600">
                    Goal: 100 words {(writingPatterns.averageWords || 0) >= 100 ? '✅' : `(${100 - (writingPatterns.averageWords || 0)} to go)`}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span>🏆</span>
                Achievement Badges
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* First Entry */}
                <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  journalEntries.length >= 1 
                    ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{journalEntries.length >= 1 ? '🌟' : '⭕'}</div>
                  <div className="text-xs font-semibold text-gray-900">First Steps</div>
                  <div className="text-xs text-gray-600">Write 1 entry</div>
                </div>

                {/* Week Warrior */}
                <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  currentStreak >= 7 
                    ? 'border-orange-400 bg-orange-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{currentStreak >= 7 ? '🔥' : '⭕'}</div>
                  <div className="text-xs font-semibold text-gray-900">Week Warrior</div>
                  <div className="text-xs text-gray-600">7-day streak</div>
                </div>

                {/* Prolific Writer */}
                <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  journalEntries.length >= 10 
                    ? 'border-green-400 bg-green-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{journalEntries.length >= 10 ? '📚' : '⭕'}</div>
                  <div className="text-xs font-semibold text-gray-900">Prolific Writer</div>
                  <div className="text-xs text-gray-600">10 entries</div>
                </div>

                {/* Consistent Creator */}
                <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  currentStreak >= 30 
                    ? 'border-purple-400 bg-purple-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{currentStreak >= 30 ? '💎' : '⭕'}</div>
                  <div className="text-xs font-semibold text-gray-900">Consistent Creator</div>
                  <div className="text-xs text-gray-600">30-day streak</div>
                </div>

                {/* Mindful Master */}
                <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  journalEntries.length >= 50 
                    ? 'border-blue-400 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{journalEntries.length >= 50 ? '🧘' : '⭕'}</div>
                  <div className="text-xs font-semibold text-gray-900">Mindful Master</div>
                  <div className="text-xs text-gray-600">50 entries</div>
                </div>

                {/* Word Wizard */}
                <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  (writingPatterns.totalWords || 0) >= 1000 
                    ? 'border-pink-400 bg-pink-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <div className="text-3xl mb-2">{(writingPatterns.totalWords || 0) >= 1000 ? '✨' : '⭕'}</div>
                  <div className="text-xs font-semibold text-gray-900">Word Wizard</div>
                  <div className="text-xs text-gray-600">1000 words</div>
                </div>
              </div>
            </div>

            {/* Progress Towards Next Goals */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span>📈</span>
                Progress Towards Goals
              </h2>
              <div className="space-y-4">
                {/* Weekly Writing Goal */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Writing Goal</span>
                    <span className="text-sm text-gray-600">{thisWeekEntries}/5 entries</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${Math.min((thisWeekEntries / 5) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>

                {/* Streak Goal */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Build a 7-Day Streak</span>
                    <span className="text-sm text-gray-600">{currentStreak}/7 days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${Math.min((currentStreak / 7) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>

                {/* Total Entries Goal */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Prolific Writer Challenge</span>
                    <span className="text-sm text-gray-600">{journalEntries.length}/10 entries</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${Math.min((journalEntries.length / 10) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Section */}
            {journalEntries.length === 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="text-center">
                  <span className="text-4xl block mb-3">🌟</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Journey!</h3>
                  <p className="text-gray-600 mb-4">Begin with your first journal entry to unlock achievements and start building streaks.</p>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('write');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2 mx-auto active:scale-95"
                    type="button"
                  >
                    <span>✏️</span>
                    Write First Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'dashboard' && (
          <>
        {/* Enhanced Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></div>
          {/* Floating elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
                  <span className="animate-wave">👋</span>
                  Welcome back, {currentUser.displayName || currentUser.email?.split('@')[0] || 'friend'}!
                  <span className="animate-pulse">✨</span>
                </h1>
                <p className="text-purple-100 flex items-center gap-2 mb-4 sm:mb-0">
                  <span>📅</span>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <span>•</span>
                  Ready to reflect on your day?
                  <span className="animate-bounce">🤔</span>
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-200 border border-white/30">
                <div className="text-4xl font-bold mb-1">{currentStreak}</div>
                <div className="text-sm text-purple-100 font-medium">Day Streak 🔥</div>
                <div className="text-xs text-purple-200">
                  {currentStreak > 0 ? `${currentStreak} day${currentStreak > 1 ? 's' : ''} strong! 💪` : 'Start today! 🌟'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote Section */}
        <div className="bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 text-center transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden shadow-lg">
          {/* Background decoration */}
          <div className="absolute top-4 right-6 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-6 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-transparent rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="text-3xl mb-4 animate-pulse">💫</div>
            <blockquote className="text-lg md:text-xl font-semibold text-gray-800 mb-4 leading-relaxed italic drop-shadow-sm">
              "{motivationalQuotes[currentQuoteIndex].text}"
            </blockquote>
            <cite className="text-sm text-gray-600 font-medium">
              — {motivationalQuotes[currentQuoteIndex].author}
            </cite>
            
            {/* Auto-rotation indicator */}
            <div className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
              <span className="font-medium">New inspiration every 10 seconds</span>
            </div>
          </div>
        </div>

        {/* Comprehensive Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Journal Entries */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{journalEntries.length}</div>
                <div className="text-sm font-medium text-gray-600">Total Entries</div>
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span>✨</span>
              {journalEntries.length === 0 ? 'Great first entry!' : 
               journalEntries.length === 1 ? 'Amazing start!' : 
               journalEntries.length < 10 ? 'Building momentum!' : 
               journalEntries.length < 50 ? 'Dedicated writer!' : 'Journal master!'}
            </div>
          </div>

          {/* This Week Entries */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{thisWeekEntries}</div>
                <div className="text-sm font-medium text-gray-600">This Week</div>
              </div>
            </div>
            <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <span>⭐</span>
              {thisWeekEntries === 0 ? 'Ready to start?' : 
               thisWeekEntries < 3 ? 'Great start!' : 
               thisWeekEntries < 5 ? 'Excellent consistency!' : 'Incredible dedication!'}
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
                <div className="text-sm font-medium text-gray-600">Day Streak</div>
              </div>
            </div>
            <div className="text-xs text-orange-600 font-medium flex items-center gap-1">
              <span>💪</span>
              {currentStreak === 0 ? 'Start your streak today!' : 
               currentStreak < 7 ? 'Building momentum!' : 
               currentStreak < 30 ? 'Amazing consistency!' : 'Streak legend!'}
            </div>
          </div>

          {/* Words Written */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✍️</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{writingPatterns.totalWords || 0}</div>
                <div className="text-sm font-medium text-gray-600">Total Words</div>
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span>📈</span>
              {writingPatterns.averageWords || 0} avg per entry
            </div>
          </div>
        </div>

        {/* Quick Actions & Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span>⚡</span>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('write');
                  }}
                  className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl transition-all duration-300 text-left shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">✏️</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Start Writing</h3>
                  <p className="text-purple-100 text-sm">✨ Begin your daily reflection</p>
                </button>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('library');
                  }}
                  className="group bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-6 rounded-xl transition-all duration-300 text-left shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📚</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Browse Library</h3>
                  <p className="text-indigo-100 text-sm">📖 Read past reflections</p>
                </button>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('analytics');
                  }}
                  className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl transition-all duration-300 text-left shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📊</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">View Analytics</h3>
                  <p className="text-green-100 text-sm">📈 Discover insights</p>
                </button>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('goals');
                  }}
                  className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-6 rounded-xl transition-all duration-300 text-left shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🎯</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Track Goals</h3>
                  <p className="text-yellow-100 text-sm">🏆 Monitor progress</p>
                </button>
              </div>
            </div>
          </div>

          {/* Today's Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>💡</span>
                Today's Insights
              </h2>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentView('analytics');
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:scale-105 transition-transform flex items-center gap-1 active:scale-95"
                type="button"
              >
                <span>📊</span>
                View All
              </button>
            </div>

            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{insight.emoji}</span>
                      <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{insight.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-4xl block mb-3">🌱</span>
                <p className="text-gray-600 text-sm mb-3">Write your first entry to unlock personalized insights!</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('write');
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                  type="button"
                >
                  Start Writing →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Entries & Export Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Recent Entries */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>📚</span>
                Recent Entries
              </h2>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentView('library');
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 hover:scale-105 transition-transform active:scale-95"
                type="button"
              >
                <span>👀</span>
                View all ({journalEntries.length})
              </button>
            </div>

            {journalEntries.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">📖</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Journey</h3>
                <p className="text-gray-600 mb-4">Write your first journal entry to begin tracking your mindfulness journey.</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('write');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2 mx-auto active:scale-95"
                  type="button"
                >
                  <span>✏️</span>
                  Write First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.slice(0, 3).map((entry, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentView('library');
                    }}
                    className="p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-white/50 active:scale-[1.01] mobile-text-container"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCurrentView('library');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 flex items-center gap-1">
                        <span>📅</span>
                        <span className="truncate">
                          {(() => {
                            let date;
                            if (entry.timestamp && typeof entry.timestamp === 'object' && entry.timestamp.toDate) {
                              date = entry.timestamp.toDate();
                            } else if (entry.timestamp && typeof entry.timestamp === 'object' && entry.timestamp.seconds) {
                              date = new Date(entry.timestamp.seconds * 1000);
                            } else if (entry.date) {
                              date = new Date(entry.date);
                            } else {
                              date = new Date();
                            }
                            return isNaN(date.getTime()) ? 'Recent Entry' : date.toLocaleDateString();
                          })()}
                        </span>
                      </span>
                      {entry.mood && (
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <span className="text-base sm:text-lg">{entry.mood.emoji}</span>
                          <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">{entry.mood.label}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed break-words mobile-text-wrap">
                      {(() => {
                        const text = Object.values(entry.entries || {})[0] || 'No content';
                        if (text === 'No content') return text;
                        
                        // Use CSS line-clamp for proper truncation instead of manual truncation
                        // This allows CSS to handle responsive behavior properly
                        return text;
                      })()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export & Tools */}
          <div className="space-y-4">
            {/* Export Section */}
            {journalEntries.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>💾</span>
                  Export & Backup
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      exportToJSON();
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl transition-all duration-200 text-left group shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📂</span>
                      <div>
                        <h3 className="font-semibold">Export JSON</h3>
                        <p className="text-blue-100 text-sm">Complete backup</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      exportToPDF();
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-xl transition-all duration-200 text-left group shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                      <div>
                        <h3 className="font-semibold">Print Journal</h3>
                        <p className="text-red-100 text-sm">Printable version</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Achievement Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>🏆</span>
                  Achievements
                </h2>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('goals');
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                  type="button"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`text-center p-3 rounded-xl border-2 ${currentStreak >= 7 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="text-2xl mb-1">{currentStreak >= 7 ? '🔥' : '⭕'}</div>
                  <div className="text-xs font-medium">Week Warrior</div>
                </div>
                <div className={`text-center p-3 rounded-xl border-2 ${journalEntries.length >= 10 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="text-2xl mb-1">{journalEntries.length >= 10 ? '📚' : '⭕'}</div>
                  <div className="text-xs font-medium">Prolific Writer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Profile Modal */}
        {showProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span>👤</span>
                    Profile Settings
                  </h2>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setProfileError('');
                    }}
                    className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6 space-y-6">
                {profileError && (
                  <div className={`p-3 rounded-lg ${
                    profileError.includes('✅') 
                      ? 'bg-green-100 border border-green-400 text-green-700' 
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                    {profileError}
                  </div>
                )}

                {/* Profile Photo */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 relative overflow-hidden">
                      {userProfile?.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || '👤'
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setProfileData(prev => ({ ...prev, avatar: e.target.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="absolute -bottom-2 -right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <span className="text-sm">📷</span>
                    </button>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span>👤</span> Display Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your display name"
                    />
                  </div>

                  {/* Email (Read-only with edit button) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span>📧</span> Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailChange(true)}
                        className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span>✨</span> Status
                    </label>
                    <select
                      name="status"
                      value={profileData.status}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">🟢 Active</option>
                      <option value="away">🟡 Away</option>
                      <option value="busy">🔴 Busy</option>
                      <option value="offline">⚫ Offline</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span>📝</span> Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span>📍</span> Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your location"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        profileLoading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Save Profile
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(true)}
                      className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span>🔑</span>
                      Change Password
                    </button>
                  </div>
                </form>

                {/* Sign Out */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to sign out?')) {
                        try {
                          await logoutUser();
                          setShowProfile(false);
                        } catch (error) {
                          console.error('Error signing out:', error);
                        }
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  >
                    <span>🚪</span>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span>🔑</span>
                    Change Password
                  </h3>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setProfileError('');
                    }}
                    className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {profileError && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    profileError.includes('✅') 
                      ? 'bg-green-100 border border-green-400 text-green-700' 
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setProfileError('');
                      }}
                      className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        profileLoading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }`}
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <span>🔑</span>
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Change Email Modal */}
        {showEmailChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span>📧</span>
                    Change Email
                  </h3>
                  <button
                    onClick={() => {
                      setShowEmailChange(false);
                      setEmailData({
                        currentPassword: '',
                        newEmail: '',
                        confirmEmail: ''
                      });
                      setProfileError('');
                    }}
                    className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {profileError && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    profileError.includes('✅') 
                      ? 'bg-green-100 border border-green-400 text-green-700' 
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                    {profileError}
                  </div>
                )}

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Current Email:</span> {currentUser?.email}
                  </p>
                </div>

                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={emailData.currentPassword}
                      onChange={handleEmailChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      name="newEmail"
                      value={emailData.newEmail}
                      onChange={handleEmailChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter new email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Email
                    </label>
                    <input
                      type="email"
                      name="confirmEmail"
                      value={emailData.confirmEmail}
                      onChange={handleEmailChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Confirm new email address"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailChange(false);
                        setEmailData({
                          currentPassword: '',
                          newEmail: '',
                          confirmEmail: ''
                        });
                        setProfileError('');
                      }}
                      className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        profileLoading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <span>📧</span>
                          Change Email
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 