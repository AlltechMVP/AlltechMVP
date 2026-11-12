
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { isDev } from '../../config/dev';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }
];

export default function UserSettings() {
  const [settings, setSettings] = useState({
    displayName: '',
    email: '',
    notifications: true,
    theme: 'light',
    language: 'en'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!isDev) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setSettings(prev => ({
          prev,
          user.user_metadata,
          email: user.email
        }));
        return;
      }
    }
    
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      setSettings(prev => ({
        prev,
        JSON.parse(stored)
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveSettings = async () => {
    if (!isDev) {
      const { error } = await supabase.auth.updateUser({
        data: settings
      });
      if (error) console.error('Error saving settings:', error);
    }
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ prev, theme: newTheme }));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">User Settings</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium dark:text-gray-300">
            Display Name
          </label>
          <input
            type="text"
            name="displayName"
            value={settings.displayName}
            onChange={handleChange}
            onBlur={saveSettings}
            className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={settings.email}
            disabled
            className="w-full border rounded-md p-2 bg-gray-100 dark:bg-gray-700"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            onBlur={saveSettings}
            className="rounded text-blue-600"
          />
          <label className="text-sm font-medium dark:text-gray-300">
            Enable Notifications
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium dark:text-gray-300">
            Language
          </label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            onBlur={saveSettings}
            className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full mt-4 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
        >
          {settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </div>
  );
}
