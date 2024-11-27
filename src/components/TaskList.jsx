import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  selectTasks,
  selectLists,
  selectPriorities,
  toggleTaskComplete,
  moveTaskToTrash,
  toggleTaskImportant,
  addList,
  updateList,
  deleteList,
} from '../store/taskSlice';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Delete,
  Edit,
  FilterList,
  Sort,
  Star,
  StarBorder,
  ViewList,
  GridView,
  Add,
  Today,
  DateRange,
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Mic,
  CheckBox,
} from '@mui/icons-material';
import { format, isToday, isThisWeek, isThisMonth, isBefore, parseISO } from 'date-fns';
import Matrix from './Matrix';
import TaskDetails from './TaskDetails';

const timeViews = [
  { id: 'all', label: 'All', icon: ViewList },
  { id: 'today', label: 'Today', icon: Today },
  { id: 'week', label: 'Next 7 Days', icon: DateRange },
  { id: 'month', label: 'Month', icon: CalendarMonth },
];

function ListEditModal({ list, onClose, onSave }) {
  const [name, setName] = useState(list ? list.name : '');
  const [color, setColor] = useState(list ? list.color : '#4299E1');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: list ? list.id : name.toLowerCase().replace(/\s+/g, '-'), name, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">
          {list ? 'Edit List' : 'New List'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 p-1 rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {list ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskList({ onEditTask }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const lists = useSelector(selectLists);
  const priorities = useSelector(selectPriorities);

  const [currentView, setCurrentView] = useState('all');
  const [isMatrixView, setIsMatrixView] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [showFilters, setShowFilters] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showListSidebar, setShowListSidebar] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    priority: 'all',
  });

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks].filter(task => !task.deleted);

    if (selectedList) {
      filtered = filtered.filter(task => task.list === selectedList);
    }

    switch (currentView) {
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

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          return priorities.findIndex(p => p.id === b.priority) -
                 priorities.findIndex(p => p.id === a.priority);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [tasks, currentView, selectedList, filters, sortBy, priorities]);

  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation();
    dispatch(toggleTaskComplete(taskId));
  };

  const handleToggleImportant = (e, taskId) => {
    e.stopPropagation();
    dispatch(toggleTaskImportant(taskId));
  };

  const handleDeleteTask = (e, taskId) => {
    e.stopPropagation();
    dispatch(moveTaskToTrash(taskId));
  };

  const handleAddList = (listData) => {
    dispatch(addList(listData));
  };

  const handleUpdateList = (listData) => {
    dispatch(updateList(listData));
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Are you sure you want to delete this list? All tasks in this list will be moved to inbox.')) {
      dispatch(deleteList(listId));
      if (selectedList === listId) {
        setSelectedList(null);
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  if (isMatrixView) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMatrixView(false)}
              className="flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800"
            >
              <ViewList className="w-5 h-5 mr-2" />
              List View
            </button>
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {timeViews.map(view => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center px-3 py-1.5 rounded-md ${
                    currentView === view.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <view.icon className="w-4 h-4 mr-2" />
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Matrix
          tasks={filteredTasks}
          onEditTask={onEditTask}
          onToggleComplete={handleToggleComplete}
          onToggleImportant={handleToggleImportant}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <AnimatePresence initial={false}>
        {showListSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white rounded-lg shadow-sm mr-6 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Lists</h3>
                <button
                  onClick={() => {
                    setEditingList(null);
                    setShowListModal(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <Add className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedList(null)}
                  className={`w-full flex items-center px-3 py-2 rounded-md ${
                    !selectedList ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Lists
                </button>
                {lists.map(list => (
                  <div key={list.id} className="group flex items-center">
                    <button
                      onClick={() => setSelectedList(list.id)}
                      className={`flex-1 flex items-center px-3 py-2 rounded-md ${
                        selectedList === list.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: list.color }}
                      />
                      {list.name}
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
                      <button
                        onClick={() => {
                          setEditingList(list);
                          setShowListModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowListSidebar(!showListSidebar)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title={showListSidebar ? "Hide Lists" : "Show Lists"}
            >
              {showListSidebar ? <ChevronLeft /> : <ChevronRight />}
            </button>
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsMatrixView(true)}
                className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-white"
              >
                <GridView className="w-5 h-5 mr-2" />
                Matrix View
              </button>
              {timeViews.map(view => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    currentView === view.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <view.icon className="w-5 h-5 mr-2" />
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <FilterList className="w-5 h-5 mr-2" />
              Filters
            </button>
            <button
              onClick={() => {
                setSortBy(current => {
                  const options = ['dueDate', 'priority', 'title'];
                  const currentIndex = options.indexOf(current);
                  return options[(currentIndex + 1) % options.length];
                });
              }}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Sort className="w-5 h-5 mr-2" />
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Priorities</option>
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <p className="text-lg">No tasks found</p>
                  <p className="text-sm">Create a new task to get started</p>
                </motion.div>
              ) : (
                filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTaskClick(task)}
                    className={`group flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
                      index !== filteredTasks.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <button
                      onClick={(e) => handleToggleComplete(e, task.id)}
                      className="mr-4"
                    >
                      {task.completed ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <RadioButtonUnchecked className="text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-medium truncate ${
                          task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </h3>
                        <button
                          onClick={(e) => handleToggleImportant(e, task.id)}
                          className="text-gray-400 hover:text-yellow-400"
                        >
                          {task.important ? (
                            <Star className="text-yellow-400" />
                          ) : (
                            <StarBorder />
                          )}
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-gray-500 truncate text-sm mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: lists.find(list => list.id === task.list)?.color,
                            color: 'white'
                          }}
                        >
                          {lists.find(list => list.id === task.list)?.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-task-${task.priority} text-white`}>
                          {task.priority}
                        </span>
                        <span className={`text-sm ${
                          isBefore(parseISO(task.dueDate), new Date()) && !task.completed
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}>
                          Due {format(parseISO(task.dueDate), 'PP')}
                        </span>
                        {task.checklist?.length > 0 && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <CheckBox className="w-4 h-4" />
                            {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                          </span>
                        )}
                        {task.attachments?.map((attachment, i) => (
                          <span key={i} className="text-gray-400">
                            {attachment.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={(e) => handleDeleteTask(e, task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                      >
                        <Delete />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showListModal && (
        <ListEditModal
          list={editingList}
          onClose={() => {
            setEditingList(null);
            setShowListModal(false);
          }}
          onSave={(listData) => {
            if (editingList) {
              handleUpdateList(listData);
            } else {
              handleAddList(listData);
            }
          }}
        />
      )}

      <AnimatePresence>
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={() => {
              onEditTask(selectedTask);
              setSelectedTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TaskList;
