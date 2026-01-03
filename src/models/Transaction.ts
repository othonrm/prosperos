export class Transaction {
	category: string;
	brokerage: string;
	broker: string;
	assetCode: string;
	operationDate: string;
	irrf: string;
	taxes: string;
	operationType: string;
	unitPrice: string;
	quantity: string;
	fees: string;

	constructor(
		category: string,
		brokerage: string,
		broker: string,
		assetCode: string,
		operationDate: string,
		irrf: string,
		taxes: string,
		operationType: string,
		unitPrice: string,
		quantity: string,
		fees: string
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
	}

	static fromCSVObject(csvObject: { [key: string]: string }): Transaction {
		return new Transaction(
			csvObject.Category || csvObject.Categoria,
			csvObject.Brokerage || csvObject.Corretagem,
			csvObject.Broker || csvObject.Corretora,
			csvObject['Asset Code'] || csvObject['Código Ativo'],
			csvObject['Operation Date'] || csvObject['Data operação'],
			csvObject.IRRF,
			csvObject.Taxes || csvObject.Impostos,
			csvObject['Operation Type'] || csvObject['Operação C/V'],
			csvObject['Unit Price'] || csvObject['Preço unitário'],
			csvObject.Quantity || csvObject.Quantidade,
			csvObject.Fees || csvObject.Taxas
		);
	}

	getUnitPriceAsNumber(): number {
		return Number.parseFloat(this.unitPrice);
	}

	getQuantityAsNumber(): number {
		return Number.parseFloat(this.quantity);
	}

	getTotalValue(): number {
		return this.getUnitPriceAsNumber() * this.getQuantityAsNumber();
	}
}
