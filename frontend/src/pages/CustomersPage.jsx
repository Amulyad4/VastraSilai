import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, User, Phone, MapPin, Mail, Upload, Edit, Save, X, BookOpen, Ruler, ArrowLeft, Trash2 } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Selected Customer detail state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [measSavedMsg, setMeasSavedMsg] = useState('');
  
  // Add Customer Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [modalError, setModalError] = useState('');
  
  // Edit Customer Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // File Uploader state
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/customers?search=${search}`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!name || !phone || !gender) {
      setModalError('Please fill in required fields (Name, Phone, Gender)');
      return;
    }
    try {
      await axios.post(`${API_URL}/customers`, {
        name,
        phone,
        gender,
        address: address || null,
        email: email || null
      });
      setShowAddModal(false);
      clearForm();
      fetchCustomers();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create customer');
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      await axios.put(`${API_URL}/customers/${editId}`, {
        name,
        phone,
        gender,
        address: address || null,
        email: email || null
      });
      setShowEditModal(false);
      clearForm();
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.id === editId) {
        // Refresh details
        setSelectedCustomer(prev => ({ ...prev, name, phone, gender, address, email }));
      }
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to update customer');
    }
  };

  const openEditModal = (c) => {
    setEditId(c.id);
    setName(c.name);
    setPhone(c.phone === '0000000000' ? '' : c.phone);
    setGender(c.gender);
    setAddress(c.address || '');
    setEmail(c.email || '');
    setShowEditModal(true);
  };

  const clearForm = () => {
    setName('');
    setPhone('');
    setGender('Male');
    setAddress('');
    setEmail('');
    setModalError('');
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer? This will also remove their measurements and order histories.")) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/customers/${customerId}`);
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert(err.response?.data?.detail || "Failed to delete customer");
    }
  };

  // View Detailed customer info
  const viewCustomerDetails = async (c) => {
    setSelectedCustomer(c);
    setIsEditingMeasurements(false);
    setMeasSavedMsg('');
    try {
      // 1. Fetch measurements
      const measRes = await axios.get(`${API_URL}/customers/${c.id}/measurements`);
      setMeasurements(measRes.data);
      
      // 2. Fetch orders
      const ordersRes = await axios.get(`${API_URL}/orders?customer_id=${c.id}`);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Error fetching profile details:", err);
    }
  };

  const saveMeasurements = async () => {
    setMeasSavedMsg('');
    try {
      const res = await axios.put(`${API_URL}/customers/${selectedCustomer.id}/measurements`, measurements);
      setMeasurements(res.data);
      setIsEditingMeasurements(false);
      setMeasSavedMsg(t('measurementsSaved'));
      setTimeout(() => setMeasSavedMsg(''), 3000);
    } catch (err) {
      alert('Failed to save measurements');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadLoading(true);
    try {
      const res = await axios.post(`${API_URL}/customers/${selectedCustomer.id}/upload-reference`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMeasurements(prev => ({ ...prev, reference_image_url: res.data.reference_image_url }));
    } catch (err) {
      console.error("Upload failed", err);
      alert('Image upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  if (selectedCustomer) {
    // Render Detail View
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <button
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white font-medium transition cursor-pointer mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Customer List</span>
        </button>

        {/* Top Header Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center font-heading font-extrabold text-2xl">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-heading">{selectedCustomer.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-400">
                {selectedCustomer.phone !== '0000000000' && (
                  <span className="flex items-center text-purple-400 font-semibold">{t('phone')}: {selectedCustomer.phone}</span>
                )}
                {selectedCustomer.gender && <span className="capitalize">{t('gender')}: {t(selectedCustomer.gender === 'Male' ? 'genderMale' : selectedCustomer.gender === 'Female' ? 'genderFemale' : 'genderOther')}</span>}
                {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={() => openEditModal(selectedCustomer)}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-1.5 transition"
          >
            <Edit className="w-4 h-4" />
            <span>{t('edit')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Measurements */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white font-heading">{t('measurementsTitle')}</h3>
              </div>
              
              {!isEditingMeasurements ? (
                <button
                  onClick={() => setIsEditingMeasurements(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl px-4 py-2 transition"
                >
                  {t('edit')}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingMeasurements(false)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl px-4 py-2 transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveMeasurements}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl px-4 py-2 transition flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('save')}</span>
                  </button>
                </div>
              )}
            </div>

            {measSavedMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
                {measSavedMsg}
              </div>
            )}

            {/* Measurement Input Form Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: 'chest', label: t('chest') },
                { key: 'waist', label: t('waist') },
                { key: 'shoulder', label: t('shoulder') },
                { key: 'sleeve', label: t('sleeve') },
                { key: 'length', label: t('length') },
                { key: 'neck', label: t('neck') },
                { key: 'hip', label: t('hip') }
              ].map(field => (
                <div key={field.key} className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</label>
                  {isEditingMeasurements ? (
                    <input
                      type="number"
                      step="0.1"
                      value={measurements[field.key] || ''}
                      onChange={(e) => setMeasurements({ ...measurements, [field.key]: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900/60 border border-white/10 focus:border-purple-500 rounded-lg px-2 py-1 text-white text-base text-center"
                    />
                  ) : (
                    <div className="text-xl font-bold text-white tracking-tight mt-1 text-center">
                      {measurements[field.key] ? `${measurements[field.key]}"` : '-'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('notes')}</label>
              {isEditingMeasurements ? (
                <textarea
                  value={measurements.notes || ''}
                  onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                  rows="3"
                  placeholder="Insert customer requirements, neck styles, sleeve cuts, buttons preference..."
                  className="w-full bg-gray-900/60 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 min-h-[80px]">
                  {measurements.notes || 'No design notes logged.'}
                </div>
              )}
            </div>

            {/* Reference Image Uploader */}
            <div className="space-y-3 text-left pt-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('referenceImage')}</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Upload Action */}
                <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-semibold text-white">{t('uploadBtn')}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{t('uploadPlaceholder')}</span>
                    </>
                  )}
                </div>

                {/* Image Display */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2 flex items-center justify-center h-40 relative overflow-hidden">
                  {measurements.reference_image_url ? (
                    <img
                      src={measurements.reference_image_url}
                      alt="Design Reference Sketch"
                      className="max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-xs text-gray-600">No Reference Sketch</span>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Column 3: Customer History Log */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white font-heading">{t('orderHistory')}</h3>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t('noOrdersYet')}</p>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {orders.map(o => (
                  <div key={o.id} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white capitalize">{t(o.cloth_type)}</span>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        o.status === 'Delivered' ? 'bg-blue-500/10 text-blue-400' :
                        o.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {o.status === 'Delivered' ? t('statusDelivered') :
                         o.status === 'Completed' ? t('statusCompleted') :
                         t('statusPending')}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Delivery: {o.delivery_date}</span>
                      <span className="text-white font-semibold">₹{o.total_amount}</span>
                    </div>

                    <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/5 text-gray-500">
                      <span>Paid: ₹{o.advance_amount}</span>
                      <span className="text-amber-400">Bal: ₹{o.balance_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('customerList')}</h2>
          <p className="text-gray-400 text-sm">Create and browse customer measurements</p>
        </div>
        <button
          onClick={() => { clearForm(); setShowAddModal(true); }}
          className="neon-btn text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* Search Bar & Stats */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass-panel pl-10 pr-4 py-3 rounded-2xl text-base text-white border border-white/5 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Customer Registry Table */}
      <div className="glass-panel rounded-3xl border border-white/5 text-left overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p>No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">{t('name')}</th>
                  <th className="px-6 py-4">{t('phone')}</th>
                  <th className="px-6 py-4">{t('address')}</th>
                  <th className="px-6 py-4">{t('email')}</th>
                  <th className="px-6 py-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{c.name}</td>
                    <td className="px-6 py-4">{c.phone === '0000000000' ? '-' : c.phone}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate">{c.address || '-'}</td>
                    <td className="px-6 py-4">{c.email || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => viewCustomerDetails(c)}
                          className="bg-purple-600/10 hover:bg-purple-600/30 text-purple-400 p-2 rounded-xl transition cursor-pointer"
                          title={t('viewDetails')}
                        >
                          <Ruler className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl border border-white/5 transition"
                          title={t('edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="bg-red-600/10 hover:bg-red-600/30 text-red-400 px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1 text-xs font-bold"
                          title="Remove customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-md text-left animate-fade-in relative my-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-4">{t('addCustomer')}</h3>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('name')} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                  placeholder="Enter the full name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('phone')} *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                  placeholder="Enter the phone no"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('gender')} *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                >
                  <option value="Male" className="bg-gray-950 text-white">Male</option>
                  <option value="Female" className="bg-gray-950 text-white">Female</option>
                  <option value="Other" className="bg-gray-950 text-white">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('address')}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  placeholder="Enter the address"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                  placeholder="Enter the email address"
                />
              </div>

              <button
                type="submit"
                className="w-full neon-btn py-3 rounded-xl text-white font-semibold flex items-center justify-center space-x-1.5"
              >
                <span>{t('save')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-md text-left animate-fade-in relative my-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-4">{t('editCustomer')}</h3>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('name')} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('phone')} *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('gender')} *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                >
                  <option value="Male" className="bg-gray-950 text-white">Male</option>
                  <option value="Female" className="bg-gray-950 text-white">Female</option>
                  <option value="Other" className="bg-gray-950 text-white">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('address')}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                />
              </div>

              <button
                type="submit"
                className="w-full neon-btn py-3 rounded-xl text-white font-semibold flex items-center justify-center space-x-1.5"
              >
                <span>{t('save')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
