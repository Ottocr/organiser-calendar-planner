import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectLists, toggleTaskComplete, toggleTaskImportant, toggleChecklistItem, selectTaskById } from '../store//slices/taskSlice';
import { format, isPast } from 'date-fns';
import {
  Close,
  Edit,
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  StarBorder,
  Schedule,
  List as ListIcon,
  Flag,
  Image as ImageIcon,
  Mic,
  CheckBox,
  CheckBoxOutlineBlank,
  PlayArrow,
  Pause,
} from '@mui/icons-material';
import { useState, useRef } from 'react';

function TaskDetails({ task: initialTask, onClose, onEdit, userId }) {
  const dispatch = useDispatch();
  const lists = useSelector(selectLists);
  // Get the latest task state from Redux
  const task = useSelector(state => selectTaskById(state, initialTask.id));
  const [isPlaying, setIsPlaying] = useState({});
  const audioRefs = useRef({});

  // If task doesn't exist or doesn't belong to current user, don't render
  if (!task || task.userId !== userId) return null;

  const handleToggleComplete = () => {
    dispatch(toggleTaskComplete({ taskId: task.id, userId }));
  };

  const handleToggleImportant = () => {
    dispatch(toggleTaskImportant({ taskId: task.id, userId }));
  };

  const handleToggleChecklistItem = (itemId) => {
    dispatch(toggleChecklistItem({ taskId: task.id, itemId, userId }));
  };

  const handlePlayVoiceNote = (attachmentId) => {
    const audioElement = audioRefs.current[attachmentId];
    if (audioElement) {
      if (isPlaying[attachmentId]) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(prev => ({
        ...prev,
        [attachmentId]: !prev[attachmentId]
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleToggleComplete}
            className="icon-btn-sm"
          >
            {task.completed ? (
              <CheckCircle className="text-green-500 w-3.5 h-3.5" />
            ) : (
              <RadioButtonUnchecked className="text-gray-400 w-3.5 h-3.5" />
            )}
          </button>
          <h3 className={`text-sm font-medium ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}>
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleToggleImportant}
            className="icon-btn-sm"
          >
            {task.important ? (
              <Star className="text-yellow-400 w-3.5 h-3.5" />
            ) : (
              <StarBorder className="text-gray-400 w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="icon-btn-sm text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="icon-btn-sm text-gray-400 hover:text-gray-600"
          >
            <Close className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-36px)] p-2">
        {/* Metadata */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Schedule className="w-3.5 h-3.5" />
            <span className={isPast(new Date(task.dueDate)) && !task.completed ? 'text-red-500' : ''}>
              Due {format(new Date(task.dueDate), 'PPp')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-600">
            <ListIcon className="w-3.5 h-3.5" />
            <span
              className="badge"
              style={{
                backgroundColor: lists.find(list => list.id === task.list)?.color,
                color: 'white'
              }}
            >
              {lists.find(list => list.id === task.list)?.name}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-600">
            <Flag className="w-3.5 h-3.5" />
            <span className={`badge bg-task-${task.priority}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Description with Embedded Media */}
        {(task.description || task.attachments?.length > 0) && (
          <div className="mb-2 space-y-1.5">
            <h4 className="text-xs font-medium text-gray-700">Description & Attachments</h4>
            <div className="prose prose-sm max-w-none">
              {task.description && (
                <p className="text-xs text-gray-600 whitespace-pre-wrap mb-1.5">{task.description}</p>
              )}
              {task.attachments?.map((attachment, index) => (
                <div key={index} className="mb-1.5">
                  {attachment.type === 'image' ? (
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-auto"
                      />
                    </div>
                  ) : attachment.type === 'voice' && (
                    <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => handlePlayVoiceNote(attachment.id)}
                        className="icon-btn-sm"
                      >
                        {isPlaying[attachment.id] ? (
                          <Pause className="text-primary w-3.5 h-3.5" />
                        ) : (
                          <PlayArrow className="text-primary w-3.5 h-3.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-700">
                          {attachment.name}
                        </div>
                        <audio
                          ref={el => audioRefs.current[attachment.id] = el}
                          src={attachment.url}
                          onEnded={() => setIsPlaying(prev => ({ ...prev, [attachment.id]: false }))}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        {task.checklist?.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-gray-700">Checklist</h4>
              <span className="text-xs text-gray-500">
                {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
              </span>
            </div>
            <div className="space-y-0.5">
              {task.checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <button
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {item.completed ? (
                      <CheckBox className="text-green-500 w-3.5 h-3.5" />
                    ) : (
                      <CheckBoxOutlineBlank className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className={`text-xs ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default TaskDetails;
