export const parseCsvString = (content: string): { [key: string]: string }[] => {
	const rows = content.split('\n');
	const columnNames = rows.splice(0, 1)[0].split(';');
	return rows.map((rowString) =>
		rowString.split(';').reduce(
			(acc, curr, columnIndex) => {
				acc[columnNames[columnIndex]] = curr;
				return acc;
			},
			{} as { [key: string]: string }
		)
	);
};
