import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import { LanguageProvider } from './contexts/LanguageContext';
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BotTradingPage } from './pages/BotTradingPage';
import { InvestmentDashboard } from './pages/InvestmentDashboard';
import { DepositWithdrawPage } from './pages/DepositWithdrawPage';
import { SupportPage } from './pages/SupportPage';
import { Navbar, PrivateRoute } from './components';

function AppContent() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If we have a token but no user, fetch the current user
    if (token && !user) {
      dispatch(fetchCurrentUser() as any);
    }
  }, [token, user, dispatch]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-crypto-dark-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/deposit-withdraw" 
            element={
              <PrivateRoute>
                <DepositWithdrawPage />
              </PrivateRoute>
            } 
          />
          <Route path="/support" element={<SupportPage />} />
          <Route 
            path="/bot/create" 
            element={
              <PrivateRoute requirePremium>
                <BotTradingPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/bot/dashboard" 
            element={
              <PrivateRoute requirePremium>
                <InvestmentDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Provider>
  );
}

export default App;
