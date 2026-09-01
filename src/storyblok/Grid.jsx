import { StoryblokComponent } from '@storyblok/react';

export default function Grid({ blok }) {
  return (
    <div className="sb-grid">
      {blok.columns?.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
}
