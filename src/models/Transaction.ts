import type { AssetCategory } from './Asset';

export type Fiat = 'BRL' | 'USD';

export const AssetCategoryToCurrencyMap: Record<AssetCategory, Fiat> = {
	Ações: 'BRL',
	BDR: 'BRL',
	Criptomoedas: 'BRL',
	'ETF Exterior': 'USD',
	ETF: 'BRL',
	'Fundos imobiliários': 'BRL',
	REITS: 'USD',
	Stocks: 'USD',
	'Tesouro direto': 'BRL'
};

export class Transaction {
	category;
	brokerage;
	broker;
	assetCode;
	operationDate;
	irrf;
	taxes;
	operationType;
	unitPrice;
	quantity;
	fees;
	currency;

	constructor(
		category: AssetCategory,
		brokerage: string,
		broker: string,
		assetCode: string,
		operationDate: string,
		irrf: string,
		taxes: string,
		operationType: string,
		unitPrice: string,
		quantity: string,
		fees: string,
		currency: Fiat
	) {
		this.category = category;
		this.brokerage = brokerage;
		this.broker = broker;
		this.assetCode = assetCode;
		this.operationDate = operationDate;
		this.irrf = irrf;
		this.taxes = taxes;
		this.operationType = operationType;
		this.unitPrice = unitPrice;
		this.quantity = quantity;
		this.fees = fees;
		this.currency = currency;
	}

	static fromCSVObject(csvObject: { [key: string]: string }): Transaction {
		return new Transaction(
			(csvObject.Category || csvObject.Categoria) as AssetCategory,
			csvObject.Brokerage || csvObject.Corretagem,
			csvObject.Broker || csvObject.Corretora,
			csvObject['Asset Code'] || csvObject['Código Ativo'],
			csvObject['Operation Date'] || csvObject['Data operação'],
			csvObject.IRRF,
			csvObject.Taxes || csvObject.Impostos,
			csvObject['Operation Type'] || csvObject['Operação C/V'],
			csvObject['Unit Price'] || csvObject['Preço unitário'],
			csvObject.Quantity || csvObject.Quantidade,
			csvObject.Fees || csvObject.Taxas,
			AssetCategoryToCurrencyMap[csvObject.Categoria as AssetCategory]
		);
	}

	private getUnitPriceAsNumber(): number {
		return Number.parseFloat(this.unitPrice.replace('.', '').replace(',', '.'));
	}

	getUnitPriceCents(): number {
		return this.getUnitPriceAsNumber() * 100;
	}

	private getQuantityAsNumber(): number {
		return Number.parseFloat(this.quantity.replace('.', '').replace(',', '.'));
	}

	getUnitPriceHundreds(): number {
		return this.getQuantityAsNumber() * 100;
	}

	getTotalValue(): number {
		return (this.getUnitPriceCents() * this.getUnitPriceHundreds()) / 10000;
	}
}
