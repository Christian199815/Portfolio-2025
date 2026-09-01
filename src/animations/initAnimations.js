import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCustomCursor } from './cursor';
import { initEasterEggs } from './easterEggs';
import { initMagnetic } from './magnetic';
import { initSpotlights } from './spotlight';
import { prefersReducedMotion, shouldUseScrollTriggers } from './device';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Project data and images land after first paint, so the document keeps growing.
 * Without this the progress bar and pinned triggers stay pegged to the old height.
 * Never refresh mid-scroll — that kills momentum, especially scrolling down on touch.
 */
function initHeightWatcher() {
  let debounceTimer = null;
  let scrollEndTimer = null;
  let pendingRefresh = false;
  let isScrolling = false;

  const runRefresh = () => {
    pendingRefresh = false;
    ScrollTrigger.refresh();
  };

  const scheduleRefresh = () => {
    pendingRefresh = true;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!isScrolling) runRefresh();
    }, 250);
  };

  const onScroll = () => {
    isScrolling = true;
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      isScrolling = false;
      if (pendingRefresh) runRefresh();
    }, 120);
  };

  const observer = new ResizeObserver(scheduleRefresh);
  observer.observe(document.body);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', scheduleRefresh);
  document.fonts?.ready.then(scheduleRefresh);

  return () => {
    clearTimeout(debounceTimer);
    clearTimeout(scrollEndTimer);
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('load', scheduleRefresh);
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

  if (prefersReducedMotion() || !shouldUseScrollTriggers()) {
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
    if (progress) {
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
