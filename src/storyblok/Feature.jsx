export default function Feature({ blok }) {
  return (
    <div className="sb-feature">
      {blok.name && <h3 className="sb-feature__name">{blok.name}</h3>}
      {blok.description && <p className="sb-feature__desc">{blok.description}</p>}
    </div>
  );
}
