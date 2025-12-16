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
    exchangeRates: {
        'USD': 1.0,
        'INR': 84.0,
        'EUR': 0.92,
        'GBP': 0.78,
        'JPY': 150.0
    },

    // Translations
    translations: translations,

    // Helper: Translate
    t(key) {
        const lang = this.language;
        const dict = this.translations[lang] || this.translations['en'];
        return dict[key] || this.translations['en'][key] || key;
    },

    // Helper: Convert FROM USD (for Display)
    convertFromUSD(amount) {
        const rate = this.exchangeRates[this.currency] || 1;
        return amount * rate;
    },

    // Helper: Convert TO USD (for Saving)
    convertToUSD(amount) {
        const rate = this.exchangeRates[this.currency] || 1;
        if (rate === 0) return amount;
        return amount / rate;
    },

    // Helper: Format Currency
    formatCurrency(amount) {
        // Amount is assumed to be in USD (Base)
        const symbol = this.currencySymbols[this.currency] || '$';
        const converted = this.convertFromUSD(amount);

        // Formatting locale could be dynamic but let's stick to standard decimal
        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Helper: Set Preference
    setPreference(key, value) {
        if (key === 'currency') this.currency = value;
        if (key === 'language') this.language = value;
        localStorage.setItem(key, value);
    }
};
