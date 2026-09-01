import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, shouldUseScrollTriggers } from './device';

gsap.registerPlugin(ScrollTrigger);

export function initScrollProjectAnimations(scope) {
  if (prefersReducedMotion() || !scope) return () => {};

  const useScrub = shouldUseScrollTriggers();

  const ctx = gsap.context(() => {
    scope.querySelectorAll('[data-scroll-panel]').forEach((panel) => {
      const image = panel.querySelector('[data-panel-image]');
      const content = panel.querySelector('[data-scroll-panel-content]');

      if (image && useScrub) {
        gsap.fromTo(
          image,
          { yPercent: -12 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }

      if (content) {
        gsap.fromTo(
          content.children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
    });
  }, scope);

  return () => ctx.revert();
}
