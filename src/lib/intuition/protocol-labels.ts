/** Extract a human-readable label from an Intuition GraphQL atom record. */
export function atomDisplayLabel(atom: {
  label?: string | null;
  data?: string | null;
  value?: {
    thing?: { name?: string | null } | null;
    person?: { name?: string | null } | null;
    organization?: { name?: string | null } | null;
  } | null;
}): string {
  return (
    atom.label?.trim() ||
    atom.value?.thing?.name?.trim() ||
    atom.value?.person?.name?.trim() ||
    atom.value?.organization?.name?.trim() ||
    atom.data?.trim()?.slice(0, 80) ||
    'Unlabeled atom'
  );
}
