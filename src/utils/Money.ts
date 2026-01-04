import type { Currency } from '../models/Transaction';
import { currencyAtom } from '../state/Currency.svelte';
import { langAtom } from '../state/Localization.svelte';

export class Money {
	amountCents;
	currency;

	constructor(amountCents: number, currency?: Currency) {
		this.amountCents = amountCents;
		this.currency = currency || currencyAtom;
	}

	public toDisplayString(): string {
		return (this.amountCents / 100).toLocaleString(langAtom, {
			style: 'currency',
			currency: currencyAtom
		});
	}
}
