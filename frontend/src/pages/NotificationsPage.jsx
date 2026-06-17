import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Send, CheckCircle, AlertCircle, History, User } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const parseDateTime = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('T') && dateStr.split('T')[1].includes('-'))) {
    return new Date(dateStr);
  }
  return new Date(dateStr + 'Z');
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedCustId, setSelectedCustId] = useState('');
  const [template, setTemplate] = useState('general'); // general, delivery, payment
  const [title, setTitle] = useState('Important Alert');
  const [message, setMessage] = useState('');
  
  // Feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching notification logs:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`);
      setCustomers(res.data);
      if (res.data.length > 0) {
        setSelectedCustId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading customers list:", err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchCustomers()]);
      setLoading(false);
    };
    initPage();
  }, []);

  // Update message body on template change
  useEffect(() => {
    if (!selectedCustId || customers.length === 0) return;
    const cust = customers.find(c => c.id.toString() === selectedCustId);
    if (!cust) return;

    if (template === 'delivery') {
      setTitle('Delivery Reminder');
      setMessage(`Hello ${cust.name}! Quick reminder from VastraSilai AI: Your order is scheduled for delivery tomorrow. Balance due: ₹0. Please collect it!`);
    } else if (template === 'payment') {
      setTitle('Payment Reminder');
      setMessage(`Hello ${cust.name}! Gentle reminder from VastraSilai AI: An outstanding balance of ₹500 is pending for your recent order. Please settle it soon. Thank you!`);
    } else {
      setTitle('Update Alert');
      setMessage(`Hello ${cust.name}! Greetings from your tailoring shop. Your design measurements are stored digitally in VastraSilai AI.`);
    }
  }, [template, selectedCustId, customers]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedCustId || !message || !title) {
      setError('Please select a customer and enter the message content');
      return;
    }
    setBtnLoading(true);
    try {
      const res = await axios.post(`${API_URL}/notifications/send-whatsapp`, {
        customer_id: parseInt(selectedCustId),
        title,
        message
      });
      setSuccess(res.data.message);
      fetchLogs(); // Reload logs
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to dispatch WhatsApp message');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('notificationsAudit')}</h2>
        <p className="text-gray-400 text-sm">Send WhatsApp templates and check message audit details</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Send Message form */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white font-heading">{t('sendCustomWhatsApp')}</h3>
          </div>

          {customers.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">Add customers first to trigger alerts.</p>
          ) : (
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Customer</label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm cursor-pointer"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-gray-950 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'general', label: 'General' },
                    { code: 'delivery', label: 'Delivery' },
                    { code: 'payment', label: 'Payment' }
                  ].map(t => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => setTemplate(t.code)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition ${
                        template === t.code
                          ? 'bg-purple-600/10 border-purple-500 text-purple-300'
                          : 'border-white/5 bg-white/5 text-gray-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alert Subject / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('messageBody')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="5"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={btnLoading}
                className="w-full neon-btn py-3 rounded-xl text-white font-bold flex items-center justify-center space-x-1.5"
              >
                {btnLoading ? <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                <span>{t('sendBtn')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Column 2 & 3: Logs lists */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white font-heading">Dispatch History logs</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-gray-500 text-sm">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p>No messages sent yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {logs.map((log) => {
                const formattedDate = parseDateTime(log.sent_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div key={log.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          log.type === 'delivery' ? 'bg-blue-500/10 text-blue-400' :
                          log.type === 'payment' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {log.type}
                        </span>
                        <h4 className="text-sm font-bold text-white">{log.title}</h4>
                      </div>
                      <p className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{log.message}</p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto text-right text-[10px] text-gray-500 gap-y-1">
                      <span>{formattedDate}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                        log.status === 'sent' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
