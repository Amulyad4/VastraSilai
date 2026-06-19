import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Users, IndianRupee, Clock, CheckCircle, Calendar } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function Dashboard({ onNavigate }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    daily_earnings: 0,
    monthly_revenue: 0,
    pending_collection: 0,
    completed_orders: 0
  });
  const [customerCount, setCustomerCount] = useState(0);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('just_registered') === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('just_registered');
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch revenue analytics
        const revRes = await axios.get(`${API_URL}/analytics/revenue`);
        setStats(revRes.data);

        // Fetch customers count
        const custRes = await axios.get(`${API_URL}/customers`);
        setCustomerCount(custRes.data.length);

        // Fetch deliveries schedule
        const delRes = await axios.get(`${API_URL}/deliveries/schedule`);
        setTodayDeliveries(delRes.data.today);
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {showWelcome && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎉</span>
            <span className="font-semibold">Successfully registered! Welcome to your VastraSilai AI tailor workspace.</span>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-emerald-400 hover:text-emerald-300 font-bold ml-4">✕</button>
        </div>
      )}
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('dashboard')}</h2>
          <p className="text-purple-600/70 dark:text-purple-400 font-medium text-sm mt-1">{t('tagline')}</p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 dashboard-stats-grid">
        
        {/* Card 1: Customers */}
        <div className="glass-card p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px] cursor-pointer" onClick={() => onNavigate('tailor_customers')}>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('cardCustomers')}</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-heading mt-2">{customerCount}</h3>
            <p className="text-[10px] text-blue-400 font-semibold mt-1">Manage digital records</p>
          </div>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="glass-card p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px] cursor-pointer" onClick={() => onNavigate('tailor_orders')}>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('completedOrders')}</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-heading mt-2">{stats.completed_orders}</h3>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">Ready or Delivered</p>
          </div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="glass-card p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px] cursor-pointer" onClick={() => onNavigate('tailor_analytics')}>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('monthlyRevenue')}</span>
            <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-heading mt-2">₹{stats.monthly_revenue.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-pink-400 font-semibold mt-1">Collected this month</p>
          </div>
        </div>

        {/* Card 4: Pending Collections */}
        <div className="glass-card p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px] cursor-pointer" onClick={() => onNavigate('tailor_payments')}>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('pendingCollection')}</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-heading mt-2">₹{stats.pending_collection.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-amber-400 font-semibold mt-1">Outstanding customer balance</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Deliveries */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 text-left">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white font-heading">{t('todayDeliveries')}</h3>
            </div>
            <button
              onClick={() => onNavigate('tailor_deliveries')}
              className="text-sm bg-purple-600/10 hover:bg-purple-600/25 text-purple-600 dark:text-purple-400 font-black px-4 py-2 rounded-xl transition-all duration-250 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              View Full Schedule
            </button>
          </div>

          {todayDeliveries.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p>{t('noDeliveriesToday')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">{t('name')}</th>
                    <th className="pb-3">{t('clothType')}</th>
                    <th className="pb-3">{t('totalAmount')}</th>
                    <th className="pb-3">{t('balanceAmount')}</th>
                    <th className="pb-3">{t('paymentStatus')}</th>
                    <th className="pb-3">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {todayDeliveries.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-semibold text-white">{order.customer?.name || 'Customer'}</td>
                      <td className="py-4 capitalize">{t(order.cloth_type)}</td>
                      <td className="py-4">₹{order.total_amount}</td>
                      <td className="py-4 text-amber-400 font-semibold">₹{order.balance_amount}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.payment_status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {order.payment_status === 'Paid' ? t('paymentPaid') :
                           order.payment_status === 'Partially Paid' ? t('paymentPartiallyPaid') :
                           t('paymentPending')}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-blue-500/10 text-blue-400' :
                          order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {order.status === 'Delivered' ? t('statusDelivered') :
                           order.status === 'Completed' ? t('statusCompleted') :
                           t('statusPending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
