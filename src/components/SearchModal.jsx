import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectSearchResults, selectLists } from '../store/slices/taskSlice';
import { format, isPast } from 'date-fns';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  Schedule,
  Search,
  Close,
} from '@mui/icons-material';

function SearchModal({ isOpen, onClose, onSelectTask, userId }) {
  const [query, setQuery] = useState('');
  const searchResults = useSelector(state => selectSearchResults(state, query))
    .filter(task => task.userId === userId); // Filter results by user
  const lists = useSelector(selectLists);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when modal opens
      const input = document.getElementById('search-input');
      if (input) input.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="text-gray-400 w-4 h-4" />
          <input
            id="search-input"
            type="text"
            placeholder="Search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Close className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query && (
            <AnimatePresence>
              {searchResults.length > 0 ? (
                searchResults.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => {
                      onSelectTask(task);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <CheckCircle className="text-green-500 flex-shrink-0 w-4 h-4" />
                      ) : (
                        <RadioButtonUnchecked className="text-gray-400 flex-shrink-0 w-4 h-4" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium truncate ${
                            task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                          }`}>
                            {task.title}
                          </span>
                          {task.important && (
                            <Star className="text-yellow-400 flex-shrink-0 w-3.5 h-3.5" />
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: lists.find(list => list.id === task.list)?.color,
                              color: 'white'
                            }}
                          >
                            {lists.find(list => list.id === task.list)?.name}
                          </span>
                          <span className="flex items-center text-xs text-gray-500">
                            <Schedule className="w-3 h-3 mr-0.5" />
                            <span className={isPast(new Date(task.dueDate)) && !task.completed ? 'text-red-500' : ''}>
                              {format(new Date(task.dueDate), 'PP')}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No tasks found matching "{query}"
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SearchModal;
