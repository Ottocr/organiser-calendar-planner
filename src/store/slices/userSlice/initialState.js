const initialState = {
  // Array of registered users
  users: [],

  // Currently logged in user
  currentUser: null,

  // Authentication state
  isAuthenticated: false,

  // Error messages
  error: null,

  // Default user settings template (used when creating new users)
  defaultSettings: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    startOfWeek: 'sunday',
    notifications: true,
    profile: {
      avatarUrl: null,
      bio: '',
      displayName: '',
      timezone: 'UTC',
      phoneNumber: '',
      organization: '',
      position: '',
    },
    taskDefaults: {
      defaultList: 'inbox',
      defaultPriority: 'normal',
      defaultView: 'tasks',
      autoSortBy: 'dueDate',
      showCompletedTasks: true,
      showDeletedTasks: false,
    },
    appearance: {
      sidebarExpanded: true,
      compactMode: false,
      showTaskIcons: true,
      showListColors: true,
      accentColor: '#4299E1',
      customTheme: null,
    },
    notifications: {
      taskDue: true,
      taskOverdue: true,
      taskAssigned: true,
      dailyDigest: false,
      emailNotifications: false,
    }
  },

  // Supported languages
  supportedLanguages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ],

  // Supported date formats
  supportedDateFormats: [
    { value: 'MM/dd/yyyy', label: '12/31/2023' },
    { value: 'dd/MM/yyyy', label: '31/12/2023' },
    { value: 'yyyy-MM-dd', label: '2023-12-31' },
  ],

  // Supported time formats
  supportedTimeFormats: [
    { value: '12h', label: '12-hour (1:30 PM)' },
    { value: '24h', label: '24-hour (13:30)' },
  ],

  // Supported week starts
  supportedWeekStarts: [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
  ],

  // Supported themes
  supportedThemes: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ],

  // Supported timezones
  supportedTimezones: [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
  ],
};

export default initialState;
