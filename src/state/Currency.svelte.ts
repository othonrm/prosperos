import type { Currency } from '../models/Transaction';

export const currencyAtom: Currency = $state('BRL');

export const currencyConversionRates: Record<Currency, number> = {
	BRL: 1,
	USD: 0.18
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
	const rate = currencyConversionRates[to] / currencyConversionRates[from];
	return amount * rate;
};

export const toCurrentCurrency = (amount: number, currency: Currency): number => {
	return convertCurrency(amount, currency, currencyAtom);
};
