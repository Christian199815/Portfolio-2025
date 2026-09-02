import { Link } from 'react-router';
import { useTouchDevice } from '../hooks/useTouchDevice';

function PanelContent({ project, index, total, isTouch, to }) {
  return (
    <>
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
          {isTouch ? (
            <Link to={to} className="feature__cta feature__cta--link label-caps">
              View case study <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <span className="feature__cta label-caps">
              View case study <span aria-hidden="true">↗</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function FeaturePanel({ project, index, total, isTouch }) {
  const to = `/work/${project.id}`;

  return (
    <li
      id={`project-${project.id}`}
      className="feature__panel"
      data-scroll-panel
    >
      {isTouch ? (
        <article className="feature__link feature__link--static">
          <PanelContent
            project={project}
            index={index}
            total={total}
            isTouch={isTouch}
            to={to}
          />
        </article>
      ) : (
        <Link to={to} className="feature__link" data-cursor-hover>
          <PanelContent
            project={project}
            index={index}
            total={total}
            isTouch={isTouch}
            to={to}
          />
        </Link>
      )}
    </li>
  );
}

export default function ProjectScrollShowcase({ projects, loading }) {
  const isTouch = useTouchDevice();

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
            isTouch={isTouch}
          />
        ))}
      </ul>
    </section>
  );
}
