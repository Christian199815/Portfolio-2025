import { useEffect, useRef, useState } from 'react';

const INTERVAL = 5000;

export default function Carousel({ items, label, interval = INTERVAL }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  // Fraction of the current slide already spent, carried across pace changes
  const [elapsed, setElapsed] = useState(0);
  const rootRef = useRef(null);
  const startRef = useRef(0);

  const many = items.length > 1;
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Don't cycle slides nobody is looking at
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !many) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [many]);

  const running = many && playing && onScreen && !reduced;
  // Hovering doesn't stop the slideshow, it just gives you longer to look
  const delay = hovered ? interval * 2 : interval;

  useEffect(() => {
    if (!running) return undefined;
    startRef.current = performance.now();
    const id = setTimeout(() => {
      setElapsed(0);
      setIndex((i) => (i + 1) % items.length);
    }, delay * (1 - elapsed));
    return () => clearTimeout(id);
  }, [running, index, items.length, delay, elapsed]);

  // Bank how far the slide got so the new pace picks up from there instead of restarting
  function setHover(next) {
    if (running) {
      setElapsed((done) => Math.min(1, done + (performance.now() - startRef.current) / delay));
    }
    setHovered(next);
  }

  function goTo(next) {
    setElapsed(0);
    setIndex(next);
  }

  const step = (direction) => goTo((index + direction + items.length) % items.length);

  return (
    <div
      className={`carousel${running ? '' : ' is-paused'}`}
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      <div className="carousel__viewport">
        <div
          className="carousel__track"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {items.map((content, i) => (
            <figure key={content.url ?? i} className="carousel__slide" aria-hidden={i !== index}>
              {content.url && (
                <img
                  src={content.url}
                  alt={`${label} — ${i + 1} of ${items.length}`}
                  loading="lazy"
                  draggable="false"
                />
              )}
              {content.duration && (
                <figcaption className="label-caps">Duration: {content.duration}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>

      {many && (
        <div className="carousel__controls">
          <div className="carousel__arrows">
            <button
              type="button"
              className="carousel__btn"
              aria-label="Previous image"
              onClick={() => step(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="carousel__btn"
              aria-label="Next image"
              onClick={() => step(1)}
            >
              →
            </button>
            {!reduced && (
              <button
                type="button"
                className="carousel__btn carousel__btn--play"
                aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                aria-pressed={!playing}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? '❙❙' : '▶'}
              </button>
            )}
          </div>

          <div className="carousel__dots" role="tablist" aria-label="Choose image">
            {items.map((content, i) => (
              <button
                key={content.url ?? i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Image ${i + 1}`}
                className={`carousel__dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
              >
                {i === index && (
                  <span
                    className="carousel__dot-fill"
                    key={`fill-${index}-${running}-${delay}`}
                    style={{
                      animationDuration: `${delay}ms`,
                      // Negative delay drops the fill straight back to where it left off
                      animationDelay: `-${elapsed * delay}ms`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <span className="carousel__count label-caps">
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
