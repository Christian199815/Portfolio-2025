import { StoryblokComponent } from '@storyblok/react';

export default function Page({ blok }) {
  return (
    <article className="sb-page">
      {blok.body?.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </article>
  );
}
