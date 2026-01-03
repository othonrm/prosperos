<script lang="ts">
	import { type ColDef, type GridApi, type GridOptions, createGrid } from 'ag-grid-community';
	import { onMount } from 'svelte';
	import type { Asset, AssetCategory } from '../models/Asset';

	let gridContainer: HTMLElement;
	let gridApi: GridApi | undefined = $state();

	const props: { assets: Asset[]; category: AssetCategory } = $props();

	const assets = $derived(
		props.assets
			.filter((asset) => asset.category === props.category)
			.toSorted((a, b) => a.assetCode.localeCompare(b.assetCode))
	);

	const totalAmount = $derived(
		assets.reduce((acc, curr) => acc + curr.getTotalInvestedCents() || 0, 0)
	);

	const columnDefs: ColDef<Asset>[] = [
		{
			headerName: 'Asset',
			field: 'assetCode'
		},
		{
			headerName: 'Average Price',
			colId: 'averagePrice',
			valueGetter: (params) =>
				params.data
					? (params.data.avgPriceCents / 100).toLocaleString('en-US', {
							style: 'currency',
							currency: params.data.currency
						})
					: ' - '
		},
		{
			headerName: 'Current Price'
		},
		{
			headerName: 'Difference (Avg / Current)'
		},
		{
			headerName: 'Quantity',
			valueGetter: (params) =>
				params.data
					? (params.data.realQuantityHundreds / 100).toFixed(params.data.getQuantityPrecision())
					: ' - '
		},
		{
			headerName: 'HOLDINGS (Current)'
		},
		{
			headerName: 'Total Invested',
			colId: 'totalInvested',
			valueGetter: (params) =>
				params.data
					? (params.data.getTotalInvestedCents() / 100).toLocaleString('en-US', {
							style: 'currency',
							currency: params.data.currency
						})
					: ' - '
		},
		{
			headerName: 'Change (Today)'
			// field: 'quantity'
		},
		{
			headerName: 'Change (Total)'
			// field: 'quantity'
		},
		{
			headerName: '% in Stocks'
			// field: 'unitPrice',
		},
		{
			headerName: '% in Portfolio'
			// colId: 'total',
		}
	];

	const gridOptions: GridOptions = $derived({
		columnDefs: columnDefs,
		rowData: assets,
		defaultColDef: {
			flex: 1
		},
		pagination: true,
		paginationPageSize: 10,
		paginationPageSizeSelector: [20, 50, 100, assets.length],
		domLayout: 'autoHeight'
	});

	$effect(() => {
		gridApi?.updateGridOptions(gridOptions);
	});

	onMount(() => {
		gridApi = createGrid(gridContainer, gridOptions);
	});
</script>

<h2>
	{props.category}

	{(totalAmount / 100).toLocaleString('en-US', {
		style: 'currency',
		currency: 'BRL'
	})}
</h2>

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
