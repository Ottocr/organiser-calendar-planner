import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

export const selectTasks = (state) => {
  const currentUser = state.user.currentUser;
  if (!currentUser) return [];
  return state.tasks.tasks.filter(task => task.userId === currentUser.id);
};

export const selectLists = (state) => {
  const currentUser = state.user.currentUser;
  if (!currentUser) return [];
  return state.tasks.lists.filter(list => !list.userId || list.userId === currentUser.id);
};

export const selectPriorities = (state) => state.tasks.priorities;
export const selectActiveFilters = (state) => state.tasks.activeFilters;
export const selectSettings = (state) => state.tasks.settings;

export const selectTaskById = (state, taskId) => {
  const currentUser = state.user.currentUser;
  if (!currentUser) return null;
  return state.tasks.tasks.find(task => 
    task.id === taskId && task.userId === currentUser.id
  );
};

export const selectFilteredTasks = (state) => {
  const { tasks, activeFilters } = state.tasks;
  const currentUser = state.user.currentUser;
  if (!currentUser) return [];

  // First filter by user
  let filtered = tasks.filter(task => task.userId === currentUser.id);

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
  
  const currentUser = state.user.currentUser;
  if (!currentUser) return [];

  const searchLower = query.toLowerCase();
  return state.tasks.tasks
    .filter(task => {
      // First check user ownership
      if (task.userId !== currentUser.id) return false;
      if (task.deleted) return false;

      // Search in title
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      
      // Search in description
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
      
      // Search in checklist items
      const checklistMatch = task.checklist?.some(item => 
        item.text.toLowerCase().includes(searchLower)
      );
      
      // Search in attachment names
      const attachmentMatch = task.attachments?.some(attachment => 
        attachment.name.toLowerCase().includes(searchLower)
      );

      return titleMatch || descriptionMatch || checklistMatch || attachmentMatch;
    })
    .sort((a, b) => {
      // First, prioritize exact title matches
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aExactMatch = aTitle === searchLower;
      const bExactMatch = bTitle === searchLower;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then, prioritize title starts with
      const aStartsWithQuery = aTitle.startsWith(searchLower);
      const bStartsWithQuery = bTitle.startsWith(searchLower);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;

      // Finally, sort by recency (using task ID as a proxy for creation time)
      return parseInt(b.id) - parseInt(a.id);
    })
    .slice(0, 5);
};
