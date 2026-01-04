import { currencyAtom, toCurrentCurrency } from '../state/Currency.svelte';
import { langAtom } from '../state/Localization.svelte';
import type { Currency, Transaction } from './Transaction';

export type AssetCategory =
	| 'Ações'
	| 'BDR'
	| 'Criptomoedas'
	| 'ETF Exterior'
	| 'ETF'
	| 'Fundos imobiliários'
	| 'REITS'
	| 'Renda Fixa'
	| 'Stocks'
	| 'Tesouro direto';

export class Asset {
	category;
	broker;
	assetCode;
	avgPriceCents;
	quantityHundreds;
	realQuantityHundreds;
	totalValueCents;
	currency;
	marketPriceCents?: number;

	constructor(
		category: AssetCategory,
		broker: string,
		assetCode: string,
		avgPriceCents: number,
		quantityHundreds: number,
		realQuantityHundreds: number,
		totalValueCents: number,
		currency: Currency,
		marketPriceCents?: number
	) {
		this.category = category;
		this.broker = broker;
		this.assetCode = assetCode;
		this.avgPriceCents = avgPriceCents;
		this.quantityHundreds = quantityHundreds;
		this.realQuantityHundreds = realQuantityHundreds;
		this.totalValueCents = totalValueCents;
		this.currency = currency;
		this.marketPriceCents = marketPriceCents;
	}

	public computeTransaction(transaction: Transaction): void {
		const unitPriceCents = transaction.getUnitPriceCents();
		const qtyHundreds = transaction.getUnitPriceHundreds();

		const oldQuantity = this.quantityHundreds;

		if (transaction.operationType.toLowerCase() === 'c') {
			this.quantityHundreds += qtyHundreds;
			this.realQuantityHundreds += qtyHundreds;
			this.totalValueCents += (qtyHundreds * unitPriceCents) / 100;
			this.avgPriceCents =
				(oldQuantity * this.avgPriceCents + qtyHundreds * unitPriceCents) / this.quantityHundreds;
		} else {
			this.quantityHundreds -= qtyHundreds;
			this.realQuantityHundreds -= qtyHundreds;
			this.totalValueCents -= (qtyHundreds * unitPriceCents) / 100;
		}
	}

	public getTotalInvestedCents(): number {
		const totalCents = (this.avgPriceCents * this.quantityHundreds) / 100;
		return toCurrentCurrency(totalCents, this.currency);
	}

	public getTotalInvestedDisplay(): string {
		return (this.getTotalInvestedCents() / 100).toLocaleString(langAtom, {
			style: 'currency',
			currency: currencyAtom
		});
	}

	public getMarketTotalCents(): number {
		if (!this.marketPriceCents) return 0;
		const totalCents = (this.marketPriceCents * this.quantityHundreds) / 100;
		return toCurrentCurrency(totalCents, this.currency);
	}

	public getMarketTotalDisplay(): string {
		return (this.getMarketTotalCents() / 100).toLocaleString(langAtom, {
			style: 'currency',
			currency: currencyAtom
		});
	}

	public getQuantityPrecision(): number {
		switch (this.category) {
			case 'Ações':
			case 'BDR':
			case 'ETF':
			case 'Fundos imobiliários':
			case 'Tesouro direto':
				return 2;

			case 'Criptomoedas':
			case 'ETF Exterior':
			case 'REITS':
			case 'Stocks':
				return 8;

			default:
				return 2;
		}
	}
}
