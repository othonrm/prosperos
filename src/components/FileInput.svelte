<script lang="ts">
	export const ssr = false;

	let file = $state<File>();

	const reader = new FileReader();

	reader.addEventListener('load', (ev) => {
		console.log(ev.target?.result);
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
