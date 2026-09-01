export default function Quote({ blok }) {
  return (
    <blockquote className="sb-quote">
      {blok.text && <p className="sb-quote__text display-serif">"{blok.text}"</p>}
      {blok.author && <footer className="sb-quote__author label-caps">— {blok.author}</footer>}
    </blockquote>
  );
}
