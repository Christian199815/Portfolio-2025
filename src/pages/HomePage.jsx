import { useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import KineticHero from '../components/KineticHero';
import Marquee from '../components/Marquee';
import ProjectScrollShowcase from '../components/ProjectScrollShowcase';
import ProjectIndex from '../components/ProjectIndex';
import DisciplineQuiz from '../components/DisciplineQuiz';
import Spotlight from '../components/Spotlight';

const CAPABILITIES = [
  {
    title: 'Front-end',
    body: 'Component architecture, design systems, and interfaces that hold up under real use.',
  },
  {
    title: 'Real-time',
    body: 'WebGL scenes, shaders, and game systems built for the browser and beyond.',
  },
  {
    title: 'Adobe suite',
    body: 'Photoshop, Illustrator, and Premiere — asset production from first sketch to final grade.',
  },
  {
    title: 'Film editing',
    body: 'Shooting, cutting, colour, and sound. Story first, effects a distant second.',
  },
];

const INDEX_SIZE = 4;

function pickRandom(items, count) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export default function HomePage() {
  const { projects, loading } = useProjects({ sortBy: 'newest' });
  const homeRef = useHomeAnimations(!loading && projects.length > 0);
  const featured = useMemo(() => projects.slice(0, 3), [projects]);

  // Reshuffled per page load, skipping whatever the featured panels already showed
  const indexed = useMemo(() => {
    const shown = new Set(projects.slice(0, 3).map((project) => project.id));
    const rest = projects.filter((project) => !shown.has(project.id));
    const pool = rest.length >= INDEX_SIZE ? rest : projects;
    return pickRandom(pool, INDEX_SIZE);
  }, [projects]);

  return (
    <div ref={homeRef} className="home-page">
      <KineticHero />
      <Marquee />
      <ProjectScrollShowcase projects={featured} loading={loading} />
      <ProjectIndex projects={indexed} loading={loading} total={projects.length} />

      <DisciplineQuiz />

      <section className="statement" aria-labelledby="statement-heading">
        <h2 id="statement-heading" className="statement__label label-caps" data-reveal>
          Approach
        </h2>
        <p className="statement__text" data-reveal>
          I sit between design and engineering — building things that feel{' '}
          <em>considered</em> rather than assembled.{' '}
          <span className="muted">Web work, game work, and everything that blurs the line.</span>
        </p>
        <Spotlight block className="statement__secret" radius={150}>
          Also: 3 AM shader math, far too many coffee cups, and one very patient rubber duck.
        </Spotlight>
      </section>

      <section className="capabilities" aria-label="Capabilities">
        <ul className="capabilities__grid" role="list" data-reveal-stagger>
          {CAPABILITIES.map((item, i) => (
            <li className="capabilities__item" key={item.title} data-reveal-item>
              <span className="capabilities__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="capabilities__title display-serif">{item.title}</h3>
              <p className="capabilities__body">{item.body}</p>
            </li>
          ))}
        </ul>
        <Spotlight block className="capabilities__secret spotlight--glyphs" radius={170}>
          ⌘ ✳ ⏻ ◆ ⟡ ⌗ ✦ ◇ ⌁
        </Spotlight>
      </section>
    </div>
  );
}
