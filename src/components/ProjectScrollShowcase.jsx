import { Link } from 'react-router';

function FeaturePanel({ project, index, total }) {
  return (
    <li
      id={`project-${project.id}`}
      className="feature__panel"
      data-scroll-panel
    >
      <article className="feature__link">
        <div className="feature__media" data-panel-media>
          {project.projectFeaturedImage ? (
            <img
              src={project.projectFeaturedImage}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              data-panel-image
            />
          ) : (
            <div className="feature__placeholder" data-panel-image aria-hidden="true" />
          )}
          <span className="feature__scrim" aria-hidden="true" />
        </div>

        <div className="feature__overlay" data-scroll-panel-content>
          <span className="feature__num label-caps">
            {String(index + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
          </span>

          <h3 className="feature__title display-serif">{project.projectname}</h3>

          <div className="feature__foot">
            <span className="feature__tags label-caps">
              {[project.category, project.projectDate].filter(Boolean).join(' / ')}
            </span>
            <Link to={`/work/${project.id}`} className="feature__cta label-caps">
              View case study <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <Link
          to={`/work/${project.id}`}
          className="feature__stretch-link"
          aria-label={`View ${project.projectname} case study`}
          tabIndex={-1}
        />
      </article>
    </li>
  );
}

export default function ProjectScrollShowcase({ projects, loading }) {
  if (loading || !projects.length) return null;

  return (
    <section className="feature" id="featured" aria-label="Featured work" data-scroll-showcase>
      <ul className="feature__track" role="list">
        {projects.map((project, index) => (
          <FeaturePanel
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
          />
        ))}
      </ul>
    </section>
  );
}
