import type { Transaction } from './Transaction';

export class Asset {
	category: string;
	broker: string;
	assetCode: string;
	avgPriceCents: number;
	quantityHundreds: number;
	realQuantityHundreds: number;
	totalValue: number;

	constructor(
		category: string,
		broker: string,
		assetCode: string,
		avgPriceCents: number,
		quantityHundreds: number,
		realQuantityHundreds: number,
		totalValue: number
	) {
		this.category = category;
		this.broker = broker;
		this.assetCode = assetCode;
		this.avgPriceCents = avgPriceCents;
		this.quantityHundreds = quantityHundreds;
		this.realQuantityHundreds = realQuantityHundreds;
		this.totalValue = totalValue;
	}

	public computeTransaction(transaction: Transaction): void {
		const unitPriceCents = transaction.getUnitPriceAsNumber() * 100;
		const qtyHundreds = transaction.getQuantityAsNumber() * 100;

		if (transaction.operationType && transaction.operationType.toLowerCase() === 'c') {
			this.quantityHundreds += qtyHundreds;
			this.realQuantityHundreds += qtyHundreds;
			this.totalValue += unitPriceCents * qtyHundreds;
		} else if (transaction.operationType && transaction.operationType.toLowerCase() === 'v') {
			if (this.realQuantityHundreds >= qtyHundreds) {
				this.realQuantityHundreds -= qtyHundreds;
				this.totalValue -= unitPriceCents * qtyHundreds;
			}
		}

		// Update the average price (weighted average of all purchases)
		if (this.realQuantityHundreds > 0) {
			this.avgPriceCents = this.totalValue / this.realQuantityHundreds;
		} else {
			this.avgPriceCents = 0; // If no securities are owned, average price is 0
		}
	}

	public getTotalInvestedCents(): number {
		return (this.avgPriceCents * this.quantityHundreds) / 100;
	}
}
