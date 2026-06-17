import React, { useState, useEffect } from 'react';
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

  // Create Order Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [clothType, setClothType] = useState('shirt');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [status, setStatus] = useState('Pending');

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
    if (!customerName || !deliveryDate || !totalAmount) {
      setModalError('Please fill in required fields (Customer Name, Delivery Date, Price)');
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
        cloth_type: 'shirt',
        delivery_date: deliveryDate,
        total_amount: priceVal,
        advance_amount: advanceVal,
        status: status
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
    setClothType('shirt');
    setDeliveryDate('');
    setTotalAmount('');
    setAdvanceAmount('');
    setStatus('Pending');
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
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('orderList')}</h2>
          <p className="text-gray-400 text-sm">Monitor stitching statuses and payment balances</p>
        </div>
        <button
          onClick={() => { clearOrderForm(); setShowAddModal(true); }}
          className="neon-btn text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-950/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createOrder')}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-panel pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Search by customer name..."
          />
        </div>

        {/* Cloth Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="glass-panel px-4 py-2.5 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="" className="bg-gray-950 text-white">All Cloth Types</option>
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
          className="glass-panel px-4 py-2.5 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="" className="bg-gray-950 text-white">All Statuses</option>
          <option value="Pending" className="bg-gray-950 text-white">Pending</option>
          <option value="In Progress" className="bg-gray-950 text-white">In Progress</option>
          <option value="Ready" className="bg-gray-950 text-white">Ready</option>
          <option value="Delivered" className="bg-gray-950 text-white">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl border border-white/5 text-left overflow-hidden">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">{t('name')}</th>
                  <th className="px-6 py-4">{t('clothType')}</th>
                  <th className="px-6 py-4">{t('bookingAndDelivery')}</th>
                  <th className="px-6 py-4">{t('totalAmount')}</th>
                  <th className="px-6 py-4">{t('balanceAmount')}</th>
                  <th className="px-6 py-4">{t('paymentStatus')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{o.customer?.name || 'Customer'}</div>
                      <div className="text-[10px] text-gray-500">{o.customer?.phone === '0000000000' ? t('notRegistered') : t('registered')}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {t(o.cloth_type)}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="text-[11px] text-gray-500 font-medium">
                        {t('booked')}: {o.order_date}
                      </div>
                      <div className="flex items-center space-x-1.5 text-white font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-purple-400 font-bold" />
                        <span>{o.delivery_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">₹{o.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${o.balance_amount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                        ₹{o.balance_amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        o.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        o.payment_status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {o.payment_status === 'Paid' ? t('paymentPaid') :
                         o.payment_status === 'Partially Paid' ? t('paymentPartiallyPaid') :
                         t('paymentPending')}
                      </span>
                      {o.transaction_id && (
                        <div className="text-[10px] text-gray-500 block font-mono">
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
                          className="bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Pending" className="bg-gray-950 text-white">Pending</option>
                          <option value="In Progress" className="bg-gray-950 text-white">In Progress</option>
                          <option value="Ready" className="bg-gray-950 text-white">Ready</option>
                          <option value="Delivered" className="bg-gray-950 text-white">Delivered</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {o.balance_amount > 0 ? (
                        <button
                          onClick={() => openPaymentModal(o)}
                          className="bg-purple-600/10 hover:bg-purple-600/30 text-purple-400 rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center space-x-1 mx-auto cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                          <div className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-semibold text-emerald-500">Fully Paid</span>
                          </div>
                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            className="bg-red-600/10 hover:bg-red-600/30 text-red-400 rounded-xl px-2.5 py-1 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
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
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-lg text-left animate-fade-in relative my-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm text-white cursor-pointer"
                >
                  <option value="Pending" className="bg-gray-950 text-white">Pending</option>
                  <option value="In Progress" className="bg-gray-950 text-white">In Progress</option>
                  <option value="Ready" className="bg-gray-950 text-white">Ready</option>
                  <option value="Delivered" className="bg-gray-950 text-white">Delivered</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full neon-btn py-3.5 rounded-xl text-white font-bold flex items-center justify-center cursor-pointer mt-2"
              >
                <span>Create Order Record</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Installment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-md text-left animate-fade-in relative my-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
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
        </div>
      )}

    </div>
  );
}
