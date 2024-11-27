export const filterReducers = {
  setActiveFilters: (state, action) => {
    state.activeFilters = { ...state.activeFilters, ...action.payload };
  },

  updateSettings: (state, action) => {
    state.settings = { ...state.settings, ...action.payload };
  }
};

export default filterReducers;
