import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCustomCursor } from './cursor';
import { initEasterEggs } from './easterEggs';
import { initMagnetic } from './magnetic';
import { initSpotlights } from './spotlight';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches;

/**
 * Project data and images land after first paint, so the document keeps growing.
 * Without this the progress bar and pinned triggers stay pegged to the old height.
 */
function initHeightWatcher() {
  let timer = null;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 180);
  };

  const observer = new ResizeObserver(refresh);
  observer.observe(document.body);

  window.addEventListener('load', refresh);
  document.fonts?.ready.then(refresh);

  return () => {
    clearTimeout(timer);
    observer.disconnect();
    window.removeEventListener('load', refresh);
  };
}

function initHeaderState() {
  const header = document.querySelector('.site-header');
  if (!header) return () => {};

  const onScroll = () => {
    header.classList.toggle('is-stuck', window.scrollY > 24);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}

export function initGlobalAnimations(scope) {
  const cleanHeaderState = initHeaderState();
  const cleanSpotlights = initSpotlights(scope);

  if (prefersReducedMotion()) {
    return () => {
      cleanHeaderState();
      cleanSpotlights();
    };
  }

  const cleanHeightWatcher = initHeightWatcher();

  initCustomCursor();
  const cleanMagnetic = initMagnetic(document);

  const ctx = gsap.context(() => {
    const progress = document.querySelector('[data-scroll-progress]');
    if (progress && !isCoarsePointer()) {
      gsap.fromTo(
        progress,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    const header = scope?.querySelector('[data-animate="header"]');
    if (header) {
      gsap.fromTo(
        header.children,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'expo.out', delay: 0.1 },
      );
    }

    scope?.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        },
      );
    });

    scope?.querySelectorAll('[data-reveal-stagger]').forEach((container) => {
      gsap.fromTo(
        container.querySelectorAll('[data-reveal-item]'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      );
    });
  }, scope ?? document);

  initEasterEggs();

  return () => {
    ctx.revert();
    cleanMagnetic();
    cleanHeaderState();
    cleanSpotlights();
    cleanHeightWatcher();
  };
}
