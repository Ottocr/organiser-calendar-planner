import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ViewList,
  CalendarMonth,
  Add,
  Menu,
  ChevronLeft,
  BarChart,
  Person,
  Search,
} from '@mui/icons-material';
import SearchModal from './SearchModal';
import ProfileMenu from './ProfileMenu';

const mainViews = [
  { id: 'tasks', label: 'Tasks', icon: ViewList },
  { id: 'calendar', label: 'Calendar', icon: CalendarMonth },
];

function Sidebar({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  onNewTask, 
  onEditTask,
  currentUser,
  onLogout
}) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const renderNavItem = (item, isActive = false) => (
    <motion.li
      key={item.id}
      whileHover={{ x: isSidebarOpen ? 4 : 0 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <button
        onClick={() => setCurrentView(item.id)}
        className={`w-full flex items-center ${isSidebarOpen ? 'px-3' : 'justify-center px-2'} py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title={!isSidebarOpen ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 min-w-[20px]" />
        {isSidebarOpen && <span className="ml-2.5 text-sm">{item.label}</span>}
      </button>
    </motion.li>
  );

  const renderActionButton = (icon, label, onClick, isActive = false) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${
        isSidebarOpen ? 'px-3' : 'justify-center px-2'
      } py-2 rounded-lg transition-colors ${
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
      title={!isSidebarOpen ? label : undefined}
    >
      {icon}
      {isSidebarOpen && <span className="ml-2.5 text-sm">{label}</span>}
    </button>
  );

  return (
    <div className={`h-full flex flex-col bg-white transition-all duration-300 ${isSidebarOpen ? 'w-[150px]' : 'w-[44px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        {isSidebarOpen ? (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base font-semibold text-gray-800"
          >
            Task Planner
          </motion.h1>
        ) : (
          <span className="w-4" />
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* New Task Button with borders */}
      <div className="px-2 py-2 border-y">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewTask}
          className={`w-full flex items-center ${isSidebarOpen ? 'px-3 justify-start' : 'justify-center px-2'} py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors`}
          title={!isSidebarOpen ? 'New Task' : undefined}
        >
          <Add className="w-5 h-5 min-w-[20px]" />
          {isSidebarOpen && <span className="ml-2.5 text-sm">New Task</span>}
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <ul className="space-y-0.5 w-full">
          {mainViews.map(item => renderNavItem(item, currentView === item.id))}
        </ul>

        <div className="mt-1.5">
          {renderActionButton(
            <Search className="w-5 h-5 min-w-[20px]" />,
            'Search',
            () => setShowSearchModal(true)
          )}
        </div>

        <div className="mt-1.5">
          {renderActionButton(
            <BarChart className="w-5 h-5 min-w-[20px]" />,
            'Analytics',
            () => setCurrentView('analytics'),
            currentView === 'analytics'
          )}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="px-2 py-2 border-t">
        {renderActionButton(
          <div className="relative">
            {currentUser?.settings?.profile?.avatarUrl ? (
              <img
                src={currentUser.settings.profile.avatarUrl}
                alt="Profile"
                className="w-5 h-5 rounded-full min-w-[20px]"
              />
            ) : (
              <Person className="w-5 h-5 min-w-[20px]" />
            )}
          </div>,
          currentUser?.settings?.profile?.displayName || currentUser?.name || 'Profile',
          () => setShowProfileMenu(true)
        )}
      </div>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectTask={onEditTask}
      />

      <ProfileMenu
        currentUser={currentUser}
        onLogout={onLogout}
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
      />
    </div>
  );
}

export default Sidebar;
