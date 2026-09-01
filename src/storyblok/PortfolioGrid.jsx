import { StoryblokComponent } from '@storyblok/react';

export default function PortfolioGrid({ blok }) {
  return (
    <section className="sb-portfolio">
      {blok.headline && <h2 className="sb-portfolio__headline display-serif">{blok.headline}</h2>}
      {blok.intro && <p className="sb-portfolio__intro">{blok.intro}</p>}
      <div className="sb-portfolio__grid">
        {blok.items?.map((item) => (
          <StoryblokComponent blok={item} key={item._uid} />
        ))}
      </div>
    </section>
  );
}
