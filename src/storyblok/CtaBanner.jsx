export default function CtaBanner({ blok }) {
  return (
    <section className="sb-cta">
      {blok.headline && <h2 className="sb-cta__headline display-serif">{blok.headline}</h2>}
      {blok.text && <p className="sb-cta__text">{blok.text}</p>}
      {blok.button_label && blok.button_url && (
        <a href={blok.button_url} className="btn btn--pill sb-cta__btn">
          {blok.button_label}
        </a>
      )}
    </section>
  );
}
