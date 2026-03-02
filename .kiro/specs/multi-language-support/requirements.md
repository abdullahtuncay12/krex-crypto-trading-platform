# Requirements Document: Multi-Language Support (i18n)

## Introduction

This document specifies the requirements for implementing comprehensive internationalization (i18n) support for the MoonLlama crypto trading platform. The system currently has a basic LanguageContext with only Turkish and English support, defaulting to Turkish, with translations only for the Navbar component. This feature will expand language support to 5 languages, change the default to English, implement a language selector in the Navbar, and provide complete translations for all pages including Dashboard and Support pages which currently contain hardcoded Turkish text.

## Glossary

- **I18n_System**: The internationalization system responsible for managing translations and language switching
- **Language_Context**: React Context providing language state and translation functions to components
- **Translation_Key**: A unique string identifier used to retrieve translated text (e.g., 'nav.home', 'dashboard.title')
- **Language_Selector**: UI component in the Navbar allowing users to choose their preferred language
- **Translation_Object**: Nested JavaScript object containing all translation keys and their values for a specific language
- **Locale_Code**: ISO 639-1 two-letter language code (en, tr, ru, ja, de)
- **Language_Preference**: User's selected language stored in browser localStorage
- **Fallback_Language**: Default language (English) used when a translation key is missing in the selected language
- **Dashboard_Page**: InvestmentDashboard component displaying user's investment portfolio
- **Support_Page**: SupportPage component with contact form and support information
- **Navbar_Component**: Navigation bar component containing the Language_Selector

## Requirements

### Requirement 1: Language Support Expansion

**User Story:** As a platform administrator, I want to support 5 different languages, so that users from different regions can use the platform in their native language.

#### Acceptance Criteria

1. THE I18n_System SHALL support English (en) as a language option
2. THE I18n_System SHALL support Turkish (tr) as a language option
3. THE I18n_System SHALL support Russian (ru) as a language option
4. THE I18n_System SHALL support Japanese (ja) as a language option
5. THE I18n_System SHALL support German (de) as a language option
6. WHEN the application initializes, THE Language_Context SHALL set English (en) as the default language
7. WHERE no Language_Preference exists in localStorage, THE I18n_System SHALL use English (en) as the Fallback_Language

### Requirement 2: Language Selector Implementation

**User Story:** As a user, I want to select my preferred language from the navigation bar, so that I can view the platform in my native language.

#### Acceptance Criteria

1. THE Navbar_Component SHALL display a Language_Selector component
2. THE Language_Selector SHALL display all 5 supported languages as selectable options
3. WHEN a user clicks the Language_Selector, THE Language_Selector SHALL display a dropdown menu with language options
4. WHEN a user selects a language from the dropdown, THE I18n_System SHALL update the current language to the selected Locale_Code
5. WHEN the language changes, THE I18n_System SHALL persist the Language_Preference to localStorage
6. THE Language_Selector SHALL display the currently selected language visually (e.g., flag icon, language name, or locale code)
7. WHEN the page reloads, THE I18n_System SHALL restore the Language_Preference from localStorage

### Requirement 3: Dashboard Page Translation

**User Story:** As a user viewing the Dashboard, I want all text to appear in my selected language, so that I can understand my investment information clearly.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL use Translation_Keys for all user-facing text instead of hardcoded strings
2. WHEN the Dashboard_Page renders, THE Dashboard_Page SHALL retrieve translations using the Language_Context translation function
3. THE I18n_System SHALL provide translations for the page title "Yatırım Paneli"
4. THE I18n_System SHALL provide translations for button labels including "Yenile" and "Yeni Yatırım"
5. THE I18n_System SHALL provide translations for portfolio summary section headers including "Aktif Yatırımlar", "Güncel Kar/Zarar", "Tamamlanan", and "Toplam Kar"
6. THE I18n_System SHALL provide translations for investment status labels including "Aktif Yatırımlar", "Tamamlanan Yatırımlar", and "İptal Edilen Yatırımlar"
7. THE I18n_System SHALL provide translations for empty state messages including "Aktif yatırım bulunmuyor" and "Yeni bir yatırım oluşturarak başlayın"
8. THE I18n_System SHALL provide translations for all metric labels including "Toplam", "Toplam yatırım", and "Toplam Kar"
9. WHEN the user changes the language, THE Dashboard_Page SHALL re-render with translations in the newly selected language

### Requirement 4: Support Page Translation

**User Story:** As a user accessing support, I want the support page to appear in my selected language, so that I can communicate my issues effectively.

#### Acceptance Criteria

1. THE Support_Page SHALL use Translation_Keys for all user-facing text instead of hardcoded strings
2. WHEN the Support_Page renders, THE Support_Page SHALL retrieve translations using the Language_Context translation function
3. THE I18n_System SHALL provide translations for the page title "Destek Merkezi"
4. THE I18n_System SHALL provide translations for the contact form section title "Bize Ulaşın"
5. THE I18n_System SHALL provide translations for all form field labels including "Ad Soyad", "E-posta", "Konu", and "Mesajınız"
6. THE I18n_System SHALL provide translations for all form field placeholders including "Adınız ve soyadınız", "email@example.com", and "Lütfen sorununuzu detaylı bir şekilde açıklayın..."
7. THE I18n_System SHALL provide translations for the subject dropdown options including "Konu seçin", "Hesap Sorunları", "Yatırma/Çekme", "Trading Bot", "Teknik Destek", and "Diğer"
8. THE I18n_System SHALL provide translations for the submit button "Gönder"
9. THE I18n_System SHALL provide translations for the success alert message "Destek talebiniz alındı. En kısa sürede size dönüş yapacağız."
10. THE I18n_System SHALL provide translations for the contact information section title "İletişim Bilgileri"
11. THE I18n_System SHALL provide translations for contact detail labels including "E-posta", "Telefon", and "Çalışma Saatleri"
12. THE I18n_System SHALL provide translations for the FAQ section title "Sık Sorulan Sorular"
13. THE I18n_System SHALL provide translations for all FAQ questions and answers
14. WHEN the user changes the language, THE Support_Page SHALL re-render with translations in the newly selected language

