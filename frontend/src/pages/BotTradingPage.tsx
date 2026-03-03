import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createInvestment, clearError } from '../store/slices/botInvestmentSlice';
import RiskDisclosureModal from '../components/RiskDisclosureModal';
import { useLanguage } from '../contexts/LanguageContext';

const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'BNB', label: 'Binance Coin (BNB)' },
  { value: 'SOL', label: 'Solana (SOL)' },
  { value: 'ADA', label: 'Cardano (ADA)' },
];

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 100000;

export const BotTradingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { loading, error } = useAppSelector((state) => state.botInvestment);
  const { t } = useLanguage();

  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(24);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
  }>({});

  // Trading periods with translations
  const TRADING_PERIODS = [
    { value: 1, label: t('botTrading.periods.1') },
    { value: 2, label: t('botTrading.periods.2') },
    { value: 3, label: t('botTrading.periods.3') },
    { value: 4, label: t('botTrading.periods.4') },
    { value: 5, label: t('botTrading.periods.5') },
    { value: 6, label: t('botTrading.periods.6') },
    { value: 12, label: t('botTrading.periods.12') },
    { value: 24, label: t('botTrading.periods.24') },
    { value: 48, label: t('botTrading.periods.48') },
    { value: 60, label: t('botTrading.periods.60') },
  ];

  // Redirect if not premium
  useEffect(() => {
    if (user && user.role !== 'premium') {
      navigate('/');
    }
  }, [user, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateAmount = (value: string): boolean => {
    const errors: { amount?: string } = {};
    const numValue = parseFloat(value);

    if (!value) {
      errors.amount = t('botTrading.errors.amountRequired');
    } else if (isNaN(numValue)) {
      errors.amount = t('botTrading.errors.amountInvalid');
    } else if (numValue < MIN_AMOUNT) {
      errors.amount = t('botTrading.errors.amountTooLow').replace('{min}', MIN_AMOUNT.toString());
    } else if (numValue > MAX_AMOUNT) {
      errors.amount = t('botTrading.errors.amountTooHigh').replace('{max}', MAX_AMOUNT.toLocaleString());
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (validationErrors.amount) {
      setValidationErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateAmount(amount)) {
      return;
    }

    // Show risk disclosure modal if not acknowledged
    if (!riskAcknowledged) {
      setShowRiskModal(true);
      return;
    }

    // Create investment
    const result = await dispatch(
      createInvestment({
        cryptocurrency: selectedCrypto,
        principalAmount: parseFloat(amount),
        tradingPeriodHours: period,
        riskAcknowledgedAt: new Date(),
      })
    );

    // Navigate to dashboard on success
    if (createInvestment.fulfilled.match(result)) {
      navigate('/bot/dashboard');
    }
  };

  const handleRiskAcknowledge = () => {
    setRiskAcknowledged(true);
    setShowRiskModal(false);
    // Automatically submit after acknowledgment
    handleSubmit(new Event('submit') as any);
  };

  const handleRiskCancel = () => {
    setShowRiskModal(false);
  };

  if (!user || user.role !== 'premium') {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {t('botTrading.title')}
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          {t('botTrading.description')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Cryptocurrency Selector */}
        <div>
          <label htmlFor="cryptocurrency" className="block text-sm font-medium text-gray-700 mb-1">
            {t('botTrading.cryptoLabel')}
          </label>
          <select
            id="cryptocurrency"
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
              <option key={crypto.value} value={crypto.value}>
                {crypto.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            {t('botTrading.amountLabel')}
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              validationErrors.amount
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder={t('botTrading.amountPlaceholder')}
            disabled={loading}
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step="0.01"
          />
          {validationErrors.amount && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {t('botTrading.amountMin')}: {MIN_AMOUNT} USDT, {t('botTrading.amountMax')}: {MAX_AMOUNT.toLocaleString()} USDT
          </p>
        </div>

        {/* Trading Period Selector */}
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
            {t('botTrading.periodLabel')}
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {TRADING_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {t('botTrading.periodHelp')}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? t('botTrading.submitting') : t('botTrading.submitButton')}
        </button>
      </form>

      {/* Risk Information */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm text-yellow-800 font-semibold">{t('botTrading.riskWarningTitle')}</p>
            <p className="text-sm text-yellow-700 mt-1">
              {t('botTrading.riskWarningText')}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Disclosure Modal */}
      <RiskDisclosureModal
        isOpen={showRiskModal}
        onAcknowledge={handleRiskAcknowledge}
        onCancel={handleRiskCancel}
      />
    </div>
  );
};
