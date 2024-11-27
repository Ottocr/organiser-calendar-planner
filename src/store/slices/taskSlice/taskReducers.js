export const taskReducers = {
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
};

export default taskReducers;
