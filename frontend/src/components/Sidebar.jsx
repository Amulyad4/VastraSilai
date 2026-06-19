import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Scissors, Users, FileText, IndianRupee, Calendar, BarChart3, Settings, LogOut, MessageSquare } from 'lucide-react';

export default function Sidebar({ activePage, onNavigate }) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

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
    <aside className="w-64 bg-gray-950/75 backdrop-blur-xl border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-30">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('tailor_dashboard')}>
        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/10 flex-shrink-0">
          <Scissors className="w-4.5 h-4.5" />
        </div>
        <span className="font-heading text-lg font-black tracking-tight text-white flex items-center brand-title">
          VastraSilai
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          let btnClass = "w-full flex items-center space-x-3 px-4 py-3 cursor-pointer transition-all duration-200";
          let iconClass = "w-4 h-4";
          
          if (theme === 'light') {
            if (isActive) {
              btnClass += " sidebar-active-link bg-purple-600 text-white rounded-full font-bold shadow-md shadow-purple-600/10";
              iconClass += " text-white";
            } else {
              btnClass += " text-slate-900 hover:bg-slate-100 hover:text-purple-600 rounded-xl font-bold";
              iconClass += " text-slate-900";
            }
          } else {
            if (isActive) {
              btnClass += " sidebar-active-link bg-purple-600/15 border-l-2 border-purple-500 text-purple-300 rounded-xl font-semibold";
              iconClass += " text-purple-400";
            } else {
              btnClass += " text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-semibold";
              iconClass += " text-gray-500";
            }
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={btnClass}
            >
              <Icon className={iconClass} />
              <span 
                className={isActive && theme === 'light' ? 'text-white' : ''}
              >
                {item.label}
              </span>
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
