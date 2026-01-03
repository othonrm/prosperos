<script lang="ts">
	import {
		AllCommunityModule,
		type ColDef,
		type GridApi,
		type GridOptions,
		ModuleRegistry,
		createGrid
	} from 'ag-grid-community';

	import { compareDesc, parse } from 'date-fns';
	import { onMount } from 'svelte';
	import type { Transaction } from '../models/Transaction';

	ModuleRegistry.registerModules([AllCommunityModule]);

	let gridContainer: HTMLElement;
	let gridApi: GridApi | undefined = $state();

	const props: { transactions: Transaction[] } = $props();

	const transactions = $derived(
		props.transactions.toSorted((a, b) =>
			compareDesc(
				parse(a.operationDate, 'dd/MM/yyyy', new Date()).getTime(),
				parse(b.operationDate, 'dd/MM/yyyy', new Date()).getTime()
			)
		)
	);

	const columnDefs: ColDef<Transaction>[] = [
		{
			headerName: 'Category',
			field: 'category'
		},
		{
			headerName: 'Asset',
			field: 'assetCode'
		},
		{
			headerName: 'Type',
			field: 'operationType'
		},
		{
			headerName: 'Broker',
			field: 'broker'
		},
		{
			headerName: 'Date',
			field: 'operationDate'
		},
		{
			headerName: 'Quantity',
			field: 'quantity'
		},
		{
			headerName: 'Price',
			field: 'unitPrice',
			valueFormatter: (params) =>
				params?.data
					? (params.data.getUnitPriceCents() / 100).toLocaleString('en-US', {
							style: 'currency',
							currency: params.data.currency
						})
					: ' - '
		},
		{
			headerName: 'Total',
			colId: 'total',
			valueGetter: ({ data }) =>
				data?.getTotalValue().toLocaleString('en-US', {
					style: 'currency',
					currency: data?.currency
				})
		}
	];

	const gridOptions: GridOptions = $derived({
		columnDefs: columnDefs,
		rowData: transactions,
		defaultColDef: {
			flex: 1
		},
		pagination: true,
		paginationPageSize: 10,
		paginationPageSizeSelector: [20, 50, 100, transactions.length],
		domLayout: 'autoHeight'
	});

	$effect(() => {
		gridApi?.updateGridOptions(gridOptions);
	});

	onMount(() => {
		gridApi = createGrid(gridContainer, gridOptions);
	});
</script>

<h2>Transactions</h2>

<div class="grid-container">
	<div id="datagrid" class="ag-theme-alpine" bind:this={gridContainer}></div>
</div>

<style>
	h2 {
		margin-bottom: 0;
	}

	.grid-container {
		padding: 1rem 0;
	}

	#datagrid {
		--ag-header-foreground-color: blue;
		width: 100%;
	}

	:global(.ag-header-viewport) {
		background: rgb(57, 88, 180);
		color: #fff;
		font-size: 16px;
	}
</style>
