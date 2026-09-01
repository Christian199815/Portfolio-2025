import { useMemo } from 'react';
import { Link } from 'react-router';
import { useProjects } from '../hooks/useProjects';

export default function NextProject({ currentId, category }) {
  const { projects, loading } = useProjects({ sortBy: 'newest' });

  // Prefer something from the same discipline, otherwise anything but this one
  const suggestion = useMemo(() => {
    const others = projects.filter((project) => project.id !== currentId);
    if (!others.length) return null;
    const related = others.filter((project) => project.category === category);
    const pool = related.length ? related : others;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [projects, currentId, category]);

  if (loading || !suggestion) return null;

  const isRelated = suggestion.category === category;

  return (
    <section className="next-project" aria-labelledby="next-project-label">
      <div className="next-project__head">
        <span className="label-caps next-project__label" id="next-project-label">
          {isRelated ? 'More like this' : 'Next project'}
        </span>
        <Link to="/work" className="label-caps next-project__all">
          All work <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <Link to={`/work/${suggestion.id}`} className="next-project__link" data-cursor-hover>
        <div className="next-project__media">
          {suggestion.projectFeaturedImage ? (
            <img src={suggestion.projectFeaturedImage} alt="" loading="lazy" />
          ) : (
            <div className="next-project__placeholder" aria-hidden="true" />
          )}
          <span className="next-project__scrim" aria-hidden="true" />
        </div>

        <div className="next-project__body">
          <h2 className="next-project__title display-serif">{suggestion.projectname}</h2>
          <span className="next-project__meta label-caps">
            {[suggestion.category, suggestion.projectDate].filter(Boolean).join(' / ')}
          </span>
          <span className="next-project__cta label-caps">
            View case study <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </section>
  );
}
