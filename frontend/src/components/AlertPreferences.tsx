import React, { useState, useEffect } from 'react';
import { alertAPI, cryptoAPI } from '../api/client';

export interface AlertPreferences {
  id: string;
  userId: string;
  priceMovementThreshold: number;
  enablePumpAlerts: boolean;
  cryptocurrencies: string[];
  updatedAt: Date;
}

interface Cryptocurrency {
  symbol: string;
  name: string;
}

interface AlertPreferencesProps {
  onSave?: (preferences: AlertPreferences) => void;
}

export const AlertPreferences: React.FC<AlertPreferencesProps> = ({ onSave }) => {
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [availableCryptos, setAvailableCryptos] = useState<Cryptocurrency[]>([]);
  const [priceThreshold, setPriceThreshold] = useState(5);
  const [pumpAlertsEnabled, setPumpAlertsEnabled] = useState(true);
  const [selectedCryptos, setSelectedCryptos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch available cryptocurrencies
      const cryptoResponse = await cryptoAPI.getAll();
      setAvailableCryptos(cryptoResponse.data.cryptocurrencies || []);

      // Fetch existing preferences
      const prefsResponse = await alertAPI.getPreferences();
      const prefs = prefsResponse.data.preferences;

      if (prefs) {
        setPreferences(prefs);
        setPriceThreshold(prefs.priceMovementThreshold);
        setPumpAlertsEnabled(prefs.enablePumpAlerts);
        setSelectedCryptos(prefs.cryptocurrencies);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await alertAPI.updatePreferences({
        priceMovementThreshold: priceThreshold,
        enablePumpAlerts: pumpAlertsEnabled,
        cryptocurrencies: selectedCryptos,
      });

      const savedPrefs = response.data.preferences;
      setPreferences(savedPrefs);
      setSuccessMessage('Preferences saved successfully');
      onSave?.(savedPrefs);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleCrypto = (symbol: string) => {
    setSelectedCryptos(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const selectAll = () => {
    setSelectedCryptos(availableCryptos.map(c => c.symbol));
  };

  const deselectAll = () => {
    setSelectedCryptos([]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Preferences</h3>
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Preferences</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Price Movement Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Movement Threshold: {priceThreshold}%
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={priceThreshold}
            onChange={(e) => setPriceThreshold(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1%</span>
            <span>50%</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Get notified when price changes by more than this percentage
          </p>
        </div>

        {/* Pump Alerts Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pump Detection Alerts
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Receive alerts when sudden price spikes are detected
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPumpAlertsEnabled(!pumpAlertsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              pumpAlertsEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                pumpAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Cryptocurrency Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Monitor Cryptocurrencies
            </label>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Deselect All
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Choose which cryptocurrencies to receive alerts for
          </p>
          <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {availableCryptos.map((crypto) => (
                <label
                  key={crypto.symbol}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCryptos.includes(crypto.symbol)}
                    onChange={() => toggleCrypto(crypto.symbol)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{crypto.symbol}</span>
                    <span className="text-gray-500 ml-1 text-xs">{crypto.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedCryptos.length} cryptocurrency{selectedCryptos.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || selectedCryptos.length === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition ${
              saving || selectedCryptos.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {selectedCryptos.length === 0 && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Please select at least one cryptocurrency
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
