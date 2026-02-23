import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!token && !!user;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-crypto-dark-800 border-b border-crypto-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 overflow-x-auto">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <svg className="w-8 h-8 text-crypto-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-xl font-bold text-white whitespace-nowrap">Crypto Signals</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 flex-nowrap">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Ana Sayfa
                </Link>
                <Link
                  to="/bot/dashboard"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <Link
                  to="/deposit-withdraw"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Yatırma/Çekme
                </Link>
                <Link
                  to="/support"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Destek
                </Link>
                <Link
                  to="/bot/create"
                  className="px-3 py-2 text-sm font-medium text-crypto-dark-900 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 rounded transition font-semibold whitespace-nowrap"
                >
                  Yeni Yatırım
                </Link>
                <div className="flex items-center space-x-2 px-2 py-1.5 bg-crypto-dark-700 border border-buy/30 rounded whitespace-nowrap">
                  <svg className="w-4 h-4 text-buy flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-buy">
                    ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-2 py-1.5 bg-crypto-dark-700 rounded whitespace-nowrap">
                  <div className="w-7 h-7 bg-gradient-to-br from-crypto-yellow-500 to-crypto-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-crypto-dark-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-200 font-medium">{user?.name}</span>
                </div>
                {user?.role === 'premium' && (
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                    PREMIUM
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Ana Sayfa
                </Link>
                <Link
                  to="/support"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Destek
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition whitespace-nowrap"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium text-crypto-dark-900 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 rounded transition font-semibold whitespace-nowrap"
                >
                  Üye Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
