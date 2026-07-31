/**
 * Placeholder slot for real photography. Swap by dropping an image in
 * /public and replacing the slot with <Image> — see README "Images".
 */
export default function PhotoSlot({
  label,
  minHeight = 320,
}: {
  label: string;
  minHeight?: number;
}) {
  return (
    <div className="photo-slot" style={{ minHeight }} role="img" aria-label={label}>
      <span>Photo slot: {label}</span>
    </div>
  );
}
