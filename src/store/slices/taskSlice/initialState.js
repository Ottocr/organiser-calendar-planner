const initialState = {
  // Tasks array - each task will have a userId field
  tasks: [],

  // Lists array - each list will have a userId field
  lists: [],

  // Default priorities (shared across all users)
  priorities: [
    { id: 'urgent', name: 'Urgent', color: '#F56565' },
    { id: 'normal', name: 'Normal', color: '#4299E1' },
    { id: 'low', name: 'Low', color: '#48BB78' },
  ],

  // Active filters - will be set per user when they log in
  activeFilters: {
    view: 'tasks',
    priority: 'all',
    search: '',
    sortBy: 'dueDate',
    timeframe: 'all',
    list: null,
  },

  // User settings - will be set per user when they log in
  settings: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    startOfWeek: 'sunday',
    notifications: true,
  },

  // Default list colors for new lists
  defaultColors: [
    '#4299E1', // Blue
    '#48BB78', // Green
    '#9F7AEA', // Purple
    '#F56565', // Red
    '#ED8936', // Orange
    '#ECC94B', // Yellow
    '#38B2AC', // Teal
    '#F687B3', // Pink
    '#A0AEC0', // Gray
  ],

  // Default icons for new lists
  defaultIcons: [
    'List',
    'Work',
    'Home',
    'School',
    'Shopping',
    'Star',
    'Heart',
    'Flag',
    'Calendar',
  ]
};

export default initialState;
