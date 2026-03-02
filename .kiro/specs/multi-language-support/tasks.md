# Implementation Plan: Multi-Language Support (i18n)

## Overview

This implementation plan expands the language support from 2 languages (Turkish and English) to 5 languages (English, Turkish, Russian, Japanese, and German), changes the default language from Turkish to English, creates a LanguageSelector component for the Navbar, and translates all hardcoded Turkish text in Dashboard and Support pages. The implementation follows a dual testing strategy with both unit tests and property-based tests using fast-check.

## Tasks

- [x] 1. Update LanguageContext to support 5 languages with English default
  - [x] 1.1 Update Language type definition to include all 5 languages
    - Change `type Language = 'tr' | 'en'` to `type Language = 'en' | 'tr' | 'ru' | 'ja' | 'de'`
    - Update TypeScript interfaces to reflect new language options
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1_
  
  - [x] 1.2 Change default language initialization from Turkish to English
    - Update localStorage fallback from `'tr'` to `'en'`
    - Add validation for invalid language codes to default to English
    - _Requirements: 1.6, 1.7, 9.4, 9.5_
  
  - [x] 1.3 Implement nested translation object structure
    - Refactor flat translation keys to nested structure (nav, dashboard, support)
    - Update translation function `t()` to handle dot notation key lookups
    - Implement fallback chain: current language → English → key itself
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3_
  
  - [x] 1.4 Add complete translation objects for all 5 languages
    - Add Russian (ru) translation object with all existing nav keys
    - Add Japanese (ja) translation object with all existing nav keys
    - Add German (de) translation object with all existing nav keys
    - Maintain existing Turkish and English nav translations
    - _Requirements: 6.1, 6.2, 6.3, 5.1_
  
  - [ ]* 1.5 Write unit tests for LanguageContext
    - Test default initialization to English
    - Test language switching updates state
    - Test translation function returns correct strings
    - Test fallback to English for missing keys
    - Test fallback to key for completely missing keys
    - Test localStorage persistence on language change
    - Test localStorage restoration on initialization
    - Test invalid language code handling
    - Test useLanguage hook error outside provider
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 9.2, 9.3, 10.2_
  
  - [ ]* 1.6 Write property-based tests for LanguageContext
    - **Property 1: Language Selection Persistence**
    - **Validates: Requirements 2.5, 9.1, 9.6**
    - **Property 2: Language Preference Restoration**
    - **Validates: Requirements 2.7, 9.3**
    - **Property 3: Translation Function Returns Strings**
    - **Validates: Requirements 7.3, 7.6, 10.6**
    - **Property 8: Invalid Language Code Handling**
    - **Validates: Requirements 9.5**
    - Use fast-check with minimum 100 iterations per property
    - Tag each test: `Feature: multi-language-support, Property {number}`
    - _Requirements: 5.2, 5.3, 7.3, 9.3, 9.5, 9.6_

- [x] 2. Create LanguageSelector component
  - [x] 2.1 Create LanguageSelector component file and basic structure
    - Create `frontend/src/components/LanguageSelector.tsx`
    - Implement dropdown UI with all 5 language options
    - Display languages with flag emojis and native names (🇬🇧 English, 🇹🇷 Türkçe, 🇷🇺 Русский, 🇯🇵 日本語, 🇩🇪 Deutsch)
    - Use useLanguage hook to access language state and setLanguage function
    - _Requirements: 2.1, 2.2, 2.3, 10.1, 10.3, 10.4_
  
  - [x] 2.2 Implement language selection and visual feedback
    - Highlight currently selected language in dropdown
    - Call setLanguage when user selects a language
    - Close dropdown after selection
    - Display current language on button (flag + code or name)
    - _Requirements: 2.4, 2.6, 7.4_
  
  - [x] 2.3 Add keyboard navigation and accessibility features
    - Implement Tab, Enter, Escape key handling
    - Add ARIA labels for screen readers
    - Implement focus management for dropdown
    - _Requirements: 2.3_
  
  - [ ]* 2.4 Write unit tests for LanguageSelector
    - Test renders all 5 language options
    - Test displays current language
    - Test clicking option calls setLanguage
    - Test dropdown opens and closes correctly
    - Test keyboard navigation works
    - Test accessibility attributes present
    - _Requirements: 2.2, 2.3, 2.4, 2.6_
  
  - [ ]* 2.5 Write property-based test for LanguageSelector
    - **Property 4: Language Selector Visual Feedback**
    - **Validates: Requirements 2.6**
    - Test that for any supported language, the selector displays it as selected
    - _Requirements: 2.6_

