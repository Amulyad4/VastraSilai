import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, User, Phone, MapPin, Mail, Upload, Edit, Save, X, BookOpen, Ruler, ArrowLeft, Trash2, Image } from 'lucide-react';
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
    if (!name || !phone || !gender) {
      setModalError('Please fill in required fields (Name, Phone, Gender)');
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/customers/${editId}`, {
        name,
        phone,
        gender,
        address: address || null,
        email: email || null
      });
      const updated = res.data;
      setShowEditModal(false);
      clearForm();
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.id === editId) {
        // Refresh details
        setSelectedCustomer(prev => ({
          ...prev,
          name: updated.name,
          phone: updated.phone,
          gender: updated.gender,
          address: updated.address,
          email: updated.email
        }));
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

  const renderEditModal = () => {
    if (!showEditModal) return null;
    return createPortal(
      <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-center p-4">
        <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-md text-left animate-fade-in relative">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white modal-close-btn"
          >
            <X className="w-5 h-5" strokeWidth={4} />
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
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                placeholder="Enter the email address"
              />
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

            <button
              type="submit"
              className="w-full neon-btn py-3.5 rounded-xl text-white font-bold flex items-center justify-center space-x-1.5 mt-2 cursor-pointer"
            >
              <span>{t('save')}</span>
            </button>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  if (selectedCustomer) {
    // Render Detail View
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <button
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-white font-semibold transition cursor-pointer mb-4 group back-to-list-btn"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-white transition-colors" />
          <span>Back to Customer List</span>
        </button>

        {/* Top Header Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          {/* Subtle colored accent top border */}
          <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>

          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-heading font-extrabold text-2xl shadow-lg shadow-purple-500/15 border border-purple-400/20">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white font-heading">{selectedCustomer.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {selectedCustomer.phone !== '0000000000' && (
                  <span className="bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-900/30 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                    {selectedCustomer.phone}
                  </span>
                )}
                {selectedCustomer.gender && (
                  <span className="capitalize bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-900/30 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                    {t(selectedCustomer.gender === 'Male' ? 'genderMale' : selectedCustomer.gender === 'Female' ? 'genderFemale' : 'genderOther')}
                  </span>
                )}
                {selectedCustomer.email && (
                  <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-900/30 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                    {selectedCustomer.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3.5">
            <button
              onClick={() => openEditModal(selectedCustomer)}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/10 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Edit className="w-4 h-4" strokeWidth={2.5} />
              <span>{t('edit')}</span>
            </button>
            <button
              onClick={() => {
                handleDeleteCustomer(selectedCustomer.id);
                setSelectedCustomer(null);
              }}
              className="bg-red-50 hover:bg-red-100 dark:bg-red-950/15 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl px-5 py-2.5 text-sm font-bold flex items-center space-x-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              <span>Remove</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Measurements */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col space-y-6 relative overflow-hidden">
            {/* Subtle colored accent top border */}
            <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>

            <div className="flex justify-between items-center pb-4 border-b border-white/5 pt-2">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-gray-800 dark:text-white font-heading">{t('measurementsTitle')}</h3>
              </div>
              
              {!isEditingMeasurements ? (
                <button
                  onClick={() => setIsEditingMeasurements(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md shadow-purple-600/10 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>{t('edit')}</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingMeasurements(false)}
                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-white bg-purple-600/5 hover:bg-purple-600/10 dark:bg-white/5 dark:hover:bg-white/10 border border-purple-500/10 hover:border-purple-500/30 dark:border-white/5 dark:hover:border-purple-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveMeasurements}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl px-4 py-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center space-x-1 shadow-sm shadow-purple-600/10 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                <div key={field.key} className="measurement-card space-y-1.5 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02]">
                  <label className="measurement-label text-[11px] font-black uppercase tracking-wider block mb-1">{field.label}</label>
                  {isEditingMeasurements ? (
                    <input
                      type="number"
                      step="0.1"
                      value={measurements[field.key] || ''}
                      onChange={(e) => setMeasurements({ ...measurements, [field.key]: parseFloat(e.target.value) || 0 })}
                      className="measurement-input w-full rounded-xl px-2 py-2 text-base font-bold text-center transition-all focus:outline-none placeholder-gray-400"
                    />
                  ) : (
                    <div className="text-xl font-black text-gray-800 dark:text-white tracking-tight mt-1 text-center">
                      {measurements[field.key] ? `${measurements[field.key]}"` : '-'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="space-y-2 text-left">
              <label className="measurement-label text-xs font-black uppercase tracking-wider block mb-1.5">{t('notes')}</label>
              {isEditingMeasurements ? (
                <textarea
                  value={measurements.notes || ''}
                  onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                  rows="3"
                  placeholder="Insert customer requirements, neck styles, sleeve cuts, buttons preference..."
                  className="measurement-textarea w-full rounded-2xl px-4 py-3 text-sm transition-all focus:outline-none placeholder-gray-400"
                />
              ) : (
                <div className="measurement-card border rounded-2xl p-4.5 text-sm text-gray-700 dark:text-gray-300 min-h-[80px] transition-all duration-300">
                  {measurements.notes || 'No design notes logged.'}
                </div>
              )}
            </div>

            {/* Reference Image Uploader */}
            <div className="space-y-3 text-left pt-2">
              <label className="measurement-label text-xs font-black uppercase tracking-wider block mb-1.5">{t('referenceImage')}</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Upload Action */}
                <div className="measurement-card border-2 border-dashed border-purple-500/20 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition relative hover:scale-[1.01] duration-300">
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
                      <Upload className="w-8 h-8 text-purple-500 dark:text-gray-400 mb-2" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-gray-850 dark:text-white">{t('uploadBtn')}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{t('uploadPlaceholder')}</span>
                    </>
                  )}
                </div>

                {/* Image Display */}
                <div className="measurement-card border rounded-2xl p-2 flex items-center justify-center h-40 relative overflow-hidden transition-all duration-300">
                  {measurements.reference_image_url ? (
                    <img
                      src={measurements.reference_image_url}
                      alt="Design Reference Sketch"
                      className="max-h-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-650">No Reference Sketch</span>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Column 3: Customer History Log */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-bold text-white font-heading">{t('orderHistory')}</h3>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t('noOrdersYet')}</p>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {orders.map(o => (
                  <div key={o.id} className="bg-purple-600/5 dark:bg-white/5 border border-purple-500/5 dark:border-white/5 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800 dark:text-white capitalize">{t(o.cloth_type)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                        o.status === 'In Progress' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                        'bg-gray-500/10 text-gray-500 dark:text-gray-400'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Delivery: {o.delivery_date}</span>
                      <span className="text-white font-semibold">₹{o.total_amount}</span>
                    </div>

                    {o.description && (
                      <p className="text-xs text-gray-400 italic bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                        {o.description}
                      </p>
                    )}

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
        {renderEditModal()}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
       {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('customers')}</h2>
          <p className="text-gray-400 text-sm">Build lasting relationships with every stitch.</p>
        </div>
        <button
          onClick={() => { clearForm(); setShowAddModal(true); }}
          className="bg-purple-600 hover:bg-purple-500 text-white rounded-full px-8 py-3.5 text-base font-extrabold flex items-center shadow-lg shadow-purple-600/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-3xl">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-600 dark:text-gray-400">
          <Search className="w-4.5 h-4.5" strokeWidth={3} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass-panel pl-11 pr-4 py-3 rounded-full text-base text-gray-800 dark:text-white border border-purple-500/10 focus:border-purple-500/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/10 shadow-sm shadow-purple-600/5 transition-all"
          placeholder="Search by name or mobile..."
        />
      </div>

      {/* Customer Registry Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/5 py-20 text-center text-gray-500 text-sm">
          <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {customers.map((c) => {
            // Helper to get initials
            const nameParts = c.name.trim().split(/\s+/);
            const initials = nameParts.length > 1
              ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
              : nameParts[0][0]?.toUpperCase() || '?';

            return (
              <div
                key={c.id}
                onClick={() => viewCustomerDetails(c)}
                className="glass-card customer-card p-8 rounded-3xl border border-white/5 hover:border-purple-500/35 transition duration-300 flex flex-col justify-between cursor-pointer group hover:shadow-xl hover:shadow-purple-950/5 relative overflow-hidden min-h-[140px]"
              >
                {/* Top blue accent border line */}
                <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#2563eb] dark:bg-[#3b82f6]"></div>

                <div className="space-y-4">
                  {/* Top: Avatar, Name & Phone */}
                  <div className="flex items-center space-x-4.5 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center font-heading font-extrabold text-lg flex-shrink-0 shadow-md shadow-purple-600/10">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-black text-gray-800 dark:text-white font-heading truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {c.name}
                        </h4>
                        {c.order_count >= 5 && (
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-500/25 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 flex items-center mt-1.5 font-semibold">
                        <Phone className="w-4 h-4 mr-1 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span>{c.phone === '0000000000' ? '-' : c.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Single Stat: Orders */}
                  <div className="bg-purple-50/80 dark:bg-white/5 border border-purple-100 dark:border-white/5 px-4 py-2.5 rounded-2xl flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Orders
                    </span>
                    <span className="bg-purple-600 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-sm shadow-purple-600/10">
                      {c.order_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-center p-4">
          <div className="glass-panel border border-white/5 p-6 rounded-3xl w-full max-w-md text-left animate-fade-in relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white modal-close-btn"
            >
              <X className="w-5 h-5" strokeWidth={4} />
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
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                  placeholder="Enter the email address"
                />
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

              <button
                type="submit"
                className="w-full neon-btn py-3.5 rounded-xl text-white font-bold flex items-center justify-center space-x-1.5 mt-2 cursor-pointer"
              >
                <span>{t('save')}</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {renderEditModal()}

    </div>
  );
}
