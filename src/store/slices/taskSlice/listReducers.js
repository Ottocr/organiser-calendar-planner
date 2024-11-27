export const listReducers = {
  addList: (state, action) => {
    state.lists.push({
      id: action.payload.id.toLowerCase(),
      ...action.payload
    });
  },

  updateList: (state, action) => {
    const index = state.lists.findIndex(list => list.id === action.payload.id);
    if (index !== -1) {
      state.lists[index] = { ...state.lists[index], ...action.payload };
    }
  },

  deleteList: (state, action) => {
    state.lists = state.lists.filter(list => list.id !== action.payload);
    state.tasks = state.tasks.map(task => 
      task.list === action.payload ? { ...task, list: 'inbox' } : task
    );
  }
};

export default listReducers;
