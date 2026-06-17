import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Languages } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  return (
    <header className="glass-panel h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Greetings */}
      <div>
        <span className="text-sm font-semibold text-gray-400">
          Welcome back, <strong className="text-white">{user?.name || 'Tailor'}</strong>
        </span>
      </div>

      {/* Tools */}
      <div className="flex items-center space-x-6">
        
        {/* Languages Switcher shortcut */}
        <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5">
          <Languages className="w-4 h-4 text-purple-400" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-xs text-gray-300 border-none focus:outline-none cursor-pointer pr-1"
          >
            <option value="en" className="bg-gray-950 text-white">{t('english')}</option>
            <option value="hi" className="bg-gray-950 text-white">{t('hindi')}</option>
            <option value="te" className="bg-gray-950 text-white">{t('telugu')}</option>
          </select>
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
          <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{user?.name}</div>
            <div className="text-[10px] text-purple-400 font-semibold capitalize">{user?.role}</div>
          </div>
        </div>

      </div>

    </header>
  );
}
