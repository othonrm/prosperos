<script lang="ts">
	import { type EChartsOption, type EChartsType, init } from 'echarts';
	import { onMount } from 'svelte';
	import type { AssetCategory } from '../models/Asset';
	import { Money } from '../utils/Money';

	interface AllocationChartProps {
		totalAllocation: number;
		totalPerCategory: Map<AssetCategory, number>;
	}

	const { totalAllocation, totalPerCategory }: AllocationChartProps = $props();

	let chartElement: HTMLElement;
	let chart: EChartsType | undefined = $state();

	const data = $derived(
		totalPerCategory.entries().reduce((acc, curr) => {
			acc.push({ value: curr[1], name: curr[0] });
			return acc;
		}, new Array<{ value: number; name: string }>())
	);

	const options: EChartsOption = $derived({
		tooltip: {
			trigger: 'item',
			valueFormatter(value) {
				if (value) {
					const formattedAmount = new Money(value as number).toDisplayString();
					const percentageOfTotal = ((value as number) / totalAllocation) * 100;
					return `${formattedAmount} (${percentageOfTotal.toFixed(2)}%)`;
				}
				return value?.toString() || ' - ';
			}
		},
		legend: {
			top: '5%',
			left: 'center'
		},
		series: [
			{
				name: 'Allocation',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: '#fff',
					borderWidth: 4
				},
				label: {
					show: false,
					position: 'center'
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 32
					}
				},
				data
			}
		]
	});

	onMount(() => {
		chart = init(chartElement);
		chart.setOption(options);
	});

	$effect(() => {
		chart?.setOption(options);
	});
</script>

<div class="allocation-chart" bind:this={chartElement}></div>

<style>
	.allocation-chart {
		width: 500px;
		height: 500px;
	}
</style>
