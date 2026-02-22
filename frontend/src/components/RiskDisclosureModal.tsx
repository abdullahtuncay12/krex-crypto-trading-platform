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
            Risk Bildirimi
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-800 font-semibold">
                ÖNEMLİ UYARI: Otomatik ticaret botu kullanımı yüksek risk içerir.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                  <span className="text-yellow-800 text-sm font-bold">1</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Sermaye Kaybı Riski
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Kripto para piyasaları son derece volatildir. Yatırımınızın tamamını kaybedebilirsiniz.
                    Sadece kaybetmeyi göze alabileceğiniz miktarla yatırım yapın.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                  <span className="text-yellow-800 text-sm font-bold">2</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Otomatik İşlem Riskleri
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bot otomatik olarak alım-satım işlemleri gerçekleştirir. Piyasa koşulları hızla değişebilir
                    ve bot her zaman karlı işlemler yapamayabilir.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                  <span className="text-yellow-800 text-sm font-bold">3</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Teknik Riskler
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sistem arızaları, internet bağlantı sorunları veya borsa API kesintileri işlemlerinizi
                    etkileyebilir. Bu durumlarda kayıplar oluşabilir.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                  <span className="text-yellow-800 text-sm font-bold">4</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Komisyon ve Ücretler
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Kar elde ettiğinizde %1 komisyon alınır. Erken iptal durumunda ana paranızın %2'si
                    iptal ücreti olarak kesilir.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                  <span className="text-yellow-800 text-sm font-bold">5</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Garanti Yok
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Geçmiş performans gelecekteki sonuçların garantisi değildir. Hiçbir kar garantisi
                    verilmemektedir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Yukarıdaki tüm riskleri okudum, anladım ve kabul ediyorum. Yatırım kararımın
                sorumluluğunun tamamen bana ait olduğunu biliyorum.
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
              Kabul Ediyorum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosureModal;
