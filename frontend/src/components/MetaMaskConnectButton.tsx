import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  connectMetaMask,
  disconnectMetaMask,
  setWalletAddress,
  setChainId,
  updateBalance,
} from '../store/slices/cryptoPaymentSlice';
import * as metamask from '../utils/metamask';
import { useLanguage } from '../contexts/LanguageContext';

export const MetaMaskConnectButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { language } = useLanguage();
  const {
    walletAddress,
    isConnected,
    isConnecting,
    networkName,
    isNetworkSupported,
    balance,
    error,
  } = useSelector((state: RootState) => state.cryptoPayment);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = metamask.isMetaMaskInstalled();

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const cleanup = metamask.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        dispatch(disconnectMetaMask());
      } else {
        // Account changed
        dispatch(setWalletAddress(accounts[0]));
        if (accounts[0]) {
          dispatch(updateBalance(accounts[0]));
        }
      }
    });

    return cleanup;
  }, [dispatch, isMetaMaskInstalled]);

  // Listen for network changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const cleanup = metamask.onChainChanged((chainId) => {
      dispatch(setChainId(chainId));
      // Reload balance when network changes
      if (walletAddress) {
        dispatch(updateBalance(walletAddress));
      }
    });

    return cleanup;
  }, [dispatch, isMetaMaskInstalled, walletAddress]);

  const handleConnect = async () => {
    dispatch(connectMetaMask());
  };

  const handleDisconnect = () => {
    dispatch(disconnectMetaMask());
  };

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <div className="flex flex-col items-center space-y-3 p-4 bg-crypto-dark-700 rounded-lg border border-crypto-dark-500">
        <div className="flex items-center space-x-2 text-yellow-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">
            {language === 'tr' ? 'MetaMask Yüklü Değil' : 'MetaMask Not Installed'}
          </span>
        </div>
        <p className="text-xs text-gray-400 text-center">
          {language === 'tr'
            ? 'Kripto para ile ödeme yapmak için MetaMask eklentisini yüklemeniz gerekiyor.'
            : 'You need to install the MetaMask extension to make crypto payments.'}
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 rounded font-semibold text-sm transition"
        >
          {language === 'tr' ? 'MetaMask Yükle' : 'Install MetaMask'}
        </a>
      </div>
    );
  }

  // Connected state
  if (isConnected && walletAddress) {
    return (
      <div className="flex flex-col space-y-3 p-4 bg-crypto-dark-700 rounded-lg border border-crypto-dark-500">
        {/* Wallet info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-crypto-yellow-500 to-crypto-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-crypto-dark-900" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {metamask.formatAddress(walletAddress)}
              </p>
              <p className="text-xs text-gray-400">{networkName}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 text-xs text-gray-300 hover:text-white hover:bg-crypto-dark-600 rounded transition"
          >
            {language === 'tr' ? 'Bağlantıyı Kes' : 'Disconnect'}
          </button>
        </div>

        {/* Balance */}
        {balance && (
          <div className="flex items-center justify-between pt-2 border-t border-crypto-dark-500">
            <span className="text-xs text-gray-400">
              {language === 'tr' ? 'Bakiye' : 'Balance'}:
            </span>
            <span className="text-sm font-semibold text-white">{balance} ETH</span>
          </div>
        )}

        {/* Network warning */}
        {!isNetworkSupported && (
          <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-yellow-500">
              {language === 'tr'
                ? 'Desteklenmeyen ağ. Lütfen Ethereum, Polygon veya BSC ağına geçin.'
                : 'Unsupported network. Please switch to Ethereum, Polygon, or BSC.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state - show connect button
  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-crypto-dark-700 rounded-lg border border-crypto-dark-500">
      <div className="flex items-center space-x-2">
        <svg className="w-6 h-6 text-crypto-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-white">
          {language === 'tr' ? 'Cüzdan Bağlantısı' : 'Wallet Connection'}
        </span>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {language === 'tr'
          ? 'Kripto para ile ödeme yapmak için MetaMask cüzdanınızı bağlayın.'
          : 'Connect your MetaMask wallet to make crypto payments.'}
      </p>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full px-4 py-2 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-crypto-dark-900 rounded font-semibold text-sm transition flex items-center justify-center space-x-2"
      >
        {isConnecting ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{language === 'tr' ? 'Bağlanıyor...' : 'Connecting...'}</span>
          </>
        ) : (
          <span>{language === 'tr' ? 'MetaMask ile Bağlan' : 'Connect with MetaMask'}</span>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="w-full p-2 bg-sell/10 border border-sell/30 rounded">
          <p className="text-xs text-sell text-center">{error}</p>
        </div>
      )}
    </div>
  );
};
