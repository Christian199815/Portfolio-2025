import { StoryblokComponent } from '@storyblok/react';

export default function ProcessList({ blok }) {
  return (
    <section className="sb-process">
      {blok.headline && <h2 className="sb-process__headline display-serif">{blok.headline}</h2>}
      <ol className="sb-process__list" role="list">
        {blok.steps?.map((step) => (
          <StoryblokComponent blok={step} key={step._uid} />
        ))}
      </ol>
    </section>
  );
}
