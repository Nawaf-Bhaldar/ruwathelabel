// src/utils/currency.js

export const RATES = { KWD: 1, USD: 3.25, EUR: 3.01, SAR: 12.17, AED: 11.94 };

export const convertKWD = (amountKWD, to) => amountKWD * (RATES[to] ?? 1);

export const fmt = (amount, code) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(amount);
