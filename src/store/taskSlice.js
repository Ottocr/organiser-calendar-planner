import { createSlice } from '@reduxjs/toolkit';
import { startOfToday, addDays, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';

const initialState = {
  tasks: [],
  lists: [
    { id: 'work', name: 'Work', color: '#4299E1', icon: 'Work' },
    { id: 'personal', name: 'Personal', color: '#48BB78', icon: 'Home' },
    { id: 'study', name: 'Study', color: '#9F7AEA', icon: 'School' },
    { id: 'health', name: 'Health', color: '#F56565', icon: 'FitnessCenter' },
  ],
  priorities: [
    { id: 'urgent', name: 'Urgent', color: '#F56565' },
    { id: 'normal', name: 'Normal', color: '#4299E1' },
    { id: 'low', name: 'Low', color: '#48BB78' },
  ],
  activeFilters: {
    view: 'tasks',      // 'tasks', 'calendar', 'analytics'
    priority: 'all',
    search: '',
    sortBy: 'dueDate', // 'dueDate', 'priority', 'title'
    timeframe: 'all',  // 'all', 'today', 'week', 'month'
    list: null,       // list id or null for all lists
  },
  settings: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    startOfWeek: 'sunday',
    notifications: true,
  }
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.push({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
        deleted: false,
        important: false,
        ...action.payload
      });
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = { 
          ...state.tasks[index], 
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },
    toggleTaskComplete: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        task.updatedAt = new Date().toISOString();
      }
    },
    toggleTaskImportant: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.important = !task.important;
        task.updatedAt = new Date().toISOString();
      }
    },
    moveTaskToTrash: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.deleted = true;
        task.deletedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
      }
    },
    restoreTaskFromTrash: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.deleted = false;
        task.deletedAt = null;
        task.updatedAt = new Date().toISOString();
      }
    },
    deleteTaskPermanently: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    addList: (state, action) => {
      state.lists.push({
        id: action.payload.id.toLowerCase(),
        ...action.payload
      });
    },
    updateList: (state, action) => {
      const index = state.lists.findIndex(list => list.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = { ...state.lists[index], ...action.payload };
      }
    },
    deleteList: (state, action) => {
      state.lists = state.lists.filter(list => list.id !== action.payload);
      // Move tasks from deleted list to inbox
      state.tasks = state.tasks.map(task => 
        task.list === action.payload ? { ...task, list: 'inbox' } : task
      );
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

// Action creators
export const {
  addTask,
  updateTask,
  toggleTaskComplete,
  toggleTaskImportant,
  moveTaskToTrash,
  restoreTaskFromTrash,
  deleteTaskPermanently,
  addList,
  updateList,
  deleteList,
  setActiveFilters,
  updateSettings,
} = taskSlice.actions;

// Selectors
export const selectTasks = (state) => state.tasks.tasks;
export const selectLists = (state) => state.tasks.lists;
export const selectPriorities = (state) => state.tasks.priorities;
export const selectActiveFilters = (state) => state.tasks.activeFilters;
export const selectSettings = (state) => state.tasks.settings;

// Complex selectors
export const selectFilteredTasks = (state) => {
  const { tasks, activeFilters } = state.tasks;
  let filtered = tasks;

  // Filter by search
  if (activeFilters.search) {
    const searchLower = activeFilters.search.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by list
  if (activeFilters.list) {
    filtered = filtered.filter(task => task.list === activeFilters.list);
  }

  // Filter by timeframe
  switch (activeFilters.timeframe) {
    case 'today':
      filtered = filtered.filter(task => isToday(parseISO(task.dueDate)));
      break;
    case 'week':
      filtered = filtered.filter(task => isThisWeek(parseISO(task.dueDate)));
      break;
    case 'month':
      filtered = filtered.filter(task => isThisMonth(parseISO(task.dueDate)));
      break;
  }

  // Filter by priority
  if (activeFilters.priority !== 'all') {
    filtered = filtered.filter(task => task.priority === activeFilters.priority);
  }

  // Sort tasks
  switch (activeFilters.sortBy) {
    case 'dueDate':
      filtered.sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate));
      break;
    case 'priority':
      const priorityOrder = { urgent: 0, normal: 1, low: 2 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      break;
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  return filtered;
};

// Search selector
export const selectSearchResults = (state, query) => {
  if (!query) return [];
  
  const searchLower = query.toLowerCase();
  return state.tasks.tasks
    .filter(task => !task.deleted &&
      (task.title.toLowerCase().includes(searchLower) ||
       task.description?.toLowerCase().includes(searchLower))
    )
    .sort((a, b) => {
      // Prioritize title matches over description matches
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aStartsWithQuery = aTitle.startsWith(searchLower);
      const bStartsWithQuery = bTitle.startsWith(searchLower);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      
      return aTitle.localeCompare(bTitle);
    })
    .slice(0, 5); // Limit to 5 results for performance
};

export default taskSlice.reducer;
