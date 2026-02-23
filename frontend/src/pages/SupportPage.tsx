import React, { useState } from 'react';

export const SupportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement support ticket submission
    alert('Destek talebiniz alındı. En kısa sürede size dönüş yapacağız.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Destek Merkezi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Bize Ulaşın</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Konu
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white focus:outline-none focus:border-crypto-yellow-500"
                  >
                    <option value="">Konu seçin</option>
                    <option value="account">Hesap Sorunları</option>
                    <option value="deposit">Yatırma/Çekme</option>
                    <option value="trading">Trading Bot</option>
                    <option value="technical">Teknik Destek</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-crypto-dark-700 border border-crypto-dark-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-crypto-yellow-500 resize-none"
                    placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 font-bold rounded transition"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
              <h3 className="text-lg font-bold text-white mb-4">İletişim Bilgileri</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-crypto-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-300">E-posta</p>
                    <p className="text-sm text-gray-400">support@cryptosignals.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-crypto-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Telefon</p>
                    <p className="text-sm text-gray-400">+90 (212) 555 0123</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-crypto-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Çalışma Saatleri</p>
                    <p className="text-sm text-gray-400">7/24 Destek</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-crypto-dark-800 rounded-lg border border-crypto-dark-500 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Sık Sorulan Sorular</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Hesabımı nasıl doğrularım?</p>
                  <p className="text-xs text-gray-400">Profil ayarlarından kimlik doğrulama bölümüne gidin.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Para çekme süresi ne kadar?</p>
                  <p className="text-xs text-gray-400">Çekim işlemleri 1-3 iş günü içinde tamamlanır.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Trading bot nasıl çalışır?</p>
                  <p className="text-xs text-gray-400">Bot, AI algoritmaları ile otomatik alım-satım yapar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
