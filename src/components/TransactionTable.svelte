<script lang="ts">
	import { compareDesc, parse } from 'date-fns';
	import type { Transaction } from '../models/Transaction';

	const props: { transactions: Transaction[] } = $props();

	const transactions = $derived(
		props.transactions.toSorted((a, b) =>
			compareDesc(
				parse(a.operationDate, 'dd/MM/yyyy', new Date()).getTime(),
				parse(b.operationDate, 'dd/MM/yyyy', new Date()).getTime()
			)
		)
	);
</script>

<h1>Transactions</h1>

<table>
	<thead>
		<tr>
			<th>Category</th>
			<th>Asset</th>
			<th>Type</th>
			<th>Broker</th>
			<th>Date</th>
			<th>Quantity</th>
			<th>Price</th>
			<th>Total</th>
		</tr>
	</thead>
	<tbody>
		{#each transactions as transaction}
			<tr>
				<td>{transaction.category}</td>
				<td>{transaction.assetCode}</td>
				<td>
					{transaction.operationType}
				</td>
				<td>{transaction.broker}</td>
				<td>{transaction.operationDate}</td>
				<td>{transaction.quantity}</td>
				<td>
					{transaction.unitPrice}
				</td>
				<td>
					{transaction.getTotalValue().toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD'
					})}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;

		& td,
		& th {
			text-align: left;
		}
		& td:last-child,
		& th:last-child {
			text-align: right;
		}
	}
</style>
