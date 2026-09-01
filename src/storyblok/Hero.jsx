export default function Hero({ blok }) {
  return (
    <section className="sb-hero">
      {blok.eyebrow && <span className="sb-hero__eyebrow label-caps">{blok.eyebrow}</span>}
      {blok.title && <h1 className="sb-hero__title display-serif">{blok.title}</h1>}
      {blok.description && <p className="sb-hero__desc">{blok.description}</p>}
    </section>
  );
}
