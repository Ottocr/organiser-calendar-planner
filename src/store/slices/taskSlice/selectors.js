import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

export const selectTasks = (state) => state.tasks.tasks;
export const selectLists = (state) => state.tasks.lists;
export const selectPriorities = (state) => state.tasks.priorities;
export const selectActiveFilters = (state) => state.tasks.activeFilters;
export const selectSettings = (state) => state.tasks.settings;

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

export const selectSearchResults = (state, query) => {
  if (!query) return [];
  
  const searchLower = query.toLowerCase();
  return state.tasks.tasks
    .filter(task => !task.deleted &&
      (task.title.toLowerCase().includes(searchLower) ||
       task.description?.toLowerCase().includes(searchLower))
    )
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aStartsWithQuery = aTitle.startsWith(searchLower);
      const bStartsWithQuery = bTitle.startsWith(searchLower);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      
      return aTitle.localeCompare(bTitle);
    })
    .slice(0, 5);
};
