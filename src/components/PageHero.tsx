export default function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="page-hero on-dark">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lede ? <p>{lede}</p> : null}
    </div>
  );
}
