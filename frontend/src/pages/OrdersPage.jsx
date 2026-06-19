import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, FileText, Calendar, IndianRupee, Clock, ChevronDown, CheckCircle, Trash2, X, PlusCircle, Ruler } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const getGarmentBadge = (type) => {
    const tType = type.toLowerCase();
    if (tType === 'shirt') return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30';
    if (tType === 'pant') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
    if (tType === 'blouse') return 'bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400 border-pink-100 dark:border-pink-900/30';
    if (tType === 'kurta') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
  };

  const getStatusSelectClass = (status) => {
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    if (status === 'In Progress') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    if (status === 'Ready') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10';
  };

  // Create Order Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [clothType, setClothType] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [description, setDescription] = useState('');
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState('Cash');

  const [modalError, setModalError] = useState('');

  // Status Change States
  const [updatingId, setUpdatingId] = useState(null);

  // Installment Record States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [paymentModalError, setPaymentModalError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders?status=${statusFilter}&cloth_type=${typeFilter}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!customerName || !clothType.trim() || !deliveryDate || !totalAmount) {
      setModalError('Please fill in required fields (Customer Name, Garment Type, Delivery Date, Price)');
      return;
    }

    const priceVal = parseFloat(totalAmount);
    const advanceVal = parseFloat(advanceAmount || 0);

    if (advanceVal > priceVal) {
      setModalError('Advance paid cannot exceed the total amount');
      return;
    }

    try {
      await axios.post(`${API_URL}/orders`, {
        customer_name: customerName,
        cloth_type: clothType,
        delivery_date: deliveryDate,
        total_amount: priceVal,
        advance_amount: advanceVal,
        payment_method: advancePaymentMethod,
        status: 'Pending',
        description: description
      });
      setShowAddModal(false);
      clearOrderForm();
      fetchOrders();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create order');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`${API_URL}/orders/${orderId}`, {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentModalError('');
    if (!paymentAmount) {
      setPaymentModalError('Please enter the payment amount');
      return;
    }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentModalError('Amount must be greater than zero');
      return;
    }

    try {
      await axios.post(`${API_URL}/orders/${paymentOrderId}/payments`, {
        amount: amt,
        payment_method: paymentMethod,
        notes: paymentNotes || null,
        transaction_id: paymentTxnId || null
      });
      setShowPaymentModal(false);
      clearPaymentForm();
      fetchOrders();
    } catch (err) {
      setPaymentModalError(err.response?.data?.detail || 'Payment record failed');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to remove this order from the order book?")) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order");
    }
  };

  const clearOrderForm = () => {
    setCustomerName('');
    setClothType('');
    setDeliveryDate('');
    setTotalAmount('');
    setAdvanceAmount('');
    setStatus('Pending');
    setDescription('');
    setAdvancePaymentMethod('Cash');
    setModalError('');
  };

  const clearPaymentForm = () => {
    setPaymentOrderId(null);
    setPaymentAmount('');
    setPaymentMethod('Cash');
    setPaymentNotes('');
    setPaymentTxnId('');
    setPaymentModalError('');
  };

  const openPaymentModal = (order) => {
    setPaymentOrderId(order.id);
    setPaymentAmount(order.balance_amount.toString());
    setShowPaymentModal(true);
  };

  // Filter orders client-side on customer name if search query exists
  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const name = o.customer?.name || '';
    const phone = o.customer?.phone || '';
    return name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-black text-gray-800 dark:text-white tracking-tight">{t('orderList')}</h2>
          <p className="text-gray-550 dark:text-gray-400 text-sm">Monitor stitching statuses and payment balances</p>
        </div>
        <button
          onClick={() => { clearOrderForm(); setShowAddModal(true); }}
          className="neon-btn text-white rounded-2xl px-7 py-3.5 text-base font-black tracking-wide shadow-lg shadow-purple-950/20 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          <span>{t('createOrder')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Orders Card */}
        <div className="glass-card stats-card-blue p-5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all duration-305 hover:translate-y-[-4px] group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-blue-500"></div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{t('totalOrders') || 'Total Orders'}</span>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{orders.length}</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Total orders in registry</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center transition-all duration-305 group-hover:scale-110">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Stitching Card */}
        <div className="glass-card stats-card-amber p-5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all duration-305 hover:translate-y-[-4px] group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-amber-500"></div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{t('pendingStitching') || 'Pending Stitching'}</span>
            <h3 className="text-2xl font-black text-amber-605 dark:text-amber-400 tracking-tight">
              {orders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-505">Awaiting tailor completion</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center transition-all duration-305 group-hover:scale-110">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Receivables Card */}
        <div className="glass-card stats-card-emerald p-5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all duration-305 hover:translate-y-[-4px] group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald-500"></div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{t('remainingBalance') || 'Remaining Balance'}</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{orders.reduce((sum, o) => sum + (o.balance_amount || 0), 0)}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-505">Total unpaid balance</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center transition-all duration-305 group-hover:scale-110">
            <IndianRupee className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative md:col-span-3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 dark:text-gray-400">
            <Search className="w-5 h-5" strokeWidth={3} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-panel pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Search by customer name..."
          />
        </div>

        {/* Garment Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="glass-panel px-4 py-2.5 rounded-xl text-sm text-gray-800 dark:text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="" className="bg-gray-950 text-white">All Garments</option>
          <option value="shirt" className="bg-gray-950 text-white">{t('shirt')}</option>
          <option value="pant" className="bg-gray-950 text-white">{t('pant')}</option>
          <option value="blouse" className="bg-gray-950 text-white">{t('blouse')}</option>
          <option value="kurta" className="bg-gray-950 text-white">{t('kurta')}</option>
          <option value="suit" className="bg-gray-950 text-white">{t('suit')}</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="glass-panel px-4 py-2.5 rounded-xl text-sm text-gray-800 dark:text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="" className="bg-gray-950 text-white">All Statuses</option>
          <option value="Pending" className="bg-gray-950 text-white">Pending</option>
          <option value="In Progress" className="bg-gray-950 text-white">In Progress</option>
          <option value="Ready" className="bg-gray-950 text-white">Ready</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl border border-white/5 text-left p-4 overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left premium-table">
              <thead>
                <tr className="text-xs font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest">
                  <th className="px-6 pb-2">{t('name')}</th>
                  <th className="px-6 pb-2">{t('clothType')}</th>
                  <th className="px-6 pb-2">{t('bookingAndDelivery')}</th>
                  <th className="px-6 pb-2">{t('totalAmount')}</th>
                  <th className="px-6 pb-2">{t('balanceAmount')}</th>
                  <th className="px-6 pb-2">{t('paymentStatus')}</th>
                  <th className="px-6 pb-2">{t('status')}</th>
                  <th className="px-6 pb-2 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-750 dark:text-gray-300">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="premium-table-row">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">{o.customer?.name || 'Customer'}</div>
                      <div className="text-[10px] font-bold mt-1">
                        {o.customer?.phone === '0000000000' ? (
                          <span className="text-gray-400 dark:text-gray-500">{t('notRegistered')}</span>
                        ) : (
                          <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-900/30">{t('registered')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black capitalize border ${getGarmentBadge(o.cloth_type)}`}>
                        {t(o.cloth_type)}
                      </span>
                      {o.description && (
                        <div className="text-xs text-gray-550 dark:text-gray-500 max-w-[200px] truncate mt-1" title={o.description}>
                          {o.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="text-[11px] text-gray-500 font-medium">
                        {t('booked')}: {o.order_date}
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-800 dark:text-white font-extrabold">
                        <Calendar className="w-3.5 h-3.5 text-purple-650 dark:text-purple-400 font-bold" strokeWidth={2.5} />
                        <span>{o.delivery_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white text-base">₹{o.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`font-black text-base ${o.balance_amount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        ₹{o.balance_amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                        o.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                        o.payment_status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                      }`}>
                        {o.payment_status === 'Paid' ? t('paymentPaid') :
                         o.payment_status === 'Partially Paid' ? t('paymentPartiallyPaid') :
                         t('paymentPending')}
                      </span>
                      {o.transaction_id && (
                        <div className="text-[10px] text-gray-500 block font-mono mt-0.5">
                          TXN: {o.transaction_id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {updatingId === o.id ? (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`border rounded-xl px-2.5 py-1.5 text-xs font-extrabold focus:outline-none cursor-pointer transition-all duration-200 ${getStatusSelectClass(o.status)}`}
                        >
                          <option value="Pending" className="bg-gray-950 text-white">Pending</option>
                          <option value="In Progress" className="bg-gray-950 text-white">In Progress</option>
                          <option value="Ready" className="bg-gray-950 text-white">Ready</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {o.balance_amount > 0 ? (
                        <button
                          onClick={() => openPaymentModal(o)}
                          className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm shadow-purple-650/10 flex items-center space-x-1 mx-auto cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                            <span className="font-extrabold">Fully Paid</span>
                          </div>
                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            className="bg-red-50 hover:bg-red-100 dark:bg-red-950/15 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl px-2.5 py-1 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                            title="Remove order from order book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-center p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-lg text-left animate-fade-in relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white modal-close-btn"
            >
              <X className="w-5 h-5" strokeWidth={4} />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-4">{t('createOrder')}</h3>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('clothType')} *</label>
                <input
                  type="text"
                  value={clothType}
                  onChange={(e) => setClothType(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white"
                  placeholder="Enter garment type (e.g., Shirt, Pant)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('deliveryDate')} *</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('totalAmount')} *</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-base text-center text-white"
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('advanceAmount')}</label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-base text-center text-white"
                    placeholder="500"
                  />
                </div>
              </div>

              {advanceAmount && advanceAmount !== '0' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('paymentMethod')} *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdvancePaymentMethod('Cash')}
                      className={`py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                        advancePaymentMethod === 'Cash'
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-950/20'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvancePaymentMethod('UPI')}
                      className={`py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                        advancePaymentMethod === 'UPI'
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-950/20'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvancePaymentMethod('Card')}
                      className={`py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                        advancePaymentMethod === 'Card'
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-950/20'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      Card
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white min-h-[80px]"
                  placeholder="Enter order details, patterns, or notes..."
                />
              </div>

              <button
                type="submit"
                className="w-full neon-btn py-3.5 rounded-xl text-white font-bold flex items-center justify-center cursor-pointer mt-2"
              >
                <span>Create Order Record</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Record Payment Installment Modal */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-center p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-md text-left animate-fade-in relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white modal-close-btn"
            >
              <X className="w-5 h-5" strokeWidth={4} />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-4">{t('addInstallment')}</h3>
            
            {paymentModalError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {paymentModalError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('amountPaid')} *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base text-center text-white"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('paymentMethod')} *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white cursor-pointer"
                >
                  <option value="Cash" className="bg-gray-950 text-white">{t('cash')}</option>
                  <option value="UPI" className="bg-gray-950 text-white">{t('upi')}</option>
                  <option value="Card" className="bg-gray-950 text-white">{t('card')}</option>
                  <option value="Other" className="bg-gray-950 text-white">{t('other')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('transactionId')}</label>
                <input
                  type="text"
                  value={paymentTxnId}
                  onChange={(e) => setPaymentTxnId(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white"
                  placeholder="E.g., UPI-829384729"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('notes')}</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows="2"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white"
                  placeholder="E.g., final settlement, cash collected by assistant"
                />
              </div>

              <button
                type="submit"
                className="w-full neon-btn py-3 rounded-xl text-white font-semibold flex items-center justify-center cursor-pointer"
              >
                <span>Save Installment</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
