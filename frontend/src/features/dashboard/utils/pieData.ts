export interface PieSliceDatum {
  name: string;
  value: number;
}

const MAX_VISIBLE_PIE_CATEGORIES = 5;
const MAX_VISIBLE_BAR_CATEGORIES = 7;

export function groupSmallPieSlices(rows: PieSliceDatum[]) {
  if (rows.length <= MAX_VISIBLE_PIE_CATEGORIES) return rows;

  const sortedRows = [...rows].sort((a, b) => b.value - a.value);
  const visibleRows = sortedRows.slice(0, MAX_VISIBLE_PIE_CATEGORIES);
  const otherValue = sortedRows
    .slice(MAX_VISIBLE_PIE_CATEGORIES)
    .reduce((total, row) => total + row.value, 0);

  return [...visibleRows, { name: 'Other', value: otherValue }];
}

export function limitBarCategories(rows: PieSliceDatum[], shouldLimit: boolean) {
  if (!shouldLimit || rows.length <= MAX_VISIBLE_BAR_CATEGORIES) return rows;

  return [...rows].sort((a, b) => b.value - a.value).slice(0, MAX_VISIBLE_BAR_CATEGORIES);
}
