export default function Teaser({ blok }) {
  return (
    <div className="sb-teaser">
      {blok.headline && <h3 className="sb-teaser__headline">{blok.headline}</h3>}
      {blok.text && <p className="sb-teaser__text">{blok.text}</p>}
    </div>
  );
}
