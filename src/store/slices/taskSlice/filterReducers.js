export const filterReducers = {
  setActiveFilters: (state, action) => {
    state.activeFilters = {
      ...state.activeFilters,
      ...action.payload
    };
  },

  updateSettings: (state, action) => {
    state.settings = {
      ...state.settings,
      ...action.payload
    };
  },

  // Reset filters when user logs out
  resetFilters: (state) => {
    state.activeFilters = {
      view: 'tasks',
      priority: 'all',
      search: '',
      sortBy: 'dueDate',
      timeframe: 'all',
      list: null,
    };
  },

  // Initialize user-specific filters
  initializeUserFilters: (state, action) => {
    const { userId } = action.payload;
    
    // Set default filters for new user
    state.activeFilters = {
      view: 'tasks',
      priority: 'all',
      search: '',
      sortBy: 'dueDate',
      timeframe: 'all',
      list: null,
      userId // Associate filters with user
    };

    // Set default settings for new user
    state.settings = {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      startOfWeek: 'sunday',
      notifications: true,
      userId // Associate settings with user
    };
  },

  // Load stored filters for user
  loadUserFilters: (state, action) => {
    const { filters, settings, userId } = action.payload;
    
    if (filters) {
      state.activeFilters = {
        ...filters,
        userId // Ensure userId is set
      };
    }

    if (settings) {
      state.settings = {
        ...settings,
        userId // Ensure userId is set
      };
    }
  },

  // Clear filters when switching users
  clearUserFilters: (state) => {
    state.activeFilters = {
      view: 'tasks',
      priority: 'all',
      search: '',
      sortBy: 'dueDate',
      timeframe: 'all',
      list: null
    };

    state.settings = {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      startOfWeek: 'sunday',
      notifications: true
    };
  }
};
