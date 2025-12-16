import { translations } from './translations.js';

export const state = {
    user: null,
    token: localStorage.getItem('token'),
    currency: localStorage.getItem('currency') || 'USD',
    language: localStorage.getItem('language') || 'en',

    // Currency Configuration
    currencySymbols: {
        'USD': '$',
        'INR': '₹',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥'
    },

    // Translations
    translations: translations,

    // Helper: Translate
    t(key) {
        const lang = this.language;
        const dict = this.translations[lang] || this.translations['en'];
        return dict[key] || this.translations['en'][key] || key;
    },

    // Helper: Format Currency
    formatCurrency(amount) {
        const symbol = this.currencySymbols[this.currency] || '$';
        return `${symbol}${amount.toFixed(2)}`;
    },

    // Helper: Set Preference
    setPreference(key, value) {
        if (key === 'currency') this.currency = value;
        if (key === 'language') this.language = value;
        localStorage.setItem(key, value);
    }
};
