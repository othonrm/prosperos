/* eslint-disable @typescript-eslint/no-explicit-any */

const quoteCacheKey = 'stockQuoteCache';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const quoteCache: Record<string, any> = JSON.parse(localStorage.getItem(quoteCacheKey) || '{}');

const cacheDurationMinutes = 60 * 6;

export const fetchMultipleQuotes = async (tickers: string[]) => {
	const responses = [];

	for await (const t of tickers) {
		const result = await fetchSingleQuote(t);
		responses.push(result);
	}

	return responses;
};

export const fetchSingleQuote = async (ticker: string) => {
	if (quoteCache[ticker]) {
		const fetchedAt = new Date(quoteCache[ticker].fetchedAt);
		const now = new Date();
		const diffMinutes = (now.getTime() - fetchedAt.getTime()) / 1000 / 60;
		if (diffMinutes < cacheDurationMinutes) {
			return quoteCache[ticker];
		}
	}
	const token = import.meta.env.VITE_BRAPI_TOKEN;
	const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${token}`);
	const data = await response.json();
	quoteCache[ticker] = {
		...(data?.results?.[0] || {}),
		fetchedAt: new Date().toISOString()
	};
	localStorage.setItem(quoteCacheKey, JSON.stringify(quoteCache));
	if (!data.results?.length) {
		console.warn(`No data found for ticker: ${ticker}`);
		return null;
	}
	return data.results[0];
};
