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
} from '../store/slices/taskSlice';
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
  Edit,
} from '@mui/icons-material';
import { format, addHours } from 'date-fns';

function AttachmentNameModal({ type, defaultName, onConfirm, onCancel }) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-4 w-80">
        <h3 className="text-sm font-medium mb-3">
          Name your {type === 'image' ? 'image' : 'voice note'}
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-sm w-full mb-3"
          placeholder={`Enter ${type === 'image' ? 'image' : 'voice note'} name`}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(name)}
            className="btn-sm btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const defaultFormData = {
  title: '',
  description: '',
  list: '',
  priority: '',
  dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  startDate: '',
  endDate: '',
  important: false,
  checklist: [],
  attachments: [],
};

function TaskModal({ isOpen, onClose, task = null, initialDate = null, userId }) {
  const dispatch = useDispatch();
  const lists = useSelector(selectLists);
  const priorities = useSelector(selectPriorities);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);
  const [attachmentToName, setAttachmentToName] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [voiceCount, setVoiceCount] = useState(0);

  const [formData, setFormData] = useState({ ...defaultFormData });
  const [errors, setErrors] = useState({});
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Reset form and counters when modal opens
  useEffect(() => {
    if (isOpen) {
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
        const existingImages = task.attachments?.filter(a => a.type === 'image').length || 0;
        const existingVoices = task.attachments?.filter(a => a.type === 'voice').length || 0;
        setImageCount(existingImages);
        setVoiceCount(existingVoices);
      } else {
        setFormData({
          ...defaultFormData,
          list: lists[0]?.id || '',
          priority: priorities[0]?.id || '',
          dueDate: format(initialDate || new Date(), "yyyy-MM-dd'T'HH:mm"),
          endDate: format(addHours(initialDate || new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
        });
        setImageCount(0);
        setVoiceCount(0);
      }
      setErrors({});
      setNewChecklistItem('');
    }
  }, [isOpen, task, initialDate, lists, priorities]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            audioChunks.current.push(e.data);
          };
          recorder.onstop = handleVoiceStop;
          setMediaRecorder(recorder);
        })
        .catch(console.error);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!userId) {
      newErrors.auth = 'User must be logged in';
    }
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
      userId,
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
            userId
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
          ? { ...item, completed: !item.completed, userId }
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
      attachments: [...prev.attachments, { ...attachment, userId }]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const nextCount = imageCount + 1;
        setImageCount(nextCount);
        handleAddAttachment({
          type: 'image',
          name: `Image ${nextCount}`,
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

  const handleVoiceStop = () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const nextCount = voiceCount + 1;
    setVoiceCount(nextCount);
    handleAddAttachment({
      type: 'voice',
      name: `Voice Note ${nextCount}`,
      url: audioUrl,
      blob: audioBlob,
    });
    audioChunks.current = [];
  };

  const handleEditAttachmentName = (index, currentName) => {
    const attachment = formData.attachments[index];
    setAttachmentToName({
      type: attachment.type,
      index,
      defaultName: currentName,
      data: attachment.url,
      blob: attachment.blob,
    });
  };

  const handleConfirmAttachmentName = (name) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map((attachment, index) =>
        index === attachmentToName.index
          ? { ...attachment, name }
          : attachment
      ),
    }));
    setAttachmentToName(null);
  };

  const handleDeleteAttachment = (index) => {
    setFormData(prev => {
      const attachment = prev.attachments[index];
      if (attachment.type === 'image') {
        setImageCount(c => c - 1);
      } else {
        setVoiceCount(c => c - 1);
      }
      return {
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {errors.auth && (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.auth}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]"
            >
              {/* Fixed Header */}
              <div className="flex justify-between items-center p-3 border-b flex-shrink-0">
                <h2 className="text-sm font-semibold text-gray-800">
                  {task ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="icon-btn-sm text-gray-400 hover:text-gray-600"
                >
                  <Close className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-3">
                <form id="taskForm" onSubmit={handleSubmit} className="py-3 space-y-3">
                  {/* Title and Important Flag */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Task title"
                      className={`input-sm ${errors.title ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleChange({
                        target: { name: 'important', type: 'checkbox', checked: !formData.important }
                      })}
                      className="icon-btn-sm"
                    >
                      {formData.important ? (
                        <Star className="w-3.5 h-3.5 text-yellow-400" />
                      ) : (
                        <StarBorder className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.title && (
                    <p className="text-red-500 text-xs -mt-2">{errors.title}</p>
                  )}

                  {/* Description */}
                  <div>
                    <div className="flex items-center mb-1">
                      <Description className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <label className="text-xs font-medium text-gray-700">
                        Description (optional)
                      </label>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add details..."
                      rows="3"
                      className="input-sm resize-none"
                    />
                  </div>

                  {/* List and Priority */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center mb-1">
                        <ListIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <label className="text-xs font-medium text-gray-700">
                          List
                        </label>
                      </div>
                      <select
                        name="list"
                        value={formData.list}
                        onChange={handleChange}
                        className={`input-sm ${errors.list ? 'border-red-500' : ''}`}
                      >
                        {lists.map(list => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>
                      {errors.list && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.list}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <Flag className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <label className="text-xs font-medium text-gray-700">
                          Priority
                        </label>
                      </div>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className={`input-sm ${errors.priority ? 'border-red-500' : ''}`}
                      >
                        {priorities.map(priority => (
                          <option key={priority.id} value={priority.id}>
                            {priority.name}
                          </option>
                        ))}
                      </select>
                      {errors.priority && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.priority}</p>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <div className="flex items-center mb-1">
                      <Event className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <label className="text-xs font-medium text-gray-700">
                        Due Date & Time
                      </label>
                    </div>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`input-sm ${errors.dueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.dueDate}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center mb-1">
                        <AccessTime className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <label className="text-xs font-medium text-gray-700">
                          Start (optional)
                        </label>
                      </div>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <AccessTime className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <label className="text-xs font-medium text-gray-700">
                          End
                        </label>
                      </div>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={`input-sm ${errors.endDate ? 'border-red-500' : ''}`}
                      />
                      {errors.endDate && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <CheckBox className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <label className="text-xs font-medium text-gray-700">
                          Checklist
                        </label>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formData.checklist.filter(item => item.completed).length}/{formData.checklist.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {formData.checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleChecklistItem(item.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {item.completed ? (
                              <CheckBox className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <CheckBoxOutlineBlank className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className={`text-xs ${item.completed ? 'line-through text-gray-400' : ''}`}>
                            {item.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="ml-auto text-gray-400 hover:text-red-500"
                          >
                            <Delete className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          placeholder="Add checklist item"
                          className="input-sm flex-1"
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
                          className="icon-btn-sm bg-gray-100 hover:bg-gray-200"
                        >
                          <Add className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">
                        Attachments
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="icon-btn-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </label>
                        <button
                          type="button"
                          onClick={handleVoiceRecord}
                          className={`icon-btn-sm ${recording ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {recording ? <Stop className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                          {attachment.type === 'image' ? (
                            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-600 flex-1">{attachment.name}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditAttachmentName(index, attachment.name)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Delete className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="flex justify-end gap-2 p-3 border-t flex-shrink-0 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="taskForm"
                  className="btn-sm btn-primary"
                >
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>

          {attachmentToName && (
            <AttachmentNameModal
              type={attachmentToName.type}
              defaultName={attachmentToName.defaultName}
              onConfirm={handleConfirmAttachmentName}
              onCancel={() => setAttachmentToName(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

export default TaskModal;
