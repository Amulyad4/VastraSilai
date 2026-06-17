import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';
import DeliveriesPage from './pages/DeliveriesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/Settings';
import Layout from './components/Layout';

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');

  // Sync navigation on auth load/change
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'tailor') {
          // If tailor is active, keep or redirect
          if (!page.startsWith('tailor_')) {
            setPage('tailor_dashboard');
          }
        }
      } else {
        // If not logged in, redirect to home if they are in private pages
        if (page !== 'home' && page !== 'login' && page !== 'register') {
          setPage('home');
        }
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <span className="font-semibold text-sm">Validating credentials...</span>
      </div>
    );
  }

  // Navigation controller
  const navigateTo = (destination) => {
    setPage(destination);
  };

  // Render private tailor screens
  const renderTailorScreen = () => {
    switch (page) {
      case 'tailor_dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'tailor_customers':
        return <CustomersPage />;
      case 'tailor_orders':
        return <OrdersPage />;
      case 'tailor_payments':
        return <PaymentsPage />;
      case 'tailor_deliveries':
        return <DeliveriesPage />;
      case 'tailor_analytics':
        return <AnalyticsPage />;
      case 'tailor_notifications':
        return <NotificationsPage />;
      case 'tailor_settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  // Main page selector
  if (page === 'home') {
    return <Home onNavigate={navigateTo} />;
  }
  if (page === 'login') {
    return <Login initialMode="login" onNavigate={navigateTo} />;
  }

  if (page === 'register') {
    return <Login initialMode="register" onNavigate={navigateTo} />;
  }


  // If tailor pages
  if (page.startsWith('tailor_')) {
    return (
      <Layout activePage={page} onNavigate={navigateTo}>
        {renderTailorScreen()}
      </Layout>
    );
  }

  // Fallback
  return <Home onNavigate={navigateTo} />;
}
