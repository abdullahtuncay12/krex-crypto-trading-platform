import React, { useState, useEffect, useRef } from 'react';
import { cryptoAPI } from '../api/client';

export interface Cryptocurrency {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
}

interface CryptoSelectorProps {
  onSelect: (crypto: Cryptocurrency) => void;
}

export const CryptoSelector: React.FC<CryptoSelectorProps> = ({ onSelect }) => {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Cryptocurrency[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch cryptocurrency list on mount
  useEffect(() => {
    const fetchCryptocurrencies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await cryptoAPI.getAll();
        const cryptos = response.data.cryptocurrencies || [];
        setCryptocurrencies(cryptos);
        setFilteredCryptos(cryptos);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load cryptocurrencies');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptocurrencies();
  }, []);

  // Filter cryptocurrencies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCryptos(cryptocurrencies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = cryptocurrencies.filter(
        (crypto) =>
          crypto.symbol.toLowerCase().includes(query) ||
          crypto.name.toLowerCase().includes(query)
      );
      setFilteredCryptos(filtered);
    }
  }, [searchQuery, cryptocurrencies]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
    setSearchQuery('');
    setIsOpen(false);
    onSelect(crypto);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <label htmlFor="crypto-search" className="block text-sm font-medium text-gray-700 mb-1">
        Select Cryptocurrency
      </label>
      
      <div className="relative">
        <input
          id="crypto-search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          placeholder={selectedCrypto ? `${selectedCrypto.symbol} - ${selectedCrypto.name}` : 'Search cryptocurrencies...'}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && !loading && !error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredCryptos.length > 0 ? (
            <ul className="py-1">
              {filteredCryptos.map((crypto) => (
                <li
                  key={crypto.symbol}
                  onClick={() => handleSelect(crypto)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{crypto.symbol}</span>
                      <span className="text-sm text-gray-600 ml-2">{crypto.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${crypto.currentPrice != null ? crypto.currentPrice.toLocaleString() : 'N/A'}
                      </div>
                      <div className={`text-xs ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto.change24h != null ? (crypto.change24h >= 0 ? '+' : '') + crypto.change24h.toFixed(2) + '%' : 'N/A'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No cryptocurrencies found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
