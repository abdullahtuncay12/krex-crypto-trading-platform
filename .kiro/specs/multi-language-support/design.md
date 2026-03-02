# Design Document: Multi-Language Support (i18n)

## Overview

This design document outlines the implementation of comprehensive internationalization (i18n) support for the MoonLlama crypto trading platform. The system will expand from the current 2-language support (Turkish and English) to 5 languages (English, Turkish, Russian, Japanese, and German), change the default language from Turkish to English, implement a language selector in the Navbar, and provide complete translations for all pages including the Dashboard and Support pages.

### Goals

- Expand language support from 2 to 5 languages with English as the default
- Implement a user-friendly language selector in the navigation bar
- Translate all hardcoded Turkish text in Dashboard and Support pages
- Maintain backward compatibility with existing Navbar translations
- Provide a scalable translation structure for future expansion
- Persist user language preferences across sessions

### Non-Goals

- Automatic language detection based on browser locale (may be added in future)
- Right-to-left (RTL) language support (not needed for current languages)
- Dynamic translation loading (all translations will be bundled)
- Translation management UI for administrators
- Machine translation integration

## Architecture

### High-Level Architecture

The i18n system follows a centralized translation management pattern using React Context API:

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Root                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           LanguageProvider (Context)                    │ │
│  │                                                          │ │
│  │  ├─ Language State (en|tr|ru|ja|de)                    │ │
│  │  ├─ Translation Objects (5 languages)                  │ │
│  │  ├─ Translation Function t(key)                        │ │
│  │  └─ Language Setter setLanguage(lang)                  │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────┐   │ │
│  │  │         localStorage Persistence                │   │ │
│  │  │  - Read on init                                 │   │ │
│  │  │  - Write on language change                     │   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ useLanguage()                    │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Consumer Components                        │ │
│  │                                                          │ │
│  │  ├─ Navbar (with Language Selector)                    │ │
│  │  ├─ InvestmentDashboard                                │ │
│  │  ├─ SupportPage                                        │ │
│  │  └─ Other Components                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Translation Flow

1. User selects language from Language Selector dropdown
2. Language Selector calls `setLanguage(newLang)`
3. LanguageContext updates state and persists to localStorage
4. All components using `useLanguage()` hook re-render
5. Components call `t(key)` to retrieve translated strings
6. Translation function returns string for current language or falls back to English

### Key Design Decisions

**Decision 1: React Context API vs External Library**
- Chosen: React Context API
- Rationale: The application has simple i18n needs without pluralization, date formatting, or complex interpolation. Context API provides sufficient functionality with zero dependencies and full type safety.

**Decision 2: Bundled vs Dynamic Translation Loading**
- Chosen: Bundled translations
- Rationale: With only 5 languages and relatively small translation files, bundling all translations simplifies the architecture and eliminates loading states. Total translation size is estimated at <50KB.

**Decision 3: English as Default Language**
- Chosen: English (en) as default
- Rationale: English is the most widely understood language globally and serves as the lingua franca for cryptocurrency trading. This aligns with international user expectations.

**Decision 4: Flat vs Nested Translation Keys**
- Chosen: Nested structure with dot notation
- Rationale: Nested objects organized by feature area (nav, dashboard, support) improve maintainability and make it clear which translations belong to which components.

## Components and Interfaces

### LanguageContext

**File:** `frontend/src/contexts/LanguageContext.tsx`

**Purpose:** Provides centralized language state management and translation functions to all components.

**Type Definitions:**

```typescript
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
```

**Key Functions:**

- `t(key: string): string` - Retrieves translated string for given key in current language, falls back to English, then returns key if not found
- `setLanguage(lang: Language): void` - Updates current language and persists to localStorage
- `useLanguage(): LanguageContextType` - Hook for consuming components to access language state and functions

**Implementation Details:**

- Initializes language from localStorage or defaults to 'en'
- Uses `useEffect` to persist language changes to localStorage
- Throws error if `useLanguage` is called outside LanguageProvider
- Translation lookup uses nested key access (e.g., 'dashboard.title' → translations[lang].dashboard.title)

### Language Selector Component

**File:** `frontend/src/components/LanguageSelector.tsx` (new file)

**Purpose:** Dropdown UI component in Navbar for selecting language.

**Props:** None (uses LanguageContext directly)

**UI Design:**

- Displays current language as a button with flag emoji or language code
- Dropdown menu shows all 5 languages with names in their native script
- Highlights currently selected language
- Closes dropdown after selection

