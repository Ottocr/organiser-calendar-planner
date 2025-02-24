import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import Analytics from './components/Analytics';
import TaskModal from './components/TaskModal';
import { setActiveFilters, selectActiveFilters } from './store/taskSlice';
import './styles/index.css';

const views = {
  tasks: TaskList,
  calendar: Calendar,
  analytics: Analytics,
};

function App() {
  const dispatch = useDispatch();
  const activeFilters = useSelector(selectActiveFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Clear search when changing views
  useEffect(() => {
    dispatch(setActiveFilters({ search: '' }));
  }, [activeFilters.view, dispatch]);

  const handleViewChange = (view) => {
    dispatch(setActiveFilters({ view }));
  };

  const handleOpenTaskModal = (task = null) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  };

  // Get the current view component
  const CurrentViewComponent = views[activeFilters.view] || TaskList;

  return (
    <div className="flex h-screen bg-background">
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? '280px' : '60px',
          opacity: 1,
        }}
        className="h-screen bg-white shadow-lg overflow-hidden"
      >
        <Sidebar
          currentView={activeFilters.view}
          setCurrentView={handleViewChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onNewTask={() => handleOpenTaskModal()}
          onEditTask={handleOpenTaskModal}
        />
      </motion.div>

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilters.view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full p-6"
          >
            <CurrentViewComponent
              onEditTask={handleOpenTaskModal}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={selectedTask}
      />
    </div>
  );
}

export default App;
