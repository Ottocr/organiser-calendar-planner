import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addTask,
  updateTask,
  selectLists,
  selectPriorities,
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
  addAttachment,
  removeAttachment,
} from '../store/taskSlice';
import {
  Close,
  AccessTime,
  List as ListIcon,
  Flag,
  Description,
  Event,
  Star,
  StarBorder,
  Add,
  Delete,
  CheckBox,
  CheckBoxOutlineBlank,
  Image as ImageIcon,
  Mic,
  Stop,
} from '@mui/icons-material';
import { format, addHours } from 'date-fns';

function TaskModal({ isOpen, onClose, task = null, initialDate = null }) {
  const dispatch = useDispatch();
  const lists = useSelector(selectLists);
  const priorities = useSelector(selectPriorities);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    list: lists[0]?.id || '',
    priority: priorities[0]?.id || '',
    dueDate: format(initialDate || new Date(), "yyyy-MM-dd'T'HH:mm"),
    startDate: '',
    endDate: '',
    important: false,
    checklist: [],
    attachments: [],
  });

  const [errors, setErrors] = useState({});
  const [newChecklistItem, setNewChecklistItem] = useState('');

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
        checklist: task.checklist || [],
        attachments: task.attachments || [],
      });
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        dueDate: format(initialDate, "yyyy-MM-dd'T'HH:mm"),
        endDate: format(addHours(initialDate, 1), "yyyy-MM-dd'T'HH:mm"),
      }));
    }
    setErrors({});
  }, [task, initialDate, lists, priorities]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            audioChunks.current.push(e.data);
          };
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            handleAddAttachment({
              type: 'voice',
              name: `Voice Note ${format(new Date(), 'PP pp')}`,
              url: audioUrl,
              blob: audioBlob,
            });
            audioChunks.current = [];
          };
          setMediaRecorder(recorder);
        })
        .catch(console.error);
    }
  }, []);

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

      if (name === 'dueDate' && !prev.endDate) {
        newData.endDate = format(addHours(new Date(value), 1), "yyyy-MM-dd'T'HH:mm");
      }

      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          {
            id: Date.now().toString(),
            text: newChecklistItem,
            completed: false,
            createdAt: new Date().toISOString(),
          }
        ]
      }));
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId
          ? { ...item, completed: !item.completed }
          : item
      )
    }));
  };

  const handleRemoveChecklistItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== itemId)
    }));
  };

  const handleAddAttachment = (attachment) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAddAttachment({
          type: 'image',
          name: file.name,
          url: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceRecord = () => {
    if (recording) {
      mediaRecorder.stop();
      setRecording(false);
    } else {
      audioChunks.current = [];
      mediaRecorder.start();
      setRecording(true);
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
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
          >
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              <form id="taskForm" onSubmit={handleSubmit} className="py-6 space-y-6">
                {/* Title and Important Flag */}
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
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}

                {/* Description */}
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

                {/* List and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <ListIcon className="w-5 h-5 mr-2 text-gray-400" />
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

                {/* Dates */}
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

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckBox className="w-5 h-5 mr-2 text-gray-400" />
                      <label className="text-sm font-medium text-gray-700">
                        Checklist
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formData.checklist.filter(item => item.completed).length}/{formData.checklist.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {formData.checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {item.completed ? (
                            <CheckBox className="text-green-500" />
                          ) : (
                            <CheckBoxOutlineBlank />
                          )}
                        </button>
                        <span className={item.completed ? 'line-through text-gray-400' : ''}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="ml-auto text-gray-400 hover:text-red-500"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="Add checklist item"
                        className="input flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddChecklistItem();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddChecklistItem}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Add />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Attachments
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <ImageIcon />
                      </label>
                      <button
                        type="button"
                        onClick={handleVoiceRecord}
                        className={`p-2 ${recording ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {recording ? <Stop /> : <Mic />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        {attachment.type === 'image' ? (
                          <ImageIcon className="text-gray-400" />
                        ) : (
                          <Mic className="text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">{attachment.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== index)
                            }));
                          }}
                          className="ml-auto text-gray-400 hover:text-red-500"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="taskForm"
                className="btn btn-primary"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskModal;
