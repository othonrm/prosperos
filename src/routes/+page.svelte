<script lang="ts">
	import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
	import { compareAsc, parse } from 'date-fns';
	import AssetTable from '../components/AssetTable.svelte';
	import FileInput from '../components/FileInput.svelte';
	import TransactionTable from '../components/TransactionTable.svelte';
	import '../css/main.css';
	import '../css/normalize.css';
	import { Asset } from '../models/Asset';
	import { Transaction } from '../models/Transaction';
	import { parseCsvString } from '../utils/CsvParser';
	import { storable } from '../utils/Storable.svelte';

	ModuleRegistry.registerModules([AllCommunityModule]);

	const storeFileContent = storable('storeFileContent', false);
	const fileContent = storable('statementContent', null, !$storeFileContent);
	let transactions = $state<Map<string, Transaction[]>>(new Map());
	let sortedTransactions = $state<Transaction[]>([]);
	let assets = $state<Map<string, Asset>>(new Map());

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

			transactions = newTransactions;
			assets = newAssets;
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

<AssetTable assets={assets.values().toArray()} category="Ações" />
<AssetTable assets={assets.values().toArray()} category="ETF" />
<AssetTable assets={assets.values().toArray()} category="Fundos imobiliários" />
<AssetTable assets={assets.values().toArray()} category="BDR" />

<hr />

<AssetTable assets={assets.values().toArray()} category="Tesouro direto" />
<AssetTable assets={assets.values().toArray()} category="Renda Fixa" />

<hr />

<AssetTable assets={assets.values().toArray()} category="Stocks" />
<AssetTable assets={assets.values().toArray()} category="ETF Exterior" />
<AssetTable assets={assets.values().toArray()} category="REITS" />

<hr />

<AssetTable assets={assets.values().toArray()} category="Criptomoedas" />

<hr />

<TransactionTable transactions={sortedTransactions} />
