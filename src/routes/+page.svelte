<script lang="ts">
	import { compareAsc, parse } from 'date-fns';
	import FileInput from '../components/FileInput.svelte';
	import TransactionTable from '../components/TransactionTable.svelte';
	import { Asset, type AssetCategory } from '../models/Asset';
	import { Transaction } from '../models/Transaction';
	import { parseCsvString } from '../utils/CsvParser';
	import { storable } from '../utils/Storable.svelte';

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
		console.log('sortedTransactions: ', sortedTransactions);

		if (sortedTransactions.length > 0) {
			const newTransactions = new Map();
			const newAssets = new Map();

			for (const transaction of sortedTransactions) {
				const skipCategories = ['Ações', 'Fundos imobiliários', 'ETF'];
				if (skipCategories.includes(transaction.category)) {
					// continue;
				}

				const existingTransForAsset = newTransactions.get(transaction.assetCode) || [];
				existingTransForAsset.push(transaction);
				newTransactions.set(transaction.assetCode, existingTransForAsset);

				const asset =
					newAssets.get(transaction.assetCode) ||
					new Asset(
						transaction.category as AssetCategory,
						transaction.broker,
						transaction.assetCode,
						0,
						0,
						0,
						0
					);

				asset.computeTransaction(transaction);

				newAssets.set(transaction.assetCode, asset);
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

<label>
	Store file contents.
	<input bind:checked={$storeFileContent} type="checkbox" />
</label>

<br />
<br />

<table>
	<thead>
		<tr>
			<th>Asset</th>
			<th>Average Price</th>
			<td>Current Price</td>
			<th>Difference (Avg / Current)</th>
			<th>Quantity</th>
			<th>HOLDINGS (Current)</th>
			<th>Total Invested</th>
			<th>Change (Today)</th>
			<th>Change (Total)</th>
			<th>% in Stocks</th>
			<th>% in Portfolio</th>
		</tr>
	</thead>
	<tbody>
		{#each assets
			.values()
			.toArray()
			.filter((asset) => asset.quantityHundreds > 0) as asset}
			<tr>
				<td>{asset.assetCode}</td>
				<td>
					{(asset.avgPriceCents / 100).toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD'
					})}
				</td>
				<td>Current Price</td>
				<td>Difference (Avg / Current)</td>
				<td>{(asset.realQuantityHundreds / 100).toFixed(asset.getQuantityPrecision())}</td>
				<td>HOLDINGS (Current)</td>
				<td>
					{(asset.getTotalInvestedCents() / 100).toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD'
					})}
				</td>
				<td>Change (Today)</td>
				<td>Change (Total)</td>
				<td>% in Stocks</td>
				<td>% in Portfolio</td>
			</tr>
		{/each}
	</tbody>
</table>

<TransactionTable transactions={sortedTransactions} />
