import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectLists, toggleTaskComplete, toggleTaskImportant, toggleChecklistItem } from '../store/taskSlice';
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

function TaskDetails({ task, onClose, onEdit }) {
  const dispatch = useDispatch();
  const lists = useSelector(selectLists);
  const [isPlaying, setIsPlaying] = useState({});
  const audioRefs = useRef({});

  const handleToggleComplete = () => {
    dispatch(toggleTaskComplete(task.id));
  };

  const handleToggleImportant = () => {
    dispatch(toggleTaskImportant(task.id));
  };

  const handleToggleChecklistItem = (itemId) => {
    dispatch(toggleChecklistItem({ taskId: task.id, itemId }));
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
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-screen w-[500px] bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <Edit />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <Close />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleComplete}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              {task.completed ? (
                <CheckCircle className="text-green-500 w-6 h-6" />
              ) : (
                <RadioButtonUnchecked className="text-gray-400 w-6 h-6" />
              )}
            </button>
            <h3 className={`text-xl font-medium ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
          </div>
          <button
            onClick={handleToggleImportant}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {task.important ? (
              <Star className="text-yellow-400" />
            ) : (
              <StarBorder className="text-gray-400" />
            )}
          </button>
        </div>

        {/* Metadata */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Schedule className="w-5 h-5" />
            <span className={isPast(new Date(task.dueDate)) && !task.completed ? 'text-red-500' : ''}>
              Due {format(new Date(task.dueDate), 'PPp')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <ListIcon className="w-5 h-5" />
            <span
              className="px-2 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: lists.find(list => list.id === task.list)?.color,
                color: 'white'
              }}
            >
              {lists.find(list => list.id === task.list)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Flag className="w-5 h-5" />
            <span className={`px-2 py-1 rounded-full text-sm font-medium bg-task-${task.priority} text-white`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Description with Embedded Media */}
        {(task.description || task.attachments?.length > 0) && (
          <div className="mb-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Description & Attachments</h4>
            <div className="prose prose-sm max-w-none">
              {task.description && (
                <p className="text-gray-600 whitespace-pre-wrap mb-4">{task.description}</p>
              )}
              {task.attachments?.map((attachment, index) => (
                <div key={index} className="mb-4">
                  {attachment.type === 'image' ? (
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-auto"
                      />
                    </div>
                  ) : attachment.type === 'voice' && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => handlePlayVoiceNote(attachment.id)}
                        className="p-2 rounded-full hover:bg-gray-200"
                      >
                        {isPlaying[attachment.id] ? (
                          <Pause className="text-primary" />
                        ) : (
                          <PlayArrow className="text-primary" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Checklist</h4>
              <span className="text-sm text-gray-500">
                {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
              </span>
            </div>
            <div className="space-y-2">
              {task.checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <button
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {item.completed ? (
                      <CheckBox className="text-green-500" />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </button>
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
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
