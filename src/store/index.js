import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';
import userReducer, { loadStoredUser } from './slices/userSlice';

// Create a middleware to save tasks to localStorage
const localStorageMiddleware = store => next => action => {
  const result = next(action);
  const state = store.getState();
  
  // Save tasks when they change
  if (action.type.startsWith('tasks/')) {
    const currentUser = state.user.currentUser;
    if (currentUser) {
      const userTasks = {
        tasks: state.tasks.tasks.filter(task => task.userId === currentUser.id),
        lists: state.tasks.lists.filter(list => list.userId === currentUser.id),
        activeFilters: state.tasks.activeFilters,
        settings: state.tasks.settings
      };
      localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(userTasks));
    }
  }

  // Save users when they change
  if (action.type.startsWith('user/') && !action.type.includes('loadStoredUser')) {
    if (state.user.users.length > 0) {
      localStorage.setItem('users', JSON.stringify(state.user.users));
    }
    if (state.user.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(state.user.currentUser));
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'tasks/addTask',
          'user/registerUser',
          'user/loginUser',
          'user/loadStoredUser',
          'tasks/loadStoredTasks'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.date', 
          'payload.dueDate', 
          'payload.startDate', 
          'payload.endDate',
          'payload.createdAt',
          'payload.completedAt',
          'payload.updatedAt'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'tasks.tasks.date', 
          'tasks.tasks.dueDate', 
          'tasks.tasks.startDate', 
          'tasks.tasks.endDate',
          'tasks.tasks.createdAt',
          'tasks.tasks.completedAt',
          'tasks.tasks.updatedAt',
          'user.currentUser.createdAt'
        ],
      },
      thunk: true,
    }).concat(localStorageMiddleware),
});

// Initialize the store with stored data
const initializeStore = () => {
  // Load stored user state (includes both users array and current user)
  store.dispatch(loadStoredUser());

  // Load current user's tasks if there is a current user
  const currentUser = store.getState().user.currentUser;
  if (currentUser) {
    const storedTasks = localStorage.getItem(`tasks_${currentUser.id}`);
    if (storedTasks) {
      store.dispatch({
        type: 'tasks/loadStoredTasks',
        payload: JSON.parse(storedTasks)
      });
    }

    // Load user's filters and settings
    store.dispatch({
      type: 'tasks/loadUserFilters',
      payload: {
        userId: currentUser.id,
        filters: currentUser.filters,
        settings: currentUser.settings
      }
    });
  }
};

// Initialize the store
initializeStore();

export default store;
