import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SESSION_KEY = 'cd-intro-seen';

function lockScroll() {
  document.documentElement.classList.add('is-scroll-locked');
}

function unlockScroll() {
  document.documentElement.classList.remove('is-scroll-locked');
}

export default function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1';

    if (reduced || alreadySeen) {
      gsap.set(rootRef.current, { display: 'none' });
      onComplete?.();
      return undefined;
    }

    lockScroll();
    const progress = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(SESSION_KEY, '1');
        unlockScroll();
        onComplete?.();
      },
    });

    tl.fromTo(
      '[data-loader-word]',
      { yPercent: 110 },
      { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' },
    )
      .to(
        progress,
        {
          value: 100,
          duration: 1.7,
          ease: 'power2.inOut',
          onUpdate: () => setCount(Math.round(progress.value)),
        },
        0.15,
      )
      .fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0.15)
      .to('[data-loader-word], [data-loader-meta]', {
        yPercent: -110,
        duration: 0.6,
        stagger: 0.05,
        ease: 'expo.in',
      })
      .add(() => rootRef.current?.classList.add('is-exiting'))
      .to(
        rootRef.current,
        { yPercent: -100, duration: 0.9, ease: 'expo.inOut' },
        '-=0.15',
      )
      .set(rootRef.current, { display: 'none' });

    return () => {
      tl.kill();
      unlockScroll();
      rootRef.current?.classList.remove('is-exiting');
    };
  }, [onComplete]);

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader__inner">
        <p className="preloader__name display-caps">
          <span className="line-mask"><span data-loader-word>Chris</span></span>
          <span className="line-mask"><span data-loader-word>Donker</span></span>
        </p>
        <div className="preloader__meta" data-loader-meta>
          <span className="label-caps">Creative Developer</span>
          <span className="preloader__count" ref={countRef}>
            {String(count).padStart(3, '0')}
          </span>
        </div>
      </div>
      <div className="preloader__bar">
        <span className="preloader__bar-fill" ref={barRef} />
      </div>
    </div>
  );
}
