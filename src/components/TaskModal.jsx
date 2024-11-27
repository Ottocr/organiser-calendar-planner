import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { addTask, updateTask, selectLists, selectPriorities } from '../store/taskSlice';
import {
  Close,
  AccessTime,
  List,
  Flag,
  Description,
  Event,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { format, addHours } from 'date-fns';

function TaskModal({ isOpen, onClose, task = null }) {
  const dispatch = useDispatch();
  const lists = useSelector(selectLists);
  const priorities = useSelector(selectPriorities);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    list: lists[0]?.id || '',
    priority: priorities[0]?.id || '',
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    startDate: '',
    endDate: '',
    important: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        list: task.list,
        priority: task.priority,
        dueDate: format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"),
        startDate: task.startDate ? format(new Date(task.startDate), "yyyy-MM-dd'T'HH:mm") : '',
        endDate: task.endDate ? format(new Date(task.endDate), "yyyy-MM-dd'T'HH:mm") : '',
        important: task.important || false,
      });
    } else {
      // Reset form when opening for new task
      setFormData({
        title: '',
        description: '',
        list: lists[0]?.id || '',
        priority: priorities[0]?.id || '',
        dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        startDate: '',
        endDate: '',
        important: false,
      });
    }
    setErrors({});
  }, [task, lists, priorities]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.list) {
      newErrors.list = 'List is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    if (task) {
      dispatch(updateTask({ id: task.id, ...taskData }));
    } else {
      dispatch(addTask(taskData));
    }
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Auto-fill end date when due date changes
      if (name === 'dueDate' && !prev.endDate) {
        newData.endDate = format(addHours(new Date(value), 1), "yyyy-MM-dd'T'HH:mm");
      }

      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Close />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Task title"
                  className={`input flex-1 ${errors.title ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => handleChange({
                    target: { name: 'important', type: 'checkbox', checked: !formData.important }
                  })}
                  className="p-2 text-gray-400 hover:text-yellow-400"
                >
                  {formData.important ? (
                    <Star className="text-yellow-400" />
                  ) : (
                    <StarBorder />
                  )}
                </button>
              </div>
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}

              <div>
                <div className="flex items-center mb-2">
                  <Description className="w-5 h-5 mr-2 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details..."
                  rows="3"
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <List className="w-5 h-5 mr-2 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">
                      List
                    </label>
                  </div>
                  <select
                    name="list"
                    value={formData.list}
                    onChange={handleChange}
                    className={`input ${errors.list ? 'border-red-500' : ''}`}
                  >
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  {errors.list && (
                    <p className="text-red-500 text-sm mt-1">{errors.list}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Flag className="w-5 h-5 mr-2 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">
                      Priority
                    </label>
                  </div>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`input ${errors.priority ? 'border-red-500' : ''}`}
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Event className="w-5 h-5 mr-2 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">
                    Due Date & Time
                  </label>
                </div>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={`input ${errors.dueDate ? 'border-red-500' : ''}`}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <AccessTime className="w-5 h-5 mr-2 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">
                      Start (optional)
                    </label>
                  </div>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <AccessTime className="w-5 h-5 mr-2 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">
                      End
                    </label>
                  </div>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`input ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskModal;
