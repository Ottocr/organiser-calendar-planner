import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import { taskReducers } from './taskReducers';
import { checklistReducers } from './checklistReducers';
import { attachmentReducers } from './attachmentReducers';
import { listReducers } from './listReducers';
import { filterReducers } from './filterReducers';

export * from './selectors';

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    ...taskReducers,
    ...checklistReducers,
    ...attachmentReducers,
    ...listReducers,
    ...filterReducers,
  },
});

export const {
  // Task actions
  loadStoredTasks,
  addTask,
  updateTask,
  toggleTaskComplete,
  toggleTaskImportant,
  moveTaskToTrash,
  restoreTaskFromTrash,
  deleteTaskPermanently,
  clearUserTasks,
  
  // Checklist actions
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
  
  // Attachment actions
  addAttachment,
  removeAttachment,
  
  // List actions
  addList,
  updateList,
  deleteList,
  
  // Filter actions
  setActiveFilters,
  updateSettings,
} = taskSlice.actions;

export default taskSlice.reducer;