**Language Display Format:**

```
🇬🇧 English
🇹🇷 Türkçe
🇷🇺 Русский
🇯🇵 日本語
🇩🇪 Deutsch
```

**Accessibility:**

- Keyboard navigation support (Tab, Enter, Escape)
- ARIA labels for screen readers
- Focus management for dropdown

### Updated Components

**Navbar Component**
- Integrates LanguageSelector component
- Maintains existing translation keys for navigation items
- Adds new translations for Russian, Japanese, and German

**InvestmentDashboard Component**
- Replaces all hardcoded Turkish strings with `t()` calls
- Uses translation keys from `dashboard.*` namespace
- Maintains existing functionality and layout

**SupportPage Component**
- Replaces all hardcoded Turkish strings with `t()` calls
- Uses translation keys from `support.*` namespace
- Maintains existing form validation and submission logic

## Data Models

### Translation Structure

The translation object follows a nested structure organized by feature area:

```typescript
const translations = {
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
      premium: 'PREMIUM'
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
      cancelledInvestments: 'Cancelled Investments'
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
          other: 'Other'
        },
        message: 'Your Message',
        messagePlaceholder: 'Please describe your issue in detail...',
        submit: 'Submit',
        successMessage: 'Your support request has been received. We will get back to you shortly.'
      },
      contactInfo: {
        title: 'Contact Information',
        email: 'Email',
        phone: 'Phone',
        hours: 'Working Hours',
        hoursValue: '24/7 Support'
      },
      faq: {
        title: 'Frequently Asked Questions',
        q1: 'How do I verify my account?',
        a1: 'Go to the identity verification section in profile settings.',
        q2: 'How long does withdrawal take?',
        a2: 'Withdrawal transactions are completed within 1-3 business days.',
        q3: 'How does the trading bot work?',
        a3: 'The bot performs automatic buy-sell operations using AI algorithms.'
      }
    }
  },
  tr: {
    // Turkish translations (existing + new)
  },
  ru: {
    // Russian translations (all keys)
  },
  ja: {
    // Japanese translations (all keys)
  },
  de: {
    // German translations (all keys)
  }
};
```

### Translation Key Naming Convention

- Use dot notation for nested keys: `feature.section.item`
- Use camelCase for key names: `currentProfitLoss`, not `current_profit_loss`
- Group related translations under common prefixes
- Keep keys descriptive but concise
- Use consistent naming patterns across features

**Examples:**
- `nav.home` - Navigation items
- `dashboard.title` - Page titles
- `support.form.name` - Form fields
- `support.faq.q1` - FAQ items

### localStorage Schema

**Key:** `language`
**Value:** Language code string (`'en' | 'tr' | 'ru' | 'ja' | 'de'`)
**Example:** `localStorage.setItem('language', 'en')`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

**Redundancy Group 1: Language Persistence**
- Criteria 2.5, 9.1, and 9.6 all test that language changes are persisted to localStorage
- These can be combined into a single property about persistence

**Redundancy Group 2: Language Restoration**
- Criteria 2.7 and 9.3 both test that stored language preferences are restored
- These represent the same round-trip property

**Redundancy Group 3: Default Language Initialization**
- Criteria 1.6, 1.7, and 9.4 all test that English is the default when no preference exists
- These are the same example test

**Redundancy Group 4: Translation Function Behavior**
- Criteria 7.3, 7.6, and 10.6 all test the translation function's basic behavior
- These can be combined into a single property

**Redundancy Group 5: Language Update Behavior**
- Criteria 2.4 and 7.4 both test that setLanguage updates the current language
- These are the same property

**Redundancy Group 6: Translation Completeness**
- Criteria 5.1 and 5.6 both test that all keys exist in all languages
- These are the same property

**Redundancy Group 7: Supported Languages**
- Criteria 1.1-1.5 all test that specific languages are supported
- These can be combined into a single example test

**Redundancy Group 8: Dashboard/Support Translation Keys**
- Criteria 3.3-3.8 and 4.3-4.13 test that specific translation keys exist
- These are all example tests that can be grouped

**Redundancy Group 9: Page Re-rendering on Language Change**
- Criteria 3.9 and 4.14 test the same behavior for different pages
- These can be combined into a single property about React re-rendering

After reflection, the unique testable properties are:

