export default function TextBlock({ blok }) {
  return (
    <section className="sb-text-block">
      {blok.eyebrow && <p className="sb-text-block__eyebrow label-caps">{blok.eyebrow}</p>}
      {blok.headline && <h2 className="sb-text-block__headline display-serif">{blok.headline}</h2>}
      {blok.body && (
        <div className="sb-text-block__body">
          {blok.body.split('\n').filter(Boolean).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      )}
    </section>
  );
}
