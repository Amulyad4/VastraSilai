import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { User, Languages, Sun, Moon, Bell, Search } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Dynamic user initials
  const nameParts = (user?.name || '').trim().split(/\s+/);
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : nameParts[0][0]?.toUpperCase() || 'T';

  return (
    <header className="glass-panel h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Greetings */}
      <div>
        <span className="text-lg font-semibold text-gray-400">
          Welcome back, <strong className="text-white">{user?.name || 'Tailor'}</strong>
        </span>
      </div>

      {/* Tools */}
      <div className="flex items-center space-x-4">
        
        {/* Languages Switcher shortcut */}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
          <Languages className="w-4.5 h-4.5 text-purple-400" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-sm text-gray-300 dark:text-gray-300 border-none focus:outline-none cursor-pointer pr-1 font-semibold"
          >
            <option value="en" className="bg-white dark:bg-gray-950 text-gray-800 dark:text-white">{t('english')}</option>
            <option value="hi" className="bg-white dark:bg-gray-950 text-gray-800 dark:text-white">{t('hindi')}</option>
            <option value="te" className="bg-white dark:bg-gray-950 text-gray-800 dark:text-white">{t('telugu')}</option>
          </select>
        </div>


        {/* Profile */}
        <div className="flex items-center space-x-3 border-l border-white/10 pl-4">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/10">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{user?.name || 'Tailor'}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold capitalize leading-none mt-0.5">
              {user?.shop_name || user?.role || 'VastraSilai Tailor'}
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
