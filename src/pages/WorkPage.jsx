import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import ProjectIndex from '../components/ProjectIndex';
import Select from '../components/Select';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Project name' },
];

const toOptions = (values, allLabel) => [
  { value: '', label: allLabel },
  ...values.map((value) => ({ value, label: value })),
];

const INDUSTRY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web' },
  { id: 'game', label: 'Game' },
];

const VIEWS = [
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
];

export default function WorkPage() {
  const [industry, setIndustry] = useState('all');
  const [category, setCategory] = useState('');
  const [productType, setProductType] = useState('');
  const [projectType, setProjectType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [view, setView] = useState('grid');

  const { projects, categories, productTypes, projectTypes, loading, error } = useProjects({
    industry: industry === 'all' ? undefined : industry,
    category,
    productType,
    projectType,
    sortBy,
  });

  const hasFilters = Boolean(category || productType || projectType);

  function clearFilters() {
    setCategory('');
    setProductType('');
    setProjectType('');
    setSortBy('newest');
  }

  return (
    <section className="work-page" aria-labelledby="work-heading">
      <header className="work-page__header">
        <h1 id="work-heading" className="work-page__title display-serif">
          All <em>work</em>
        </h1>
        <div className="work-page__header-meta">
          <p className="work-page__intro">
            Everything worth showing — web builds, game projects, and the experiments in between.
          </p>
          <span className="work-page__tally label-caps" aria-live="polite">
            {loading ? '—' : String(projects.length).padStart(2, '0')} shown
          </span>
        </div>
      </header>

      <div className="work-page__bar">
        <div className="work-page__tabs" role="tablist" aria-label="Filter by discipline">
          {INDUSTRY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={industry === tab.id}
              className={`work-page__tab${industry === tab.id ? ' is-active' : ''}`}
              onClick={() => setIndustry(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="work-page__views" role="group" aria-label="Change layout">
          {VIEWS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              className={`work-page__view${view === option.id ? ' is-active' : ''}`}
              onClick={() => setView(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="work-page__controls" role="search" aria-label="Filter and sort projects">
        <fieldset className="work-page__filters">
          <legend className="sr-only">Filter projects</legend>

          <Select
            className="work-page__filter"
            label="Filter by category"
            value={category}
            onChange={setCategory}
            options={toOptions(categories, 'All categories')}
          />

          <Select
            className="work-page__filter"
            label="Filter by product type"
            value={productType}
            onChange={setProductType}
            options={toOptions(productTypes, 'All product types')}
          />

          <Select
            className="work-page__filter"
            label="Filter by project type"
            value={projectType}
            onChange={setProjectType}
            options={toOptions(projectTypes, 'All project types')}
          />

          {hasFilters && (
            <button type="button" className="work-page__clear" onClick={clearFilters}>
              Clear <span aria-hidden="true">×</span>
            </button>
          )}
        </fieldset>

        <div className="work-page__sort">
          <span className="label-caps">Sort</span>
          <Select
            label="Sort projects"
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {loading && <p className="work-page__status">Loading projects…</p>}
      {error && <p className="work-page__status work-page__status--error">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <p className="work-page__status" role="status">No projects match your filters.</p>
      )}

      {!loading && !error && projects.length > 0 && view === 'grid' && (
        <ul className="work-page__grid" role="list" data-reveal-stagger aria-live="polite">
          {projects.map((project) => (
            <li key={project.id} className="work-page__item" data-reveal-item>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && projects.length > 0 && view === 'list' && (
        <ProjectIndex
          projects={projects}
          loading={false}
          id="work-index"
          label="All work"
          showHeader={false}
          bare
        />
      )}
    </section>
  );
}
