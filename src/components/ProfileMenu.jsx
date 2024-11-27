import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Person,
  Settings,
  Palette,
  Schedule,
  Notifications,
  Language,
  DarkMode,
  ExitToApp,
  Edit,
  AccountCircle,
  Lock,
  Security,
  CloudUpload,
  Close,
} from '@mui/icons-material';
import { updateUserSettings, updateUserProfile, updateUserAvatar } from '../store/slices/userSlice';

function ProfileMenu({ currentUser, onLogout, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateUserAvatar({ avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = (field, value) => {
    dispatch(updateUserProfile({
      profile: { [field]: value }
    }));
  };

  const handleSettingUpdate = (section, field, value) => {
    dispatch(updateUserSettings({
      settings: { [section]: { [field]: value } }
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Person },
    { id: 'account', label: 'Account', icon: AccountCircle },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Notifications },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={menuRef} className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <Close className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-48 border-r bg-gray-50">
            <div className="p-4 border-b text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2">
                  {currentUser?.settings?.profile?.avatarUrl ? (
                    <img
                      src={currentUser.settings.profile.avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Person className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="mt-2">
                <h3 className="font-medium">{currentUser?.settings?.profile?.displayName || currentUser?.name}</h3>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
            <nav className="p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg mb-1 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={currentUser?.settings?.profile?.displayName || ''}
                    onChange={(e) => handleProfileUpdate('displayName', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={currentUser?.settings?.profile?.bio || ''}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={currentUser?.settings?.profile?.organization || ''}
                    onChange={(e) => handleProfileUpdate('organization', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={currentUser?.settings?.profile?.position || ''}
                    onChange={(e) => handleProfileUpdate('position', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Theme</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSettingUpdate('theme', 'mode', 'light')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        currentUser?.settings?.theme === 'light'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleSettingUpdate('theme', 'mode', 'dark')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        currentUser?.settings?.theme === 'dark'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Accent Color</h3>
                  <input
                    type="color"
                    value={currentUser?.settings?.appearance?.accentColor || '#4299E1'}
                    onChange={(e) => handleSettingUpdate('appearance', 'accentColor', e.target.value)}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {Object.entries(currentUser?.settings?.notifications || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {key.split(/(?=[A-Z])/).join(' ')}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingUpdate('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={currentUser?.settings?.language || 'en'}
                    onChange={(e) => handleSettingUpdate('language', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    {currentUser?.supportedLanguages?.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select
                    value={currentUser?.settings?.profile?.timezone || 'UTC'}
                    onChange={(e) => handleProfileUpdate('timezone', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    {currentUser?.supportedTimezones?.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Account Actions</h3>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <ExitToApp className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileMenu;
