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
} from '../store/slices/taskSlice';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Delete,
  Edit,
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
  Archive,
  Flag,
  Warning,
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

function ConfirmationModal({ onConfirm, onCancel, title, message }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-80 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Warning className="text-amber-500" />
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ListEditModal({ list, onClose, onSave, userId }) {
  const [name, setName] = useState(list ? list.name : '');
  const [color, setColor] = useState(list ? list.color : '#4299E1');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: list ? list.id : name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
      userId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-80">
        <h2 className="text-base font-semibold mb-3">
          {list ? 'Edit List' : 'New List'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-1.5 border rounded-md text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-8 p-0.5 rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {list ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskList({ onEditTask, userId }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const lists = useSelector(selectLists);
  const priorities = useSelector(selectPriorities);

  const [currentView, setCurrentView] = useState('all');
  const [isMatrixView, setIsMatrixView] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [viewMode, setViewMode] = useState('active');
  const [sortBy, setSortBy] = useState('dueDate');
  const [editingList, setEditingList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showListSidebar, setShowListSidebar] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [filters, setFilters] = useState({
    priority: 'all',
    favorites: false,
  });

  const priorityColors = {
    all: 'bg-gray-500',
    urgent: 'bg-red-500',
    normal: 'bg-blue-500',
    low: 'bg-green-500',
  };

  const handlePriorityChange = () => {
    const priorityOrder = ['all', 'urgent', 'normal', 'low'];
    const currentIndex = priorityOrder.indexOf(filters.priority);
    const nextPriority = priorityOrder[(currentIndex + 1) % priorityOrder.length];
    setFilters(f => ({ ...f, priority: nextPriority }));
  };

  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation();
    dispatch(toggleTaskComplete({ taskId, userId }));
  };

  const handleToggleImportant = (e, taskId) => {
    e.stopPropagation();
    dispatch(toggleTaskImportant({ taskId, userId }));
  };

  const handleDeleteTask = (e, taskId) => {
    e.stopPropagation();
    dispatch(moveTaskToTrash({ taskId, userId }));
  };

  const handleAddList = (listData) => {
    dispatch(addList({ ...listData, userId }));
  };

  const handleUpdateList = (listData) => {
    dispatch(updateList({ ...listData, userId }));
  };

  const handleDeleteList = (listId) => {
    setDeleteConfirmation(listId);
  };

  const confirmDeleteList = () => {
    if (deleteConfirmation) {
      dispatch(deleteList({ listId: deleteConfirmation, userId }));
      if (selectedList === deleteConfirmation) {
        setSelectedList(null);
      }
      setDeleteConfirmation(null);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filter by view mode
    switch (viewMode) {
      case 'completed':
        filtered = filtered.filter(task => task.completed && !task.deleted);
        break;
      case 'archived':
        filtered = filtered.filter(task => task.deleted);
        break;
      default: // 'active'
        filtered = filtered.filter(task => !task.completed && !task.deleted);
        break;
    }

    // Filter by list (only if in active view)
    if (selectedList && viewMode === 'active') {
      filtered = filtered.filter(task => task.list === selectedList);
    }

    // Filter by favorites
    if (filters.favorites) {
      filtered = filtered.filter(task => task.important);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filter by timeframe
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
  }, [tasks, currentView, selectedList, viewMode, filters, sortBy, priorities]);

  if (isMatrixView) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMatrixView(false)}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <ViewList className="w-4 h-4 mr-1.5" />
              List View
            </button>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {timeViews.map(view => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    currentView === view.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <view.icon className="w-4 h-4 mr-1.5" />
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
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className="h-full grid gap-4" style={{ gridTemplateColumns: `1fr ${selectedTask ? '400px' : '0px'}` }}>
      <div className="flex h-full gap-4">
        <AnimatePresence initial={false}>
          {showListSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Lists</h3>
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
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedList(null);
                      setViewMode('active');
                    }}
                    className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${
                      !selectedList && viewMode === 'active' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Lists
                  </button>
                  {lists.map(list => (
                    <div key={list.id} className="group flex items-center">
                      <button
                        onClick={() => {
                          setSelectedList(list.id);
                          setViewMode('active');
                        }}
                        className={`flex-1 flex items-center px-2 py-1.5 text-sm rounded-md ${
                          selectedList === list.id && viewMode === 'active' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: list.color }}
                        />
                        {list.name}
                      </button>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        <button
                          onClick={() => {
                            setEditingList(list);
                            setShowListModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Delete className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedList(null);
                        setViewMode('completed');
                      }}
                      className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${
                        viewMode === 'completed' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed Tasks
                    </button>
                    <button
                      onClick={() => {
                        setSelectedList(null);
                        setViewMode('archived');
                      }}
                      className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${
                        viewMode === 'archived' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archived Tasks
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowListSidebar(!showListSidebar)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
                title={showListSidebar ? "Hide Lists" : "Show Lists"}
              >
                {showListSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setIsMatrixView(true)}
                  className="flex items-center px-2 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-800 hover:bg-white"
                >
                  <GridView className="w-4 h-4 mr-1.5" />
                  Matrix View
                </button>
                {timeViews.map(view => (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id)}
                    className={`flex items-center px-2 py-1.5 text-sm rounded-md ${
                      currentView === view.id
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <view.icon className="w-4 h-4 mr-1.5" />
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, favorites: !f.favorites }))}
                className={`flex items-center px-3 py-1.5 text-sm rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  filters.favorites ? 'bg-yellow-50 text-yellow-600' : 'bg-white'
                }`}
              >
                <Star className="w-4 h-4 mr-1.5" />
                Favorites
              </button>
              <button
                onClick={handlePriorityChange}
                className={`flex items-center px-3 py-1.5 text-sm rounded-lg shadow-sm hover:shadow-md transition-shadow text-white ${priorityColors[filters.priority]}`}
              >
                <Flag className="w-4 h-4 mr-1.5" />
                {filters.priority === 'all' ? 'All Priorities' : `${filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)} Priority`}
              </button>
              <button
                onClick={() => {
                  setSortBy(current => {
                    const options = ['dueDate', 'priority', 'title'];
                    const currentIndex = options.indexOf(current);
                    return options[(currentIndex + 1) % options.length];
                  });
                }}
                className="flex items-center px-3 py-1.5 text-sm bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Sort className="w-4 h-4 mr-1.5" />
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-full overflow-y-auto p-3">
              <AnimatePresence>
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-gray-500"
                  >
                    <p className="text-sm">No tasks found</p>
                    <p className="text-xs">Create a new task to get started</p>
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
                      className={`group flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
                        index !== filteredTasks.length - 1 ? 'border-b' : ''
                      } ${selectedTask?.id === task.id ? 'bg-gray-50' : ''}`}
                    >
                      <button
                        onClick={(e) => handleToggleComplete(e, task.id)}
                        className="mr-3"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <RadioButtonUnchecked className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-medium truncate ${
                            task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                          }`}>
                            {task.title}
                          </h3>
                          <button
                            onClick={(e) => handleToggleImportant(e, task.id)}
                            className="text-gray-400 hover:text-yellow-400"
                          >
                            {task.important ? (
                              <Star className="w-3.5 h-3.5 text-yellow-400" />
                            ) : (
                              <StarBorder className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-gray-500 truncate text-xs mt-0.5">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: lists.find(list => list.id === task.list)?.color,
                              color: 'white'
                            }}
                          >
                            {lists.find(list => list.id === task.list)?.name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium bg-task-${task.priority} text-white`}>
                            {task.priority}
                          </span>
                          <span className={`text-xs ${
                            isBefore(parseISO(task.dueDate), new Date()) && !task.completed
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }`}>
                            Due {format(parseISO(task.dueDate), 'PP')}
                          </span>
                          {task.checklist?.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <CheckBox className="w-3.5 h-3.5" />
                              {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                            </span>
                          )}
                          {task.attachments?.map((attachment, i) => (
                            <span key={i} className="text-gray-400">
                              {attachment.type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTask(e, task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                        >
                          <Delete className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="h-full">
            <TaskDetails
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onEdit={() => {
                onEditTask(selectedTask);
                setSelectedTask(null);
              }}
              userId={userId}
            />
          </div>
        )}
      </AnimatePresence>

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
          userId={userId}
        />
      )}

      {deleteConfirmation && (
        <ConfirmationModal
          title="Delete List"
          message="Are you sure you want to delete this list? All tasks in this list will be moved to inbox."
          onConfirm={confirmDeleteList}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
}

export default TaskList;
