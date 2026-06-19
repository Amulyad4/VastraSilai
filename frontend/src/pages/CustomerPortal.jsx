import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, CreditCard, Bell, Ruler, Clock, CheckCircle, Truck, RefreshCw, Scissors, ArrowLeft, Store, MapPin, AlertTriangle, Search, User } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function CustomerPortal() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  // Selection and data states
  const [tailors, setTailors] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [shopFilter, setShopFilter] = useState('');

  const filteredTailors = tailors.filter(tailor => {
    const shopName = (tailor.shop_name || `${tailor.name}'s Shop`).toLowerCase();
    const tailorName = (tailor.name || '').toLowerCase();
    const address = (tailor.address || '').toLowerCase();
    const searchLower = shopFilter.toLowerCase();
    return shopName.includes(searchLower) || tailorName.includes(searchLower) || address.includes(searchLower);
  });

  useEffect(() => {
    if (localStorage.getItem('just_registered') === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('just_registered');
    }
    fetchTailors();
  }, []);

  const fetchTailors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/customer/tailors`);
      setTailors(res.data);
    } catch (err) {
      console.error("Error loading tailors list:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectTailorShop = async (tailor) => {
    setSelectedTailor(tailor);
    setLoadingDetails(true);
    try {
      const res = await axios.get(`${API_URL}/customer/tailor/${tailor.id}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error loading customer tailor details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBack = () => {
    setSelectedTailor(null);
    setDashboardData(null);
  };

  const handleRefresh = async () => {
    if (selectedTailor) {
      setLoadingDetails(true);
      try {
        const res = await axios.get(`${API_URL}/customer/tailor/${selectedTailor.id}`);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error refreshing details:", err);
      } finally {
        setLoadingDetails(false);
      }
    } else {
      fetchTailors();
    }
  };

  // Helper to compute progress bar width percentage
  const getProgressPercent = (status) => {
    if (status === 'Pending') return '0%';
    if (status === 'In Progress') return '50%';
    if (status === 'Ready') return '100%';
    if (status === 'Delivered') return '100%';
    return '0%';
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      {showWelcome && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-sm rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎉</span>
            <span className="font-extrabold">Successfully registered! Welcome to your VastraSilai AI customer portal.</span>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Conditionally Render Header */}
      {!selectedTailor || loadingDetails || (dashboardData && !dashboardData.is_registered) ? (
        /* STANDARD WELCOME HEADER BAR (when not viewing a shop's dashboard) */
        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-sm shadow-purple-550/5">
          <div className="absolute -left-12 -top-12 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-650 text-white rounded-2xl shadow-md shadow-purple-500/15">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-black text-gray-850 dark:text-white leading-tight">
                {t('welcomeCustomer', { name: user?.name })}
              </h1>
              <p className="text-[10px] text-purple-650 dark:text-purple-400 font-black uppercase tracking-wider mt-0.5">{t('customerDashboard')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-purple-600/5 hover:bg-purple-600/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white rounded-xl border border-purple-500/10 hover:border-purple-500/30 dark:border-white/5 dark:hover:border-purple-500/30 transition duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="bg-red-550/10 hover:bg-red-550/20 dark:bg-red-600/10 dark:hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:border-red-550/30 dark:hover:border-red-500/40 rounded-xl px-4 py-2.5 text-xs font-black tracking-wider uppercase transition duration-300 cursor-pointer hover:scale-105 active:scale-95"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      ) : (
        /* UNIFIED RECORD VIEW HEADER (when viewing dashboard) */
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent dark:from-purple-900/20 dark:via-indigo-900/15 dark:to-transparent border border-purple-500/15 dark:border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden shadow-sm shadow-purple-550/5">
          {/* Ambient Background Glow */}
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Back button */}
            <button
               onClick={handleBack}
               className="p-3 bg-purple-600/5 hover:bg-purple-600/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-white rounded-2xl border border-purple-500/10 hover:border-purple-500/30 dark:border-white/5 dark:hover:border-purple-500/30 transition duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 shadow-md self-start group back-to-list-btn"
               title="Go back to shops"
             >
               <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 dark:text-gray-300 dark:group-hover:text-white transition-colors" />
             </button>
            
            <div className="flex items-center space-x-4">
              {/* Avatar with dynamic initials and premium gradient */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-650 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-purple-400/30">
                {(dashboardData?.customer_name || user?.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-850 dark:text-white font-heading mt-1 leading-tight tracking-tight">
                  {dashboardData?.customer_name || user?.name}
                </h2>
                <p className="text-xs text-gray-550 dark:text-gray-400 font-bold mt-1 flex items-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Linked Phone: <span className="text-gray-700 dark:text-gray-350 font-extrabold ml-1">{user?.phone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Tailor Shop details & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Tailor Shop details pill */}
            <div className="flex items-center space-x-3 bg-purple-600/5 dark:bg-white/5 border border-purple-500/10 dark:border-white/5 py-2.5 px-4 rounded-2xl">
              <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Store className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-purple-650 dark:text-purple-450 font-black uppercase tracking-wider block">Tailor Shop</span>
                <span className="text-xs font-black text-gray-900 dark:text-white block mt-0.5">{selectedTailor.shop_name || selectedTailor.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-purple-600/5 hover:bg-purple-600/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-450 hover:text-purple-600 dark:hover:text-white rounded-xl border border-purple-500/10 hover:border-purple-500/30 dark:border-white/5 dark:hover:border-purple-500/30 transition duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="bg-red-550/10 hover:bg-red-550/20 dark:bg-red-600/10 dark:hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:border-red-550/30 dark:hover:border-red-500/40 rounded-xl px-4 py-2.5 text-xs font-black tracking-wider uppercase transition duration-300 cursor-pointer hover:scale-105 active:scale-95"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection flow */}
      {!selectedTailor ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white font-heading tracking-tight">Select Your Tailor Shop</h2>
              <p className="text-sm text-gray-550 dark:text-gray-400">Choose a shop below to view your tailoring records, measurements, and orders.</p>
            </div>
            
            {/* Search Filter input */}
            <div className="relative w-full md:w-[480px] group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600 dark:text-gray-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors duration-200" strokeWidth={3} />
              <input
                type="text"
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                placeholder="Search by shop, tailor, or location..."
                className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm text-black dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          {filteredTailors.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
              <Store className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p>No tailor shops match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTailors.map(tailor => (
                <div
                  key={tailor.id}
                  onClick={() => selectTailorShop(tailor)}
                  className="glass-card p-6 rounded-3xl border border-white/5 cursor-pointer flex flex-col justify-between group animate-fade-in relative overflow-hidden min-h-[190px]"
                >
                  {/* Premium top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 pointer-events-none rounded-t-3xl"></div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-650 text-white rounded-2xl shadow-md shadow-purple-500/15 group-hover:scale-105 transition-all duration-350">
                        <Store className="w-5 h-5" strokeWidth={2.2} />
                      </div>
                      <span className="text-[10px] text-purple-650 dark:text-purple-400 font-black bg-purple-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Tailor Shop
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-gray-850 dark:text-white group-hover:text-purple-650 dark:group-hover:text-purple-300 transition-colors duration-250">
                        {tailor.shop_name || `${tailor.name}'s Shop`}
                      </h3>
                      <p className="text-xs text-gray-550 dark:text-gray-400 font-bold mt-2 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400/80" strokeWidth={2.5} />
                        <span>Tailor: <strong className="text-gray-700 dark:text-gray-300 font-extrabold">{tailor.name}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-purple-500/10 dark:border-white/5 pt-4 mt-6 flex items-center text-xs text-gray-500 dark:text-gray-400 font-bold">
                    <div className="flex items-center bg-purple-500/5 dark:bg-white/5 px-2.5 py-1 rounded-lg max-w-full">
                      <MapPin className="w-3.5 h-3.5 text-purple-500 dark:text-purple-450 mr-1.5 flex-shrink-0" strokeWidth={2.5} />
                      <span className="truncate text-gray-750 dark:text-gray-300">{tailor.address || "Address not provided"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loadingDetails ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-gray-400 text-sm">Verifying records with {selectedTailor.shop_name || selectedTailor.name}...</span>
        </div>
      ) : dashboardData && !dashboardData.is_registered ? (
        // NOT REGISTERED VIEW
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-red-500/20 space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-950/20">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-heading">Not Registered at Shop</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Your registered customer phone number (<span className="text-white font-semibold">{user?.phone}</span>) is not linked in <span className="text-purple-400 font-bold">{selectedTailor.shop_name || selectedTailor.name}</span>'s records.
            </p>
          </div>


          <button
            onClick={handleBack}
            className="neon-btn px-6 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center space-x-2 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tailor Shops</span>
          </button>
        </div>
      ) : (
        // REGISTERED DASHBOARD VIEW
        <div className="space-y-8 animate-fade-in">
          {/* Unified header rendered at the page top replaces this section */}

          {/* KPI stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {/* Active Orders */}
            <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-purple">
              <div className="p-3 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm shadow-purple-650/5">
                <ShoppingBag className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">{t('cardOrders')}</span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">{dashboardData?.orders.length}</h3>
              </div>
            </div>

            {/* Remaining Balance */}
            <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-blue">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm shadow-blue-650/5">
                <CreditCard className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">{t('remainingBalance')}</span>
                <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-0.5">
                  ₹{dashboardData?.orders.reduce((sum, o) => sum + o.balance_amount, 0) || 0}
                </h3>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-pink">
              <div className="p-3 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-2xl shadow-sm shadow-pink-655/5 relative">
                <Bell className="w-6 h-6" strokeWidth={2.2} />
                {dashboardData?.notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">Active Alerts</span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">{dashboardData?.notifications.length}</h3>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Col: Order Tracking */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <div className="flex items-center space-x-2 pb-2">
                <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="font-heading text-lg font-black text-gray-800 dark:text-white">{t('trackOrderStatus')}</h2>
              </div>

              {dashboardData?.orders.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
                  <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p>No active orders found at this tailor shop.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dashboardData?.orders.map(order => (
                    <div key={order.id} className="glass-card p-6 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
                      {/* Premium top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 pointer-events-none rounded-t-3xl"></div>
                      
                      {/* Title & Price */}
                      <div className="flex justify-between items-start border-b border-purple-500/10 dark:border-white/5 pb-4">
                        <div>
                          <span className="text-xs text-purple-650 dark:text-purple-400 font-black bg-purple-550/10 px-3 py-1 rounded-full uppercase tracking-wider">{t(order.cloth_type)}</span>
                          <h3 className="text-lg font-black text-gray-850 dark:text-white mt-2.5">Order Number: #{1000 + order.id}</h3>
                          {order.description && (
                            <p className="text-xs text-gray-550 dark:text-gray-400 mt-2 font-medium italic">{order.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider block">Price</span>
                          <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">₹{order.total_amount}</h4>
                        </div>
                      </div>

                      {/* Horizontal Progress tracker */}
                      <div className="space-y-4 py-2">
                        <div className="relative flex justify-between">
                          {/* Tracking background line */}
                          <div className="absolute top-3.5 left-0 right-0 h-1 bg-purple-600/5 dark:bg-white/5 -z-10 rounded-full"></div>
                          <div 
                            className="absolute top-3.5 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-650 -z-10 rounded-full transition-all duration-500"
                            style={{ width: getProgressPercent(order.status) }}
                          ></div>

                          {/* Step 1: Order Created */}
                          <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              order.status === 'Pending' 
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 text-white scale-110 shadow-lg shadow-purple-500/20' 
                                : 'bg-purple-600 border-purple-500 text-white'
                            }`}>
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${order.status === 'Pending' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-450 dark:text-gray-500'}`}>
                              Order Created
                            </span>
                          </div>

                          {/* Step 2: Stitching Started */}
                          <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              order.status === 'In Progress'
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 text-white scale-110 shadow-lg shadow-purple-500/20'
                                : ['In Progress', 'Ready', 'Delivered'].includes(order.status)
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'bg-purple-600/5 dark:bg-gray-900 border-purple-550/10 dark:border-white/10 text-gray-400 dark:text-gray-500'
                            }`}>
                              <Scissors className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'In Progress' 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : ['In Progress', 'Ready', 'Delivered'].includes(order.status)
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-gray-450 dark:text-gray-500'
                            }`}>
                              Stitching Started
                            </span>
                          </div>

                          {/* Step 3: Ready */}
                          <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              order.status === 'Ready'
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 text-white scale-110 shadow-lg shadow-purple-500/20'
                                : ['Ready', 'Delivered'].includes(order.status)
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'bg-purple-600/5 dark:bg-gray-900 border-purple-550/10 dark:border-white/10 text-gray-400 dark:text-gray-500'
                            }`}>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'Ready' 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : ['Ready', 'Delivered'].includes(order.status)
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-gray-455 dark:text-gray-500'
                            }`}>
                              Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="border-t border-purple-500/10 dark:border-white/5 pt-4 space-y-4">
                        <div className="flex items-center space-x-1.5 text-xs font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                          <span>Order Pricing Details</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-purple-600/5 dark:bg-white/5 border border-purple-500/10 dark:border-white/5 p-3.5 rounded-2xl">
                            <span className="text-gray-500 dark:text-gray-400 block uppercase font-bold text-[9px] mb-0.5">{t('amountPaid').replace(' (₹)', '')}</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 text-base font-black">₹{order.advance_amount}</strong>
                          </div>
                          <div className="bg-purple-600/5 dark:bg-white/5 border border-purple-500/10 dark:border-white/5 p-3.5 rounded-2xl">
                            <span className="text-gray-500 dark:text-gray-400 block uppercase font-bold text-[9px] mb-0.5">{t('remainingBalance')}</span>
                            <strong className={`text-base font-black ${order.balance_amount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-605 dark:text-gray-400'}`}>
                              ₹{order.balance_amount}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Booking & Delivery Date card */}
                      <div className="bg-purple-600/5 dark:bg-white/5 border border-purple-500/10 dark:border-white/5 p-4 rounded-2xl text-xs flex justify-between items-center gap-4 font-bold">
                        <div className="flex space-x-6 sm:space-x-12">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 block uppercase font-bold text-[9px] mb-0.5">{t('booked')}</span>
                            <strong className="text-gray-800 dark:text-white font-heading text-xs sm:text-sm font-black">{order.order_date}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 block uppercase font-bold text-[9px] mb-0.5">{t('deliveryDate')}</span>
                            <strong className="text-purple-650 dark:text-purple-400 font-heading text-xs sm:text-sm font-black">{order.delivery_date}</strong>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                          order.payment_status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          order.payment_status === 'Partially Paid' ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400' :
                          'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                          {order.payment_status === 'Paid' ? t('paymentPaid') :
                           order.payment_status === 'Partially Paid' ? t('paymentPartiallyPaid') :
                           t('paymentPending')}
                        </span>
                      </div>

                      {/* Payment installments history */}
                      {order.payments && order.payments.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Payment Installments Logs</span>
                          <div className="space-y-2">
                            {order.payments.map((p, idx) => (
                              <div key={p.id} className="flex justify-between items-center text-xs py-2 px-3 border border-purple-500/5 dark:border-white/5 text-gray-700 dark:text-gray-300 font-bold bg-purple-500/5 dark:bg-white/5 rounded-xl">
                                <span>Installment #{idx + 1} ({p.payment_method})</span>
                                <span className="font-black text-emerald-600 dark:text-emerald-450">+ ₹{p.amount}</span>
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
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-purple-500/10 dark:border-white/5 pb-3">
                  <Bell className="w-5 h-5 text-purple-650 dark:text-purple-400" />
                  <h3 className="text-lg font-black text-gray-800 dark:text-white font-heading">Reminders & Alerts</h3>
                </div>

                {dashboardData?.notifications.length === 0 ? (
                  <p className="text-xs text-gray-550 dark:text-gray-500 py-6 text-center">{t('noNotifications')}</p>
                ) : (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {dashboardData?.notifications.map(n => (
                      <div key={n.id} className="bg-purple-600/5 dark:bg-white/5 border border-purple-550/10 dark:border-white/5 p-3 rounded-2xl space-y-1 text-xs">
                        <div className="font-extrabold text-gray-800 dark:text-white">{n.title}</div>
                        <p className="text-[11px] text-gray-650 dark:text-gray-400 font-medium">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer measurements viewer */}
              {dashboardData?.measurements && (
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-purple-500/10 dark:border-white/5 pb-3">
                    <Ruler className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                    <h3 className="text-lg font-black text-gray-805 dark:text-white font-heading">{t('measurementsTitle')}</h3>
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
                      <div key={field.key} className="measurement-card flex justify-between items-center p-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.01]">
                        <span className="measurement-label text-[10px] font-black uppercase tracking-wider">{field.label.split(' ')[0]}</span>
                        <strong className="text-gray-800 dark:text-white font-black text-sm">
                          {dashboardData.measurements[field.key] ? `${dashboardData.measurements[field.key]}"` : '-'}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {dashboardData.measurements.notes && (
                    <div className="measurement-card p-3.5 rounded-xl border text-xs text-gray-700 dark:text-gray-300 text-left transition-all duration-300">
                      <span className="measurement-label text-xs font-black uppercase tracking-wider block mb-1">Tailor Notes</span>
                      <p>{dashboardData.measurements.notes}</p>
                    </div>
                  )}

                  {dashboardData.measurements.reference_image_url && (
                    <div className="space-y-1.5 text-left">
                      <span className="measurement-label text-[10px] font-black uppercase tracking-wider block">Reference Sketch</span>
                      <div className="measurement-card border rounded-xl p-2 h-32 flex items-center justify-center overflow-hidden transition-all duration-300">
                        <img
                          src={dashboardData.measurements.reference_image_url}
                          alt="Reference Sketch"
                          className="max-h-full object-contain rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
