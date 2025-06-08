import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXmaqkCgyomUioJcPkPCw6atIqU9JWUyo",
  authDomain: "progress-tracker-26ebf.firebaseapp.com",
  projectId: "progress-tracker-26ebf",
  storageBucket: "progress-tracker-26ebf.firebasestorage.app",
  messagingSenderId: "363850217424",
  appId: "1:363850217424:web:8c7c74cfddb42ecab26bd5",
  measurementId: "G-S5SH1LCZPW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app.name);

// Initialize Firebase Auth
export const auth = getAuth(app);
console.log('Firebase Auth initialized:', !!auth);

// Initialize Firestore
export const db = getFirestore(app);
console.log('Firestore initialized:', !!db);

// Auth functions
export const registerUser = async (email, password, name) => {
  try {
    console.log('Starting user registration process...');
    console.log('Auth object:', auth);
    console.log('Auth app:', auth.app);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User created successfully:', user.uid);
    
    // Update user profile with name
    await updateProfile(user, {
      displayName: name
    });
    console.log('User profile updated');
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });
    console.log('User document created in Firestore');
    
    return user;
  } catch (error) {
    console.error('Error in registerUser:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Goals functions
export const addGoal = async (userId, goalData) => {
  try {
    console.log('Adding goal for user:', userId);
    console.log('Goal data:', goalData);
    
    const goalRef = await addDoc(collection(db, 'goals'), {
      ...goalData,
      userId: userId,
      createdAt: serverTimestamp()
    });
    
    console.log('Goal added successfully with ID:', goalRef.id);
    return goalRef.id;
  } catch (error) {
    console.error('Error in addGoal:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const getUserGoals = async (userId) => {
  try {
    console.log('Fetching goals for user:', userId);
    
    // Simplified query without orderBy to avoid index issues
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const goals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort on client side instead of server side
    goals.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    
    console.log('Goals fetched successfully:', goals.length, 'goals');
    return goals;
  } catch (error) {
    console.error('Error in getUserGoals:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Return empty array instead of throwing error to prevent app crash
    return [];
  }
};

export const updateGoal = async (goalId, updates) => {
  const goalRef = doc(db, 'goals', goalId);
  await updateDoc(goalRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteGoal = async (goalId) => {
  const goalRef = doc(db, 'goals', goalId);
  await deleteDoc(goalRef);
};

// Habits functions
export const addHabit = async (userId, habitData) => {
  try {
    console.log('Adding habit for user:', userId);
    console.log('Habit data:', habitData);
    
    const habitRef = await addDoc(collection(db, 'habits'), {
      ...habitData,
      userId: userId,
      createdAt: serverTimestamp(),
      streak: 0,
      lastCompleted: null,
      totalCompletions: 0
    });
    
    console.log('Habit added successfully with ID:', habitRef.id);
    return habitRef.id;
  } catch (error) {
    console.error('Error in addHabit:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const getUserHabits = async (userId) => {
  try {
    console.log('Fetching habits for user:', userId);
    
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const habits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort on client side
    habits.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    
    console.log('Habits fetched successfully:', habits.length, 'habits');
    return habits;
  } catch (error) {
    console.error('Error in getUserHabits:', error);
    return [];
  }
};

export const updateHabit = async (habitId, updates) => {
  try {
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('Habit updated successfully');
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const deleteHabit = async (habitId) => {
  try {
    const habitRef = doc(db, 'habits', habitId);
    await deleteDoc(habitRef);
    console.log('Habit deleted successfully');
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

export const markHabitComplete = async (habitId, habitData) => {
  try {
    const today = new Date().toDateString();
    const lastCompleted = habitData.lastCompleted?.toDate()?.toDateString();
    
    let newStreak = habitData.streak || 0;
    let totalCompletions = (habitData.totalCompletions || 0) + 1;
    
    // Calculate streak
    if (lastCompleted === today) {
      // Already completed today, don't update
      return;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCompleted === yesterday.toDateString()) {
        // Continuing streak
        newStreak += 1;
      } else {
        // Starting new streak
        newStreak = 1;
      }
    }
    
    await updateHabit(habitId, {
      lastCompleted: serverTimestamp(),
      streak: newStreak,
      totalCompletions: totalCompletions
    });
    
    console.log('Habit marked complete, new streak:', newStreak);
  } catch (error) {
    console.error('Error marking habit complete:', error);
    throw error;
  }
};

// Progress logging functions
export const addProgressEntry = async (userId, progressData) => {
  try {
    console.log('Adding journal entry for user:', userId);
    console.log('Journal data:', progressData);
    
    const progressRef = await addDoc(collection(db, 'progress'), {
      ...progressData,
      userId: userId,
      createdAt: serverTimestamp(),
      date: new Date().toDateString()
    });
    
    console.log('Journal entry added successfully with ID:', progressRef.id);
    return progressRef.id;
  } catch (error) {
    console.error('Error in addProgressEntry:', error);
    throw error;
  }
};

export const getUserProgress = async (userId, days = 30) => {
  try {
    console.log('Fetching progress for user:', userId);
    
    const q = query(
      collection(db, 'progress'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const progress = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by date
    progress.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    
    console.log('Progress fetched successfully:', progress.length, 'entries');
    return progress.slice(0, days); // Return last N days
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return [];
  }
};

// User Profile functions
export const getUserProfile = async (userId) => {
  try {
    console.log('Fetching user profile for:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User profile fetched successfully:', userData);
      return userData;
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('Updating user profile for:', userId);
    console.log('Profile data:', profileData);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!profileData) {
      throw new Error('Profile data is required');
    }

    const userDocRef = doc(db, 'users', userId);
    
    // Check if document exists first
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
      console.log('User profile updated successfully');
    } else {
      // Create new document if it doesn't exist
      console.log('User document does not exist, creating new one');
      await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('User profile created successfully');
    }
    
    // Update Firebase Auth profile if displayName is provided
    if (profileData.name && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: profileData.name,
          photoURL: profileData.avatar || auth.currentUser.photoURL
        });
        console.log('Firebase Auth profile updated successfully');
      } catch (authError) {
        console.warn('Failed to update Firebase Auth profile:', authError);
        // Don't throw here as the main profile update succeeded
      }
    }
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: You do not have permission to update this profile.');
    } else if (error.code === 'unavailable') {
      throw new Error('Service temporarily unavailable. Please try again later.');
    } else if (error.code === 'unauthenticated') {
      throw new Error('Authentication required. Please sign in again.');
    } else {
      throw error;
    }
  }
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    console.log('Changing user password...');
    
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    console.log('User re-authenticated successfully');
    
    // Update password
    await updatePassword(auth.currentUser, newPassword);
    console.log('Password updated successfully');
    
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const changeUserEmail = async (currentPassword, newEmail) => {
  try {
    console.log('Changing user email...');
    
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }
    
    // Re-authenticate user before changing email
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    console.log('User re-authenticated successfully');
    
    // Update email
    await updateEmail(auth.currentUser, newEmail);
    console.log('Email updated successfully');
    
    // Update email in Firestore
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      email: newEmail,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error changing email:', error);
    throw error;
  }
};

// Journal functions
export const addJournalEntry = async (userId, journalData) => {
  try {
    console.log('Adding journal entry for user:', userId);
    console.log('Journal data:', journalData);
    console.log('Database instance:', !!db);
    
    // Validate input data
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!journalData) {
      throw new Error('Journal data is required');
    }
    
    // Prepare the journal entry with proper structure
    const entryData = {
      ...journalData,
      userId: userId,
      createdAt: serverTimestamp(),
      timestamp: serverTimestamp(),
      type: 'journal'
    };
    
    console.log('Prepared entry data:', entryData);
    
    const journalsCollection = collection(db, 'journals');
    console.log('Journals collection reference:', !!journalsCollection);
    
    const journalRef = await addDoc(journalsCollection, entryData);
    
    console.log('Journal entry added successfully with ID:', journalRef.id);
    return journalRef.id;
  } catch (error) {
    console.error('Error in addJournalEntry:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: Please ensure you are logged in and have permission to save journal entries.');
    } else if (error.code === 'unavailable') {
      throw new Error('Database temporarily unavailable. Please try again in a moment.');
    } else {
      throw new Error(`Failed to save journal entry: ${error.message}`);
    }
  }
};

export const getUserJournalEntries = async (userId, limit = 50) => {
  try {
    console.log('Fetching journal entries for user:', userId);
    
    const q = query(
      collection(db, 'journals'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const journals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by date
    journals.sort((a, b) => {
      const dateA = new Date(b.timestamp?.toDate() || b.createdAt?.toDate() || b.date);
      const dateB = new Date(a.timestamp?.toDate() || a.createdAt?.toDate() || a.date);
      return dateA - dateB;
    });
    
    console.log('Journal entries fetched successfully:', journals.length, 'entries');
    return journals.slice(0, limit);
  } catch (error) {
    console.error('Error in getUserJournalEntries:', error);
    return [];
  }
};

export const updateJournalEntry = async (journalId, updates) => {
  try {
    const journalRef = doc(db, 'journals', journalId);
    await updateDoc(journalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('Journal entry updated successfully');
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (journalId) => {
  try {
    const journalRef = doc(db, 'journals', journalId);
    await deleteDoc(journalRef);
    console.log('Journal entry deleted successfully');
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

export default app; 