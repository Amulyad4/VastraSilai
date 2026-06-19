import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, ListCollapse } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function DeliveriesPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'calendar'
  const [schedule, setSchedule] = useState({
    overdue: [],
    today: [],
    upcoming: [],
    calendar: []
  });
  const [loading, setLoading] = useState(true);

  // Calendar navigation states
  const [currentDate, setCurrentDate] = useState(new Date()); // Defaulting to today's date

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/deliveries/schedule`);
      setSchedule(res.data);
    } catch (err) {
      console.error("Error fetching deliveries schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Render Calendar Days logic
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const calendarDays = [];
    
    // Fill in empty slots for previous month offset
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="min-h-[90px] border border-white/5 bg-gray-900/10 p-1 opacity-20"></div>);
    }
    
    // Fill in days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayEvents = schedule.calendar.filter(event => event.start === dateString);
      const today = new Date();
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate(); // Highlight today's date

      calendarDays.push(
        <div
          key={`day-${day}`}
          className={`calendar-day-cell p-1.5 flex flex-col justify-between rounded-xl ${
            isToday ? 'calendar-day-cell-today' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
              isToday ? 'bg-purple-600 text-white font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 rounded-full">
                {dayEvents.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1 mt-1 flex-grow overflow-y-auto max-h-[60px] custom-scrollbar">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                  event.status === 'Delivered' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/10' :
                  event.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/10' :
                  'bg-amber-500/15 text-amber-300 border border-amber-500/10'
                }`}
                title={`${event.title} (${event.status})`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-black text-gray-800 dark:text-white tracking-tight">{t('schedule')}</h2>
          <p className="text-gray-550 dark:text-gray-400 text-sm">Organize delivery dates and track deadlines</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-1.5 py-2 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListCollapse className="w-4 h-4" />
            <span>Schedule Lists</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-1.5 py-2 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Segregated Lists */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* A. OVERDUE ORDERS */}
          <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
              <h3 className="text-lg font-black text-gray-800 dark:text-white font-heading">{t('overdueDeliveries')}</h3>
              <span className="ml-auto text-xs bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full">
                {schedule.overdue.length}
              </span>
            </div>

            {schedule.overdue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-550/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">All Caught Up!</p>
                <p className="text-[11px] text-gray-450 dark:text-gray-500">No overdue deliveries. Great job!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {schedule.overdue.map(o => (
                  <div key={o.id} className="delivery-card delivery-card-overdue space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-gray-905 dark:text-white">{o.customer?.name}</span>
                      <span className="text-[10px] bg-red-500/15 text-red-500 dark:text-red-400 px-2.5 py-0.5 rounded-full font-bold">Overdue</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300 font-bold capitalize">{t(o.cloth_type)}</span>
                      <span className="text-red-500 dark:text-red-400 font-extrabold">{o.delivery_date}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/5 text-gray-500 dark:text-gray-400 font-medium">
                      <span>Balance due: ₹{o.balance_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. TODAY'S DELIVERIES */}
          <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-black text-gray-800 dark:text-white font-heading">{t('todayDeliveries')}</h3>
              <span className="ml-auto text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full">
                {schedule.today.length}
              </span>
            </div>

            {schedule.today.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Quiet Day</p>
                <p className="text-[11px] text-gray-450 dark:text-gray-500">No deliveries due today.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {schedule.today.map(o => (
                  <div key={o.id} className="delivery-card delivery-card-today space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-gray-905 dark:text-white">{o.customer?.name}</span>
                      <span className="text-[10px] bg-purple-500/15 text-purple-650 dark:text-purple-400 px-2.5 py-0.5 rounded-full font-bold">Due Today</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300 font-bold capitalize">{t(o.cloth_type)}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-extrabold">{o.delivery_date}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/5 text-gray-500 dark:text-gray-400 font-medium">
                      <span>Balance due: ₹{o.balance_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* C. UPCOMING DELIVERIES */}
          <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <CalendarIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="text-lg font-black text-gray-800 dark:text-white font-heading">{t('upcomingDeliveries')}</h3>
              <span className="ml-auto text-xs bg-blue-500/10 text-blue-500 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
                {schedule.upcoming.length}
              </span>
            </div>

            {schedule.upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No Bookings</p>
                <p className="text-[11px] text-gray-455 dark:text-gray-500">No upcoming deliveries booked.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {schedule.upcoming.map(o => (
                  <div key={o.id} className="delivery-card delivery-card-upcoming space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-gray-950 dark:text-white">{o.customer?.name}</span>
                      <span className="text-[10px] bg-blue-500/15 text-blue-500 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold">Upcoming</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300 font-bold capitalize">{t(o.cloth_type)}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold">{o.delivery_date}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/5 text-gray-500 dark:text-gray-400 font-medium">
                      <span>Balance due: ₹{o.balance_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Monthly Grid Calendar */}
      {activeTab === 'calendar' && (
        <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-6">
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-800 dark:text-white font-heading">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="flex space-x-2 bg-purple-600/5 dark:bg-white/5 border border-purple-500/10 dark:border-white/10 rounded-xl p-1">
              <button
                onClick={handlePrevMonth}
                className="hover:bg-purple-600/10 dark:hover:bg-white/10 text-gray-700 dark:text-white p-1.5 rounded-lg transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="hover:bg-purple-600/10 dark:hover:bg-white/10 text-gray-700 dark:text-white p-1.5 rounded-lg transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid header (Days names) */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-700 dark:text-gray-400 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-x-6 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-purple-500/10 dark:border-white/5">
            <span className="font-black text-gray-850 dark:text-white">Legend:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="font-bold text-gray-700 dark:text-gray-300">Stitching in Progress</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="font-bold text-gray-700 dark:text-gray-300">Ready for Collection</span>
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
