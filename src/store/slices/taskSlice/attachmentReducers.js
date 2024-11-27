export const attachmentReducers = {
  addAttachment: (state, action) => {
    const { taskId, attachment, userId } = action.payload;
    const task = state.tasks.find(t => 
      t.id === taskId && t.userId === userId
    );
    if (task) {
      task.attachments = task.attachments || [];
      task.attachments.push({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        userId,
        ...attachment
      });
      task.updatedAt = new Date().toISOString();
    }
  },

  removeAttachment: (state, action) => {
    const { taskId, attachmentId, userId } = action.payload;
    const task = state.tasks.find(t => 
      t.id === taskId && t.userId === userId
    );
    if (task && task.attachments) {
      task.attachments = task.attachments.filter(
        attachment => attachment.id !== attachmentId
      );
      task.updatedAt = new Date().toISOString();
    }
  },

  updateAttachment: (state, action) => {
    const { taskId, attachmentId, updates, userId } = action.payload;
    const task = state.tasks.find(t => 
      t.id === taskId && t.userId === userId
    );
    if (task && task.attachments) {
      const attachmentIndex = task.attachments.findIndex(
        a => a.id === attachmentId
      );
      if (attachmentIndex !== -1) {
        task.attachments[attachmentIndex] = {
          ...task.attachments[attachmentIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        task.updatedAt = new Date().toISOString();
      }
    }
  }
};
