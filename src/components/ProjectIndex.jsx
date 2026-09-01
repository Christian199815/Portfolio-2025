import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';

export default function ProjectIndex({
  projects,
  loading,
  id = 'index',
  label = 'Selected work',
  showHeader = true,
  bare = false,
  total,
}) {
  const rootRef = useRef(null);
  const previewRef = useRef(null);
  const slidesRef = useRef([]);

  useEffect(() => {
    slidesRef.current.length = projects.length;
    const root = rootRef.current;
    const preview = previewRef.current;
    if (!root || !preview) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const ctx = gsap.context(() => {
      const moveX = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
      const moveY = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });
      const rows = Array.from(root.querySelectorAll('[data-index-row]'));

      const onMove = (event) => {
        const bounds = root.getBoundingClientRect();
        moveX(event.clientX - bounds.left);
        moveY(event.clientY - bounds.top);
      };

      const show = (position) => {
        document.body.classList.add('is-cursor-muted');
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
        slidesRef.current.forEach((slide, i) => {
          if (!slide) return;
          gsap.to(slide, { autoAlpha: i === position ? 1 : 0, duration: 0.3, ease: 'power2.out' });
        });
      };

      const hide = () => {
        document.body.classList.remove('is-cursor-muted');
        gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.35, ease: 'power3.out' });
      };

      const rowHandlers = rows.map((row, i) => {
        const handler = () => show(i);
        row.addEventListener('mouseenter', handler);
        return { row, handler };
      });

      root.addEventListener('mousemove', onMove);
      root.addEventListener('mouseleave', hide);

      gsap.set(preview, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.9 });

      return () => {
        document.body.classList.remove('is-cursor-muted');
        root.removeEventListener('mousemove', onMove);
        root.removeEventListener('mouseleave', hide);
        rowHandlers.forEach(({ row, handler }) => row.removeEventListener('mouseenter', handler));
      };
    }, root);

    return () => ctx.revert();
  }, [projects]);

  const sectionClass = `index${bare ? ' index--bare' : ''}`;

  if (loading) {
    return (
      <section className={sectionClass} id={id} aria-label={label}>
        <p className="index__status">Loading work…</p>
      </section>
    );
  }

  if (!projects.length) {
    return (
      <section className={sectionClass} id={id} aria-label={label}>
        <p className="index__status">No projects match your filters.</p>
      </section>
    );
  }

  return (
    <section
      className={sectionClass}
      id={id}
      aria-labelledby={showHeader ? `${id}-heading` : undefined}
      aria-label={showHeader ? undefined : label}
      ref={rootRef}
    >
      {showHeader && (
        <header className="index__header" data-reveal>
          <h2 id={`${id}-heading`} className="label-caps index__label">
            <span className="index__label-dot" aria-hidden="true" />
            {label}
          </h2>
          <span className="label-caps index__count">
            {total && total > projects.length
              ? `${String(projects.length).padStart(2, '0')} of ${String(total).padStart(2, '0')}`
              : `${String(projects.length).padStart(2, '0')} projects`}
          </span>
        </header>
      )}

      <ul className="index__list" role="list">
        {projects.map((project, i) => (
          <li key={project.id} className="index__row" data-index-row data-reveal>
            <Link to={`/work/${project.id}`} className="index__link">
              <span className="index__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="index__name display-serif">
                <span className="index__name-base">{project.projectname}</span>
                <span className="index__name-hover" aria-hidden="true">{project.projectname}</span>
              </span>
              <span className="index__tag label-caps">{project.category || 'Project'}</span>
              <span className="index__year">{project.projectDate || ''}</span>
              <span className="index__arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>

      {total && total > projects.length && (
        <Link to="/work" className="index__all label-caps" data-reveal>
          View all {total} projects <span aria-hidden="true">↗</span>
        </Link>
      )}

      <div className="index__preview" ref={previewRef} aria-hidden="true">
        {projects.map((project, i) => (
          <div
            className="index__preview-slide"
            key={project.id}
            ref={(el) => {
              slidesRef.current[i] = el;
            }}
          >
            {project.projectFeaturedImage ? (
              <img src={project.projectFeaturedImage} alt="" loading="lazy" />
            ) : (
              <div className="index__preview-fallback" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
