<script lang="ts">
	import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
	import { compareAsc, parse } from 'date-fns';
	import { fetchMultipleQuotes } from '../api/StockQuote';
	import AllocationChart from '../components/AllocationChart.svelte';
	import AssetTable from '../components/AssetTable.svelte';
	import FileInput from '../components/FileInput.svelte';
	import TransactionTable from '../components/TransactionTable.svelte';
	import '../css/main.css';
	import '../css/normalize.css';
	import { Asset, type AssetCategory } from '../models/Asset';
	import { Transaction } from '../models/Transaction';
	import { convertCurrency } from '../state/Currency.svelte';
	import { parseCsvString } from '../utils/CsvParser';
	import { storable } from '../utils/Storable.svelte';

	ModuleRegistry.registerModules([AllCommunityModule]);

	const storeFileContent = storable('storeFileContent', false);
	const fileContent = storable('statementContent', null, !$storeFileContent);
	let transactions = $state<Map<string, Transaction[]>>(new Map());
	let sortedTransactions = $state<Transaction[]>([]);
	let assets = $state<Map<string, Asset>>(new Map());

	let totalPerCategory: Map<AssetCategory, number> = $state(new Map());

	const assetsArray = $derived(assets.values().toArray());

	$effect(() => {
		const newMap = new Map();
		for (const asset of assetsArray) {
			let curr = newMap.get(asset.category) || 0;
			curr += asset.getMarketTotalCents();
			newMap.set(asset.category, curr);
		}
		totalPerCategory = newMap;
	});

	const totalAllocation = $derived(totalPerCategory.values().reduce((acc, curr) => acc + curr, 0));

	$effect(() => {
		if ($fileContent) {
			const parsedValue = parseCsvString($fileContent);

			sortedTransactions = parsedValue
				.map(Transaction.fromCSVObject)
				.filter((t) => t.assetCode)
				// .filter((t) => t.assetCode === 'TSLA34')
				.sort((a, b) => {
					if (a.operationDate === b.operationDate) {
						if (a.operationType.toLowerCase() === 'c') {
							return 1;
						}
						return -1;
					}
					return compareAsc(
						parse(a.operationDate, 'dd/MM/yyyy', new Date()),
						parse(b.operationDate, 'dd/MM/yyyy', new Date())
					);
				});
		}
	});

	$effect(() => {
		if (sortedTransactions.length > 0) {
			const newTransactions = new Map();
			const newAssets = new Map<string, Asset>();

			for (const transaction of sortedTransactions) {
				const existingTransForAsset = newTransactions.get(transaction.assetCode) || [];
				existingTransForAsset.push(transaction);
				newTransactions.set(transaction.assetCode, existingTransForAsset);

				const asset =
					newAssets.get(transaction.assetCode) ||
					new Asset(
						transaction.category,
						transaction.broker,
						transaction.assetCode,
						0,
						0,
						0,
						0,
						transaction.currency
					);

				asset.computeTransaction(transaction);

				newAssets.set(transaction.assetCode, asset);
			}

			for (const asset of newAssets.values()) {
				if (!(asset.getTotalInvestedCents() > 0)) {
					newAssets.delete(asset.assetCode);
				}
			}

			fetchMultipleQuotes(newAssets.keys().toArray()).then((quotes) => {
				for (const quote of quotes) {
					if (!quote) {
						continue;
					}
					const asset = newAssets.get(quote.symbol);
					if (quote?.regularMarketPrice >= 0 && asset) {
						asset.marketPriceCents = convertCurrency(
							quote.regularMarketPrice * 100,
							quote.currency,
							asset.currency
						);
					}
				}
				transactions = newTransactions;
				assets = newAssets;
			});
		}
	});
</script>

<h1>Prosperos</h1>
<p>Upload your transactions or statement to consolidate your portfolio.</p>

<FileInput bind:fileContent={$fileContent} />

<br />
<br />

<div>
	<label>
		Store file contents.
		<input bind:checked={$storeFileContent} type="checkbox" />
	</label>
</div>

<hr />

<h1>Portfolio</h1>

<AllocationChart {totalAllocation} {totalPerCategory} />

<AssetTable assets={assetsArray} category="Ações" />
<AssetTable assets={assetsArray} category="ETF" />
<AssetTable assets={assetsArray} category="Fundos imobiliários" />
<AssetTable assets={assetsArray} category="BDR" />

<hr />

<AssetTable assets={assetsArray} category="Tesouro direto" />
<AssetTable assets={assetsArray} category="Renda Fixa" />

<hr />

<AssetTable assets={assetsArray} category="Stocks" />
<AssetTable assets={assetsArray} category="ETF Exterior" />
<AssetTable assets={assetsArray} category="REITS" />

<hr />

<AssetTable assets={assetsArray} category="Criptomoedas" />

<hr />

<TransactionTable transactions={sortedTransactions} />
