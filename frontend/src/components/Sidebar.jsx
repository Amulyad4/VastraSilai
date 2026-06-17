import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Users, FileText, IndianRupee, Calendar, BarChart3, Settings, LogOut, MessageSquare } from 'lucide-react';

export default function Sidebar({ activePage, onNavigate }) {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { id: 'tailor_dashboard', label: t('dashboard'), icon: Scissors },
    { id: 'tailor_customers', label: t('customers'), icon: Users },
    { id: 'tailor_orders', label: t('orders'), icon: FileText },
    { id: 'tailor_payments', label: t('payments'), icon: IndianRupee },
    { id: 'tailor_deliveries', label: t('schedule'), icon: Calendar },
    { id: 'tailor_analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'tailor_settings', label: t('settings'), icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <aside className="w-64 bg-gray-950 border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-30">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('tailor_dashboard')}>
        <div className="p-1.5 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400">
          <Scissors className="w-5 h-5" />
        </div>
        <span className="font-heading text-lg font-bold tracking-tight text-white">
          {t('appName')}
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-purple-600/15 border-l-2 border-purple-500 text-purple-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>{t('logout')}</span>
        </button>
      </div>

    </aside>
  );
}
