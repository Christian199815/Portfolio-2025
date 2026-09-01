export default function Spotlight({ children, radius, block = false, className = '' }) {
  const classes = ['spotlight', block ? 'spotlight--block' : '', className].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      data-spotlight
      style={radius ? { '--spot-r': `${radius}px` } : undefined}
    >
      <span className="spotlight__ghost">{children}</span>
      <span className="spotlight__lit" aria-hidden="true">{children}</span>
    </span>
  );
}
