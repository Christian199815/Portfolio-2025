export default function PortfolioItem({ blok }) {
  const tags = blok.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <article className="sb-portfolio-item">
      {blok.image?.filename && (
        <figure className="sb-portfolio-item__image">
          <img src={blok.image.filename} alt={blok.image.alt || blok.title || ''} loading="lazy" />
        </figure>
      )}
      <div className="sb-portfolio-item__body">
        {blok.title && <h3 className="sb-portfolio-item__title">{blok.title}</h3>}
        {blok.description && <p className="sb-portfolio-item__desc">{blok.description}</p>}
        {tags.length > 0 && (
          <ul className="sb-portfolio-item__tags" role="list">
            {tags.map((tag) => (
              <li key={tag} className="label-caps">{tag}</li>
            ))}
          </ul>
        )}
        {blok.url && (
          <a href={blok.url} className="sb-portfolio-item__link label-caps" target="_blank" rel="noopener noreferrer">
            View project →
          </a>
        )}
      </div>
    </article>
  );
}