**Properties (Universal Rules):**
1. Language selection persistence (2.5, 9.1, 9.6)
2. Language preference restoration round-trip (2.7, 9.3)
3. Translation function returns strings for all valid keys (7.3, 7.6, 10.6)
4. Language selector displays current language (2.6)
5. Translation completeness across all languages (5.1, 5.6)
6. Fallback to English for missing translations (5.2)
7. Fallback to key for missing English translations (5.3)
8. Invalid language code defaults to English (9.5)
9. Components re-render on language change (3.9, 4.14)

**Examples (Specific Cases):**
1. All 5 languages are supported (1.1-1.5)
2. Default language is English (1.6, 1.7, 9.4)
3. Required translation keys exist (3.3-3.8, 4.3-4.13, 6.1-6.3)
4. Language selector shows all 5 options (2.2)
5. Navbar displays language selector (2.1)
6. useLanguage hook structure (10.1, 10.3)
7. Language context exposes current language (7.5)
8. Initialization checks localStorage (9.2)

**Edge Cases:**
1. useLanguage throws error outside provider (10.2)
2. Clicking language selector shows dropdown (2.3)

### Property 1: Language Selection Persistence

*For any* supported language code (en, tr, ru, ja, de), when a user selects that language through setLanguage, the system should immediately persist that language code to localStorage under the key 'language'.

**Validates: Requirements 2.5, 9.1, 9.6**

### Property 2: Language Preference Restoration

*For any* supported language code, if that language is saved to localStorage and the application is reinitialized, the Language Context should restore that language as the current language.

**Validates: Requirements 2.7, 9.3**

### Property 3: Translation Function Returns Strings

*For any* translation key that exists in the current language's translation object, calling t(key) should return a non-empty string value.

**Validates: Requirements 7.3, 7.6, 10.6**

### Property 4: Language Selector Visual Feedback

*For any* supported language, when that language is set as the current language, the Language Selector component should visually display that language as selected (through styling, icon, or text).

**Validates: Requirements 2.6**

### Property 5: Translation Completeness

*For any* translation key that exists in the English translation object, that same key should exist in all other language translation objects (tr, ru, ja, de).

**Validates: Requirements 5.1, 5.6**

### Property 6: Fallback to English for Missing Translations

*For any* translation key and any non-English language, if that key is missing from the selected language's translation object but exists in the English translation object, calling t(key) should return the English translation.

**Validates: Requirements 5.2**

### Property 7: Fallback to Key for Missing English Translations

*For any* translation key, if that key does not exist in any language's translation object including English, calling t(key) should return the key itself as a string.

**Validates: Requirements 5.3**

### Property 8: Invalid Language Code Handling

*For any* string value that is not a valid language code (not 'en', 'tr', 'ru', 'ja', or 'de'), if that value is stored in localStorage under the 'language' key, the Language Context should initialize with English ('en') as the current language.

**Validates: Requirements 9.5**

### Property 9: Component Re-rendering on Language Change

*For any* component using the useLanguage hook and displaying translated text, when the language changes through setLanguage, that component should re-render and display translations in the new language.

**Validates: Requirements 3.9, 4.14**

## Error Handling

### Translation Key Not Found

**Scenario:** A component requests a translation key that doesn't exist in any language.

**Handling:**
1. Check current language translation object
2. If not found, check English (fallback) translation object
3. If still not found, return the key itself as a string
4. Log warning to console in development mode: `Translation key not found: ${key}`

**Rationale:** Returning the key itself ensures the UI doesn't break and makes missing translations visible to developers.

### Invalid Language Code

**Scenario:** localStorage contains an invalid or unsupported language code.

**Handling:**
1. Validate language code against supported languages: ['en', 'tr', 'ru', 'ja', 'de']
2. If invalid, default to English ('en')
3. Log warning to console: `Invalid language code: ${code}, defaulting to English`
4. Update localStorage with valid default

**Rationale:** Graceful degradation ensures the application remains functional even with corrupted localStorage data.

### useLanguage Hook Called Outside Provider

**Scenario:** A component calls useLanguage() but is not wrapped in LanguageProvider.

**Handling:**
1. Throw descriptive error: `useLanguage must be used within LanguageProvider`
2. Error boundary should catch and display user-friendly message

**Rationale:** This is a developer error that should be caught during development, not silently ignored.

### localStorage Access Failure

**Scenario:** localStorage is unavailable (private browsing, quota exceeded, or disabled).

**Handling:**
1. Wrap localStorage operations in try-catch blocks
2. If read fails, default to English ('en')
3. If write fails, continue with in-memory state only
4. Log warning to console: `localStorage unavailable, language preference will not persist`

