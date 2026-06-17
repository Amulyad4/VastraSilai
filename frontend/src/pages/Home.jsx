import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Scissors, Users, Calendar, Award, MessageSquare, ArrowRight, Languages } from 'lucide-react';

export default function Home({ onNavigate }) {
  const { t, language, changeLanguage } = useLanguage();
  // Home page for tailor registration and login

  return (
    <div className="min-height-screen flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
            <Scissors className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            {t('appName')}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selection */}
          <div className="flex items-center space-x-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5">
            <Languages className="w-4 h-4 text-purple-400" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-sm text-gray-300 border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-gray-950 text-white">{t('english')}</option>
              <option value="hi" className="bg-gray-950 text-white">{t('hindi')}</option>
              <option value="te" className="bg-gray-950 text-white">{t('telugu')}</option>
            </select>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {t('loginBtn')}
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="neon-btn px-5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer"
          >
            {t('registerBtn')}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl mx-auto space-y-6">
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider rounded-full">
            {t('tagline')}
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
            Modernize Your Tailoring Shop <br />
            With <span className="gradient-text font-black">{t('appName')}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ditch the old notebooks! Manage customer measurements, payment status, and order schedules online. Automatically notify customers via WhatsApp reminders.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto neon-btn text-white px-8 py-3.5 rounded-xl font-medium flex items-center justify-center space-x-2 text-base group cursor-pointer"
            >
              <span>{t('registerBtn')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-medium transition text-base cursor-pointer"
            >
              <span>{t('loginBtn')}</span>
            </button>
          </div>
        </div>

        {/* Features list */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-24">
          <div className="glass-card p-6 text-left rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-lg">Digital Measurements</h3>
            <p className="text-sm text-gray-400">Store Chest, Waist, Shoulder lengths digitally. Access measurement histories instantly.</p>
          </div>

          <div className="glass-card p-6 text-left rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-lg">Delivery Scheduling</h3>
            <p className="text-sm text-gray-400">Organize orders into Today's, Overdue, and Upcoming lists. Stay ahead of deadlines.</p>
          </div>

          <div className="glass-card p-6 text-left rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-lg">WhatsApp Alerts</h3>
            <p className="text-sm text-gray-400">Automate daily morning collections summary and send customized payment reminders.</p>
          </div>

          <div className="glass-card p-6 text-left rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-lg">Supabase Storage</h3>
            <p className="text-sm text-gray-400">Your records are secure. No risk of torn or lost notebook pages.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} {t('appName')}. {t('tagline')}. Built for Local Tailors.</p>
      </footer>
    </div>
  );
}
