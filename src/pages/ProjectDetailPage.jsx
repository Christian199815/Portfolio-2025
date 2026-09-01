import { Link, useParams } from 'react-router';
import { useProject } from '../hooks/useProjects';
import NextProject from '../components/NextProject';
import Carousel from '../components/Carousel';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { project, loading, error } = useProject(id);

  if (loading) {
    return <p className="project-detail__status">Loading project…</p>;
  }

  if (error || !project) {
    return (
      <div className="project-detail project-detail--missing">
        <p>Project not found.</p>
        <Link to="/work">← Back to work</Link>
      </div>
    );
  }

  return (
    <article className="project-detail" aria-labelledby="project-title">
      <header className="project-detail__header" data-reveal>
        <nav className="project-detail__breadcrumb" aria-label="Breadcrumb">
          <ol role="list">
            <li><Link to="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/work">Work</Link></li>
            <li aria-hidden="true">/</li>
            <li><span aria-current="page">{project.projectname}</span></li>
          </ol>
        </nav>
        <h1 id="project-title" className="project-detail__title display-serif">{project.projectname}</h1>
        {project.projectDate && (
          <time className="project-detail__date label-caps">{project.projectDate}</time>
        )}
      </header>

      {project.projectFeaturedImage && (
        <figure className="project-detail__featured" data-reveal>
          <img
            src={project.projectFeaturedImage}
            alt={`Featured image for ${project.projectname}`}
            loading="eager"
          />
        </figure>
      )}

      <div className="project-detail__info" data-reveal>
        <aside className="project-detail__tools">
          <h2 className="project-detail__section-title label-caps">Tools</h2>
          {project.projectLanguages?.length > 0 ? (
            <ul role="list" className="project-detail__tools-list">
              {project.projectLanguages.map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>
          ) : (
            <p className="project-detail__empty">—</p>
          )}

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary project-detail__external"
            >
              Visit website →
            </a>
          )}
        </aside>

        <div className="project-detail__copy">
          <p className="project-detail__description">
            {project.projectBodyText || project.projectFeaturedText || 'Project description coming soon.'}
          </p>
          {project.projectQuote && (
            <blockquote className="project-detail__quote">
              <p>{project.projectQuote}</p>
            </blockquote>
          )}
        </div>
      </div>

      {project.projectProgress?.length > 0 && (
        <section className="project-detail__progress" aria-labelledby="progress-heading" data-reveal>
          <h2 id="progress-heading" className="project-detail__section-title display-serif">Project information</h2>

          {project.projectProgress.map((progress, progressIndex) => {
            const items = progress.progressContent ?? [];

            return (
              <article key={progress.progressName ?? progressIndex} className="project-detail__progress-item">
                <h3>{progress.progressName}</h3>
                {progress.progressBodyText && <p>{progress.progressBodyText}</p>}

                {items.length > 0 && (
                  <Carousel items={items} label={progress.progressName} />
                )}
              </article>
            );
          })}
        </section>
      )}

      <NextProject currentId={project.id} category={project.category} />
    </article>
  );
}
