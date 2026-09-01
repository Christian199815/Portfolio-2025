const DEFAULT_ITEMS = [
  'Front-end',
  'Creative coding',
  'WebGL',
  'Game dev',
  'Adobe suite',
  'Film editing',
  'Design systems',
];

export default function Marquee({ items = DEFAULT_ITEMS }) {
  const run = (
    <span className="marquee__run" aria-hidden="true">
      {items.map((item) => (
        <span className="marquee__item" key={item}>
          {item}
          <span className="marquee__sep">✳</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="marquee" role="presentation">
      <span className="sr-only">{items.join(', ')}</span>
      {run}
      {run}
    </div>
  );
}
