import { useEffect, useState } from 'react';
import Spotlight from './Spotlight';

function useLocalTime() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/Amsterdam',
        }).format(new Date()),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function KineticHero() {
  const time = useLocalTime();

  return (
    <section className="hero" aria-labelledby="hero-heading" data-hero>
      <div className="hero__top" data-hero-fade>
        <span className="label-caps hero__eyebrow">Portfolio — Ed. 2026</span>
        <span className="label-caps hero__status">
          <span className="hero__pulse" aria-hidden="true" />
          Available for work
        </span>
      </div>

      <h1 id="hero-heading" className="hero__title">
        <span className="line-mask">
          <span className="hero__line display-caps" data-hero-line>Creative</span>
        </span>
        <span className="line-mask">
          <span className="hero__line hero__line--serif display-serif" data-hero-line>
            <em>developer</em>
            <span className="hero__star" aria-hidden="true">✳</span>
          </span>
        </span>
        <span className="line-mask">
          <span className="hero__line display-caps" data-hero-line>
            <span className="hero__in">in</span> Web <span className="hero__amp">&amp;</span> Game
          </span>
        </span>
      </h1>

      <div className="hero__bottom">
        <div className="hero__lede-group" data-hero-fade>
          <p className="hero__lede">
            I build interfaces and worlds — front-end craft, real-time systems, and the small
            details that make a thing feel alive.
          </p>
          <Spotlight block className="hero__secret">
            ↑ ↑ ↓ ↓ ← → ← → B A — try it
          </Spotlight>
        </div>

        <dl className="hero__meta" data-hero-fade>
          <div className="hero__meta-item">
            <dt className="label-caps">Based in</dt>
            <dd>Amsterdam, Netherlands</dd>
          </div>
          <div className="hero__meta-item">
            <dt className="label-caps">Local time</dt>
            <dd className="hero__clock">{time || '--:--:--'}</dd>
          </div>
        </dl>

        <a href="#featured" className="hero__scroll" data-hero-fade>
          <span className="label-caps">Scroll</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
