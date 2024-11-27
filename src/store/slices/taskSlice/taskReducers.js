export const taskReducers = {
  loadStoredTasks: (state, action) => {
    // Load stored tasks and other data
    state.tasks = action.payload.tasks || [];
    state.lists = action.payload.lists || state.lists;
    state.activeFilters = action.payload.activeFilters || state.activeFilters;
    state.settings = action.payload.settings || state.settings;
  },

  clearUserTasks: (state, action) => {
    // Clear all tasks and reset state when user logs out
    state.tasks = [];
    state.activeFilters = {
      view: 'tasks',
      priority: 'all',
      search: '',
      sortBy: 'dueDate',
      timeframe: 'all',
      list: null,
    };
  },

  addTask: (state, action) => {
    state.tasks.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      deleted: false,
      important: false,
      checklist: [],
      attachments: [],
      ...action.payload
    });
  },

  updateTask: (state, action) => {
    const { id, userId, ...updates } = action.payload;
    const index = state.tasks.findIndex(task => 
      task.id === id && task.userId === userId
    );
    if (index !== -1) {
      state.tasks[index] = { 
        ...state.tasks[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
  },

  toggleTaskComplete: (state, action) => {
    const { taskId, userId } = action.payload;
    const task = state.tasks.find(task => 
      task.id === taskId && task.userId === userId
    );
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      task.updatedAt = new Date().toISOString();
    }
  },

  toggleTaskImportant: (state, action) => {
    const { taskId, userId } = action.payload;
    const task = state.tasks.find(task => 
      task.id === taskId && task.userId === userId
    );
    if (task) {
      task.important = !task.important;
      task.updatedAt = new Date().toISOString();
    }
  },

  moveTaskToTrash: (state, action) => {
    const { taskId, userId } = action.payload;
    const task = state.tasks.find(task => 
      task.id === taskId && task.userId === userId
    );
    if (task) {
      task.deleted = true;
      task.deletedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();
    }
  },

  restoreTaskFromTrash: (state, action) => {
    const { taskId, userId } = action.payload;
    const task = state.tasks.find(task => 
      task.id === taskId && task.userId === userId
    );
    if (task) {
      task.deleted = false;
      task.deletedAt = null;
      task.updatedAt = new Date().toISOString();
    }
  },

  deleteTaskPermanently: (state, action) => {
    const { taskId, userId } = action.payload;
    state.tasks = state.tasks.filter(task => 
      !(task.id === taskId && task.userId === userId)
    );
  },
};

export default taskReducers;
