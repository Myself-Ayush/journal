# Firebase Mindful Journal Setup Guide

## 🔥 Firebase Configuration & Database Rules

This guide will help you set up Firebase Authentication and Firestore Database with secure rules for your Mindful Journal app.

## 📋 Prerequisites

1. [Firebase Console](https://console.firebase.google.com/) account
2. Your Firebase project: `progress-tracker-26ebf`

## 🔧 Step 1: Firebase Configuration

### Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `progress-tracker-26ebf`
3. Click the ⚙️ (Settings) icon → "Project settings"
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" → Web icon (</>)
6. Register your app with name: "Mindful Journal Web"
7. Copy the `firebaseConfig` object

### Update Firebase Configuration

Replace the values in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "progress-tracker-26ebf.firebaseapp.com",
  projectId: "progress-tracker-26ebf",
  storageBucket: "progress-tracker-26ebf.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🔐 Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started" if first time
3. Go to "Sign-in method" tab
4. Click "Email/Password" and toggle "Enable"
5. Save changes

### Optional: Configure Authorized Domains

In Authentication → Sign-in method → Authorized domains:
- `localhost` (for development)
- `progress-tracker-26ebf.web.app` (Firebase hosting)
- Add any custom domains

## 🗄️ Step 3: Set Up Firestore Database

1. Go to "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in production mode" (we'll add custom rules)
4. Select a location (closest to your users)

## 🛡️ Step 4: Configure Security Rules

Copy the contents of `firestore.rules` file and paste it in Firebase Console:

1. Go to "Firestore Database" → "Rules" tab
2. Replace the default rules with the content from `firestore.rules`
3. Click "Publish"

### Security Rules Explained

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Goals are isolated per user
match /goals/{goalId} {
  allow read, write: if request.auth != null 
                     && request.auth.uid == resource.data.userId;
}
```

## 📊 Database Structure

### Collections

#### `users` Collection
```json
{
  "userId": {
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `goals` Collection
```json
{
  "goalId": {
    "title": "Learn React",
    "completed": false,
    "userId": "user-uid-here",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🔒 Security Rules Details

### User Protection
- ✅ Users can only read/write their own user document
- ✅ Email validation with regex pattern
- ✅ Name length validation (1-100 characters)
- ✅ Required fields validation

### Goal Protection
- ✅ Users can only access their own goals
- ✅ Goal title validation (1-500 characters)
- ✅ Cannot change goal ownership
- ✅ Cannot modify creation timestamps
- ✅ Boolean validation for completion status

### Data Validation Functions

```javascript
// User data validation
function validateUserData(data) {
  return data.keys().hasAll(['name', 'email', 'createdAt']) &&
         data.name is string &&
         data.name.size() > 0 &&
         data.name.size() <= 100 &&
         data.email is string &&
         data.email.matches('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
}

// Goal data validation
function validateGoalData(data) {
  return data.keys().hasAll(['title', 'completed', 'userId', 'createdAt']) &&
         data.title is string &&
         data.title.size() > 0 &&
         data.title.size() <= 500 &&
         data.completed is bool &&
         data.userId == request.auth.uid;
}
```

## 🚀 Step 5: Install Dependencies & Test

```bash
npm install
npm start
```

## ✅ Testing the Setup

1. **Authentication Test:**
   - Try creating a new account
   - Try signing in with existing account
   - Verify error handling for invalid credentials

2. **Database Test:**
   - Add a new goal
   - Mark goal as complete/incomplete
   - Delete a goal
   - Sign out and sign back in (data should persist)

3. **Security Test:**
   - Check that users can't see other users' goals
   - Verify that unauthenticated users can't access data

## 📱 Step 6: Deploy (Optional)

```bash
npm run build
firebase deploy
```

## 🔍 Monitoring & Analytics

### Enable Firebase Analytics (Optional)
1. Go to Firebase Console → Analytics
2. Enable Google Analytics
3. Configure data streams

### Monitor Usage
- Authentication → Users tab
- Firestore → Usage tab
- Monitor read/write operations

## 🛠️ Troubleshooting

### Common Issues

1. **"Permission denied" errors:**
   - Check that security rules are properly deployed
   - Verify user is authenticated
   - Ensure user owns the data they're trying to access

2. **"Invalid configuration" errors:**
   - Verify Firebase config values are correct
   - Check that services are enabled in Firebase Console

3. **Authentication failures:**
   - Verify Email/Password auth is enabled
   - Check domain authorization settings

### Debug Tools

1. **Firebase Console:**
   - Authentication → Users (see registered users)
   - Firestore → Data (view database contents)
   - Firestore → Rules playground (test rules)

2. **Browser DevTools:**
   - Check console for error messages
   - Network tab for failed requests
   - Application tab → Local Storage

## 📝 Best Practices

1. **Security:**
   - Never store sensitive data in client-side code
   - Use environment variables for config in production
   - Regularly review security rules

2. **Performance:**
   - Use Firestore indexes for complex queries
   - Implement pagination for large datasets
   - Cache data when appropriate

3. **User Experience:**
   - Handle offline scenarios
   - Show loading states
   - Provide clear error messages

## 🔄 Backup & Maintenance

1. **Regular Backups:**
   - Set up automated Firestore exports
   - Export user data periodically

2. **Updates:**
   - Keep Firebase SDK updated
   - Monitor Firebase release notes
   - Test changes in development first

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Review security rules in Rules playground
3. Test with Firebase Local Emulator Suite for development 