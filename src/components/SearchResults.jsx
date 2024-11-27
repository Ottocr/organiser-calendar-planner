import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectSearchResults, selectLists } from '../store/taskSlice';
import { format, isPast } from 'date-fns';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  Schedule,
} from '@mui/icons-material';

function SearchResults({ query, onSelectTask, onClose }) {
  const searchResults = useSelector(state => selectSearchResults(state, query));
  const lists = useSelector(selectLists);

  if (!query) return null;

  return (
    <AnimatePresence>
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-[400px] overflow-y-auto"
        >
          {searchResults.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => {
                onSelectTask(task);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <RadioButtonUnchecked className="text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${
                      task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </span>
                    {task.important && (
                      <Star className="text-yellow-400 flex-shrink-0 w-4 h-4" />
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 truncate">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: lists.find(list => list.id === task.list)?.color,
                        color: 'white'
                      }}
                    >
                      {lists.find(list => list.id === task.list)?.name}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <Schedule className="w-3 h-3 mr-1" />
                      <span className={isPast(new Date(task.dueDate)) && !task.completed ? 'text-red-500' : ''}>
                        {format(new Date(task.dueDate), 'PP')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchResults;
