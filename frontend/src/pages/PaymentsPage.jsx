import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Search, IndianRupee, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const parseDateTime = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('T') && dateStr.split('T')[1].includes('-'))) {
    return new Date(dateStr);
  }
  return new Date(dateStr + 'Z');
};

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/payments`);
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter client-side
  const filteredPayments = payments.filter(p => {
    const custName = p.order?.customer?.name || '';
    const phone = p.order?.customer?.phone || '';
    const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
    const matchesMethod = methodFilter ? p.payment_method === methodFilter : true;
    return matchesSearch && matchesMethod;
  });

  const getMethodBadgeClass = (method) => {
    if (method === 'Cash') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    if (method === 'UPI') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    if (method === 'Card') return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10';
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header */}
      <div>
        <h2 className="font-heading text-3xl font-black text-gray-800 dark:text-white tracking-tight">{t('paymentLedger')}</h2>
        <p className="text-gray-550 dark:text-gray-400 text-sm">Historical ledger of customer installment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collected Card */}
        <div className="glass-card stats-card-emerald p-5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all duration-305 hover:translate-y-[-4px] group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald-500"></div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{t('totalCollected') || 'Total Collected'}</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0)}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-505">Accumulated store earnings</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center transition-all duration-305 group-hover:scale-110">
            <IndianRupee className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Cash Collections Card */}
        <div className="glass-card stats-card-amber p-5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all duration-305 hover:translate-y-[-4px] group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-amber-500"></div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{t('cashCollected') || 'Cash Payments'}</span>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              ₹{payments.filter(p => p.payment_method === 'Cash').reduce((sum, p) => sum + (p.amount || 0), 0)}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-505">In-hand physical currency</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center transition-all duration-305 group-hover:scale-110">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Digital Collections Card */}
        <div className="glass-card stats-card-blue p-5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all duration-305 hover:translate-y-[-4px] group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-blue-500"></div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{t('onlineCollected') || 'Digital Collections'}</span>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              ₹{payments.filter(p => p.payment_method === 'UPI' || p.payment_method === 'Card').reduce((sum, p) => sum + (p.amount || 0), 0)}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-505">UPI & card bank credits</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center transition-all duration-305 group-hover:scale-110">
            <CreditCard className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 dark:text-gray-400">
            <Search className="w-5 h-5" strokeWidth={3} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-panel pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-805 dark:text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Search transactions by full name..."
          />
        </div>

        {/* Method selector */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="glass-panel px-4 py-2.5 rounded-xl text-sm text-gray-800 dark:text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="" className="bg-gray-950 text-white">All Payment Methods</option>
          <option value="Cash" className="bg-gray-950 text-white">{t('cash')}</option>
          <option value="UPI" className="bg-gray-950 text-white">{t('upi')}</option>
          <option value="Card" className="bg-gray-950 text-white">{t('card')}</option>
          <option value="Other" className="bg-gray-950 text-white">{t('other')}</option>
        </select>
      </div>

      {/* Payment Ledger */}
      <div className="glass-panel rounded-3xl border border-white/5 text-left p-4 overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            <DollarSign className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p>No transactions logged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left premium-table">
              <thead>
                <tr className="text-xs font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest">
                  <th className="px-6 pb-2">Transaction ID</th>
                  <th className="px-6 pb-2">{t('name')}</th>
                  <th className="px-6 pb-2">Order Details</th>
                  <th className="px-6 pb-2">Date & Time</th>
                  <th className="px-6 pb-2">{t('paymentMethod')}</th>
                  <th className="px-6 pb-2">Amount Received</th>
                  <th className="px-6 pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-750 dark:text-gray-300">
                {filteredPayments.map((p) => {
                  const formattedDate = parseDateTime(p.payment_date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <tr key={p.id} className="premium-table-row">
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 border border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/5 dark:text-gray-400 rounded-lg px-2.5 py-1 text-xs font-mono font-bold">
                          {p.transaction_id || `TXN-${10000 + p.id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white text-base">
                        {p.order?.customer?.name || 'Customer'}
                      </td>
                      <td className="px-6 py-4 capitalize font-semibold">
                        {t(p.order?.cloth_type || '')} <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-0.5">(ID: #{p.order_id})</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black capitalize border ${getMethodBadgeClass(p.payment_method)}`}>
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400 text-base">
                        + ₹{p.amount}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-[300px] truncate font-medium" title={p.notes || ''}>
                        {p.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
