/* eslint-disable @typescript-eslint/no-explicit-any */

const quoteCacheKey = 'cryptoQuoteCache';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const quoteCache: Record<string, any> = JSON.parse(localStorage.getItem(quoteCacheKey) || '{}');

// const REQUEST_TICKER_LIMIT = 10;

const cacheDurationMinutes = 60 * 6;

export const fetchCryptoQuotes = async (tickers: string[]) => {
	const responses = [];

	// const chunks = [];
	// for (let i = 0; i <= Math.ceil(tickers.length / REQUEST_TICKER_LIMIT); i++) {
	// 	chunks.push(tickers.splice(0, REQUEST_TICKER_LIMIT));
	// }

	for await (const t of tickers) {
		const result = await fetchSingleQuote(t);
		responses.push(result);
	}

	return responses;
};

export const fetchSingleQuote = async (coin: string) => {
	if (quoteCache[coin]) {
		const fetchedAt = new Date(quoteCache[coin].fetchedAt);
		const now = new Date();
		const diffMinutes = (now.getTime() - fetchedAt.getTime()) / 1000 / 60;
		if (diffMinutes < cacheDurationMinutes) {
			return quoteCache[coin];
		}
	}
	const token = import.meta.env.VITE_BRAPI_TOKEN;
	const response = await fetch(
		`https://brapi.dev/api/v2/crypto?coin=${coin}&currency=BRL&token=${token}`
	);
	const data = await response.json();
	quoteCache[coin] = {
		...(data?.coins?.[0] || {}),
		fetchedAt: new Date().toISOString()
	};
	localStorage.setItem(quoteCacheKey, JSON.stringify(quoteCache));
	if (!data.coins?.length) {
		console.warn(`No data found for ticker: ${coin}`);
		return null;
	}
	return data.coins[0];
};
