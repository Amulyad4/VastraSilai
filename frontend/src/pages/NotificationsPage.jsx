import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Send, CheckCircle, AlertCircle, History, User, Clock, Play } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

const parseDateTime = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('T') && dateStr.split('T')[1].includes('-'))) {
    return new Date(dateStr);
  }
  return new Date(dateStr + 'Z');
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [scheduleData, setScheduleData] = useState({ today: [], overdue: [], calendar: [] });
  const [loading, setLoading] = useState(true);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

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

  const fetchSchedule = async () => {
    try {
      const res = await axios.get(`${API_URL}/deliveries/schedule`);
      setScheduleData(res.data);
    } catch (err) {
      console.error("Error fetching delivery schedule:", err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchCustomers(), fetchSchedule()]);
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

  const handleTriggerDailyRun = async () => {
    setSchedulerLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_URL}/notifications/trigger-daily-run`);
      setSuccess(t('triggerSuccess'));
      await fetchLogs(); // Reload logs
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to trigger daily WhatsApp run');
    } finally {
      setSchedulerLoading(false);
    }
  };

  const getSimulatedMessage = () => {
    const todayCount = scheduleData.today ? scheduleData.today.length : 0;
    const expectedCollection = scheduleData.today ? scheduleData.today.reduce((sum, o) => sum + (o.balance_amount || 0), 0) : 0;
    const overdueCount = scheduleData.overdue ? scheduleData.overdue.length : 0;
    const totalPendingBalance = scheduleData.calendar ? scheduleData.calendar.reduce((sum, item) => sum + (item.balance > 0 ? item.balance : 0), 0) : 0;

    const tailorName = user?.name || 'Tailor';
    const lang = user?.language || 'en';

    if (lang === 'hi') {
      let msg = `शुभ प्रभात, ${tailorName}!\n\nवस्त्रसिलाई दैनिक रिपोर्ट:\n`;
      msg += `• आज की डिलीवरी: ${todayCount} (अपेक्षित संग्रह: ₹${expectedCollection})\n`;
      msg += `• विलंबित आर्डर: ${overdueCount}\n`;
      msg += `• कुल लंबित संग्रह: ₹${totalPendingBalance}\n\n`;
      
      if (todayCount > 0) {
        msg += "आज की डिलीवरी सूची:\n";
        scheduleData.today.forEach((o, idx) => {
          msg += `${idx + 1}. ${o.customer?.name || 'ग्राहक'} - शेष ₹${o.balance_amount}\n`;
        });
      } else {
        msg += "आज कोई डिलीवरी निर्धारित नहीं है।";
      }
      return msg;
    } else if (lang === 'te') {
      let msg = `శుభోదయం, ${tailorName}!\n\nవస్త్రసిలై రోజువారీ నివేదిక:\n`;
      msg += `• ఈరోజు డెలివరీలు: ${todayCount} (ఆశించిన వసూలు: ₹${expectedCollection})\n`;
      msg += `• గడువు ముగిసిన ఆర్డర్లు: ${overdueCount}\n`;
      msg += `• మొత్తం బ్యాలెన్స్ వసూళ్లు: ₹${totalPendingBalance}\n\n`;
      
      if (todayCount > 0) {
        msg += "ఈరోజు డెలివరీల జాబితా:\n";
        scheduleData.today.forEach((o, idx) => {
          msg += `${idx + 1}. ${o.customer?.name || 'కస్టమర్'} - బ్యాలెన్స్ ₹${o.balance_amount}\n`;
        });
      } else {
        msg += "ఈరోజు ఎటువంటి డెలివరీలు షెడ్యూల్ చేయబడలేదు.";
      }
      return msg;
    } else {
      let msg = `Good Morning, ${tailorName}!\n\nVastraSilai Morning Summary:\n`;
      msg += `• Today's Deliveries: ${todayCount} (Expected Collection: ₹${expectedCollection})\n`;
      msg += `• Overdue Orders: ${overdueCount}\n`;
      msg += `• Total Outstanding Balance: ₹${totalPendingBalance}\n\n`;
      
      if (todayCount > 0) {
        msg += "Today's Delivery List:\n";
        scheduleData.today.forEach((o, idx) => {
          msg += `${idx + 1}. ${o.customer?.name || 'Customer'} (Balance ₹${o.balance_amount})\n`;
        });
      } else {
        msg += "No deliveries scheduled for today.";
      }
      return msg;
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
        
        {/* Column 1: Daily Scheduler and Custom Message form */}
        <div className="space-y-6">
          
          {/* Card 1: Daily Scheduler Controller */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white font-heading">{t('dailyScheduler')}</h3>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('dailySchedulerDesc')}
              </p>
              
              <div className="p-3 bg-gray-950/65 rounded-xl border border-white/5 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Auto Trigger Time:</span>
                  <span className="text-gray-300 font-mono">08:00 AM Daily</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Recipient Phone:</span>
                  <span className="text-emerald-400 font-mono">{user?.phone || 'Not configured'}</span>
                </div>
              </div>

              {/* Message Preview */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('messagePreview')}</label>
                <div className="whatsapp-wallpaper p-3 rounded-2xl border border-white/5 min-h-[140px] flex flex-col justify-end text-left relative overflow-hidden">
                  <div className="bg-emerald-600/90 text-white rounded-2xl rounded-tr-none p-3 shadow-md max-w-[90%] self-end relative animate-fade-in">
                    <p className="text-[9px] font-bold text-emerald-300 tracking-wider uppercase mb-1">WhatsApp Alert</p>
                    <p className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-left">
                      {getSimulatedMessage()}
                    </p>
                    <div className="absolute right-2 bottom-1 text-[8px] text-emerald-200">
                      08:00 AM
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerDailyRun}
                disabled={schedulerLoading}
                className="w-full neon-btn py-3 rounded-xl text-white font-bold flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-emerald-500/20"
              >
                {schedulerLoading ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{t('triggerDailyNotifications')}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Send Custom WhatsApp */}
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
