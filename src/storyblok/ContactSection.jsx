export default function ContactSection({ blok }) {
  return (
    <section className="sb-contact">
      <div className="sb-contact__card">
        {blok.name && <h2 className="sb-contact__name display-serif">{blok.name}</h2>}
        {blok.role && <p className="sb-contact__role label-caps">{blok.role}</p>}
        {blok.email && (
          <a href={`mailto:${blok.email}`} className="sb-contact__email">
            {blok.email}
          </a>
        )}
        {blok.bio && <p className="sb-contact__bio">{blok.bio}</p>}
        <ul className="sb-contact__social" role="list">
          {blok.linkedin_url && (
            <li>
              <a href={blok.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                LinkedIn
              </a>
            </li>
          )}
          {blok.github_url && (
            <li>
              <a href={blok.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
