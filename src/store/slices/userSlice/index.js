import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    registerUser: (state, action) => {
      const { email, password, name } = action.payload;
      // Case-insensitive email check
      const userExists = state.users.some(
        user => user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (userExists) {
        state.error = 'An account with this email already exists';
        return;
      }

      const newUser = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(), // Store email in lowercase
        password, // In production, this would be hashed
        name,
        createdAt: new Date().toISOString(),
        settings: {
          ...state.defaultSettings,
          profile: {
            ...state.defaultSettings.profile,
            displayName: name,
          }
        }
      };

      state.users.push(newUser);
      state.currentUser = { ...newUser, password: undefined };
      state.isAuthenticated = true;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(state.users));
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },

    loginUser: (state, action) => {
      const { email, password } = action.payload;
      // Case-insensitive email check
      const user = state.users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        state.error = 'No account found with this email';
        return;
      }

      if (user.password !== password) {
        state.error = 'Invalid password';
        return;
      }

      state.currentUser = { ...user, password: undefined };
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },

    logoutUser: (state) => {
      // Save current user's tasks before logout
      const currentUserId = state.currentUser?.id;
      if (currentUserId) {
        const tasksData = localStorage.getItem(`tasks_${currentUserId}`);
        if (tasksData) {
          localStorage.setItem(`tasks_${currentUserId}`, tasksData);
        }
      }

      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('currentUser');
    },

    loadStoredUsers: (state, action) => {
      state.users = action.payload;
    },

    loadStoredUser: (state) => {
      const storedUsers = localStorage.getItem('users');
      const storedCurrentUser = localStorage.getItem('currentUser');

      if (storedUsers) {
        state.users = JSON.parse(storedUsers);
      }

      if (storedCurrentUser) {
        const currentUser = JSON.parse(storedCurrentUser);
        // Verify the user still exists in the users array
        const userExists = state.users.some(u => u.id === currentUser.id);
        if (userExists) {
          state.currentUser = currentUser;
          state.isAuthenticated = true;
        } else {
          // If user doesn't exist anymore, clear the stored current user
          localStorage.removeItem('currentUser');
        }
      }
    },

    updateUserSettings: (state, action) => {
      const { settings } = action.payload;
      if (state.currentUser) {
        // Update user settings in users array
        const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
          state.users[userIndex].settings = {
            ...state.users[userIndex].settings,
            ...settings
          };
          
          // Update current user settings
          state.currentUser.settings = {
            ...state.currentUser.settings,
            ...settings
          };

          // Save to localStorage
          localStorage.setItem('users', JSON.stringify(state.users));
          localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
      }
    },

    updateUserProfile: (state, action) => {
      const { profile } = action.payload;
      if (state.currentUser) {
        const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
          // Update profile in users array
          state.users[userIndex].settings.profile = {
            ...state.users[userIndex].settings.profile,
            ...profile
          };
          
          // Update current user profile
          state.currentUser.settings.profile = {
            ...state.currentUser.settings.profile,
            ...profile
          };

          // Save to localStorage
          localStorage.setItem('users', JSON.stringify(state.users));
          localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
      }
    },

    updateUserAvatar: (state, action) => {
      const { avatarUrl } = action.payload;
      if (state.currentUser) {
        const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
          // Update avatar in users array
          state.users[userIndex].settings.profile.avatarUrl = avatarUrl;
          
          // Update current user avatar
          state.currentUser.settings.profile.avatarUrl = avatarUrl;

          // Save to localStorage
          localStorage.setItem('users', JSON.stringify(state.users));
          localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    deleteAccount: (state, action) => {
      const { userId, password } = action.payload;
      const userIndex = state.users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        state.error = 'User not found';
        return;
      }

      if (state.users[userIndex].password !== password) {
        state.error = 'Invalid password';
        return;
      }

      // Remove user's data
      localStorage.removeItem(`tasks_${userId}`);
      state.users = state.users.filter(u => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(state.users));

      // Logout if current user
      if (state.currentUser?.id === userId) {
        state.currentUser = null;
        state.isAuthenticated = false;
        localStorage.removeItem('currentUser');
      }

      state.error = null;
    }
  }
});

export const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  loadStoredUser,
  loadStoredUsers,
  updateUserSettings,
  updateUserProfile,
  updateUserAvatar,
  deleteAccount,
  clearError 
} = userSlice.actions;

export default userSlice.reducer;
