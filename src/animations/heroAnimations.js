import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initHeroAnimations(scope) {
  if (prefersReducedMotion() || !scope) return () => {};

  const ctx = gsap.context(() => {
    const lines = scope.querySelectorAll('[data-hero-line]');
    const fades = scope.querySelectorAll('[data-hero-fade]');
    const introDelay = sessionStorage.getItem('cd-intro-seen') === '1' ? 0.1 : 2.9;

    gsap.set(lines, { yPercent: 108 });
    gsap.set(fades, { opacity: 0, y: 18 });

    const tl = gsap.timeline({ delay: introDelay });

    tl.to(lines, {
      yPercent: 0,
      duration: 1.15,
      stagger: 0.09,
      ease: 'expo.out',
    }).to(
      fades,
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
      '-=0.75',
    );

    // Type drifts up and dims as the hero scrolls away
    gsap.to(scope.querySelector('.hero__title'), {
      yPercent: -18,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  }, scope);

  return () => ctx.revert();
}
