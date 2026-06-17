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

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('paymentLedger')}</h2>
        <p className="text-gray-400 text-sm">Historical ledger of customer installment transactions</p>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            placeholder="Search transactions by full name..."
          />
        </div>

        {/* Method selector */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="glass-panel px-4 py-2.5 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="" className="bg-gray-950 text-white">All Payment Methods</option>
          <option value="Cash" className="bg-gray-950 text-white">{t('cash')}</option>
          <option value="UPI" className="bg-gray-950 text-white">{t('upi')}</option>
          <option value="Card" className="bg-gray-950 text-white">{t('card')}</option>
          <option value="Other" className="bg-gray-950 text-white">{t('other')}</option>
        </select>
      </div>

      {/* Payment Ledger */}
      <div className="glass-panel rounded-3xl border border-white/5 text-left overflow-hidden">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">{t('name')}</th>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">{t('paymentMethod')}</th>
                  <th className="px-6 py-4">Amount Recieved</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {filteredPayments.map((p) => {
                  const formattedDate = parseDateTime(p.payment_date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.transaction_id || `TXN-${10000 + p.id}`}</td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {p.order?.customer?.name || 'Customer'}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {t(p.order?.cloth_type || '')} (ID: #{p.order_id})
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-white/5 border border-white/5 text-gray-300">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        + ₹{p.amount}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 max-w-[200px] truncate">
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
