import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ViewList,
  CalendarMonth,
  Add,
  Menu,
  ChevronLeft,
  BarChart,
  Settings,
  Person,
  Palette,
  Schedule,
  Notifications,
  Language,
  DarkMode,
  Search,
} from '@mui/icons-material';
import SearchModal from './SearchModal';

const mainViews = [
  { id: 'tasks', label: 'Tasks', icon: ViewList },
  { id: 'calendar', label: 'Calendar', icon: CalendarMonth },
];

function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'datetime', label: 'Date & Time', icon: Schedule },
    { id: 'notifications', label: 'Notifications', icon: Notifications },
    { id: 'language', label: 'Language', icon: Language },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <div className="flex h-[600px]">
          <div className="w-48 border-r">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center px-4 py-2 rounded-lg border hover:bg-gray-50">
                      <DarkMode className="w-5 h-5 mr-2" />
                      Dark Mode
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen, onNewTask, onEditTask }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const renderNavItem = (item, isActive = false) => (
    <motion.li
      key={item.id}
      whileHover={{ x: isSidebarOpen ? 4 : 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={() => setCurrentView(item.id)}
        className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'px-3'} py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title={!isSidebarOpen ? item.label : undefined}
      >
        <item.icon className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
        {isSidebarOpen && <span className="font-medium">{item.label}</span>}
      </button>
    </motion.li>
  );

  return (
    <div className={`h-full flex flex-col bg-white transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-[60px]'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        {isSidebarOpen ? (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-semibold text-gray-800"
          >
            Task Planner
          </motion.h1>
        ) : (
          <span className="w-6" />
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft /> : <Menu />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {mainViews.map(item => renderNavItem(item, currentView === item.id))}
        </ul>

        <div className="mt-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className={`w-full flex items-center ${
              isSidebarOpen ? 'px-4' : 'px-3'
            } py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors`}
            title={!isSidebarOpen ? 'Search' : undefined}
          >
            <Search className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
            {isSidebarOpen && <span>Search</span>}
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setCurrentView('analytics')}
            className={`w-full flex items-center ${
              isSidebarOpen ? 'px-4' : 'px-3'
            } py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
              currentView === 'analytics' ? 'bg-primary text-white' : ''
            }`}
            title={!isSidebarOpen ? 'Analytics' : undefined}
          >
            <BarChart className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
            {isSidebarOpen && <span>Analytics</span>}
          </button>
        </div>
      </nav>

      <div className="p-4 border-t space-y-2">
        <button
          onClick={() => setShowSettings(true)}
          className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'px-3'} py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors`}
          title={!isSidebarOpen ? 'Settings' : undefined}
        >
          <Settings className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
          {isSidebarOpen && <span>Settings</span>}
        </button>
        <button
          onClick={() => {/* TODO: Implement profile */}}
          className={`w-full flex items-center ${isSidebarOpen ? 'px-4' : 'px-3'} py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors`}
          title={!isSidebarOpen ? 'Profile' : undefined}
        >
          <Person className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
          {isSidebarOpen && <span>Profile</span>}
        </button>
        <motion.button
          whileHover={{ scale: isSidebarOpen ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewTask}
          className={`w-full flex items-center justify-center ${isSidebarOpen ? 'px-4' : 'px-3'} py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors`}
          title={!isSidebarOpen ? 'New Task' : undefined}
        >
          <Add className={`w-5 h-5 ${isSidebarOpen ? 'mr-2' : ''}`} />
          {isSidebarOpen && <span>New Task</span>}
        </motion.button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectTask={onEditTask}
      />
    </div>
  );
}

export default Sidebar;