**Rationale:** The application should remain functional even when localStorage is unavailable, with degraded persistence functionality.

### Missing Translation in Production

**Scenario:** A translation key exists in some languages but not others, and fallback chain fails.

**Handling:**
1. Return the translation key itself (as per Property 7)
2. In production, log error to monitoring service
3. Display key to user (makes issue visible but doesn't break UI)

**Rationale:** Visible missing translations are better than broken UI, and logging helps identify issues in production.

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** will focus on:
- Specific examples of translation key lookups
- Component rendering with specific languages
- Edge cases like invalid language codes
- Error conditions like missing provider
- Integration between components (Navbar + LanguageSelector)

**Property-Based Tests** will focus on:
- Universal properties that hold for all languages
- Round-trip properties (save/restore language preference)
- Translation completeness across all languages
- Fallback behavior for any missing key
- Re-rendering behavior for any language change

### Property-Based Testing Configuration

**Library:** fast-check (for TypeScript/React)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with reference to design property
- Tag format: `Feature: multi-language-support, Property {number}: {property_text}`

**Example Property Test Structure:**

```typescript
import fc from 'fast-check';

describe('Property 1: Language Selection Persistence', () => {
  it('should persist any selected language to localStorage', () => {
    // Feature: multi-language-support, Property 1: Language selection persistence
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'tr', 'ru', 'ja', 'de'),
        (language) => {
          // Test implementation
          const { result } = renderHook(() => useLanguage(), {
            wrapper: LanguageProvider,
          });
          
          act(() => {
            result.current.setLanguage(language);
          });
          
          expect(localStorage.getItem('language')).toBe(language);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

**LanguageContext Tests:**
- Default initialization to English
- Language switching updates state
- Translation function returns correct strings
- Fallback to English for missing keys
- Fallback to key for completely missing keys
- localStorage persistence on language change
- localStorage restoration on initialization
- Invalid language code handling
- useLanguage hook error outside provider

**LanguageSelector Tests:**
- Renders all 5 language options
- Displays current language
- Clicking option calls setLanguage
- Dropdown opens and closes correctly
- Keyboard navigation works
- Accessibility attributes present

**InvestmentDashboard Tests:**
- All text uses translation keys (no hardcoded strings)
- Renders correctly in each language
- Re-renders when language changes
- All required translation keys exist

**SupportPage Tests:**
- All text uses translation keys (no hardcoded strings)
- Form labels and placeholders translated
- Renders correctly in each language
- Re-renders when language changes
- All required translation keys exist

**Integration Tests:**
- Navbar displays LanguageSelector
- Selecting language updates entire application
- Language preference persists across page reloads
- All pages display correct language simultaneously

### Test Organization

```
frontend/src/
├── contexts/
│   └── __tests__/
│       ├── LanguageContext.test.tsx (unit + property tests)
│       └── LanguageContext.property.test.tsx (property tests only)
├── components/
│   └── __tests__/
│       ├── LanguageSelector.test.tsx (unit tests)
│       └── Navbar.test.tsx (integration test)
└── pages/
    └── __tests__/
        ├── InvestmentDashboard.i18n.test.tsx (translation tests)
        └── SupportPage.i18n.test.tsx (translation tests)
```

### Translation Completeness Validation

A dedicated test suite will validate translation completeness:

```typescript
describe('Translation Completeness', () => {
  const languages = ['en', 'tr', 'ru', 'ja', 'de'];
  const baseLanguage = 'en';
  
  it('should have all keys in all languages', () => {
    // Feature: multi-language-support, Property 5: Translation completeness
    const baseKeys = getAllKeys(translations[baseLanguage]);
    
    languages.forEach(lang => {
      if (lang === baseLanguage) return;
      
      const langKeys = getAllKeys(translations[lang]);
      baseKeys.forEach(key => {
        expect(langKeys).toContain(key);
      });
    });
  });
});
```

### Manual Testing Checklist

- [ ] Switch between all 5 languages and verify UI updates
- [ ] Verify language preference persists after browser refresh
- [ ] Test with localStorage disabled (private browsing)
- [ ] Verify all pages display correct translations
- [ ] Check for any remaining hardcoded text
- [ ] Test keyboard navigation in language selector
- [ ] Verify screen reader announces language changes
- [ ] Test with browser zoom at 200%
- [ ] Verify mobile responsive design for language selector
- [ ] Check that flag emojis display correctly across browsers

