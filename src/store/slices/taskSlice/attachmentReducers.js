export const attachmentReducers = {
  addAttachment: (state, action) => {
    const { taskId, attachment } = action.payload;
    const task = state.tasks.find(task => task.id === taskId);
    if (task) {
      if (!task.attachments) task.attachments = [];
      task.attachments.push({
        id: Date.now().toString(),
        ...attachment,
        createdAt: new Date().toISOString()
      });
      task.updatedAt = new Date().toISOString();
    }
  },

  removeAttachment: (state, action) => {
    const { taskId, attachmentId } = action.payload;
    const task = state.tasks.find(task => task.id === taskId);
    if (task && task.attachments) {
      task.attachments = task.attachments.filter(att => att.id !== attachmentId);
      task.updatedAt = new Date().toISOString();
    }
  }
};

export default attachmentReducers;
