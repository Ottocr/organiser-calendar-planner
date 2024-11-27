export const checklistReducers = {
  addChecklistItem: (state, action) => {
    const { taskId, text } = action.payload;
    const task = state.tasks.find(task => task.id === taskId);
    if (task) {
      if (!task.checklist) task.checklist = [];
      task.checklist.push({
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      });
      task.updatedAt = new Date().toISOString();
    }
  },

  toggleChecklistItem: (state, action) => {
    const { taskId, itemId } = action.payload;
    const task = state.tasks.find(task => task.id === taskId);
    if (task && task.checklist) {
      const item = task.checklist.find(item => item.id === itemId);
      if (item) {
        item.completed = !item.completed;
        item.completedAt = item.completed ? new Date().toISOString() : null;
        task.updatedAt = new Date().toISOString();
      }
    }
  },

  removeChecklistItem: (state, action) => {
    const { taskId, itemId } = action.payload;
    const task = state.tasks.find(task => task.id === taskId);
    if (task && task.checklist) {
      task.checklist = task.checklist.filter(item => item.id !== itemId);
      task.updatedAt = new Date().toISOString();
    }
  }
};

export default checklistReducers;
