import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  selectTasks,
  selectLists,
  toggleTaskComplete,
  moveTaskToTrash,
  toggleTaskImportant
} from '../store/slices/taskSlice';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Delete,
  Edit,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';

const quadrants = [
  { id: 'urgent-important', title: 'Urgent & Important', color: 'bg-red-100' },
  { id: 'not-urgent-important', title: 'Not Urgent but Important', color: 'bg-blue-100' },
  { id: 'urgent-not-important', title: 'Urgent but Not Important', color: 'bg-yellow-100' },
  { id: 'not-urgent-not-important', title: 'Not Urgent & Not Important', color: 'bg-green-100' },
];

function Matrix({ onEditTask }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const lists = useSelector(selectLists);

  const categorizedTasks = useMemo(() => {
    const result = {
      'urgent-important': [],
      'not-urgent-important': [],
      'urgent-not-important': [],
      'not-urgent-not-important': [],
    };

    tasks
      .filter(task => !task.deleted)
      .forEach(task => {
        const isUrgent = isBefore(parseISO(task.dueDate), new Date(Date.now() + 24 * 60 * 60 * 1000));
        const isImportant = task.important;

        if (isUrgent && isImportant) {
          result['urgent-important'].push(task);
        } else if (!isUrgent && isImportant) {
          result['not-urgent-important'].push(task);
        } else if (isUrgent && !isImportant) {
          result['urgent-not-important'].push(task);
        } else {
          result['not-urgent-not-important'].push(task);
        }
      });

    return result;
  }, [tasks]);

  const handleToggleComplete = (taskId) => {
    dispatch(toggleTaskComplete(taskId));
  };

  const handleToggleImportant = (taskId) => {
    dispatch(toggleTaskImportant(taskId));
  };

  const handleDeleteTask = (taskId) => {
    dispatch(moveTaskToTrash(taskId));
  };

  const TaskCard = ({ task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-lg shadow-sm p-4 mb-2 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleToggleComplete(task.id)}
          className="flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle className="text-green-500" />
          ) : (
            <RadioButtonUnchecked className="text-gray-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium truncate ${
              task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            <button
              onClick={() => handleToggleImportant(task.id)}
              className="flex-shrink-0 text-gray-400 hover:text-yellow-400"
            >
              {task.important ? (
                <Star className="text-yellow-400" />
              ) : (
                <StarBorder />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: lists.find(list => list.id === task.list)?.color,
                color: 'white'
              }}
            >
              {lists.find(list => list.id === task.list)?.name}
            </span>
            <span className={`text-xs ${
              isBefore(parseISO(task.dueDate), new Date()) && !task.completed
                ? 'text-red-500'
                : 'text-gray-500'
            }`}>
              Due {format(parseISO(task.dueDate), 'PP')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditTask(task)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Eisenhower Matrix
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        {quadrants.map(quadrant => (
          <div
            key={quadrant.id}
            className={`${quadrant.color} rounded-xl p-4 flex flex-col`}
          >
            <h3 className="font-semibold text-gray-800 mb-4">
              {quadrant.title}
            </h3>
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {categorizedTasks[quadrant.id].map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Matrix;
