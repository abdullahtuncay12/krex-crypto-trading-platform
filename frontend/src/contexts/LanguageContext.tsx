import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tr' | 'ru' | 'ja' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface Translations {
  en: TranslationObject;
  tr: TranslationObject;
  ru: TranslationObject;
  ja: TranslationObject;
  de: TranslationObject;
}

const translations: Translations = {
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      deposit: 'Deposit/Withdraw',
      support: 'Support',
      newInvestment: 'New Investment',
      login: 'Login',
      register: 'Sign Up',
      logout: 'Logout',
      premium: 'PREMIUM',
    },
    dashboard: {
      title: 'Investment Dashboard',
      refresh: 'Refresh',
      newInvestment: 'New Investment',
      activeInvestments: 'Active Investments',
      currentProfitLoss: 'Current Profit/Loss',
      completed: 'Completed',
      totalProfit: 'Total Profit',
      total: 'Total',
      totalInvestment: 'Total investment',
      noActiveInvestments: 'No active investments',
      startNewInvestment: 'Start by creating a new investment',
      createNewInvestment: 'Create New Investment',
      completedInvestments: 'Completed Investments',
      cancelledInvestments: 'Cancelled Investments',
    },
    botTrading: {
      title: 'Automated Trading Bot',
      description: 'Invest in cryptocurrency with AI-powered automated trading bot. The bot automatically executes buy-sell transactions for the period you specify.',
      cryptoLabel: 'Cryptocurrency',
      amountLabel: 'Investment Amount (USDT)',
      amountPlaceholder: '100 - 100,000 USDT',
      amountMin: 'Minimum',
      amountMax: 'Maximum',
      periodLabel: 'Trading Period',
      periodHelp: 'The bot will trade automatically for the selected period',
      submitButton: 'Create Investment',
      submitting: 'Creating Investment...',
      riskWarningTitle: 'Risk Warning',
      riskWarningText: 'Cryptocurrency investments carry high risk. You must read and acknowledge the risk disclosure before investing.',
      periods: {
        '1': '1 Hour',
        '2': '2 Hours',
        '3': '3 Hours',
        '4': '4 Hours',
        '5': '5 Hours',
        '6': '6 Hours',
        '12': '12 Hours',
        '24': '24 Hours',
        '48': '48 Hours',
        '60': '60 Hours',
      },
      errors: {
        amountRequired: 'Investment amount is required',
        amountInvalid: 'Please enter a valid amount',
        amountTooLow: 'Minimum investment amount is {min} USDT',
        amountTooHigh: 'Maximum investment amount is {max} USDT',
      },
    },
    support: {
      title: 'Support Center',
      contactUs: 'Contact Us',
      form: {
        name: 'Full Name',
        namePlaceholder: 'Your first and last name',
        email: 'Email',
        emailPlaceholder: 'email@example.com',
        subject: 'Subject',
        subjectPlaceholder: 'Select a subject',
        subjectOptions: {
          account: 'Account Issues',
          deposit: 'Deposit/Withdraw',
          trading: 'Trading Bot',
          technical: 'Technical Support',
          other: 'Other',
        },
        message: 'Your Message',
        messagePlaceholder: 'Please describe your issue in detail...',
        submit: 'Submit',
        successMessage: 'Your support request has been received. We will get back to you shortly.',
      },
      contactInfo: {
        title: 'Contact Information',
        email: 'Email',
        phone: 'Phone',
        hours: 'Working Hours',
        hoursValue: '24/7 Support',
      },
      faq: {
        title: 'Frequently Asked Questions',
        q1: 'How do I verify my account?',
        a1: 'Go to the identity verification section in profile settings.',
        q2: 'How long does withdrawal take?',
        a2: 'Withdrawal transactions are completed within 1-3 business days.',
        q3: 'How does the trading bot work?',
        a3: 'The bot performs automatic buy-sell operations using AI algorithms.',
      },
    },
  },
  tr: {
    nav: {
      home: 'Ana Sayfa',
      dashboard: 'Dashboard',
      deposit: 'Yatırma/Çekme',
      support: 'Destek',
      newInvestment: 'Yeni Yatırım',
      login: 'Giriş Yap',
      register: 'Üye Ol',
      logout: 'Çıkış',
      premium: 'PREMIUM',
    },
    dashboard: {
      title: 'Yatırım Paneli',
      refresh: 'Yenile',
      newInvestment: 'Yeni Yatırım',
      activeInvestments: 'Aktif Yatırımlar',
      currentProfitLoss: 'Güncel Kar/Zarar',
      completed: 'Tamamlanan',
      totalProfit: 'Toplam Kar',
      total: 'Toplam',
      totalInvestment: 'Toplam yatırım',
      noActiveInvestments: 'Aktif yatırım bulunmuyor',
      startNewInvestment: 'Yeni bir yatırım oluşturarak başlayın',
      createNewInvestment: 'Yeni Yatırım Oluştur',
      completedInvestments: 'Tamamlanan Yatırımlar',
      cancelledInvestments: 'İptal Edilen Yatırımlar',
    },
    botTrading: {
      title: 'Otomatik Ticaret Botu',
      description: 'AI destekli otomatik ticaret botu ile kripto para yatırımı yapın. Bot, belirlediğiniz süre boyunca otomatik olarak alım-satım işlemleri gerçekleştirir.',
      cryptoLabel: 'Kripto Para',
      amountLabel: 'Yatırım Tutarı (USDT)',
      amountPlaceholder: '100 - 100.000 USDT',
      amountMin: 'Minimum',
      amountMax: 'Maximum',
      periodLabel: 'İşlem Süresi',
      periodHelp: 'Bot, seçtiğiniz süre boyunca otomatik işlem yapacaktır',
      submitButton: 'Yatırım Oluştur',
      submitting: 'Yatırım Oluşturuluyor...',
      riskWarningTitle: 'Risk Uyarısı',
      riskWarningText: 'Kripto para yatırımları yüksek risk içerir. Yatırım yapmadan önce risk bildirimini okuyup onaylamanız gerekmektedir.',
      periods: {
        '1': '1 Saat',
        '2': '2 Saat',
        '3': '3 Saat',
        '4': '4 Saat',
        '5': '5 Saat',
        '6': '6 Saat',
        '12': '12 Saat',
        '24': '24 Saat',
        '48': '48 Saat',
        '60': '60 Saat',
      },
      errors: {
        amountRequired: 'Yatırım tutarı gereklidir',
        amountInvalid: 'Geçerli bir tutar giriniz',
        amountTooLow: 'Minimum yatırım tutarı {min} USDT\'dir',
        amountTooHigh: 'Maximum yatırım tutarı {max} USDT\'dir',
      },
    },
    support: {
      title: 'Destek Merkezi',
      contactUs: 'Bize Ulaşın',
      form: {
        name: 'Ad Soyad',
        namePlaceholder: 'Adınız ve soyadınız',
        email: 'E-posta',
        emailPlaceholder: 'email@example.com',
        subject: 'Konu',
        subjectPlaceholder: 'Konu seçin',
        subjectOptions: {
          account: 'Hesap Sorunları',
          deposit: 'Yatırma/Çekme',
          trading: 'Trading Bot',
          technical: 'Teknik Destek',
          other: 'Diğer',
        },
        message: 'Mesajınız',
        messagePlaceholder: 'Lütfen sorununuzu detaylı bir şekilde açıklayın...',
        submit: 'Gönder',
        successMessage: 'Destek talebiniz alındı. En kısa sürede size dönüş yapacağız.',
      },
      contactInfo: {
        title: 'İletişim Bilgileri',
        email: 'E-posta',
        phone: 'Telefon',
        hours: 'Çalışma Saatleri',
        hoursValue: '7/24 Destek',
      },
      faq: {
        title: 'Sık Sorulan Sorular',
        q1: 'Hesabımı nasıl doğrularım?',
        a1: 'Profil ayarlarından kimlik doğrulama bölümüne gidin.',
        q2: 'Para çekme süresi ne kadar?',
        a2: 'Çekim işlemleri 1-3 iş günü içinde tamamlanır.',
        q3: 'Trading bot nasıl çalışır?',
        a3: 'Bot, AI algoritmaları ile otomatik alım-satım yapar.',
      },
    },
  },
  ru: {
    nav: {
      home: 'Главная',
      dashboard: 'Панель',
      deposit: 'Депозит/Вывод',
      support: 'Поддержка',
      newInvestment: 'Новая Инвестиция',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выход',
      premium: 'ПРЕМИУМ',
    },
    dashboard: {
      title: 'Панель Инвестиций',
      refresh: 'Обновить',
      newInvestment: 'Новая Инвестиция',
      activeInvestments: 'Активные Инвестиции',
      currentProfitLoss: 'Текущая Прибыль/Убыток',
      completed: 'Завершено',
      totalProfit: 'Общая Прибыль',
      total: 'Всего',
      totalInvestment: 'Общая инвестиция',
      noActiveInvestments: 'Нет активных инвестиций',
      startNewInvestment: 'Начните с создания новой инвестиции',
      createNewInvestment: 'Создать Новую Инвестицию',
      completedInvestments: 'Завершенные Инвестиции',
      cancelledInvestments: 'Отмененные Инвестиции',
    },
    botTrading: {
      title: 'Автоматический Торговый Бот',
      description: 'Инвестируйте в криптовалюту с помощью автоматического торгового бота на базе ИИ. Бот автоматически выполняет операции купли-продажи в течение указанного вами периода.',
      cryptoLabel: 'Криптовалюта',
      amountLabel: 'Сумма Инвестиции (USDT)',
      amountPlaceholder: '100 - 100 000 USDT',
      amountMin: 'Минимум',
      amountMax: 'Максимум',
      periodLabel: 'Период Торговли',
      periodHelp: 'Бот будет торговать автоматически в течение выбранного периода',
      submitButton: 'Создать Инвестицию',
      submitting: 'Создание Инвестиции...',
      riskWarningTitle: 'Предупреждение о Рисках',
      riskWarningText: 'Инвестиции в криптовалюту несут высокий риск. Вы должны прочитать и подтвердить раскрытие рисков перед инвестированием.',
      periods: {
        '1': '1 Час',
        '2': '2 Часа',
        '3': '3 Часа',
        '4': '4 Часа',
        '5': '5 Часов',
        '6': '6 Часов',
        '12': '12 Часов',
        '24': '24 Часа',
        '48': '48 Часов',
        '60': '60 Часов',
      },
      errors: {
        amountRequired: 'Требуется сумма инвестиции',
        amountInvalid: 'Пожалуйста, введите действительную сумму',
        amountTooLow: 'Минимальная сумма инвестиции составляет {min} USDT',
        amountTooHigh: 'Максимальная сумма инвестиции составляет {max} USDT',
      },
    },
    support: {
      title: 'Центр Поддержки',
      contactUs: 'Связаться с Нами',
      form: {
        name: 'Полное Имя',
        namePlaceholder: 'Ваше имя и фамилия',
        email: 'Электронная Почта',
        emailPlaceholder: 'email@example.com',
        subject: 'Тема',
        subjectPlaceholder: 'Выберите тему',
        subjectOptions: {
          account: 'Проблемы с Аккаунтом',
          deposit: 'Депозит/Вывод',
          trading: 'Торговый Бот',
          technical: 'Техническая Поддержка',
          other: 'Другое',
        },
        message: 'Ваше Сообщение',
        messagePlaceholder: 'Пожалуйста, опишите вашу проблему подробно...',
        submit: 'Отправить',
        successMessage: 'Ваш запрос в поддержку получен. Мы свяжемся с вами в ближайшее время.',
      },
      contactInfo: {
        title: 'Контактная Информация',
        email: 'Электронная Почта',
        phone: 'Телефон',
        hours: 'Часы Работы',
        hoursValue: 'Поддержка 24/7',
      },
      faq: {
        title: 'Часто Задаваемые Вопросы',
        q1: 'Как подтвердить мой аккаунт?',
        a1: 'Перейдите в раздел подтверждения личности в настройках профиля.',
        q2: 'Сколько времени занимает вывод средств?',
        a2: 'Транзакции вывода завершаются в течение 1-3 рабочих дней.',
        q3: 'Как работает торговый бот?',
        a3: 'Бот выполняет автоматические операции купли-продажи с использованием алгоритмов ИИ.',
      },
    },
  },
  ja: {
    nav: {
      home: 'ホーム',
      dashboard: 'ダッシュボード',
      deposit: '入金/出金',
      support: 'サポート',
      newInvestment: '新規投資',
      login: 'ログイン',
      register: '登録',
      logout: 'ログアウト',
      premium: 'プレミアム',
    },
    dashboard: {
      title: '投資ダッシュボード',
      refresh: '更新',
      newInvestment: '新規投資',
      activeInvestments: 'アクティブな投資',
      currentProfitLoss: '現在の損益',
      completed: '完了',
      totalProfit: '総利益',
      total: '合計',
      totalInvestment: '総投資額',
      noActiveInvestments: 'アクティブな投資はありません',
      startNewInvestment: '新しい投資を作成して開始',
      createNewInvestment: '新規投資を作成',
      completedInvestments: '完了した投資',
      cancelledInvestments: 'キャンセルされた投資',
    },
    botTrading: {
      title: '自動取引ボット',
      description: 'AI搭載の自動取引ボットで暗号通貨に投資します。ボットは指定された期間、自動的に売買取引を実行します。',
      cryptoLabel: '暗号通貨',
      amountLabel: '投資額 (USDT)',
      amountPlaceholder: '100 - 100,000 USDT',
      amountMin: '最小',
      amountMax: '最大',
      periodLabel: '取引期間',
      periodHelp: 'ボットは選択された期間、自動的に取引します',
      submitButton: '投資を作成',
      submitting: '投資を作成中...',
      riskWarningTitle: 'リスク警告',
      riskWarningText: '暗号通貨投資は高リスクです。投資する前にリスク開示を読んで確認する必要があります。',
      periods: {
        '1': '1時間',
        '2': '2時間',
        '3': '3時間',
        '4': '4時間',
        '5': '5時間',
        '6': '6時間',
        '12': '12時間',
        '24': '24時間',
        '48': '48時間',
        '60': '60時間',
      },
      errors: {
        amountRequired: '投資額が必要です',
        amountInvalid: '有効な金額を入力してください',
        amountTooLow: '最小投資額は{min} USDTです',
        amountTooHigh: '最大投資額は{max} USDTです',
      },
    },
    support: {
      title: 'サポートセンター',
      contactUs: 'お問い合わせ',
      form: {
        name: '氏名',
        namePlaceholder: 'お名前',
        email: 'メールアドレス',
        emailPlaceholder: 'email@example.com',
        subject: '件名',
        subjectPlaceholder: '件名を選択',
        subjectOptions: {
          account: 'アカウントの問題',
          deposit: '入金/出金',
          trading: 'トレーディングボット',
          technical: 'テクニカルサポート',
          other: 'その他',
        },
        message: 'メッセージ',
        messagePlaceholder: '問題を詳しく説明してください...',
        submit: '送信',
        successMessage: 'サポートリクエストを受け付けました。すぐにご連絡いたします。',
      },
      contactInfo: {
        title: '連絡先情報',
        email: 'メールアドレス',
        phone: '電話',
        hours: '営業時間',
        hoursValue: '24時間365日サポート',
      },
      faq: {
        title: 'よくある質問',
        q1: 'アカウントを確認するにはどうすればよいですか？',
        a1: 'プロフィール設定の本人確認セクションに移動してください。',
        q2: '出金にはどのくらい時間がかかりますか？',
        a2: '出金取引は1〜3営業日以内に完了します。',
        q3: 'トレーディングボットはどのように機能しますか？',
        a3: 'ボットはAIアルゴリズムを使用して自動売買を実行します。',
      },
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      dashboard: 'Dashboard',
      deposit: 'Einzahlung/Auszahlung',
      support: 'Support',
      newInvestment: 'Neue Investition',
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      premium: 'PREMIUM',
    },
    dashboard: {
      title: 'Investitions-Dashboard',
      refresh: 'Aktualisieren',
      newInvestment: 'Neue Investition',
      activeInvestments: 'Aktive Investitionen',
      currentProfitLoss: 'Aktueller Gewinn/Verlust',
      completed: 'Abgeschlossen',
      totalProfit: 'Gesamtgewinn',
      total: 'Gesamt',
      totalInvestment: 'Gesamtinvestition',
      noActiveInvestments: 'Keine aktiven Investitionen',
      startNewInvestment: 'Beginnen Sie mit der Erstellung einer neuen Investition',
      createNewInvestment: 'Neue Investition Erstellen',
      completedInvestments: 'Abgeschlossene Investitionen',
      cancelledInvestments: 'Stornierte Investitionen',
    },
    botTrading: {
      title: 'Automatisierter Trading Bot',
      description: 'Investieren Sie in Kryptowährung mit KI-gestütztem automatisiertem Trading Bot. Der Bot führt automatisch Kauf-/Verkaufstransaktionen für den von Ihnen angegebenen Zeitraum aus.',
      cryptoLabel: 'Kryptowährung',
      amountLabel: 'Investitionsbetrag (USDT)',
      amountPlaceholder: '100 - 100.000 USDT',
      amountMin: 'Minimum',
      amountMax: 'Maximum',
      periodLabel: 'Handelszeitraum',
      periodHelp: 'Der Bot wird für den ausgewählten Zeitraum automatisch handeln',
      submitButton: 'Investition Erstellen',
      submitting: 'Investition Wird Erstellt...',
      riskWarningTitle: 'Risikowarnung',
      riskWarningText: 'Kryptowährungsinvestitionen bergen ein hohes Risiko. Sie müssen die Risikooffenlegung lesen und bestätigen, bevor Sie investieren.',
      periods: {
        '1': '1 Stunde',
        '2': '2 Stunden',
        '3': '3 Stunden',
        '4': '4 Stunden',
        '5': '5 Stunden',
        '6': '6 Stunden',
        '12': '12 Stunden',
        '24': '24 Stunden',
        '48': '48 Stunden',
        '60': '60 Stunden',
      },
      errors: {
        amountRequired: 'Investitionsbetrag ist erforderlich',
        amountInvalid: 'Bitte geben Sie einen gültigen Betrag ein',
        amountTooLow: 'Mindestinvestitionsbetrag beträgt {min} USDT',
        amountTooHigh: 'Maximaler Investitionsbetrag beträgt {max} USDT',
      },
    },
    support: {
      title: 'Support-Center',
      contactUs: 'Kontaktieren Sie Uns',
      form: {
        name: 'Vollständiger Name',
        namePlaceholder: 'Ihr Vor- und Nachname',
        email: 'E-Mail',
        emailPlaceholder: 'email@example.com',
        subject: 'Betreff',
        subjectPlaceholder: 'Betreff auswählen',
        subjectOptions: {
          account: 'Kontoprobleme',
          deposit: 'Einzahlung/Auszahlung',
          trading: 'Trading Bot',
          technical: 'Technischer Support',
          other: 'Sonstiges',
        },
        message: 'Ihre Nachricht',
        messagePlaceholder: 'Bitte beschreiben Sie Ihr Problem im Detail...',
        submit: 'Senden',
        successMessage: 'Ihre Support-Anfrage wurde empfangen. Wir werden uns in Kürze bei Ihnen melden.',
      },
      contactInfo: {
        title: 'Kontaktinformationen',
        email: 'E-Mail',
        phone: 'Telefon',
        hours: 'Arbeitszeiten',
        hoursValue: '24/7 Support',
      },
      faq: {
        title: 'Häufig Gestellte Fragen',
        q1: 'Wie verifiziere ich mein Konto?',
        a1: 'Gehen Sie zum Identitätsverifizierungsbereich in den Profileinstellungen.',
        q2: 'Wie lange dauert eine Auszahlung?',
        a2: 'Auszahlungstransaktionen werden innerhalb von 1-3 Werktagen abgeschlossen.',
        q3: 'Wie funktioniert der Trading Bot?',
        a3: 'Der Bot führt automatische Kauf-/Verkaufsoperationen mit KI-Algorithmen durch.',
      },
    },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested translation value
const getNestedTranslation = (obj: TranslationObject, path: string): string | undefined => {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
};

// Validate language code
const isValidLanguage = (lang: string): lang is Language => {
  return ['en', 'tr', 'ru', 'ja', 'de'].includes(lang);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved && isValidLanguage(saved)) {
        return saved;
      }
      // Default to English if no valid language found
      return 'en';
    } catch (error) {
      // If localStorage is unavailable, default to English
      console.warn('localStorage unavailable, language preference will not persist');
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.warn('localStorage unavailable, language preference will not persist');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    // Try to get translation from current language
    const currentTranslation = getNestedTranslation(translations[language], key);
    if (currentTranslation) {
      return currentTranslation;
    }
    
    // Fallback to English if not found in current language
    if (language !== 'en') {
      const englishTranslation = getNestedTranslation(translations.en, key);
      if (englishTranslation) {
        return englishTranslation;
      }
    }
    
    // If not found in English either, return the key itself
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
