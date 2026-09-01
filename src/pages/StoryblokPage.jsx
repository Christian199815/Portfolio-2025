import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { StoryblokComponent, useStoryblok } from '@storyblok/react';
import { getDummyStory } from '../storyblok/dummyStories';

export default function StoryblokPage() {
  const { slug } = useParams();
  const liveStory = useStoryblok(slug, { version: 'draft' });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
    const timer = window.setTimeout(() => setTimedOut(true), 5000);
    return () => window.clearTimeout(timer);
  }, [slug]);

  const dummyStory = getDummyStory(slug);
  const story = liveStory?.content ? liveStory : dummyStory;

  if (!story?.content) {
    if (timedOut) {
      return (
        <div className="loading">
          <p>Could not load this page from Storyblok.</p>
          <Link to="/">← Back home</Link>
        </div>
      );
    }

    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {!liveStory?.content && dummyStory && import.meta.env.DEV && (
        <p className="sb-dev-banner label-caps">Previewing local dummy content — run npm run storyblok:seed to publish</p>
      )}
      <StoryblokComponent blok={story.content} />
    </>
  );
}
