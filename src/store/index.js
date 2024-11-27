import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['tasks/addTask'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.date', 'payload.dueDate', 'payload.startDate', 'payload.endDate'],
        // Ignore these paths in the state
        ignoredPaths: ['tasks.tasks.date', 'tasks.tasks.dueDate', 'tasks.tasks.startDate', 'tasks.tasks.endDate'],
      },
    }),
});

export default store;
