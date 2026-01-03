<script lang="ts">
	export const ssr = false;

	let { fileContent = $bindable() } = $props();

	let file = $state<File>();

	const reader = new FileReader();

	reader.addEventListener('load', (ev) => {
		const content = ev.target?.result;
		if (typeof content === 'string' && content.length > 0) {
			fileContent = ev.target?.result;
		}
	});

	$effect(() => {
		if (file) {
			reader.readAsText(file);
			console.log('READING FILE...');
		}
	});

	const handleFileChange = (ev: Event) => {
		const target = ev?.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			file = target.files[0];
		}
	};
</script>

<label>
	Click to select a file.
	<input type="file" onchange={handleFileChange} />
</label>