### Requirement 5: Translation Completeness and Consistency

**User Story:** As a developer, I want all translation keys to be defined for all supported languages, so that users never see missing translations or untranslated text.

#### Acceptance Criteria

1. FOR ALL Translation_Keys defined in the Translation_Object, THE I18n_System SHALL provide translations in all 5 supported languages
2. WHEN a Translation_Key is missing for the selected language, THE I18n_System SHALL return the translation from the Fallback_Language (English)
3. IF a Translation_Key is missing from the Fallback_Language, THEN THE I18n_System SHALL return the Translation_Key itself as the display text
4. THE Translation_Object SHALL use a consistent nested structure for organizing Translation_Keys by page or component
5. THE Translation_Object SHALL use dot notation for Translation_Keys (e.g., 'dashboard.title', 'support.form.name')
6. WHEN a developer adds a new Translation_Key, THE Translation_Object SHALL include that key in all 5 language objects

### Requirement 6: Existing Translation Preservation

**User Story:** As a developer, I want existing Navbar translations to remain functional, so that the language switching feature works seamlessly across the entire application.

#### Acceptance Criteria

1. THE I18n_System SHALL preserve all existing Navbar Translation_Keys including 'nav.home', 'nav.dashboard', 'nav.deposit', 'nav.support', 'nav.newInvestment', 'nav.login', 'nav.register', 'nav.logout', and 'nav.premium'
2. THE I18n_System SHALL maintain the existing translations for Turkish and English for all Navbar Translation_Keys
3. THE I18n_System SHALL add translations for Russian, Japanese, and German for all Navbar Translation_Keys
4. WHEN the Navbar_Component renders, THE Navbar_Component SHALL continue to use the existing translation function from Language_Context

### Requirement 7: Language Context Enhancement

**User Story:** As a developer, I want the Language_Context to support all 5 languages with proper TypeScript typing, so that I can safely use translations throughout the application.

#### Acceptance Criteria

1. THE Language_Context SHALL update the Language type definition to include all 5 Locale_Codes: 'en' | 'tr' | 'ru' | 'ja' | 'de'
2. THE Language_Context SHALL maintain the existing LanguageContextType interface with language, setLanguage, and t properties
3. THE Language_Context SHALL provide a translation function t that accepts a Translation_Key and returns a string
4. THE Language_Context SHALL provide a setLanguage function that accepts a Locale_Code and updates the current language
5. THE Language_Context SHALL expose the current language as a readable property
6. WHEN a component calls the t function with a Translation_Key, THE Language_Context SHALL return the translated string for the current language
7. THE Language_Context SHALL use React Context API for state management and provider pattern

### Requirement 8: Translation Organization and Scalability

**User Story:** As a developer, I want translations to be organized in a maintainable structure, so that adding new translations or languages is straightforward.

#### Acceptance Criteria

1. THE Translation_Object SHALL organize Translation_Keys by feature area using nested objects (e.g., nav, dashboard, support)
2. THE Translation_Object SHALL group related translations together within each feature area
3. THE Translation_Object SHALL use descriptive Translation_Key names that indicate their purpose and location
4. THE Translation_Object SHALL maintain alphabetical ordering of Translation_Keys within each nested section for easy lookup
5. WHEN a new page or component requires translations, THE Translation_Object SHALL add a new nested section for that feature area

### Requirement 9: Language Persistence and Initialization

**User Story:** As a user, I want my language preference to be remembered across sessions, so that I don't have to select my language every time I visit the platform.

#### Acceptance Criteria

1. WHEN a user selects a language, THE I18n_System SHALL save the Locale_Code to localStorage with key 'language'
2. WHEN the application initializes, THE Language_Context SHALL check localStorage for an existing Language_Preference
3. WHERE a Language_Preference exists in localStorage, THE Language_Context SHALL initialize with that Locale_Code
4. WHERE no Language_Preference exists in localStorage, THE Language_Context SHALL initialize with English (en) as the default
5. IF the stored Language_Preference contains an invalid or unsupported Locale_Code, THEN THE Language_Context SHALL default to English (en)
6. WHEN the Language_Preference changes, THE I18n_System SHALL update localStorage immediately

### Requirement 10: Component Translation Integration

**User Story:** As a developer, I want a simple and consistent way to use translations in React components, so that implementing i18n is straightforward and maintainable.

#### Acceptance Criteria

1. THE Language_Context SHALL export a useLanguage hook for accessing language state and translation functions
2. WHEN a component calls useLanguage outside of a LanguageProvider, THE useLanguage hook SHALL throw an error with a descriptive message
3. THE useLanguage hook SHALL return an object containing language, setLanguage, and t properties
4. WHEN a component needs to display translated text, THE component SHALL call the t function with the appropriate Translation_Key
5. WHEN a component needs to conditionally render based on language, THE component SHALL access the language property from useLanguage
6. THE t function SHALL accept a Translation_Key as a string parameter and return a string value
