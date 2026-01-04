/* eslint-disable @typescript-eslint/no-explicit-any */

const quoteCacheKey = 'brazilianTreasuryBondQuoteCache';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const quoteCache: Record<string, any> = JSON.parse(localStorage.getItem(quoteCacheKey) || '{}');

export const fetchBrTreasuryBonds = async (bondKeys: string[]) => {
	const hasCachedData = bondKeys.every((k) => quoteCache[k]);

	if (hasCachedData) {
		const fetchedAt = new Date(quoteCache[bondKeys[0]].fetchedAt);
		const now = new Date();
		const diffHours = (now.getTime() - fetchedAt.getTime()) / 1000;
		if (diffHours < 12) {
			return Object.values(quoteCache).filter((bond) => bondKeys.includes(bond.bondKey));
		}
	}

	const response = await fetch(
		'https://www.tesourodireto.com.br/o/c/rentabilidades/?pageSize=200&sort=targetYear%3Adesc',
		{
			headers: {
				accept: 'application/json, text/plain, */*'
			},
			body: null,
			method: 'GET',
			mode: 'cors'
		}
	);
	const data = await response.json();

	const bonds: { treasuryBondName: string; bondKey: string }[] = data.items?.map(
		(bond: { treasuryBondName: string }) => {
			const bondKey = bond.treasuryBondName.replaceAll('+', '').replaceAll(' ', '-').toLowerCase();
			if (!bondKey) {
				return;
			}
			quoteCache[bondKey] = {
				...(bond || {}),
				bondKey,
				fetchedAt: new Date().toISOString()
			};
			return {
				...bond,
				bondKey
			};
		}
	);

	localStorage.setItem(quoteCacheKey, JSON.stringify(quoteCache));
	if (!bonds?.length) {
		console.warn('No data found for brazilian bonds.');
		return null;
	}
	return bonds.filter((bond) => bondKeys.includes(bond.bondKey));
};