- [x] 3. Add Dashboard page translations
  - [x] 3.1 Add dashboard translation keys to all 5 language objects
    - Add dashboard.title, dashboard.refresh, dashboard.newInvestment
    - Add dashboard.activeInvestments, dashboard.currentProfitLoss, dashboard.completed, dashboard.totalProfit
    - Add dashboard.total, dashboard.totalInvestment, dashboard.noActiveInvestments, dashboard.startNewInvestment
    - Add dashboard.createNewInvestment, dashboard.completedInvestments, dashboard.cancelledInvestments
    - Include translations for all 5 languages (en, tr, ru, ja, de)
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.6_
  
  - [x] 3.2 Update InvestmentDashboard component to use translation keys
    - Replace "Yatırım Paneli" with `t('dashboard.title')`
    - Replace "Yenile" with `t('dashboard.refresh')`
    - Replace "Yeni Yatırım" with `t('dashboard.newInvestment')`
    - Replace all portfolio summary headers with translation keys
    - Replace all status labels with translation keys
    - Replace empty state messages with translation keys
    - Replace all metric labels with translation keys
    - _Requirements: 3.1, 3.2, 3.9, 10.4, 10.5_
  
  - [ ]* 3.3 Write unit tests for Dashboard translations
    - Test all text uses translation keys (no hardcoded strings)
    - Test renders correctly in each language
    - Test all required translation keys exist
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 4. Add Support page translations
  - [x] 4.1 Add support translation keys to all 5 language objects
    - Add support.title, support.contactUs
    - Add support.form.* keys (name, namePlaceholder, email, emailPlaceholder, subject, subjectPlaceholder, message, messagePlaceholder, submit, successMessage)
    - Add support.form.subjectOptions.* keys (account, deposit, trading, technical, other)
    - Add support.contactInfo.* keys (title, email, phone, hours, hoursValue)
    - Add support.faq.* keys (title, q1, a1, q2, a2, q3, a3)
    - Include translations for all 5 languages (en, tr, ru, ja, de)
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 5.1, 5.6_
  
  - [x] 4.2 Update SupportPage component to use translation keys
    - Replace "Destek Merkezi" with `t('support.title')`
    - Replace "Bize Ulaşın" with `t('support.contactUs')`
    - Replace all form field labels with translation keys
    - Replace all form field placeholders with translation keys
    - Replace subject dropdown options with translation keys
    - Replace submit button text with translation key
    - Replace success alert message with translation key
    - Replace contact information section with translation keys
    - Replace FAQ section with translation keys
    - _Requirements: 4.1, 4.2, 4.14, 10.4, 10.5_
  
  - [ ]* 4.3 Write unit tests for Support page translations
    - Test all text uses translation keys (no hardcoded strings)
    - Test form labels and placeholders translated
    - Test renders correctly in each language
    - Test all required translation keys exist
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13_

- [x] 5. Integrate LanguageSelector into Navbar
  - [x] 5.1 Replace language toggle button with LanguageSelector component
    - Import LanguageSelector component in Navbar
    - Replace existing `toggleLanguage` button with LanguageSelector
    - Update both desktop and mobile navigation layouts
    - Ensure proper spacing and styling consistency
    - _Requirements: 2.1, 6.4_
  
  - [ ]* 5.2 Write integration tests for Navbar with LanguageSelector
    - Test Navbar displays LanguageSelector
    - Test selecting language updates entire application
    - Test language preference persists across page reloads
    - _Requirements: 2.1, 2.7, 9.2, 9.3_

- [ ] 6. Write property-based tests for translation completeness
  - [ ]* 6.1 Write property test for translation completeness
    - **Property 5: Translation Completeness**
    - **Validates: Requirements 5.1, 5.6**
    - Test that all keys in English exist in all other languages
    - _Requirements: 5.1, 5.6_
  
  - [ ]* 6.2 Write property test for fallback behavior
    - **Property 6: Fallback to English for Missing Translations**
    - **Validates: Requirements 5.2**
    - **Property 7: Fallback to Key for Missing English Translations**
    - **Validates: Requirements 5.3**
    - Test fallback chain works for any missing key
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 6.3 Write property test for component re-rendering
    - **Property 9: Component Re-rendering on Language Change**
    - **Validates: Requirements 3.9, 4.14**
    - Test that any component re-renders when language changes
    - _Requirements: 3.9, 4.14_

- [x] 7. Final checkpoint and validation
  - Ensure all tests pass
  - Verify no hardcoded Turkish text remains in Dashboard or Support pages
  - Verify all 5 languages display correctly in LanguageSelector
  - Verify language preference persists across browser refresh
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check with minimum 100 iterations
- Translation keys use dot notation organized by feature area (nav, dashboard, support)
- Fallback chain: current language → English → key itself
- localStorage key: 'language'
- All components using translations must use the useLanguage hook
