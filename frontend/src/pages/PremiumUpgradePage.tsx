import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useLanguage } from '../contexts/LanguageContext';

export const PremiumUpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const texts: Record<string, any> = {
    tr: {
      title: 'Premium\'a Yükselt',
      subtitle: 'Tüm özelliklerin kilidini aç ve kazancını maksimize et',
      currentPlan: 'Mevcut Planınız',
      normal: 'Normal Üye',
      monthly: 'Aylık',
      yearly: 'Yıllık',
      save20: '%20 Tasarruf',
      perMonth: '/ay',
      perYear: '/yıl',
      upgradeNow: 'Şimdi Yükselt',
      features: {
        title: 'Premium Özellikler',
        feature1: '🤖 Gelişmiş AI Trading Botu',
        feature2: '📊 Sınırsız Sinyal Erişimi',
        feature3: '⚡ Gerçek Zamanlı Bildirimler',
        feature4: '📈 Detaylı Analiz Araçları',
        feature5: '🎯 Özel Strateji Önerileri',
        feature6: '💎 Öncelikli Destek',
        feature7: '📱 Mobil Uygulama Erişimi',
        feature8: '🔒 Gelişmiş Güvenlik',
      },
      comparison: {
        title: 'Plan Karşılaştırması',
        normal: 'Normal',
        premium: 'Premium',
        signals: 'Sinyal Erişimi',
        signalsNormal: 'Sınırlı',
        signalsPremium: 'Sınırsız',
        bot: 'Trading Bot',
        botNormal: 'Temel',
        botPremium: 'Gelişmiş AI',
        notifications: 'Bildirimler',
        notificationsNormal: 'E-posta',
        notificationsPremium: 'Gerçek Zamanlı',
        support: 'Destek',
        supportNormal: 'Standart',
        supportPremium: 'Öncelikli',
      },
      testimonials: {
        title: 'Kullanıcı Yorumları',
        user1: 'Premium\'a geçtikten sonra kazancım %300 arttı!',
        user2: 'AI bot gerçekten işe yarıyor, harika!',
        user3: 'Gerçek zamanlı bildirimler sayesinde hiçbir fırsatı kaçırmıyorum.',
      },
      guarantee: '30 Gün Para İade Garantisi',
      guaranteeText: 'Memnun kalmazsan, ilk 30 gün içinde tam iade.',
    },
    en: {
      title: 'Upgrade to Premium',
      subtitle: 'Unlock all features and maximize your profits',
      currentPlan: 'Your Current Plan',
      normal: 'Normal Member',
      monthly: 'Monthly',
      yearly: 'Yearly',
      save20: 'Save 20%',
      perMonth: '/month',
      perYear: '/year',
      upgradeNow: 'Upgrade Now',
      features: {
        title: 'Premium Features',
        feature1: '🤖 Advanced AI Trading Bot',
        feature2: '📊 Unlimited Signal Access',
        feature3: '⚡ Real-Time Notifications',
        feature4: '📈 Detailed Analysis Tools',
        feature5: '🎯 Custom Strategy Recommendations',
        feature6: '💎 Priority Support',
        feature7: '📱 Mobile App Access',
        feature8: '🔒 Advanced Security',
      },
      comparison: {
        title: 'Plan Comparison',
        normal: 'Normal',
        premium: 'Premium',
        signals: 'Signal Access',
        signalsNormal: 'Limited',
        signalsPremium: 'Unlimited',
        bot: 'Trading Bot',
        botNormal: 'Basic',
        botPremium: 'Advanced AI',
        notifications: 'Notifications',
        notificationsNormal: 'Email',
        notificationsPremium: 'Real-Time',
        support: 'Support',
        supportNormal: 'Standard',
        supportPremium: 'Priority',
      },
      testimonials: {
        title: 'User Testimonials',
        user1: 'My profits increased 300% after upgrading to Premium!',
        user2: 'The AI bot really works, amazing!',
        user3: 'Thanks to real-time notifications, I never miss an opportunity.',
      },
      guarantee: '30-Day Money Back Guarantee',
      guaranteeText: 'If you\'re not satisfied, full refund within the first 30 days.',
    },
  };

  const t = texts[language] || texts.en;

  const handleUpgrade = () => {
    // Yatırma/Çekme sayfasına yönlendir (ödeme için)
    navigate('/deposit-withdraw');
  };

  if (user?.role === 'premium') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors duration-200 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-crypto-dark-500/50">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'tr' ? 'Zaten Premium Üyesiniz!' : 'You\'re Already Premium!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'tr' 
              ? 'Tüm premium özelliklere erişiminiz var.' 
              : 'You have access to all premium features.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 font-semibold rounded-lg transition"
          >
            {language === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors duration-200">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl opacity-90">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">{t.currentPlan}:</span> {t.normal}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-xl p-8 cursor-pointer transition border-4 ${
              selectedPlan === 'monthly'
                ? 'border-crypto-yellow-500'
                : 'border-transparent hover:border-gray-300 dark:hover:border-crypto-dark-500'
            }`}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.monthly}</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">$49</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">{t.perMonth}</span>
            </div>
            <button
              onClick={handleUpgrade}
              className="w-full px-6 py-3 bg-crypto-yellow-500 hover:bg-crypto-yellow-600 text-crypto-dark-900 font-semibold rounded-lg transition"
            >
              {t.upgradeNow}
            </button>
          </div>

          {/* Yearly Plan */}
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-xl p-8 cursor-pointer transition border-4 relative ${
              selectedPlan === 'yearly'
                ? 'border-crypto-yellow-500'
                : 'border-transparent hover:border-gray-300 dark:hover:border-crypto-dark-500'
            }`}
          >
            <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
              {t.save20}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.yearly}</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">$470</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">{t.perYear}</span>
            </div>
            <button
              onClick={handleUpgrade}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition"
            >
              {t.upgradeNow}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-xl p-8 mb-12 border border-gray-200 dark:border-crypto-dark-500/50">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t.features.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(t.features)
              .filter(([key]) => key.startsWith('feature'))
              .map(([key, value]) => (
                <div key={key} className="flex items-start space-x-3">
                  <div className="text-2xl">{(value as string).split(' ')[0]}</div>
                  <p className="text-gray-700 dark:text-gray-300">{(value as string).substring(3)}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-crypto-dark-800/80 dark:backdrop-blur-md rounded-lg shadow-xl p-8 mb-12 border border-gray-200 dark:border-crypto-dark-500/50">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t.comparison.title}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-crypto-dark-500">
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white"></th>
                  <th className="text-center py-4 px-4 text-gray-900 dark:text-white">{t.comparison.normal}</th>
                  <th className="text-center py-4 px-4 text-purple-600 dark:text-purple-400 font-bold">{t.comparison.premium}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-crypto-dark-500">
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{t.comparison.signals}</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">{t.comparison.signalsNormal}</td>
                  <td className="text-center py-4 px-4 text-green-600 dark:text-green-400 font-semibold">{t.comparison.signalsPremium}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-crypto-dark-500">
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{t.comparison.bot}</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">{t.comparison.botNormal}</td>
                  <td className="text-center py-4 px-4 text-green-600 dark:text-green-400 font-semibold">{t.comparison.botPremium}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-crypto-dark-500">
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{t.comparison.notifications}</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">{t.comparison.notificationsNormal}</td>
                  <td className="text-center py-4 px-4 text-green-600 dark:text-green-400 font-semibold">{t.comparison.notificationsPremium}</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{t.comparison.support}</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">{t.comparison.supportNormal}</td>
                  <td className="text-center py-4 px-4 text-green-600 dark:text-green-400 font-semibold">{t.comparison.supportPremium}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">✅ {t.guarantee}</h3>
          <p className="text-green-700 dark:text-green-300">{t.guaranteeText}</p>
        </div>
      </div>
    </div>
  );
};
