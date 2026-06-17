import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Settings, User, Languages, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback States
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLanguageSelect = async (lang) => {
    setError('');
    setSuccess('');
    changeLanguage(lang);
    try {
      await updateProfile({ language: lang });
      setSuccess('Language settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update language on server profile');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name) {
      setError('Name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ name, email: email || null });
      setSuccess('Profile details updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in password fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ password });
      setPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('settings')}</h2>
        <p className="text-gray-400 text-sm">Customize application language and manage credentials</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Box 1: Multilingual settings */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Languages className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white font-heading">{t('language')} Settings</h3>
          </div>
          
          <div className="space-y-3 pt-2">
            {[
              { code: 'en', label: t('english') },
              { code: 'hi', label: t('hindi') },
              { code: 'te', label: t('telugu') }
            ].map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full py-3 px-4 rounded-xl border text-left text-sm font-semibold transition flex justify-between items-center ${
                  language === lang.code
                    ? 'bg-purple-600/15 border-purple-500 text-purple-300'
                    : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                }`}
              >
                <span>{lang.label}</span>
                {language === lang.code && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Box 2: Profile Settings */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white font-heading">Profile Details</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>Update Profile Info</span>
            </button>
          </form>

          {/* Password Reset form */}
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3 pt-6">
            <Lock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white font-heading">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('password')} *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                  placeholder="New password"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('confirmPassword')} *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-base"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>Save New Password</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
