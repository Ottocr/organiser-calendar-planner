export const listReducers = {
  addList: (state, action) => {
    const { id, name, color, userId } = action.payload;
    // Check if list with this ID already exists for this user
    const existingList = state.lists.find(list => 
      list.id === id && list.userId === userId
    );
    
    if (!existingList) {
      state.lists.push({
        id,
        name,
        color,
        userId,
        createdAt: new Date().toISOString(),
        icon: 'List' // Default icon
      });
    }
  },

  updateList: (state, action) => {
    const { id, name, color, userId } = action.payload;
    const listIndex = state.lists.findIndex(list => 
      list.id === id && list.userId === userId
    );
    
    if (listIndex !== -1) {
      state.lists[listIndex] = {
        ...state.lists[listIndex],
        name,
        color,
        updatedAt: new Date().toISOString()
      };
    }
  },

  deleteList: (state, action) => {
    const { listId, userId } = action.payload;
    
    // Remove the list
    state.lists = state.lists.filter(list => 
      !(list.id === listId && list.userId === userId)
    );

    // Move tasks in this list to default list
    state.tasks.forEach(task => {
      if (task.list === listId && task.userId === userId) {
        task.list = 'inbox';
        task.updatedAt = new Date().toISOString();
      }
    });
  },

  // Load initial lists for a new user
  initializeUserLists: (state, action) => {
    const { userId } = action.payload;
    const defaultLists = [
      { id: 'inbox', name: 'Inbox', color: '#4299E1', icon: 'Inbox' },
      { id: 'work', name: 'Work', color: '#48BB78', icon: 'Work' },
      { id: 'personal', name: 'Personal', color: '#9F7AEA', icon: 'Home' },
      { id: 'shopping', name: 'Shopping', color: '#F56565', icon: 'ShoppingCart' }
    ];

    // Add default lists for the new user
    defaultLists.forEach(list => {
      state.lists.push({
        ...list,
        userId,
        createdAt: new Date().toISOString()
      });
    });
  }
};
