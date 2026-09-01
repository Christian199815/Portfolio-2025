function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function processStep(title, description) {
  return {
    _uid: uid('step'),
    component: 'process_step',
    title,
    description,
  };
}

function portfolioItem(title, description, tags, url) {
  return {
    _uid: uid('project'),
    component: 'portfolio_item',
    title,
    description,
    tags,
    url,
    image: { filename: '', alt: '' },
  };
}

export const dummyStories = {
  contact: {
    name: 'Contact',
    slug: 'contact',
    content: {
      _uid: uid('page'),
      component: 'page',
      body: [
        {
          _uid: uid('hero'),
          component: 'hero',
          eyebrow: 'Contact',
          title: '—Get in touch',
          description: 'Open to collaborations, freelance projects, and conversations about web and game work.',
        },
        {
          _uid: uid('contact'),
          component: 'contact_section',
          name: 'Chris Donker',
          role: 'Frontend Developer',
          email: 'cdarkdesigns@gmail.com',
          bio: 'Builder of web and game experiences. Based in Amsterdam, Netherlands, working across design systems, React apps, and interactive 3D.',
          linkedin_url: 'https://www.linkedin.com/in/chris-donker/',
          github_url: 'https://github.com/Christian199815',
        },
        {
          _uid: uid('cta'),
          component: 'cta_banner',
          headline: 'Have a project in mind?',
          text: 'Tell me about your timeline, team, and goals — I usually reply within a couple of days.',
          button_label: 'Send an email',
          button_url: 'mailto:cdarkdesigns@gmail.com',
        },
      ],
    },
  },

  about: {
    name: 'About',
    slug: 'about',
    content: {
      _uid: uid('page'),
      component: 'page',
      body: [
        {
          _uid: uid('hero'),
          component: 'hero',
          eyebrow: 'About',
          title: '—Donker',
          description: 'I blend web design, frontend development, and game craft into focused digital experiences.',
        },
        {
          _uid: uid('text'),
          component: 'text_block',
          eyebrow: 'Background',
          headline: 'Design-minded developer',
          body: 'I studied interactive media and have spent years shipping portfolio sites, CMS-driven apps, and playful 3D interfaces.\nMy sweet spot is where visual clarity meets solid engineering.',
        },
        {
          _uid: uid('process'),
          component: 'process_list',
          headline: 'How I work',
          steps: [
            processStep('Discover', 'Understand goals, audience, and constraints before touching pixels or code.'),
            processStep('Design', 'Explore layout, type, and motion — often in Figma with real content early.'),
            processStep('Build', 'Ship accessible, performant frontends with React, Vite, and headless CMS.'),
            processStep('Iterate', 'Measure, refine, and document so teams can maintain what we launch.'),
          ],
        },
        {
          _uid: uid('quote'),
          component: 'quote',
          text: 'Design is really an act of communication.',
          author: 'Don Norman',
        },
      ],
    },
  },

  work: {
    name: 'Work',
    slug: 'work',
    content: {
      _uid: uid('page'),
      component: 'page',
      body: [
        {
          _uid: uid('hero'),
          component: 'hero',
          eyebrow: 'Work',
          title: '—Selected projects',
          description: 'A mix of client work, school projects, and experiments across web and games.',
        },
        {
          _uid: uid('grid'),
          component: 'portfolio_grid',
          headline: 'Portfolio',
          intro: 'Placeholder projects — replace with real case studies from Storyblok when ready.',
          items: [
            portfolioItem(
              'Accessible Keyboard',
              'Custom keyboard UI for a client with motor impairments — designed and prototyped in code.',
              'Web Design, Accessibility',
              'https://github.com/Christian199815',
            ),
            portfolioItem(
              'Invoice Generator',
              'Internal tool to turn spreadsheet rows into branded PDF invoices for freelance work.',
              'Web Development, Automation',
              'https://github.com/Christian199815',
            ),
            portfolioItem(
              'Portfolio Worlds',
              'This site — four skill worlds with Three.js portals and Storyblok content.',
              'React, Three.js, Storyblok',
              '/',
            ),
          ],
        },
      ],
    },
  },
};

export function getDummyStory(slug) {
  return dummyStories[slug] ?? null;
}

export function getAllDummySlugs() {
  return Object.keys(dummyStories);
}
