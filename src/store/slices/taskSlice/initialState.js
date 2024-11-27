export const initialState = {
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
    view: 'tasks',
    priority: 'all',
    search: '',
    sortBy: 'dueDate',
    timeframe: 'all',
    list: null,
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

export default initialState;
