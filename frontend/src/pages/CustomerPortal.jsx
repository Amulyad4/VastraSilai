import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, CreditCard, Bell, Ruler, Clock, CheckCircle, Truck, RefreshCw, Scissors } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function CustomerPortal() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState({ orders: [], pending_balance: 0, notifications: [] });
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('just_registered') === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('just_registered');
    }
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/customer/dashboard`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading customer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  // Get first measurement chart available from orders list to show the customer
  const firstCustomerRecord = data.orders.length > 0 ? data.orders[0].customer : null;
  const measurements = firstCustomerRecord?.measurements;

  // Helper to compute progress bar width percentage
  const getProgressPercent = (status) => {
    if (status === 'Pending') return '0%';
    if (status === 'In Progress') return '33.33%';
    if (status === 'Ready') return '66.66%';
    if (status === 'Delivered') return '100%';
    return '0%';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      {showWelcome && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎉</span>
            <span className="font-semibold">Successfully registered! Welcome to your VastraSilai AI customer portal.</span>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-emerald-400 hover:text-emerald-300 font-bold ml-4">✕</button>
        </div>
      )}
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-xl">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-white leading-tight">
              {t('welcomeCustomer', { name: user?.name })}
            </h1>
            <p className="text-xs text-gray-500 font-semibold">{t('customerDashboard')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer"
          >
            {t('logout')}
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">{t('cardOrders')}</span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">{data.orders.length}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">{t('remainingBalance')}</span>
            <h3 className="text-2xl font-bold text-amber-400 tracking-tight mt-0.5">₹{data.pending_balance}</h3>
          </div>
        </div>

        {/* Notifications alert box */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-1 flex items-center space-x-4">
          <div className="p-3 bg-pink-600/10 text-pink-400 rounded-xl relative">
            <Bell className="w-6 h-6" />
            {data.notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
            )}
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">Active Alerts</span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">{data.notifications.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Order Tracking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 pb-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            <h2 className="font-heading text-lg font-bold text-white">{t('trackOrderStatus')}</h2>
          </div>

          {data.orders.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
              <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p>No active orders found linked to your name.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.orders.map(order => (
                <div key={order.id} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
                  
                  {/* Title & Price */}
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t(order.cloth_type)}</span>
                      <h3 className="text-lg font-bold text-white mt-1">Order Number: #{1000 + order.id}</h3>
                      {order.tailor_name && (
                        <p className="text-xs text-purple-300 font-semibold mt-1">
                          Tailor Name: <span className="text-white">{order.tailor_name}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">Price</span>
                      <h4 className="text-xl font-bold text-white">₹{order.total_amount}</h4>
                    </div>
                  </div>

                  {/* Horizontal Progress tracker */}
                  <div className="space-y-4 py-2">
                    <div className="relative flex justify-between">
                      {/* Tracking background line */}
                      <div className="absolute top-3.5 left-0 right-0 h-1 bg-white/5 -z-10 rounded-full"></div>
                      <div 
                        className="absolute top-3.5 left-0 h-1 bg-purple-500 -z-10 rounded-full transition-all duration-500"
                        style={{ width: getProgressPercent(order.status) }}
                      ></div>

                      {/* Step 1: Order Created */}
                      <div className="flex flex-col items-center text-center space-y-1 z-10">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          order.status === 'Pending' 
                            ? 'bg-amber-500 border-amber-400 text-gray-950 scale-110 shadow-lg shadow-amber-950/20' 
                            : 'bg-purple-600 border-purple-500 text-white'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold ${order.status === 'Pending' ? 'text-amber-400' : 'text-gray-400'}`}>
                          Order Created
                        </span>
                      </div>

                      {/* Step 2: Stitching Started */}
                      <div className="flex flex-col items-center text-center space-y-1 z-10">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          order.status === 'In Progress'
                            ? 'bg-amber-500 border-amber-400 text-gray-950 scale-110 shadow-lg shadow-amber-950/20'
                            : ['In Progress', 'Ready', 'Delivered'].includes(order.status)
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-gray-900 border-white/10 text-gray-500'
                        }`}>
                          <Scissors className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          order.status === 'In Progress' 
                            ? 'text-amber-400' 
                            : ['In Progress', 'Ready', 'Delivered'].includes(order.status)
                              ? 'text-gray-400'
                              : 'text-gray-500'
                        }`}>
                          Stitching Started
                        </span>
                      </div>

                      {/* Step 3: Ready */}
                      <div className="flex flex-col items-center text-center space-y-1 z-10">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          order.status === 'Ready'
                            ? 'bg-amber-500 border-amber-400 text-gray-950 scale-110 shadow-lg shadow-amber-950/20'
                            : ['Ready', 'Delivered'].includes(order.status)
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-gray-900 border-white/10 text-gray-500'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          order.status === 'Ready' 
                            ? 'text-amber-400' 
                            : ['Ready', 'Delivered'].includes(order.status)
                              ? 'text-gray-400'
                              : 'text-gray-500'
                        }`}>
                          Ready
                        </span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex flex-col items-center text-center space-y-1 z-10">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          order.status === 'Delivered'
                            ? 'bg-blue-500 border-blue-400 text-gray-950 scale-110 shadow-lg shadow-blue-950/20'
                            : 'bg-gray-900 border-white/10 text-gray-500'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold ${order.status === 'Delivered' ? 'text-blue-400' : 'text-gray-500'}`}>
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Order Pricing Details</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                        <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">Advance Amount</span>
                        <strong className="text-emerald-400 text-xs font-semibold">₹{order.advance_amount}</strong>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                        <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">Remaining Amount</span>
                        <strong className={`text-xs font-semibold ${order.balance_amount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                          ₹{order.balance_amount}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Booking & Delivery Date card */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs flex justify-between items-center gap-4">
                    <div className="flex space-x-6 sm:space-x-12">
                      <div>
                        <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">{t('booked')}</span>
                        <strong className="text-white font-heading text-xs sm:text-sm">{order.order_date}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">{t('deliveryDate')}</span>
                        <strong className="text-purple-400 font-heading text-xs sm:text-sm">{order.delivery_date}</strong>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      order.payment_status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {order.payment_status === 'Paid' ? t('paymentPaid') :
                       order.payment_status === 'Partially Paid' ? t('paymentPartiallyPaid') :
                       t('paymentPending')}
                    </span>
                  </div>

                  {/* Payment installments history */}
                  {order.payments && order.payments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Installments Logs</span>
                      <div className="space-y-1.5">
                        {order.payments.map((p, idx) => (
                          <div key={p.id} className="flex justify-between items-center text-xs py-1.5 border-t border-white/5 text-gray-300">
                            <span>Installment #{idx + 1} ({p.payment_method})</span>
                            <span className="font-bold text-emerald-400">+ ₹{p.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Notifications list & Measurements */}
        <div className="space-y-6">
          
          {/* Notifications feed */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Bell className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white font-heading">Reminders & Alerts</h3>
            </div>

            {data.notifications.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">{t('noNotifications')}</p>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {data.notifications.map(n => (
                  <div key={n.id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-white">{n.title}</div>
                    <p className="text-[11px] text-gray-400">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer measurements viewer */}
          {measurements && (
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                <Ruler className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white font-heading">{t('measurementsTitle')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'chest', label: t('chest') },
                  { key: 'waist', label: t('waist') },
                  { key: 'shoulder', label: t('shoulder') },
                  { key: 'sleeve', label: t('sleeve') },
                  { key: 'length', label: t('length') },
                  { key: 'neck', label: t('neck') },
                  { key: 'hip', label: t('hip') }
                ].map(field => (
                  <div key={field.key} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase">{field.label.split(' ')[0]}</span>
                    <strong className="text-white">{measurements[field.key] ? `${measurements[field.key]}"` : '-'}</strong>
                  </div>
                ))}
              </div>

              {measurements.notes && (
                <div className="text-xs bg-white/5 p-3 rounded-xl border border-white/5 text-gray-400 text-left">
                  <span className="font-bold text-white block mb-1">Tailor Notes:</span>
                  {measurements.notes}
                </div>
              )}

              {measurements.reference_image_url && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Reference Sketch</span>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 h-32 flex items-center justify-center overflow-hidden">
                    <img
                      src={measurements.reference_image_url}
                      alt="Reference Sketch"
                      className="max-h-full object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
