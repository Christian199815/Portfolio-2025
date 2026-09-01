import { Link } from 'react-router';

export default function ProjectCard({ project }) {
  const image = project.projectFeaturedImage;
  const title = project.projectname;
  const category = project.category;
  const date = project.projectDate;

  return (
    <article className="project-card" data-cursor-hover>
      <Link to={`/work/${project.id}`} className="project-card__link">
        <figure className="project-card__image">
          {image ? (
            <img src={image} alt={title} loading="lazy" />
          ) : (
            <div className="project-card__placeholder" aria-hidden="true" />
          )}
        </figure>
        <div className="project-card__meta">
          <h3 className="project-card__title">{title}</h3>
          <div className="project-card__details">
            {category && <span className="project-card__category label-caps">{category}</span>}
            {date && <time className="project-card__date">{date}</time>}
          </div>
        </div>
      </Link>
    </article>
  );
}
