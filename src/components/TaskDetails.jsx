import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectLists, toggleTaskComplete, toggleTaskImportant } from '../store/taskSlice';
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
  Delete,
} from '@mui/icons-material';

function TaskDetails({ task, onClose, onEdit }) {
  const dispatch = useDispatch();
  const lists = useSelector(selectLists);

  const handleToggleComplete = () => {
    dispatch(toggleTaskComplete(task.id));
  };

  const handleToggleImportant = () => {
    dispatch(toggleTaskImportant(task.id));
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-50"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Close />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={handleToggleComplete}>
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

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Checklist */}
          {task.checklist && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Checklist</h4>
              <div className="space-y-2">
                {task.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckBox className={item.completed ? 'text-green-500' : 'text-gray-400'} />
                    <span className={item.completed ? 'line-through text-gray-400' : ''}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
              <div className="space-y-2">
                {task.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {attachment.type === 'image' ? (
                      <ImageIcon className="text-gray-400" />
                    ) : (
                      <Mic className="text-gray-400" />
                    )}
                    <span className="text-gray-600">{attachment.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t space-x-3 flex justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Task
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default TaskDetails;
