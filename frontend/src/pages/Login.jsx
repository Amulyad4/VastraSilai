import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Phone, Lock, User, Mail, ChevronRight, Languages, AlertCircle, CheckCircle, Eye, EyeOff, Store, MapPin } from 'lucide-react';

export default function Login({ initialMode = 'login', onNavigate }) {
  const { login, registerUser } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  
  const [mode, setMode] = useState(initialMode); // 'login', 'register'
  const [defaultLang, setDefaultLang] = useState(language);
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLangChange = (lang) => {
    setDefaultLang(lang);
    changeLanguage(lang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!name || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(name, password, 'tailor');
      if (userData.role === 'tailor') {
        onNavigate('tailor_dashboard');
      } else {
        // Fallback (should not happen for tailor-only login page)
        onNavigate('home');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!name || !shopName || !phone || !address || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Phone number must contain at least 10 digits');
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Calling registerUser from form...");
      const userData = await registerUser(
        name,
        phone,
        email || null,
        password,
        'tailor',
        defaultLang,
        shopName,
        address,
        true // Enable auto-login
      );
      console.log("registerUser resolved in form, user data:", userData);
      localStorage.setItem('just_registered', 'true');
      if (userData && userData.role === 'tailor') {
        console.log("Navigating to tailor_dashboard");
        onNavigate('tailor_dashboard');
      } else {
        console.log("Navigating to home");
        onNavigate('home');
      }
    } catch (err) {
      console.error("handleRegister catch:", err);
      alert("handleRegister failed: " + err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative animate-fade-in bg-gray-950">
      
      {/* Language Switcher */}
      <div className="absolute top-10 right-10 flex items-center space-x-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 z-50">
        <Languages className="w-4 h-4 text-purple-400" />
        <select
          value={language}
          onChange={(e) => handleLangChange(e.target.value)}
          className="bg-transparent text-sm text-gray-300 border-none focus:outline-none cursor-pointer pr-1"
        >
          <option value="en" className="bg-gray-950 text-white">{t('english')}</option>
          <option value="hi" className="bg-gray-950 text-white">{t('hindi')}</option>
          <option value="te" className="bg-gray-950 text-white">{t('telugu')}</option>
        </select>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
            <Scissors className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">{t('appName')}</h2>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Tailor Portal</span>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative">
          
          <div className="mb-6 text-center">
            <h3 className="text-white text-xl font-bold">
              {mode === 'login' ? 'Tailor Login' : 'Tailor Registration'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'login' 
                ? 'Sign in to access your digital workspace' 
                : 'Create an account to digitize your tailoring shop'}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tailor Name or Phone
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    key="login-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    key="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-10 py-3 rounded-xl text-base"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn py-3.5 rounded-xl font-medium text-white flex items-center justify-center space-x-2 text-base pt-2 cursor-pointer"
              >
                <span>{loading ? t('loading') : t('loginBtn')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tailor Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    key="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Shop Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Store className="w-5 h-5" />
                  </span>
                  <input
                    key="register-shopname"
                    type="text"
                    name="shopName"
                    autoComplete="off"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter shop name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    key="register-phone"
                    type="text"
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    key="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <input
                    key="register-address"
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter shop address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password *</label>
                  <div className="relative">
                    <input
                      key="register-password"
                      type={showPassword ? "text" : "password"}
                      name="new-password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-input pl-4 pr-10 py-3 rounded-xl text-base"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm *</label>
                  <div className="relative">
                    <input
                      key="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm-password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass-input pl-4 pr-10 py-3 rounded-xl text-base"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn py-3.5 rounded-xl font-medium text-white flex items-center justify-center space-x-2 text-base mt-2 cursor-pointer"
              >
                <span>{loading ? t('loading') : t('registerBtn')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Toggle register/login links */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            {mode === 'login' ? (
              <button
                onClick={() => { setError(''); setSuccessMsg(''); setMode('register'); }}
                className="text-sm text-gray-400 hover:text-purple-300 transition cursor-pointer"
              >
                Don't have an account? Register here
              </button>
            ) : (
              <button
                onClick={() => { setError(''); setSuccessMsg(''); setMode('login'); }}
                className="text-sm text-gray-400 hover:text-purple-300 transition cursor-pointer"
              >
                Already have an account? Login here
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
