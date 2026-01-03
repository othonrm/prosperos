<script lang="ts">
	import FileInput from '../components/FileInput.svelte';
	import { Asset } from '../models/Asset';
	import { Transaction } from '../models/Transaction';
	import { parseCsvString } from '../utils/CsvParser';
	import { storable } from '../utils/Storable.svelte';

	const storeFileContent = storable('storeFileContent', false);
	const fileContent = storable('statementContent', null, !$storeFileContent);
	let transactions = $state<Map<string, Transaction[]>>(new Map());
	let assets = $state<Map<string, Asset>>(new Map());

	$effect(() => {
		if ($fileContent) {
			const parsedValue = parseCsvString($fileContent);
			const newTransactions = new Map();
			const newAssets = new Map();
			for (const transactionObj of parsedValue) {
				const transaction = Transaction.fromCSVObject(transactionObj);
				const existingTransForAsset = newTransactions.get(transaction.assetCode) || [];
				existingTransForAsset.push(transaction);
				newTransactions.set(transaction.assetCode, existingTransForAsset);

				const asset =
					newAssets.get(transaction.assetCode) ||
					new Asset(transaction.category, transaction.broker, transaction.assetCode, 0, 0, 0, 0);

				asset.computeTransaction(transaction);

				console.log('SETTING ASSETS');

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
		{#each assets.values().toArray() as asset}
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
				<td>{(asset.realQuantityHundreds / 100).toFixed(0)}</td>
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
