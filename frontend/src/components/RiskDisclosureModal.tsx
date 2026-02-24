/**
 * Risk Disclosure Modal Component
 * 
 * Displays risk warnings and requires explicit user acknowledgment
 * before allowing bot trading investment creation.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React, { useState } from 'react';

interface RiskDisclosureModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  onCancel: () => void;
}

const RiskDisclosureModal: React.FC<RiskDisclosureModalProps> = ({
  isOpen,
  onAcknowledge,
  onCancel,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleAcknowledge = () => {
    if (acknowledged) {
      onAcknowledge();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Akıllı Trading Sistemi Bilgilendirmesi
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-sm text-green-800 font-semibold">
                ✓ Gelişmiş Risk Yönetimi: Otomatik stop-loss sistemi ile maksimum %5 zarar koruması
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-800 text-sm font-bold">1</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    🛡️ Otomatik Zarar Kesme (Stop-Loss)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sistemimiz her işlemde otomatik stop-loss kullanır. Maksimum zarar %5 ile sınırlıdır.
                    Yapay zeka destekli algoritmalarımız piyasa volatilitesini sürekli izler ve riskleri minimize eder.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-800 text-sm font-bold">2</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    🤖 Akıllı Algoritma Sistemi
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Üst düzey yapay zeka ve makine öğrenmesi teknolojileri ile donatılmış sistemimiz,
                    piyasa trendlerini analiz eder ve en uygun alım-satım zamanlarını belirler.
                    Minimum zarar, maksimum kar mantığıyla çalışır.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-800 text-sm font-bold">3</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    📊 7/24 Piyasa Takibi
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Botumuz kesintisiz çalışır ve piyasadaki fırsatları kaçırmaz. Teknik analiz,
                    hacim analizi ve trend takibi ile en karlı işlemleri gerçekleştirir.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-800 text-sm font-bold">4</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    💰 Şeffaf Ücretlendirme
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sadece kar ettiğinizde %1 komisyon alınır. Zarar durumunda hiçbir ücret yoktur.
                    Erken iptal durumunda ana paranızın %2'si işlem ücreti olarak kesilir.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-800 text-sm font-bold">5</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    ⚠️ Genel Risk Uyarısı
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Kripto para piyasaları volatildir. Sistemimiz gelişmiş koruma mekanizmalarına sahip olsa da,
                    yatırım kararlarınızın sorumluluğu size aittir. Sadece kaybetmeyi göze alabileceğiniz
                    miktarla yatırım yapmanızı öneririz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Yukarıdaki bilgileri okudum ve anladım. Akıllı trading sisteminin %5 maksimum zarar
                koruması ile çalıştığını ve yatırım kararımın sorumluluğunun bana ait olduğunu kabul ediyorum.
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              İptal
            </button>
            <button
              onClick={handleAcknowledge}
              disabled={!acknowledged}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                acknowledged
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Anladım, Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosureModal;
