import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SplashScreen } from './components/SplashScreen';
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BotTradingPage } from './pages/BotTradingPage';
import { InvestmentDashboard } from './pages/InvestmentDashboard';
import { DepositWithdrawPage } from './pages/DepositWithdrawPage';
import { SupportPage } from './pages/SupportPage';
import { FreeTrialPage } from './pages/FreeTrial';
import { PremiumUpgradePage } from './pages/PremiumUpgradePage';
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
      <SplashScreen />
      <div className="min-h-screen bg-white dark:bg-space-gradient transition-colors duration-200 relative">
        {/* Space theme stars - only visible in dark mode */}
        <div className="dark:block hidden fixed inset-0 overflow-hidden pointer-events-none">
          {/* Large stars */}
          <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-[20%] right-[25%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[40%] left-[35%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-[75%] left-[45%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-[30%] right-[40%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '2.5s' }}></div>
          
          {/* Small stars */}
          <div className="absolute top-[15%] left-[25%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-[25%] right-[35%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '1.3s' }}></div>
          <div className="absolute top-[45%] left-[55%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '2.3s' }}></div>
          <div className="absolute top-[65%] right-[45%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute top-[80%] left-[65%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '1.8s' }}></div>
          <div className="absolute top-[35%] right-[55%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '2.8s' }}></div>
          <div className="absolute top-[50%] left-[20%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-[70%] right-[30%] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '1.2s' }}></div>
          
          {/* Tiny stars */}
          <div className="absolute top-[12%] left-[40%] w-px h-px bg-white/40 rounded-full animate-twinkle" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute top-[28%] right-[20%] w-px h-px bg-white/40 rounded-full animate-twinkle" style={{ animationDelay: '1.6s' }}></div>
          <div className="absolute top-[48%] left-[70%] w-px h-px bg-white/40 rounded-full animate-twinkle" style={{ animationDelay: '2.6s' }}></div>
          <div className="absolute top-[68%] right-[60%] w-px h-px bg-white/40 rounded-full animate-twinkle" style={{ animationDelay: '0.9s' }}></div>
          <div className="absolute top-[85%] left-[30%] w-px h-px bg-white/40 rounded-full animate-twinkle" style={{ animationDelay: '1.9s' }}></div>
        </div>
        
        <div className="relative z-10">
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
            <Route path="/free-trial" element={<FreeTrialPage />} />
            <Route path="/premium" element={<PremiumUpgradePage />} />
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
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
